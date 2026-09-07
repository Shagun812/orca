# 04 — API Contract

Base path: `/api/v1`

## Investigation
```text
GET    /investigations
POST   /investigations
GET    /investigations/{id}
PATCH  /investigations/{id}
DELETE /investigations/{id}
```

## Satellite
```text
GET  /satellite/images
GET  /satellite/images/{id}
POST /satellite/images
```

## Spill
```text
GET  /spills
GET  /spills/{id}
POST /spills/detect
POST /spills/{id}/analyze
```

## Drift
```text
POST /drift/hindcast
POST /drift/forecast
GET  /drift/{id}
```

## AIS
```text
GET /ais/vessels
GET /ais/vessels/{id}
GET /ais/vessels/{id}/track
GET /ais/search
```

## Candidates
```text
GET /spills/{spill_id}/candidates
GET /candidates/{candidate_id}
```

## Jobs
```text
GET /jobs/{id}
```

## ML detection request
```json
{
  "image_id": "sat_001",
  "timestamp": "2026-08-24T10:30:00Z",
  "bbox": [80.1, 15.2, 81.4, 16.3]
}
```

## ML detection response
```json
{
  "prediction_id": "pred_001",
  "spill_detected": true,
  "confidence": 0.94,
  "area_km2": 32.7,
  "geometry": {}
}
```

## Candidate response
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
