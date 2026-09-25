use axum::{extract::State, Json};
use serde::Serialize;
use sqlx::PgPool;
use std::time::Instant;
use reqwest::Client;
use sysinfo::System;

#[derive(Serialize)]
pub struct TelemetryResponse {
    pub db_latency_ms: u64,
    pub ml_api_latency_ms: u64,
    pub ml_api_status: String,
    pub active_cases: i64,
    pub ram_usage_mb: u64,
    pub total_ram_mb: u64,
}

pub async fn get_telemetry(State(pool): State<PgPool>) -> Json<TelemetryResponse> {
    // 1. Measure DB Ping
    let db_start = Instant::now();
    let _db_status = sqlx::query("SELECT 1 as ping").fetch_one(&pool).await;
    let db_latency = db_start.elapsed().as_millis() as u64;

    // 2. Measure ML API Ping
    let ml_start = Instant::now();
    let client = Client::new();
    let ml_resp = client.get("http://127.0.0.1:8000/").send().await;
    let ml_latency = ml_start.elapsed().as_millis() as u64;
    let ml_status = match ml_resp {
        Ok(_) => "Online".to_string(),
        Err(_) => "Offline".to_string(),
    };

    // 3. Queue / Active Cases
    let count_res: Result<(i64,), _> = sqlx::query_as("SELECT COUNT(*) as count FROM investigations WHERE status = 'open'")
        .fetch_one(&pool)
        .await;
    
    let active_cases = match count_res {
        Ok(r) => r.0,
        Err(_) => 0,
    };

    // 4. System RAM via sysinfo
    let mut sys = System::new_all();
    sys.refresh_memory();
    let ram_usage_mb = sys.used_memory() / 1024 / 1024;
    let total_ram_mb = sys.total_memory() / 1024 / 1024;

    Json(TelemetryResponse {
        db_latency_ms: db_latency,
        ml_api_latency_ms: ml_latency,
        ml_api_status: ml_status,
        active_cases,
        ram_usage_mb,
        total_ram_mb,
    })
}
