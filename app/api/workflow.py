from fastapi import APIRouter

from app.detection.inference import detect_spill
from app.drift.hindcast import run_hindcast
from app.schemas.detection import DetectionRequest, DetectionResponse
from app.schemas.drift import DriftRequest, DriftResponse


router = APIRouter(
    prefix="/workflow",
    tags=["Workflow"],
)


@router.post(
    "/check-spill",
    response_model=DetectionResponse,
)
def check_spill(request: DetectionRequest) -> DetectionResponse:
    """
    Stage 1: Check satellite observation for an oil spill.
    """
    return detect_spill(request)


@router.post(
    "/set-radius",
    response_model=DriftResponse,
)
def set_radius(request: DriftRequest) -> DriftResponse:
    """
    Stage 2: Reconstruct the probable spill origin using
    backward drift/hindcast and the user-defined uncertainty radius.
    """
    return run_hindcast(request)