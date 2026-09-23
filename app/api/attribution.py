
from fastapi import APIRouter

from app.attribution.ranking import rank_candidates
from app.schemas.attribution import AttributionRequest, AttributionResponse

router = APIRouter(prefix="", tags=["attribution"])


@router.post("/attribution/rank", response_model=AttributionResponse)
def attribution(request: AttributionRequest) -> AttributionResponse:
    return rank_candidates(request)
