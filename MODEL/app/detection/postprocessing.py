
from typing import Any


def clean_prediction(prediction: dict[str, Any]) -> dict[str, Any]:
    """Small contract-normalization hook for future model outputs."""
    prediction = dict(prediction)
    prediction["confidence"] = float(prediction.get("confidence", 0.0))
    prediction["spill_detected"] = bool(prediction.get("spill_detected", False))
    return prediction
