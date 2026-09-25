use sqlx::PgPool;
use tower_http::cors::{CorsLayer, Any};
use tower_http::trace::TraceLayer;
use std::env;

mod config;
mod models;
mod handlers;
mod services;
mod routes;
mod middleware;
mod errors;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    // Load .env file if it exists, otherwise ignore
    let _ = dotenvy::dotenv();

    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL environment variable must be set");

    let pool = PgPool::connect(&database_url)
        .await
        .expect("Failed to connect to the database");

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

    let port = env::var("PORT").unwrap_or_else(|_| "8000".to_string());
    let addr = format!("0.0.0.0:{}", port);
    
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    tracing::info!("Server running on {}", addr);
    
    axum::serve(listener, app).await?;

    Ok(())
}
