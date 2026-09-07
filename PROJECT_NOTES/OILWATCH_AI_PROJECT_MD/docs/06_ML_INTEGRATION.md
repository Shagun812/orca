# 06 — ML Integration

## Boundary
ML is a separate service so the ML team can change models without changing the frontend/backend.

```text
Rust Backend --HTTP/JSON--> ML Service → Models
```

## Capabilities

### Spill detection
Input: satellite image + metadata.
Output: detected/not detected, confidence, segmentation geometry, area, optional age.

### Drift/hindcast
Input: spill geometry, observation time, environmental variables.
Output: origin zone, origin time window, hindcast, forecast, uncertainty.

### Attribution
Input: candidate vessels, AIS tracks, origin/time window and derived features.
Output: ranked vessels, scores and evidence.

## Possible ML tooling
- PyTorch
- scikit-learn
- XGBoost
- Transformers
- Scientific/physics-based drift models
- LangChain only if an LLM explanation/orchestration layer is actually needed

The core detection and correlation pipeline does not require LangChain.
