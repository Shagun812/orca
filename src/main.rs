use sqlx::PgPool;
use tower_http::cors::{CorsLayer, Any};
use tower_http::trace::TraceLayer;

mod config;
mod models;
mod handlers;
mod services;
mod routes;
mod middleware;
mod errors;

#[shuttle_runtime::main]
async fn main(
    #[shuttle_shared_db::Postgres] pool: PgPool,
) -> shuttle_axum::ShuttleAxum {
    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = routes::create_router(pool)
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    Ok(app.into())
}
