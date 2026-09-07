
from fastapi import APIRouter

from app.drift.hindcast import run_hindcast
from app.drift.forecast import run_forecast
from app.schemas.drift import DriftRequest, DriftResponse

router = APIRouter(prefix="", tags=["drift"])


@router.post("/drift/hindcast", response_model=DriftResponse)
def hindcast(request: DriftRequest) -> DriftResponse:
    return run_hindcast(request)


@router.post("/drift/forecast", response_model=DriftResponse)
def forecast(request: DriftRequest) -> DriftResponse:
    return run_forecast(request)
