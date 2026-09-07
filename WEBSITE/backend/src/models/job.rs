use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};

/// Job types match the async pattern: detect, drift, attribution
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Job {
    pub id: Uuid,
    #[sqlx(rename = "type")]
    pub job_type: String,
    pub status: String,
    pub target_id: Option<Uuid>,
    pub progress: Option<i32>,
    pub result_data: Option<serde_json::Value>,
    pub error_message: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateJob {
    pub job_type: String,
    pub target_id: Option<Uuid>,
}
