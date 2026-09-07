# 11 — Complete Architecture & Workflow

This file is the main source for architecture diagrams, Figma diagrams and PPT visuals.

## 1. Master architecture

```text
                         ┌────────────────┐
                         │      USER      │
                         └───────┬────────┘
                                 ↓
                    ┌────────────────────────┐
                    │ React + TypeScript     │
                    │ MapLibre GIS Dashboard │
                    └───────────┬────────────┘
                                │ REST / WS
                                ↓
                    ┌────────────────────────┐
                    │ Rust + Axum Backend    │
                    │ API + Orchestration    │
                    │ Jobs + Authentication  │
                    └───────┬────────┬───────┘
                            │        │
                            ↓        ↓
                 ┌────────────────┐ ┌────────────────┐
                 │ PostgreSQL     │ │ Redis          │
                 │ + PostGIS      │ │ Cache / Jobs   │
                 └───────┬────────┘ └────────────────┘
                         ↓
                ┌─────────────────────┐
                │ ML Services         │
                │ Spill / Drift /     │
                │ Attribution         │
                └─────────────────────┘
```

## 2. Data-source architecture

```text
Satellite ──────┐
AIS ────────────┼→ Ingestion → PostgreSQL/PostGIS
Ocean/Weather ──┘
```

## 3. Complete investigation workflow

```text
START
 ↓
Create Investigation
 ↓
Select Area + Time
 ↓
Select Satellite Observation
 ↓
Run Oil Detection
 ↓
Oil Detected?
 ├─ NO → Review / finish
 └─ YES
      ↓
   Store Spill
      ↓
   Geometry + Confidence
      ↓
   Run Drift/Hindcast
      ↓
   Estimate Origin Zone
      ↓
   Estimate Origin Time Window
      ↓
   Query AIS History
      ↓
   Generate Candidate Vessels
      ↓
   Extract Spatial/Temporal/Trajectory Features
      ↓
   Run Attribution/Ranking
      ↓
   Store Evidence
      ↓
   Render GIS Dashboard
      ↓
   Investigator Review
      ↓
   Report / Export
      ↓
     END
```

## 4. Spill detection

```text
Satellite Image
 ↓
Preprocessing
 ↓
ML Detection / Segmentation
 ↓
Spill Geometry
 ├─ Boundary
 ├─ Area
 ├─ Centroid
 └─ Confidence
 ↓
PostGIS
 ↓
Map
```

## 5. Drift/hindcast

```text
Spill Geometry + Timestamp
              +
       Wind / Currents
              ↓
        Drift Model
         ↙       ↘
   Hindcast      Forecast
       ↓             ↓
 Origin Zone      Future Path
       ↓
PostGIS + Dashboard
```

## 6. AIS correlation

```text
Origin Zone + Time Window
            ↓
     PostGIS Query
            ↓
      AIS Positions
            ↓
   Time + Distance Filter
            ↓
       Vessel Groups
            ↓
      Trajectories
            ↓
     Feature Extraction
            ↓
     Attribution Model
            ↓
    Ranked Candidates
```

## 7. Candidate evidence

```text
Candidate Vessel
 ├─ Spatial: distance/proximity
 ├─ Temporal: event-time proximity
 ├─ Trajectory: movement consistency
 └─ Behavioural: relevant indicators
              ↓
            Score
              ↓
            Rank
              ↓
       Evidence Breakdown
```

## 8. Frontend flow

```text
User
 ↓
React Page
 ↓
TanStack Query
 ↓
Rust API
 ↓
JSON / GeoJSON
 ↓
Cards + Tables + Charts + MapLibre
```

Realtime:
```text
Rust → WebSocket → React → UI update
```

## 9. Backend flow

```text
HTTP Request
 ↓
Axum Router
 ↓
Middleware
 ├─ Auth
 ├─ Validation
 ├─ Request ID
 └─ Logging
 ↓
Handler
 ↓
Service
 ├─ Repository
 ├─ Redis
 ├─ ML Client
 └─ Job Worker
 ↓
Response
```

## 10. Async processing

```text
User
 ↓ POST /analysis
Rust
 ↓
Create Job
 ↓
Return job_id
 ↓
Worker Queue
 ↓
Processing
 ├─ ML Detection
 ├─ Drift
 ├─ AIS Correlation
 └─ Attribution
 ↓
Persist Results
 ↓
WebSocket Progress
 ↓
React Update
```

## 11. Map layers

```text
MapLibre
 ├─ Satellite imagery
 ├─ Oil slick polygon
 ├─ Origin probability zone
 ├─ Hindcast path
 ├─ Forecast path
 ├─ AIS vessels
 └─ Vessel trajectories
```

## 12. Failure workflow

```text
ML unavailable → Job FAILED → Retry → Warning if still failed
AIS unavailable → Data availability warning
No candidates → Empty-result state
Low confidence → Uncertainty warning
Invalid coordinates → Validation error
Slow analysis → Async job + progress
```

## 13. PPT diagrams to create

### System architecture
Use section 1.

### End-to-end pipeline
```text
Satellite + AIS + Ocean Data
→ Detection
→ Spill
→ Drift
→ Origin
→ AIS Correlation
→ Candidate Ranking
→ GIS Dashboard
```

### AIS intelligence
```text
Origin Zone
→ Spatial/Temporal Filter
→ AIS
→ Trajectory
→ Features
→ Attribution
→ Ranking
```

### Technology architecture
```text
React/TypeScript
       ↓
Rust/Axum
       ↓
PostgreSQL/PostGIS + Redis
       ↓
ML Services
```

### Investigation dashboard
Show a map with:
- slick polygon
- origin zone
- drift path
- vessel tracks
- candidate ranking panel
- evidence breakdown

## One-line master flow

```text
Satellite + AIS + Ocean/Weather Data → AI Spill Detection → Spill Characterization → Drift Hindcasting → Origin Estimation → PostGIS Spatio-Temporal AIS Correlation → Vessel Candidate Ranking → Evidence-Based GIS Dashboard
```
