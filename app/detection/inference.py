
from datetime import datetime, timezone

from app.detection.geometry import demo_polygon
from app.schemas.detection import DetectionRequest, DetectionResponse


def detect_spill(request: DetectionRequest) -> DetectionResponse:
    # V1 demo mode. A real model can use request.image_path and return a real mask.
    geometry = demo_polygon(request.bbox)
    area = _approx_area_km2(request.bbox)

    return DetectionResponse(
        prediction_id=f"det-{request.image_id}",
        spill_detected=True,
        confidence=0.86,
        area_km2=round(area, 4),
        geometry=geometry,
        observed_at=request.observed_at,
    )


def _approx_area_km2(bbox: list[float]) -> float:
    west, south, east, north = bbox
    # Small-area equirectangular approximation.
    import math

    lat_km = 111.32
    lon_km = 111.32 * math.cos(math.radians((south + north) / 2))
    return max(0.0, (east - west) * lon_km * (north - south) * lat_km)
