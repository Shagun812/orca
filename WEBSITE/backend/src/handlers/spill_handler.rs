use axum::{extract::{Path, State}, http::StatusCode, Json};
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::job::Job;
use crate::models::ml::{AttributionRequest, DetectionRequest, DriftRequest};
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

    let bbox_geojson = serde_json::json!({
        "type": "Polygon", "coordinates": [[
            [body.bbox[0], body.bbox[1]], [body.bbox[2], body.bbox[1]],
            [body.bbox[2], body.bbox[3]], [body.bbox[0], body.bbox[3]], [body.bbox[0], body.bbox[1]]
        ]]
    });
    let observation = sqlx::query_as::<_, (Uuid,)>(
        "INSERT INTO satellite_observations (image_id, observed_at, bbox, image_path) VALUES ($1, $2, ST_GeomFromGeoJSON($3), $4) RETURNING id"
    )
    .bind(&body.image_id).bind(body.observed_at).bind(bbox_geojson.to_string()).bind(&body.image_path)
    .fetch_one(&pool).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let observation_id = observation.0;

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
                        r#"INSERT INTO spills (investigation_id, satellite_observation_id, prediction_id, confidence, area_km2, geometry)
                           VALUES ($1, $2, $3, $4, $5, ST_GeomFromGeoJSON($6))"#
                    )
                    .bind(investigation_id)
                    .bind(observation_id)
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

/// POST /api/v1/drift/forecast. The job result is the unmodified MODEL response.
pub async fn drift_forecast(
    State(pool): State<PgPool>,
    Json(body): Json<DriftRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let job_id = create_model_job(&pool, "forecast").await?;
    let pool_clone = pool.clone();
    tokio::spawn(async move {
        set_job_running(&pool_clone, job_id).await;
        let outcome = MlClient::from_env().drift_forecast(&body).await
            .and_then(|response| serde_json::to_value(response).map_err(|error| error.to_string()));
        finish_job(&pool_clone, job_id, outcome).await;
    });
    Ok(Json(serde_json::json!({ "job_id": job_id })))
}

/// POST /api/v1/attribution/rank. Candidate ranks always come from MODEL.
pub async fn attribution_rank(
    State(pool): State<PgPool>,
    Json(body): Json<AttributionRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let job_id = create_model_job(&pool, "attribution").await?;
    let pool_clone = pool.clone();
    tokio::spawn(async move {
        set_job_running(&pool_clone, job_id).await;
        let outcome = MlClient::from_env().attribution_rank(&body).await
            .and_then(|response| serde_json::to_value(response).map_err(|error| error.to_string()));
        if let Ok(result) = &outcome {
            if let Some(candidates) = result.get("candidates").and_then(|value| value.as_array()) {
                let spill_id = sqlx::query_scalar::<_, Uuid>("SELECT sp.id FROM spills sp JOIN satellite_observations obs ON obs.id = sp.satellite_observation_id WHERE obs.observed_at = $1 ORDER BY sp.created_at DESC LIMIT 1")
                    .bind(body.event_time)
                    .fetch_optional(&pool_clone).await.ok().flatten();
                if let Some(spill_id) = spill_id {
                    let _ = sqlx::query("DELETE FROM candidate_vessels WHERE spill_id = $1").bind(spill_id).execute(&pool_clone).await;
                    for candidate in candidates {
                        let mmsi = candidate.get("vessel_id").and_then(|value| value.as_str()).unwrap_or("");
                        if mmsi.is_empty() { continue; }
                        let last = candidate.get("trajectory").and_then(|value| value.as_array()).and_then(|rows| rows.last());
                        let name = last.and_then(|row| row.get("vessel_name")).and_then(|value| value.as_str());
                        let vessel_type = last.and_then(|row| row.get("vessel_type")).and_then(|value| value.as_str());
                        let imo = last.and_then(|row| row.get("imo")).and_then(|value| value.as_str());
                        let _ = sqlx::query("INSERT INTO vessels (mmsi, imo, vessel_name, vessel_type) VALUES ($1,$2,$3,$4) ON CONFLICT (mmsi) DO UPDATE SET imo=EXCLUDED.imo, vessel_name=EXCLUDED.vessel_name, vessel_type=EXCLUDED.vessel_type, updated_at=NOW()")
                            .bind(mmsi).bind(imo).bind(name).bind(vessel_type).execute(&pool_clone).await;
                        let _ = sqlx::query("INSERT INTO candidate_vessels (spill_id, mmsi, rank, score, evidence, features, positions_used) VALUES ($1,$2,$3,$4,$5,$6,$7)")
                            .bind(spill_id).bind(mmsi)
                            .bind(candidate.get("rank").and_then(|value| value.as_i64()).unwrap_or(0) as i32)
                            .bind(candidate.get("score").and_then(|value| value.as_f64()).unwrap_or(0.0))
                            .bind(candidate.get("evidence").cloned().unwrap_or_default())
                            .bind(candidate.get("features").cloned().unwrap_or_default())
                            .bind(candidate.get("positions_used").and_then(|value| value.as_i64()).unwrap_or(0) as i32)
                            .execute(&pool_clone).await;
                    }
                }
            }
        }
        finish_job(&pool_clone, job_id, outcome).await;
    });
    Ok(Json(serde_json::json!({ "job_id": job_id })))
}

async fn create_model_job(pool: &PgPool, job_type: &str) -> Result<Uuid, StatusCode> {
    sqlx::query_as::<_, (Uuid,)>("INSERT INTO jobs (type, status) VALUES ($1, 'pending') RETURNING id")
        .bind(job_type)
        .fetch_one(pool)
        .await
        .map(|row| row.0)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn set_job_running(pool: &PgPool, job_id: Uuid) {
    let _ = sqlx::query("UPDATE jobs SET status = 'running', progress = 10, updated_at = NOW() WHERE id = $1")
        .bind(job_id).execute(pool).await;
}

async fn finish_job(pool: &PgPool, job_id: Uuid, outcome: Result<serde_json::Value, String>) {
    match outcome {
        Ok(result) => { let _ = sqlx::query("UPDATE jobs SET status = 'completed', progress = 100, result_data = $1, updated_at = NOW() WHERE id = $2").bind(result).bind(job_id).execute(pool).await; }
        Err(error) => { let _ = sqlx::query("UPDATE jobs SET status = 'failed', error_message = $1, updated_at = NOW() WHERE id = $2").bind(error).bind(job_id).execute(pool).await; }
    }
}
