
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_detection_endpoint():
    response = client.post(
        "/detect",
        json={
            "image_id": "demo",
            "observed_at": "2026-09-08T12:00:00Z",
            "bbox": [77.0, 13.0, 77.2, 13.2],
        },
    )
    assert response.status_code == 200
    assert response.json()["spill_detected"] is True
