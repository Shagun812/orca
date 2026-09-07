# OILWATCH AI — Backend Build Instructions

Scope: backend only. ML is a separate team/service — call it over HTTP, mock it until it's ready.

## 1. Stack
- Rust
- Axum (web framework)
- Tokio (async runtime)
- SQLx (Postgres driver, compile-time checked queries)
- Serde (JSON serialization)
- Reqwest (HTTP client, for calling the ML service)
- Tower (middleware)
- PostgreSQL + PostGIS (primary database)
- Redis (cache, job state)
- WebSockets (job progress / realtime updates)
- Docker (local + deployment)

## 2. Project structure
```text
backend/
├── src/
│   ├── main.rs
│   ├── config/          # env loading, settings struct
│   ├── routes/           # route → handler wiring
│   ├── handlers/         # HTTP layer, request/response mapping
│   ├── services/         # business logic
│   ├── repositories/     # DB queries (SQLx)
│   ├── models/           # structs shared across layers
│   ├── middleware/        # auth, logging, request id
│   ├── jobs/              # async job workers
│   ├── websocket/         # WS connection handling
│   └── errors/            # unified error type
├── migrations/
├── Cargo.toml
└── Dockerfile
```

## 3. Core principles
- Backend owns orchestration. Frontend never touches the DB directly.
- PostgreSQL/PostGIS is the source of truth.
- Redis is for cache and job state only, not source of truth.
- ML is decoupled behind HTTP calls — mock it first, swap in the real service later.
- Filter spatially/temporally in PostGIS before doing expensive processing.
- Anything slow (detection, drift, AIS correlation) runs as an async job, not inline in the request.

## 4. Database

### Primary: PostgreSQL + PostGIS
Needed for relational data plus spatial/temporal ops: distance, intersection, containment, buffering, trajectory queries.

### Core tables
```text
users
investigations
satellite_observations
spills
spill_observations
drift_predictions
origin_zones
vessels
ais_positions
trajectories
candidate_vessels
model_predictions
jobs
alerts
reports
```

### Relationships
```text
User → Investigation → Spill
Spill → SatelliteObservation
Spill → DriftPrediction
Spill → OriginZone
Spill → CandidateVessel → Vessel → AISPosition
```

### Indexes
- B-tree on IDs, timestamps, MMSI.
- GiST on all spatial geometry/geography columns.

### Example spatial query
```sql
SELECT *
FROM ais_positions
WHERE timestamp BETWEEN :start_time AND :end_time
AND ST_DWithin(position, :origin_point, :radius_meters);
```

### Scale rule
Always reduce the AIS dataset by time window + region before running any candidate/feature logic.

## 5. Services to implement
- `InvestigationService` — CRUD for investigations
- `SatelliteService` — register/fetch satellite observations
- `SpillService` — store spill records, trigger detection
- `DriftService` — trigger drift/hindcast, store origin zone
- `AISService` — ingest, normalize, and query AIS positions
- `AttributionService` — run candidate ranking, store evidence
- `MLService` — thin HTTP client wrapping calls to the ML service (mocked initially)
- `ReportService` — generate/export investigation reports

## 6. API contract

Base path: `/api/v1`

### Investigations
```text
GET    /investigations
POST   /investigations
GET    /investigations/{id}
PATCH  /investigations/{id}
DELETE /investigations/{id}
```

### Satellite
```text
GET  /satellite/images
GET  /satellite/images/{id}
POST /satellite/images
```

### Spill
```text
GET  /spills
GET  /spills/{id}
POST /spills/detect
POST /spills/{id}/analyze
```

### Drift
```text
POST /drift/hindcast
POST /drift/forecast
GET  /drift/{id}
```

### AIS
```text
GET /ais/vessels
GET /ais/vessels/{id}
GET /ais/vessels/{id}/track
GET /ais/search
```

### Candidates
```text
GET /spills/{spill_id}/candidates
GET /candidates/{candidate_id}
```

### Jobs
```text
GET /jobs/{id}
```

