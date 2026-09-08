use std::env;

#[derive(Debug, Clone)]
pub struct Settings {
    pub database_url: String,
    pub redis_url: String,
    pub ml_service_url: String,
    pub jwt_secret: String,
}

impl Settings {
    pub fn from_env() -> Self {
        Self {
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            redis_url: env::var("REDIS_URL").unwrap_or_else(|_| "redis://localhost:6379".into()),
            ml_service_url: env::var("ML_SERVICE_URL")
                .unwrap_or_else(|_| "http://127.0.0.1:8000".into()),
            jwt_secret: env::var("JWT_SECRET").expect("JWT_SECRET must be set"),
        }
    }
}
