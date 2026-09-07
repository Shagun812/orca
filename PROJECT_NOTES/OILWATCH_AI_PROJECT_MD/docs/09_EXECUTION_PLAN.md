# 09 — Execution Plan

## Phase 1 — Contracts
Freeze API schemas, DB entities, GeoJSON conventions and ML schemas.

## Phase 2 — Infrastructure
Set up Docker Compose, PostgreSQL/PostGIS, Redis, Rust/Axum and React/Vite.

Success:
```text
React ↔ Rust ↔ PostgreSQL
```

## Phase 3 — Backend
Implement investigations, spills, satellite records, vessels, AIS, jobs and authentication.

## Phase 4 — Frontend
Implement login, dashboard, investigation list/detail, map and candidate table.

## Phase 5 — ML integration
Start with mocked ML responses:
```text
React → Rust → Mock ML → DB → React
```
Then replace the mock service with the real model.

## Phase 6 — AIS intelligence
Implement spatial/temporal filtering, candidate generation, trajectory reconstruction, features and ranking.

## Phase 7 — Final flow
```text
Satellite → Spill → Drift → Origin → AIS → Candidates → Ranking → Evidence → Dashboard
```

## Phase 8 — Hardening
Test ML failures, missing AIS, invalid coordinates, no candidates, low confidence, slow jobs, WebSocket reconnects and DB failures.
