
from datetime import datetime, timezone

from app.drift.hindcast import run_hindcast
from app.schemas.drift import DriftRequest


def test_hindcast_returns_origin():
    result = run_hindcast(
        DriftRequest(
            spill_geometry={
                "type": "Polygon",
                "coordinates": [[[77.08, 13.08], [77.12, 13.08], [77.12, 13.12], [77.08, 13.12], [77.08, 13.08]]],
            },
            observed_at=datetime(2026, 9, 8, 12, tzinfo=timezone.utc),
        )
    )
    assert result.mode == "hindcast"
    assert result.origin_zone is not None
    assert result.time_window is not None
