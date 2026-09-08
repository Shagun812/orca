use axum::{
    routing::{get, post, patch, delete},
    Router,
};
use sqlx::PgPool;
use tower_http::services::ServeDir;

use crate::handlers::{auth_handler, investigation_handler, spill_handler, upload_handler};

pub fn create_router(pool: PgPool) -> Router {
    let api = Router::new()
        // Auth
        .route("/auth/register", post(auth_handler::register))
        .route("/auth/login", post(auth_handler::login))
        // Satellite upload
        .route("/upload/satellite", post(upload_handler::upload_satellite))
        // Investigations CRUD
        .route("/investigations", get(investigation_handler::list).post(investigation_handler::create))
        .route(
            "/investigations/:id",
            get(investigation_handler::get)
                .patch(investigation_handler::update)
                .delete(investigation_handler::delete),
        )
        // Spill detection & drift (async jobs calling real MODEL)
        .route("/spills/detect", post(spill_handler::detect_spill))
        .route("/drift/hindcast", post(spill_handler::drift_hindcast))
        .route("/drift/forecast", post(spill_handler::drift_forecast))
        .route("/attribution/rank", post(spill_handler::attribution_rank))
        // Job status
        .route("/jobs/:id", get(spill_handler::get_job))
        .with_state(pool);

    Router::new()
        .nest("/api/v1", api)
        .nest_service("/uploads", ServeDir::new("./uploads"))
}
