use axum::{extract::State, http::StatusCode, Json};
use sha2::{Sha256, Digest};
use sqlx::PgPool;

use crate::models::user::{CreateUser, LoginRequest, AuthResponse};

/// Hash password with SHA-256 + salt prefix.
/// In production, use argon2 or bcrypt. This is sufficient for a demo.
fn hash_password(password: &str) -> String {
    let salted = format!("oilwatch_salt_{}", password);
    let mut hasher = Sha256::new();
    hasher.update(salted.as_bytes());
    hex::encode(hasher.finalize())
}

/// POST /api/v1/auth/register
pub async fn register(
    State(pool): State<PgPool>,
    Json(body): Json<CreateUser>,
) -> Result<(StatusCode, Json<AuthResponse>), (StatusCode, Json<serde_json::Value>)> {
    let password_hash = hash_password(&body.password);

    // Check if user already exists
    let existing = sqlx::query_as::<_, (uuid::Uuid,)>(
        "SELECT id FROM users WHERE email = $1"
    )
    .bind(&body.email)
    .fetch_optional(&pool)
    .await
    .map_err(|e| (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(serde_json::json!({ "error": format!("Database error: {}", e) }))
    ))?;

    if existing.is_some() {
        return Err((
            StatusCode::CONFLICT,
            Json(serde_json::json!({ "error": "An account with this email already exists" }))
        ));
    }

    let user = sqlx::query_as::<_, (uuid::Uuid,)>(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id"
    )
    .bind(&body.email)
    .bind(&password_hash)
    .fetch_one(&pool)
    .await
    .map_err(|e| (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(serde_json::json!({ "error": format!("Failed to create user: {}", e) }))
    ))?;

    let token = create_token(user.0);

    Ok((StatusCode::CREATED, Json(AuthResponse {
        token,
        user_id: user.0,
    })))
}

/// POST /api/v1/auth/login
pub async fn login(
    State(pool): State<PgPool>,
    Json(body): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, (StatusCode, Json<serde_json::Value>)> {
    let password_hash = hash_password(&body.password);

    let row = sqlx::query_as::<_, (uuid::Uuid,)>(
        "SELECT id FROM users WHERE email = $1 AND password_hash = $2"
    )
    .bind(&body.email)
    .bind(&password_hash)
    .fetch_optional(&pool)
    .await
    .map_err(|e| (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(serde_json::json!({ "error": format!("Database error: {}", e) }))
    ))?
    .ok_or_else(|| (
        StatusCode::UNAUTHORIZED,
        Json(serde_json::json!({ "error": "Invalid email or password" }))
    ))?;

    let token = create_token(row.0);

    Ok(Json(AuthResponse {
        token,
        user_id: row.0,
    }))
}

fn create_token(user_id: uuid::Uuid) -> String {
    // Placeholder token — swap for real JWT signing in production
    format!("token_{}_{}", user_id, chrono::Utc::now().timestamp())
}
