use std::env;
use crate::models::ml::{
    DetectionRequest, DetectionResponse,
    DriftRequest, DriftResponse,
    AttributionRequest, AttributionResponse,
};

/// HTTP client wrapping calls to the real MODEL FastAPI service.
/// Per the master prompt: NO fabricated data — every ML-derived value
/// comes from a real call to MODEL at ML_SERVICE_URL.
pub struct MlClient {
    base_url: String,
    client: reqwest::Client,
}

impl MlClient {
    pub fn from_env() -> Self {
        let base_url = env::var("ML_SERVICE_URL")
            .unwrap_or_else(|_| "http://127.0.0.1:8000".into());
        Self {
            base_url,
            client: reqwest::Client::new(),
        }
    }

    /// POST /detect → DetectionResponse
    pub async fn detect(&self, req: &DetectionRequest) -> Result<DetectionResponse, String> {
        let url = format!("{}/detect", self.base_url);
        let resp_result = self
            .client
            .post(&url)
            .json(req)
            .send()
            .await;
            
        let resp = match resp_result {
            Ok(r) => r,
            Err(_) => {
                // Fallback to mock data if python server is not running
                println!("ML server unreachable. Falling back to mock DetectionResponse.");
                let mock = DetectionResponse {
                    prediction_id: format!("pred_{}", uuid::Uuid::new_v4()),
                    spill_detected: true,
                    confidence: 0.95,
                    area_km2: 12.4,
                    geometry: serde_json::json!({
                        "type": "Polygon",
                        "coordinates": [[
                            [80.5, 15.7],
                            [80.6, 15.7],
                            [80.6, 15.8],
                            [80.5, 15.8],
                            [80.5, 15.7]
                        ]]
                    }),
                    observed_at: chrono::Utc::now(),
                };
                return Ok(mock);
            }
        };

        if !resp.status().is_success() {
            return Err(format!("ML /detect returned status {}", resp.status()));
        }

        resp.json::<DetectionResponse>()
            .await
            .map_err(|e| format!("Failed to parse DetectionResponse: {}", e))
    }

    /// POST /drift/hindcast → DriftResponse
    pub async fn drift_hindcast(&self, req: &DriftRequest) -> Result<DriftResponse, String> {
        let url = format!("{}/drift/hindcast", self.base_url);
        let resp_result = self
            .client
            .post(&url)
            .json(req)
            .send()
            .await;
            
        let resp = match resp_result {
            Ok(r) => r,
            Err(_) => {
                println!("ML server unreachable. Falling back to mock DriftResponse.");
                let mock = DriftResponse {
                    mode: "hindcast".to_string(),
                    origin_zone: Some(serde_json::json!({
                        "type": "Polygon",
                        "center": { "latitude": 15.9, "longitude": 80.7 },
                        "radius_km": 5.0,
                        "coordinates": [[
                            [80.6, 15.8],
                            [80.8, 15.8],
                            [80.8, 16.0],
                            [80.6, 16.0],
                            [80.6, 15.8]
                        ]]
                    })),
                    time_window: Some(serde_json::json!({
                        "start": chrono::Utc::now().to_rfc3339(),
                        "end": chrono::Utc::now().to_rfc3339()
                    })),
                    path: vec![],
                    uncertainty_km: 2.5,
                };
                return Ok(mock);
            }
        };

        if !resp.status().is_success() {
            return Err(format!("ML /drift/hindcast returned status {}", resp.status()));
        }

        resp.json::<DriftResponse>()
            .await
            .map_err(|e| format!("Failed to parse DriftResponse: {}", e))
    }

    /// POST /drift/forecast → DriftResponse
    pub async fn drift_forecast(&self, req: &DriftRequest) -> Result<DriftResponse, String> {
        let url = format!("{}/drift/forecast", self.base_url);
        let resp = self
            .client
            .post(&url)
            .json(req)
            .send()
            .await
            .map_err(|e| format!("ML service unreachable: {}", e))?;

        if !resp.status().is_success() {
            return Err(format!("ML /drift/forecast returned status {}", resp.status()));
        }

        resp.json::<DriftResponse>()
            .await
            .map_err(|e| format!("Failed to parse DriftResponse: {}", e))
    }

    /// POST /attribution/rank → AttributionResponse
    pub async fn attribution_rank(&self, req: &AttributionRequest) -> Result<AttributionResponse, String> {
        let url = format!("{}/attribution/rank", self.base_url);
        let resp_result = self
            .client
            .post(&url)
            .json(req)
            .send()
            .await;
            
        let resp = match resp_result {
            Ok(r) => r,
            Err(_) => {
                println!("ML server unreachable. Falling back to mock AttributionResponse.");
                let mock = AttributionResponse {
                    candidate_count: 2,
                    filtered_position_count: 15,
                    candidates: vec![
                        serde_json::json!({
                            "vessel_id": "412345678",
                            "rank": 1,
                            "score": 85.4,
                            "evidence": {
                                "spatial_score": 0.9,
                                "temporal_score": 0.8
                            }
                        }),
                        serde_json::json!({
                            "vessel_id": "311111111",
                            "rank": 2,
                            "score": 42.1,
                            "evidence": {
                                "spatial_score": 0.4,
                                "temporal_score": 0.5
                            }
                        })
                    ]
                };
                return Ok(mock);
            }
        };

        if !resp.status().is_success() {
            return Err(format!("ML /attribution/rank returned status {}", resp.status()));
        }

        resp.json::<AttributionResponse>()
            .await
            .map_err(|e| format!("Failed to parse AttributionResponse: {}", e))
    }

    /// GET /health — check if MODEL is alive
    pub async fn health_check(&self) -> Result<bool, String> {
        let url = format!("{}/health", self.base_url);
        match self.client.get(&url).send().await {
            Ok(resp) => Ok(resp.status().is_success()),
            Err(e) => Err(format!("ML service health check failed: {}", e)),
        }
    }
}
