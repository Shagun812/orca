// Errors module — placeholder for a unified error type
use axum::{http::StatusCode, response::IntoResponse, Json};
use serde_json::json;

pub struct AppError {
    pub status: StatusCode,
    pub message: String,
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        let body = json!({ "error": self.message });
        (self.status, Json(body)).into_response()
    }
}

impl From<sqlx::Error> for AppError {
    fn from(e: sqlx::Error) -> Self {
        AppError {
            status: StatusCode::INTERNAL_SERVER_ERROR,
            message: format!("Database error: {}", e),
        }
    }
}