## 7. Request flow
```text
Request → Router → Middleware (auth, request-id, logging) → Handler
→ Service → Repository / Redis / ML Client → Response
```

## 8. Async jobs
Any expensive operation (detection, drift, AIS correlation, attribution) follows this pattern:
```text
POST /analysis
→ create job row (status: pending)
→ return job_id immediately
→ background worker picks up job
→ processing (may call ML service)
→ persist result to Postgres
→ push WebSocket notification with progress/result
```
Frontend polls `GET /jobs/{id}` or listens on the WebSocket — support both.

## 9. Mocking the ML service
Until the ML team's service is ready, `MLService` should return realistic fake data matching the real contract, so the rest of the backend and the frontend can be built against it now.

### Detection request → ML
```json
{
  "image_id": "sat_001",
  "timestamp": "2026-08-24T10:30:00Z",
  "bbox": [80.1, 15.2, 81.4, 16.3]
}
```

### Detection response ← ML
```json
{
  "prediction_id": "pred_001",
  "spill_detected": true,
  "confidence": 0.94,
  "area_km2": 32.7,
  "geometry": {}
}
```

### Candidate ranking response (backend → frontend)
```json
{
  "spill_id": "spill_001",
  "results": [
    {
      "vessel_id": "v_001",
      "rank": 1,
      "score": 0.91,
      "evidence": {
        "min_distance_km": 3.2,
        "time_difference_hours": 1.4,
        "trajectory_score": 0.87
      }
    }
  ]
}
```

Build `MLService` behind a trait/interface so swapping the mock for the real HTTP client later is a one-line change, not a rewrite.

## 10. AIS pipeline (backend-owned)
```text
AIS Source → Ingestion → Validation → Normalization → PostgreSQL/PostGIS
→ Spatial/Temporal Filtering → Vessel Grouping → Trajectory Reconstruction
→ Feature Extraction → Candidate Ranking
```
Normalize fields: MMSI, timestamp, latitude, longitude, speed, course, heading, vessel type, IMO/name when available.

Candidate filtering uses: origin probability zone, origin time window, a configurable search buffer, plausible movement, optional vessel type.

Features to compute per candidate (store the evidence, don't just store the score):
- minimum distance to origin
- closest approach time
- time difference from event
- speed/heading around the event
- time spent inside search region
- trajectory consistency
- AIS observation quality

## 11. Geospatial rules
- Represent origin as **probability zone + confidence + time window**, never a falsely exact point.
- Return GeoJSON for anything the frontend will draw on the map.
- Never send raw/unfiltered AIS points to the frontend — always filter/simplify server-side first.

## 12. Environment variables
```text
DATABASE_URL=
REDIS_URL=
ML_SERVICE_URL=
JWT_SECRET=
RUST_LOG=
```
Never commit secrets.

## 13. Deployment (local)
```bash
docker compose up --build
```
Services: `frontend`, `backend`, `postgres-postgis`, `redis`, `ml-service` (mock or real).

## 14. Failure handling to build in
```text
ML unavailable      → job FAILED → retry → surface warning
AIS unavailable      → data-availability warning
No candidates found  → empty-result state, not an error
Low confidence       → uncertainty warning in response
Invalid coordinates  → 400 validation error
Slow analysis        → stays async, progress via WebSocket
```

## 15. Build order (backend-only slice)
1. Docker Compose: Postgres+PostGIS, Redis, backend skeleton. Confirm `backend ↔ postgres` connectivity.
2. Auth + Investigation CRUD.
3. Satellite observation records + Spill records (detection endpoint calls **mocked** ML).
4. Drift/hindcast endpoint (mocked ML) → store origin zone.
5. AIS ingestion + normalization + spatial/temporal query endpoint.
6. Candidate generation + feature extraction + ranking (mocked or rule-based scoring is fine for now).
7. Job system + WebSocket progress notifications.
8. Reports/export endpoint.
9. Swap mocked `MLService` calls for the real ML service once it's available.
