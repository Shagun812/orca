
from datetime import datetime
from pydantic import BaseModel, Field


class DriftRequest(BaseModel):
    spill_geometry: dict
    observed_at: datetime
    lookback_hours: float = Field(default=24, gt=0, le=168)
    forecast_hours: float = Field(default=24, gt=0, le=168)
    origin_buffer_km: float = Field(default=10, gt=0, le=200)


class DriftResponse(BaseModel):
    mode: str
    origin_zone: dict | None
    time_window: dict | None
    path: list[dict]
    uncertainty_km: float
