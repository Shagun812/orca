# 02 — Rust Backend

## Stack
- Rust
- Axum
- Tokio
- SQLx
- Serde
- Reqwest
- Tower
- PostgreSQL/PostGIS
- Redis
- WebSockets
- Docker

## Structure
```text
backend/
├── src/
│   ├── main.rs
│   ├── config/
│   ├── routes/
│   ├── handlers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── middleware/
│   ├── jobs/
│   ├── websocket/
│   └── errors/
├── migrations/
├── Cargo.toml
└── Dockerfile
```

## Services
InvestigationService, SatelliteService, SpillService, DriftService, AISService, AttributionService, MLService, ReportService.

## Request flow
```text
Request → Router → Middleware → Handler → Service
→ Repository / Redis / ML Client → Response
```

## Async work
```text
POST /analysis
→ create job
→ return job_id
→ worker
→ processing
→ persist result
→ WebSocket notification
```
