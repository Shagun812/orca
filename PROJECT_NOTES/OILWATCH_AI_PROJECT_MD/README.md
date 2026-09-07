# OILWATCH AI — Project Engineering Markdown Pack

## Stack
React + TypeScript → Rust + Axum → PostgreSQL + PostGIS + Redis → ML Services

## Team split
- Backend: Rust, APIs, DB, AIS/geospatial processing, jobs, ML integration.
- Frontend: React, TypeScript, MapLibre, dashboard and investigation UI.
- ML: oil-spill detection, drift/hindcast and vessel attribution.

## Core flow
Satellite imagery → spill detection → spill geometry → drift/hindcast → probable origin → AIS filtering → candidate vessels → scoring → evidence → GIS dashboard.

## Database decision
PostgreSQL + PostGIS is the primary database. Redis is used for cache, job state and transient data.
