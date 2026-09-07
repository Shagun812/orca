
from datetime import datetime, timezone

from app.attribution.ranking import rank_candidates
from app.schemas.ais import AISPosition
from app.schemas.attribution import AttributionRequest


def test_ranking_prefers_closer_vessel():
    request = AttributionRequest(
        event_time=datetime(2026, 9, 8, 12, tzinfo=timezone.utc),
        origin_zone={
            "type": "Polygon",
            "coordinates": [[[77.0, 13.0], [77.2, 13.0], [77.2, 13.2], [77.0, 13.2], [77.0, 13.0]]],
            "center": {"latitude": 13.1, "longitude": 77.1},
            "radius_km": 10,
        },
        time_window={
            "start": "2026-09-07T12:00:00Z",
            "end": "2026-09-08T12:00:00Z",
        },
        ais_positions=[
            AISPosition(
                mmsi="1",
                timestamp="2026-09-08T11:00:00Z",
                latitude=13.101,
                longitude=77.101,
                speed_knots=8,
                course_deg=90,
            ),
            AISPosition(
                mmsi="2",
                timestamp="2026-09-08T11:00:00Z",
                latitude=13.18,
                longitude=77.18,
                speed_knots=8,
                course_deg=90,
            ),
        ],
        search_buffer_km=20,
    )
    result = rank_candidates(request)
    assert result.candidate_count == 2
    assert result.candidates[0]["vessel_id"] == "1"
