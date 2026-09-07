use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

/// Represents a spill record stored in Postgres after a MODEL /detect call.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Spill {
    pub id: Uuid,
    pub investigation_id: Option<Uuid>,
    pub satellite_observation_id: Option<Uuid>,
    pub prediction_id: Option<String>,
    pub confidence: Option<f64>,
    pub area_km2: Option<f64>,
    /// GeoJSON geometry — the detected spill polygon from MODEL
    pub geometry: serde_json::Value,
    pub created_at: Option<DateTime<Utc>>,
}

/// Matches DetectionRequest fields from MODEL/app/schemas/detection.py
#[derive(Debug, Serialize, Deserialize)]
pub struct DetectionRequest {
    pub image_id: String,
    pub observed_at: DateTime<Utc>,
    pub bbox: Vec<f64>,
    pub image_path: Option<String>,
}

/// Matches DetectionResponse fields from MODEL/app/schemas/detection.py
#[derive(Debug, Serialize, Deserialize)]
pub struct DetectionResponse {
    pub prediction_id: String,
    pub spill_detected: bool,
    pub confidence: f64,
    pub area_km2: f64,
    pub geometry: serde_json::Value,
    pub observed_at: DateTime<Utc>,
}

/// Matches DriftRequest fields from MODEL/app/schemas/drift.py
#[derive(Debug, Serialize, Deserialize)]
pub struct DriftRequest {
    pub spill_geometry: serde_json::Value,
    pub observed_at: DateTime<Utc>,
    pub lookback_hours: Option<f64>,
    pub forecast_hours: Option<f64>,
    pub origin_buffer_km: Option<f64>,
}

/// Matches DriftResponse fields from MODEL/app/schemas/drift.py
#[derive(Debug, Serialize, Deserialize)]
pub struct DriftResponse {
    pub mode: String,
    pub origin_zone: Option<serde_json::Value>,
    pub time_window: Option<serde_json::Value>,
    pub path: Vec<serde_json::Value>,
    pub uncertainty_km: f64,
}

/// Matches AISPosition from MODEL/app/schemas/ais.py
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AISPosition {
    pub mmsi: String,
    pub timestamp: String,
    pub latitude: f64,
    pub longitude: f64,
    pub speed_knots: f64,
    pub course_deg: f64,
    pub heading_deg: Option<f64>,
    pub vessel_type: Option<String>,
    pub imo: Option<String>,
    pub vessel_name: Option<String>,
}

/// Matches AttributionRequest from MODEL/app/schemas/attribution.py
#[derive(Debug, Serialize, Deserialize)]
pub struct AttributionRequest {
    pub event_time: DateTime<Utc>,
    pub origin_zone: serde_json::Value,
    pub time_window: serde_json::Value,
    pub ais_positions: Vec<AISPosition>,
    pub search_buffer_km: Option<f64>,
}

/// Matches AttributionResponse from MODEL/app/schemas/attribution.py
#[derive(Debug, Serialize, Deserialize)]
pub struct AttributionResponse {
    pub candidate_count: i32,
    pub filtered_position_count: i32,
    pub candidates: Vec<serde_json::Value>,
}

/// Stored candidate record in our DB
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CandidateVessel {
    pub id: Uuid,
    pub spill_id: Uuid,
    pub mmsi: String,
    pub rank: i32,
    pub score: f64,
    pub evidence: serde_json::Value,
    pub features: serde_json::Value,
    pub positions_used: i32,
    pub created_at: Option<DateTime<Utc>>,
}

/// Stored origin zone
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OriginZone {
    pub id: Uuid,
    pub spill_id: Uuid,
    pub mode: String,
    pub center_lat: f64,
    pub center_lon: f64,
    pub radius_km: f64,
    pub window_start: DateTime<Utc>,
    pub window_end: DateTime<Utc>,
    pub uncertainty_km: f64,
    pub created_at: Option<DateTime<Utc>>,
}
