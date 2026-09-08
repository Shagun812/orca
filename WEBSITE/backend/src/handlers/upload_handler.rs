use axum::{extract::{Multipart, State}, http::StatusCode, Json};
use sqlx::PgPool;
use std::path::PathBuf;
use uuid::Uuid;

/// POST /api/v1/upload/satellite
/// Accepts a multipart file upload of satellite imagery.
/// Saves the file to ./uploads/ and returns the image_id + path for use
/// in the detection pipeline.
pub async fn upload_satellite(
    State(pool): State<PgPool>,
    mut multipart: Multipart,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let upload_dir = PathBuf::from("./uploads");
    tokio::fs::create_dir_all(&upload_dir).await.map_err(|e| (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(serde_json::json!({ "error": format!("Cannot create upload dir: {}", e) }))
    ))?;

    let mut saved_path: Option<String> = None;
    let mut original_name: Option<String> = None;

    while let Some(field) = multipart.next_field().await.map_err(|e| (
        StatusCode::BAD_REQUEST,
        Json(serde_json::json!({ "error": format!("Multipart parse error: {}", e) }))
    ))? {
        let name = field.name().unwrap_or("").to_string();

        if name == "file" {
            let file_name = field
                .file_name()
                .unwrap_or("unknown.tif")
                .to_string();
            original_name = Some(file_name.clone());

            let ext = file_name
                .rsplit('.')
                .next()
                .unwrap_or("bin");
            let unique_name = format!("{}_{}.{}", Uuid::new_v4(), chrono::Utc::now().timestamp(), ext);
            let dest = upload_dir.join(&unique_name);

            let data = field.bytes().await.map_err(|e| (
                StatusCode::BAD_REQUEST,
                Json(serde_json::json!({ "error": format!("Failed to read file bytes: {}", e) }))
            ))?;

            tokio::fs::write(&dest, &data).await.map_err(|e| (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": format!("Failed to write file: {}", e) }))
            ))?;

            // The MODEL service runs in a different working directory. Return an
            // absolute path so the exact uploaded pixels reach inference.
            saved_path = Some(
                tokio::fs::canonicalize(&dest)
                    .await
                    .unwrap_or(dest)
                    .to_string_lossy()
                    .to_string(),
            );
        }
    }

    let image_path = saved_path.ok_or_else(|| (
        StatusCode::BAD_REQUEST,
        Json(serde_json::json!({ "error": "No file field named 'file' found in the upload" }))
    ))?;

    let image_id = format!("sat_{}", Uuid::new_v4().to_string().split('-').next().unwrap_or("x"));
    let image_url = format!("/uploads/{}", PathBuf::from(&image_path).file_name().unwrap_or_default().to_string_lossy());

    tracing::info!(
        "Satellite image uploaded: {} -> {}",
        original_name.as_deref().unwrap_or("unknown"),
        &image_path
    );

    Ok(Json(serde_json::json!({
        "image_id": image_id,
        "image_path": image_path,
        "image_url": image_url,
        "original_name": original_name,
        "status": "uploaded"
    })))
}
