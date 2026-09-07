
from app.schemas.ais import AISPosition
from app.utils.geo import haversine_km
from app.utils.time import parse_datetime


def calculate_features(
    positions: list[AISPosition],
    origin_lat: float,
    origin_lon: float,
    event_time,
) -> dict:
    if not positions:
        return {
            "min_distance_km": None,
            "closest_approach_time": None,
            "time_difference_hours": None,
            "time_inside_region_hours": 0.0,
            "trajectory_consistency": 0.0,
            "ais_quality": 0.0,
        }

    distances = [
        haversine_km(p.latitude, p.longitude, origin_lat, origin_lon)
        for p in positions
    ]
    idx = min(range(len(distances)), key=distances.__getitem__)
    closest = positions[idx]
    closest_time = parse_datetime(closest.timestamp)
    diff_hours = abs((closest_time - event_time).total_seconds()) / 3600

    if len(positions) >= 2:
        trajectory_consistency = _trajectory_consistency(positions)
    else:
        trajectory_consistency = 0.5

    return {
        "min_distance_km": min(distances),
        "closest_approach_time": closest.timestamp,
        "time_difference_hours": diff_hours,
        "time_inside_region_hours": _time_span_hours(positions),
        "trajectory_consistency": trajectory_consistency,
        "ais_quality": 1.0,
    }


def _time_span_hours(positions: list[AISPosition]) -> float:
    if len(positions) < 2:
        return 0.0
    times = [parse_datetime(p.timestamp) for p in positions]
    return max(0.0, (max(times) - min(times)).total_seconds() / 3600)


def _trajectory_consistency(positions: list[AISPosition]) -> float:
    # Lightweight baseline: compare reported heading to bearing between consecutive points.
    import math

    agreements = []
    for a, b in zip(positions, positions[1:]):
        bearing = _bearing(a.latitude, a.longitude, b.latitude, b.longitude)
        delta = abs(((bearing - a.course_deg + 180) % 360) - 180)
        agreements.append(max(0.0, 1.0 - delta / 180.0))

    return sum(agreements) / len(agreements) if agreements else 0.5


def _bearing(lat1, lon1, lat2, lon2) -> float:
    import math

    p1, p2 = math.radians(lat1), math.radians(lat2)
    dl = math.radians(lon2 - lon1)
    y = math.sin(dl) * math.cos(p2)
    x = math.cos(p1) * math.sin(p2) - math.sin(p1) * math.cos(p2) * math.cos(dl)
    return (math.degrees(math.atan2(y, x)) + 360) % 360
