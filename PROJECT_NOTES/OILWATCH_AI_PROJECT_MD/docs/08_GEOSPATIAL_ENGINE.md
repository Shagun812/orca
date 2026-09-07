# 08 — Geospatial Engine

## Purpose
Connect the spill, probable origin and vessel movement.

## Operations
- distance
- intersection
- containment
- buffering
- bounding-box filtering
- nearest-feature queries
- trajectory clipping
- spatial joins

## Flow
```text
Spill
 ↓
Origin Probability Zone
 ↓
Search Buffer
 ↓
AIS Positions
 ↓
Group by Vessel
 ↓
Reconstruct Track
 ↓
Calculate Features
```

## Uncertainty
Represent the origin as:
```text
probability zone + confidence + time window
```
rather than a falsely exact point.

## Frontend
Return GeoJSON for map objects where practical.

## Performance
Never send all raw AIS points to the browser. Send filtered/simplified trajectories and relevant vessels.
