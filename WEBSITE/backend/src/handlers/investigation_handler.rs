use axum::{extract::{Path, State}, http::StatusCode, Json};
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::investigation::{CreateInvestigation, Investigation, UpdateInvestigation};

/// GET /api/v1/investigations
pub async fn list(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Investigation>>, StatusCode> {
    let rows = sqlx::query_as::<_, Investigation>(
        "SELECT id, user_id, title, description, status, NULL AS spill_info, created_at, updated_at FROM investigations ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(rows))
}

/// POST /api/v1/investigations
pub async fn create(
    State(pool): State<PgPool>,
    Json(body): Json<CreateInvestigation>,
) -> Result<(StatusCode, Json<Investigation>), StatusCode> {
    let row = sqlx::query_as::<_, Investigation>(
        "INSERT INTO investigations (title, description) VALUES ($1, $2) RETURNING id, user_id, title, description, status, NULL AS spill_info, created_at, updated_at"
    )
    .bind(&body.title)
    .bind(&body.description)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok((StatusCode::CREATED, Json(row)))
}

/// GET /api/v1/investigations/:id
pub async fn get(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<Investigation>, StatusCode> {
    let row = sqlx::query_as::<_, Investigation>(
        r#"SELECT i.id, i.user_id, i.title, i.description, i.status, i.created_at, i.updated_at,
            (SELECT row_to_json(s) FROM (
                SELECT sp.prediction_id, sp.confidence, sp.area_km2, ST_AsGeoJSON(sp.geometry)::json AS geometry,
                       obs.observed_at, '/uploads/' || regexp_replace(obs.image_path, '^.*[\\\\/]', '') AS image_url
                FROM spills sp
                JOIN satellite_observations obs ON obs.id = sp.satellite_observation_id
                WHERE sp.investigation_id = i.id
                ORDER BY sp.created_at DESC LIMIT 1
            ) s) AS spill_info
        FROM investigations i WHERE i.id = $1"#
    )
    .bind(id)
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(row))
}

/// PATCH /api/v1/investigations/:id
pub async fn update(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateInvestigation>,
) -> Result<Json<Investigation>, StatusCode> {
    let row = sqlx::query_as::<_, Investigation>(
        r#"UPDATE investigations SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            status = COALESCE($3, status),
            updated_at = NOW()
        WHERE id = $4
        RETURNING id, user_id, title, description, status, NULL AS spill_info, created_at, updated_at"#
    )
    .bind(&body.title)
    .bind(&body.description)
    .bind(&body.status)
    .bind(id)
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(row))
}

/// DELETE /api/v1/investigations/:id
pub async fn delete(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    let result = sqlx::query("DELETE FROM investigations WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::NO_CONTENT)
}
