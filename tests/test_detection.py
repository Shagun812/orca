
from datetime import datetime, timezone

from app.detection.inference import detect_spill
from app.schemas.detection import DetectionRequest


def test_demo_detection():
    result = detect_spill(
        DetectionRequest(
            image_id="x",
            observed_at=datetime.now(timezone.utc),
            bbox=[77.0, 13.0, 77.2, 13.2],
        )
    )
    assert result.spill_detected is True
    assert result.confidence > 0
    assert result.geometry["type"] == "Polygon"
