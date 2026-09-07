
from datetime import datetime
from pydantic import BaseModel, Field

from app.schemas.ais import AISPosition


class AttributionRequest(BaseModel):
    event_time: datetime
    origin_zone: dict
    time_window: dict
    ais_positions: list[AISPosition]
    search_buffer_km: float = Field(default=20, gt=0, le=200)


class AttributionResponse(BaseModel):
    candidate_count: int
    filtered_position_count: int
    candidates: list[dict]
