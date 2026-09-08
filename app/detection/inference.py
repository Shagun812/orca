
"""Inference adapter for the trained oil-spill detector."""

from functools import lru_cache
from pathlib import Path

from fastapi import HTTPException

from app.schemas.detection import DetectionRequest, DetectionResponse

MODEL_PATH = Path(__file__).resolve().parents[2] / "models" / "spill_detection" / "best.pt"


@lru_cache(maxsize=1)
def _model():
    try:
        from ultralytics import YOLO
    except ImportError as exc:
        raise RuntimeError("ultralytics is required to run spill detection") from exc
    if not MODEL_PATH.is_file():
        raise RuntimeError(f"Trained spill detector is missing: {MODEL_PATH}")
    return YOLO(str(MODEL_PATH))


def detect_spill(request: DetectionRequest) -> DetectionResponse:
    """Run the trained detector. No image or unavailable model is an explicit error."""
    if not request.image_path:
        raise HTTPException(status_code=422, detail="image_path is required for model inference")

    image_path = Path(request.image_path)
    if not image_path.is_file():
        raise HTTPException(status_code=422, detail=f"Uploaded image cannot be read: {image_path}")

    try:
        result = _model().predict(source=str(image_path), verbose=False)[0]
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Spill model inference failed: {exc}") from exc

    if result.boxes is None or len(result.boxes) == 0:
        return DetectionResponse(
            prediction_id=f"det-{request.image_id}", spill_detected=False,
            confidence=0.0, area_km2=0.0,
            geometry={"type": "Polygon", "coordinates": [[]]}, observed_at=request.observed_at,
        )

    index = int(result.boxes.conf.argmax().item())
    confidence = float(result.boxes.conf[index].item())
    x1, y1, x2, y2 = (float(value) for value in result.boxes.xyxy[index].tolist())
    height, width = result.orig_shape
    geometry = _box_to_geojson(x1, y1, x2, y2, width, height, request.bbox)

    return DetectionResponse(
        prediction_id=f"det-{request.image_id}", spill_detected=True,
        confidence=round(confidence, 6), area_km2=round(_approx_area_km2(geometry), 6),
        geometry=geometry, observed_at=request.observed_at,
    )


def _box_to_geojson(x1: float, y1: float, x2: float, y2: float, width: int, height: int, bbox: list[float]) -> dict:
    west, south, east, north = bbox

    def point(x: float, y: float) -> list[float]:
        return [west + (x / width) * (east - west), north - (y / height) * (north - south)]

    ring = [point(x1, y1), point(x2, y1), point(x2, y2), point(x1, y2)]
    return {"type": "Polygon", "coordinates": [ring + [ring[0]]]}


def _approx_area_km2(geometry: dict) -> float:
    import math

    points = geometry["coordinates"][0]
    west, south = points[0]
    east, north = points[2]
    return abs(east - west) * (111.32 * math.cos(math.radians((south + north) / 2))) * abs(north - south) * 111.32
