
from datetime import datetime, timedelta, timezone

from app.drift.environmental_data import default_environment
from app.drift.particle_model import Particle, advect
from app.drift.origin_estimation import estimate_origin
from app.schemas.drift import DriftRequest, DriftResponse


def run_hindcast(request: DriftRequest) -> DriftResponse:
    env = default_environment()

    centroid = _centroid(request.spill_geometry)
    observed = request.observed_at

    hours = max(1.0, request.lookback_hours)
    backwards = advect(
        Particle(*centroid),
        -hours,
        env.current_u_mps,
        env.current_v_mps,
        env.wind_u_mps,
        env.wind_v_mps,
    )

    origin = estimate_origin(backwards.latitude, backwards.longitude, request.origin_buffer_km)

    return DriftResponse(
        mode="hindcast",
        origin_zone=origin,
        time_window={
            "start": (observed - timedelta(hours=hours)).isoformat(),
            "end": observed.isoformat(),
        },
        path=[
            {"latitude": centroid[0], "longitude": centroid[1], "hours_from_observation": 0},
            {"latitude": backwards.latitude, "longitude": backwards.longitude, "hours_from_observation": -hours},
        ],
        uncertainty_km=request.origin_buffer_km,
    )


def _centroid(geometry: dict) -> tuple[float, float]:
    coords = geometry["coordinates"][0]
    lon = sum(p[0] for p in coords[:-1]) / max(1, len(coords) - 1)
    lat = sum(p[1] for p in coords[:-1]) / max(1, len(coords) - 1)
    return lat, lon
