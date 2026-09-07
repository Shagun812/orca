use axum::{extract::{Path, State}, http::StatusCode, Json};
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::job::Job;
use crate::models::ml::{DetectionRequest, DriftRequest};
use crate::services::ml_service::MlClient;

/// POST /api/v1/spills/detect
/// Triggers spill detection as an async job.
/// Also auto-creates an investigation to track the full pipeline.
pub async fn detect_spill(
    State(pool): State<PgPool>,
    Json(body): Json<DetectionRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    // Auto-create an investigation for this detection run
    let inv = sqlx::query_as::<_, (Uuid,)>(
        "INSERT INTO investigations (title, description, status) VALUES ($1, $2, 'open') RETURNING id"
    )
    .bind(format!("Detection: {}", &body.image_id))
    .bind(format!("Automated investigation for satellite image {}", &body.image_id))
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let investigation_id = inv.0;

    // Create a job record linked to the investigation
    let job = sqlx::query_as::<_, (Uuid,)>(
        "INSERT INTO jobs (type, status, target_id) VALUES ('detect', 'pending', $1) RETURNING id"
    )
    .bind(investigation_id)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let job_id = job.0;
    let pool_clone = pool.clone();

    // Spawn background task
    tokio::spawn(async move {
        let ml = MlClient::from_env();

        // Update job to running
        let _ = sqlx::query(
            "UPDATE jobs SET status = 'running', progress = 10, updated_at = NOW() WHERE id = $1"
        )
        .bind(job_id)
        .execute(&pool_clone)
        .await;

        match ml.detect(&body).await {
            Ok(response) => {
                if response.spill_detected {
                    // Store spill record with real geometry from MODEL, linked to the investigation
                    let geom_json = serde_json::to_string(&response.geometry).unwrap_or_default();
                    let _ = sqlx::query(
                        r#"INSERT INTO spills (investigation_id, prediction_id, confidence, area_km2, geometry)
                           VALUES ($1, $2, $3, $4, ST_GeomFromGeoJSON($5))"#
                    )
                    .bind(investigation_id)
                    .bind(&response.prediction_id)
                    .bind(response.confidence)
                    .bind(response.area_km2)
                    .bind(&geom_json)
                    .execute(&pool_clone)
                    .await;
                }

                let result_data = serde_json::to_value(&response).unwrap_or_default();
                let _ = sqlx::query(
                    "UPDATE jobs SET status = 'completed', progress = 100, result_data = $1, updated_at = NOW() WHERE id = $2"
                )
                .bind(result_data)
                .bind(job_id)
                .execute(&pool_clone)
                .await;
            }
            Err(e) => {
                let _ = sqlx::query(
                    "UPDATE jobs SET status = 'failed', error_message = $1, updated_at = NOW() WHERE id = $2"
                )
                .bind(format!("ML service error: {}", e))
                .bind(job_id)
                .execute(&pool_clone)
                .await;
            }
        }
    });

    Ok(Json(serde_json::json!({
        "job_id": job_id,
        "investigation_id": investigation_id
    })))
}

/// POST /api/v1/drift/hindcast
pub async fn drift_hindcast(
    State(pool): State<PgPool>,
    Json(body): Json<DriftRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let job = sqlx::query_as::<_, (Uuid,)>(
        "INSERT INTO jobs (type, status) VALUES ('drift', 'pending') RETURNING id"
    )
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let job_id = job.0;
    let pool_clone = pool.clone();

    tokio::spawn(async move {
        let ml = MlClient::from_env();

        let _ = sqlx::query(
            "UPDATE jobs SET status = 'running', progress = 10, updated_at = NOW() WHERE id = $1"
        )
        .bind(job_id)
        .execute(&pool_clone)
        .await;

        match ml.drift_hindcast(&body).await {
            Ok(response) => {
                // Store origin_zone as real PostGIS geometry
                if let Some(origin_zone) = &response.origin_zone {
                    if let (Some(center), Some(radius_km)) = (
                        origin_zone.get("center"),
                        origin_zone.get("radius_km"),
                    ) {
                        let lat = center.get("latitude").and_then(|v| v.as_f64()).unwrap_or(0.0);
                        let lon = center.get("longitude").and_then(|v| v.as_f64()).unwrap_or(0.0);
                        let radius = radius_km.as_f64().unwrap_or(0.0);

                        let time_window = response.time_window.as_ref();
                        let window_start = time_window
                            .and_then(|tw| tw.get("start"))
                            .and_then(|v| v.as_str())
                            .unwrap_or("");
                        let window_end = time_window
                            .and_then(|tw| tw.get("end"))
                            .and_then(|v| v.as_str())
                            .unwrap_or("");

                        let origin_geojson = serde_json::to_string(origin_zone).unwrap_or_default();

                        let _ = sqlx::query(
                            r#"INSERT INTO origin_zones (mode, center, radius_km, polygon, window_start, window_end, uncertainty_km, spill_id)
                               VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4,
                                       ST_GeomFromGeoJSON($5), $6::timestamptz, $7::timestamptz, $8,
                                       (SELECT id FROM spills ORDER BY created_at DESC LIMIT 1))"#
                        )
                        .bind(&response.mode)
                        .bind(lon)
                        .bind(lat)
                        .bind(radius)
                        .bind(&origin_geojson)
                        .bind(window_start)
                        .bind(window_end)
                        .bind(response.uncertainty_km)
                        .execute(&pool_clone)
                        .await;
                    }
                }

                let result_data = serde_json::to_value(&response).unwrap_or_default();
                let _ = sqlx::query(
                    "UPDATE jobs SET status = 'completed', progress = 100, result_data = $1, updated_at = NOW() WHERE id = $2"
                )
                .bind(result_data)
                .bind(job_id)
                .execute(&pool_clone)
                .await;
            }
            Err(e) => {
                let _ = sqlx::query(
                    "UPDATE jobs SET status = 'failed', error_message = $1, updated_at = NOW() WHERE id = $2"
                )
                .bind(format!("ML service error: {}", e))
                .bind(job_id)
                .execute(&pool_clone)
                .await;
            }
        }
    });

    Ok(Json(serde_json::json!({ "job_id": job_id })))
}

/// GET /api/v1/jobs/:id
pub async fn get_job(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<Job>, StatusCode> {
    let row = sqlx::query_as::<_, Job>(
        "SELECT id, type, status, target_id, progress, result_data, error_message, created_at, updated_at FROM jobs WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(row))
}
