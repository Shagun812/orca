
from datetime import datetime
from pydantic import BaseModel, Field


class DetectionRequest(BaseModel):
    image_id: str
    observed_at: datetime
    bbox: list[float] = Field(min_length=4, max_length=4)
    image_path: str | None = None


class DetectionResponse(BaseModel):
    prediction_id: str
    spill_detected: bool
    confidence: float
    area_km2: float
    geometry: dict
    observed_at: datetime
