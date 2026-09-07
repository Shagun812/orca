
from fastapi import APIRouter

from app.detection.inference import detect_spill
from app.schemas.detection import DetectionRequest, DetectionResponse

router = APIRouter(prefix="", tags=["detection"])


@router.post("/detect", response_model=DetectionResponse)
def detect(request: DetectionRequest) -> DetectionResponse:
    return detect_spill(request)
