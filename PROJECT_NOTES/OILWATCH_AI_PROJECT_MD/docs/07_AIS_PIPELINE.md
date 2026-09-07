# 07 — AIS Pipeline

```text
AIS Source
→ Ingestion
→ Validation
→ Normalization
→ PostgreSQL/PostGIS
→ Spatial/Temporal Filtering
→ Vessel Grouping
→ Trajectory Reconstruction
→ Feature Extraction
→ Candidate Ranking
```

## Normalize
MMSI, timestamp, latitude, longitude, speed, course, heading, vessel type, IMO/name when available.

## Candidate filtering
Use:
- origin probability zone
- origin time window
- configurable search buffer
- plausible movement
- optional vessel type

## Features
- minimum distance to origin
- closest approach time
- time difference
- speed around event
- heading around event
- time inside search region
- trajectory consistency
- AIS observation quality

Store the evidence behind each candidate score.
