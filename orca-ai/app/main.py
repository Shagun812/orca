from fastapi import FastAPI
from app.api.workflow import router as workflow_router
from app.api.attribution import router as attribution_router
from app.api.detection import router as detection_router
from app.api.drift import router as drift_router
from app.api.health import router as health_router
from app.config import settings


def _warm_detector() -> None:
    """Load YOLO before the first case is submitted, avoiding cold-start delay."""
    try:
        from app.detection.inference import _model
        _model()
    except Exception as exc:
        # Health can still report the service process; inference returns its
        # own clear error if the trained weights are unavailable.
        print(f"Detector warm-up skipped: {exc}")

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="ORCA Part B intelligence service",
)


@app.on_event("startup")
def warm_model_on_startup() -> None:
    _warm_detector()

app.include_router(health_router)
app.include_router(detection_router)
app.include_router(drift_router)
app.include_router(attribution_router)
app.include_router(workflow_router)
