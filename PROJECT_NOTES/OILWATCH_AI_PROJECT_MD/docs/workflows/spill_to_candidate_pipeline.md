# Spill to Candidate Pipeline

## Purpose
This document outlines the primary asynchronous workflow for detecting a spill, modeling its origin, and attributing it to a candidate vessel using the `MODEL/` intelligence service.

## Stages / Flow

### Stage 1: Spill Detection
1. A user (or automated watcher) triggers `POST /api/v1/spills/detect` passing image metadata and a bounding box.
2. The Rust backend creates a new `job` in the database and returns the `job_id` to the frontend.
3. The background worker asynchronously calls the MODEL's `/detect` endpoint.
4. If a spill is detected, the resulting Polygon GeoJSON is stored in the `spills` table via PostGIS functions. The job is marked complete.

### Stage 2: Drift Hindcast & Origin Modeling
1. From the investigation detail, the user triggers drift modeling which hits `POST /api/v1/drift/hindcast`.
2. A new job is created. The worker fetches the most recent spill geometry and posts it to the MODEL's `/drift/hindcast` endpoint.
3. The MODEL service returns a calculated `origin_zone` (with center and radius) and a `time_window`.
4. This data is persisted into the `origin_zones` table in PostGIS.

### Stage 3: AIS Correlation & Attribution (Pending Backend Implementation)
1. Following hindcast, the worker (or a subsequent request) gathers AIS points from the `ais_positions` table matching the time window and bounding box of the origin zone.
2. These positions are sent to the MODEL's `/attribution/rank` endpoint.
3. The MODEL computes spatial, temporal, trajectory, and dwell scores, returning a ranked list of candidate `vessel_id`s (MMSI).
4. The worker joins these MMSIs against vessel metadata and persists the ranked candidates to the database for frontend display.
