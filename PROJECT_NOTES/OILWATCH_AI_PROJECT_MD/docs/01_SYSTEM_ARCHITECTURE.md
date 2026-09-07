# 01 — System Architecture

```text
USER
 ↓
React + TypeScript
 ↓ REST / WebSocket
Rust + Axum Backend
 ├── PostgreSQL + PostGIS
 ├── Redis
 └── ML Services
      ├── Spill Detection
      ├── Drift/Hindcast
      └── Attribution
```

## Data sources
```text
Satellite ──────┐
AIS ────────────┼→ Ingestion → Data Layer
Ocean/Weather ──┘
```

## Runtime
```text
Satellite → Spill Detection → Spill Record
Spill + Environment → Drift → Origin Zone
Origin + Time Window → PostGIS AIS Query
AIS → Trajectories → Features → Attribution
Results → Backend → React GIS Dashboard
```

## Principles
- Backend owns orchestration.
- PostgreSQL/PostGIS is source of truth.
- Redis handles cache/job state.
- ML is decoupled behind APIs.
- Frontend never accesses the DB directly.
- Spatial/time filtering happens before expensive processing.
- Long-running analysis is asynchronous.
