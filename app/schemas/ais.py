
from pydantic import BaseModel, Field


class AISPosition(BaseModel):
    mmsi: str
    timestamp: str
    latitude: float
    longitude: float
    speed_knots: float = Field(ge=0, le=100)
    course_deg: float = Field(ge=0, le=360)
    heading_deg: float | None = Field(default=None, ge=0, le=360)
    vessel_type: str | None = None
    imo: str | None = None
    vessel_name: str | None = None
