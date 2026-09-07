# 03 — Database

## Primary
PostgreSQL + PostGIS.

Use it because the system needs relational data plus spatial/temporal operations: distance, intersection, containment, buffering and trajectory queries.

## Cache
Redis for hot data, job state, temporary results and optional rate limiting.

## Core tables
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

## Relationships
```text
User → Investigation → Spill
Spill → SatelliteObservation
Spill → DriftPrediction
Spill → OriginZone
Spill → CandidateVessel → Vessel → AISPosition
```

## Indexes
- B-tree: IDs, timestamps, MMSI.
- GiST: spatial geometry/geography.

## Example
```sql
SELECT *
FROM ais_positions
WHERE timestamp BETWEEN :start_time AND :end_time
AND ST_DWithin(position, :origin_point, :radius_meters);
```

## Scale rule
Reduce AIS by time + region before expensive analysis.
