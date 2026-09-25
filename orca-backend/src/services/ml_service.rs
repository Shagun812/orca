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
        let resp = self
            .client
            .post(&url)
            .json(req)
            .send()
            .await
            .map_err(|error| format!("ML /detect is unavailable: {error}"))?;

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
        let resp = self
            .client
            .post(&url)
            .json(req)
            .send()
            .await
            .map_err(|error| format!("ML /drift/hindcast is unavailable: {error}"))?;

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
        let resp = self
            .client
            .post(&url)
            .json(req)
            .send()
            .await
            .map_err(|error| format!("ML /attribution/rank is unavailable: {error}"))?;

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
