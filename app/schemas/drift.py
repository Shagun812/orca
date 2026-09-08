from typing import List, Literal
from pydantic import BaseModel


class Point(BaseModel):
    longitude: float
    latitude: float


class SpillGeometry(BaseModel):
    type: Literal["Polygon"]
    coordinates: List[List[List[float]]]


class SpillInput(BaseModel):
    prediction_id: str
    spill_detected: bool
    confidence: float
    area_km2: float
    geometry: SpillGeometry
    observed_at: str


class EnvironmentInput(BaseModel):
    wind_u_mps: float
    wind_v_mps: float
    current_u_mps: float
    current_v_mps: float


class SimulationInput(BaseModel):
    direction: Literal["backward", "forward"] = "backward"
    duration_hours: int = 48
    time_step_minutes: int = 15
    windage_coefficient: float = 0.03
    particles_per_side: int = 5


class DriftRequest(BaseModel):
    spill: SpillInput
    environment: EnvironmentInput
    simulation: SimulationInput


class ReleaseTimeWindow(BaseModel):
    start: str
    end: str


class ProbableOrigin(BaseModel):
    type: Literal["Polygon"]
    coordinates: List[List[List[float]]]


class DriftResponse(BaseModel):
    prediction_id: str
    probable_origin: ProbableOrigin
    release_time_window: ReleaseTimeWindow
    origin_confidence: float
    simulation: dict