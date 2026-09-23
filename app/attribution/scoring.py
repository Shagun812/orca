
def score_candidate(features: dict) -> tuple[float, dict]:
    spatial = _spatial_score(features.get("min_distance_km"))
    temporal = _temporal_score(features.get("time_difference_hours"))
    trajectory = float(features.get("trajectory_consistency", 0.0))
    dwell = min(1.0, float(features.get("time_inside_region_hours", 0.0)) / 6.0)
    quality = float(features.get("ais_quality", 0.0))

    score = (
        0.35 * spatial
        + 0.25 * temporal
        + 0.20 * trajectory
        + 0.10 * dwell
        + 0.10 * quality
    )

    evidence = {
        "spatial_score": round(spatial, 4),
        "temporal_score": round(temporal, 4),
        "trajectory_score": round(trajectory, 4),
        "dwell_score": round(dwell, 4),
        "ais_quality_score": round(quality, 4),
    }

    return round(score * 100, 2), evidence


def _spatial_score(distance_km) -> float:
    if distance_km is None:
        return 0.0
    return max(0.0, 1.0 - float(distance_km) / 20.0)


def _temporal_score(hours) -> float:
    if hours is None:
        return 0.0
    return max(0.0, 1.0 - float(hours) / 24.0)
