use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{request::Parts, StatusCode},
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Claims embedded in the JWT token
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: Uuid,   // user id
    pub exp: usize,  // expiry timestamp
}

/// Extractor: validated JWT claims available in handlers
#[async_trait]
impl<S: Send + Sync> FromRequestParts<S> for Claims {
    type Rejection = StatusCode;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        // Pull claims from request extensions (set by auth middleware)
        parts
            .extensions
            .get::<Claims>()
            .cloned()
            .ok_or(StatusCode::UNAUTHORIZED)
    }
}
