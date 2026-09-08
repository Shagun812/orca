from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class DriftRequest(BaseModel):
    """Inputs consumed by the numerical drift model and the Rust API gateway."""

    spill_geometry: dict
    observed_at: datetime
    lookback_hours: float = Field(default=24, gt=0, le=168)
    forecast_hours: float = Field(default=24, gt=0, le=168)
    origin_buffer_km: float = Field(default=10, gt=0, le=200)
    current_u_mps: float = 0.20
    current_v_mps: float = 0.05
    wind_u_mps: float = 0.0
    wind_v_mps: float = 0.0


class DriftResponse(BaseModel):
    mode: Literal["hindcast", "forecast"]
    origin_zone: dict | None = None
    time_window: dict | None = None
    path: list[dict]
    uncertainty_km: float
