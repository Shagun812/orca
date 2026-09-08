
from app.drift.particle_model import Particle, advect
from app.schemas.drift import DriftRequest, DriftResponse


def run_forecast(request: DriftRequest) -> DriftResponse:
    lat, lon = _centroid(request.spill_geometry)
    hours = max(1.0, request.forecast_hours)

    future = advect(
        Particle(lat, lon),
        hours,
        request.current_u_mps,
        request.current_v_mps,
        request.wind_u_mps,
        request.wind_v_mps,
    )

    return DriftResponse(
        mode="forecast",
        origin_zone=None,
        time_window=None,
        path=[
            {"latitude": lat, "longitude": lon, "hours_from_observation": 0},
            {"latitude": future.latitude, "longitude": future.longitude, "hours_from_observation": hours},
        ],
        uncertainty_km=request.origin_buffer_km,
    )


def _centroid(geometry: dict) -> tuple[float, float]:
    coords = geometry["coordinates"][0]
    lon = sum(p[0] for p in coords[:-1]) / max(1, len(coords) - 1)
    lat = sum(p[1] for p in coords[:-1]) / max(1, len(coords) - 1)
    return lat, lon
