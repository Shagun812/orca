
# Part B — Intelligence / ML / AIS / Geospatial

## Responsibility

Part B converts satellite observations and supporting environmental/AIS data into
structured evidence for the ORCA application.

### Master flow

Satellite Image
→ Preprocessing
→ Spill Detection
→ Spill Characterization
→ Drift Hindcasting
→ Origin Zone + Time Window
→ AIS Spatial/Temporal Filtering
→ Candidate Vessels
→ Trajectory Reconstruction
→ Feature Extraction
→ Evidence Scoring
→ Ranked Candidates

## Boundary with Part A

Part A:
- React dashboard
- Rust/Axum API
- authentication
- investigation lifecycle
- database persistence
- Redis/job orchestration
- WebSocket updates
- report/export UI

Part B:
- detection
- drift/hindcast
- origin estimation
- AIS filtering
- trajectory processing
- geospatial feature calculation
- candidate scoring/ranking
- ML inference

Part B returns JSON and GeoJSON-compatible structures. It does not connect directly
to the browser or own the application's database.

## API

- `GET /health`
- `POST /detect`
- `POST /drift/hindcast`
- `POST /drift/forecast`
- `POST /attribution/rank`

## V1 implementation

The first prototype uses deterministic baselines:
- a demo segmentation polygon when no raster is supplied
- a simple drift approximation driven by current/wind vectors
- haversine distance and nearest-approach calculations
- explainable rule-based candidate scoring

This is intentional: the team can demonstrate the complete pipeline first and replace
individual components with trained/physical models later.

## Candidate score

The baseline score combines:
- spatial proximity
- temporal proximity
- trajectory consistency
- time spent in/near the origin search region
- AIS quality

The output is investigative evidence and candidate ranking, not legal proof of
responsibility.
