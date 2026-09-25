#  ORCA

### Oil-spill Response & Correlation Analytics

**Satellite-based oil spill detection, probable-origin reconstruction, and AIS-based vessel investigation**

> **ORCA (Oil-spill Response & Correlation Analytics) is an investigation-support platform that detects suspected marine oil slicks from satellite imagery, reconstructs their probable origin using ocean and weather data, correlates that origin with historical AIS vessel movements, and ranks potential source vessels using explainable evidence.**

>  **Important:** ORCA produces investigative leads and evidence-based candidate rankings. It does **not** establish legal responsibility or prove that a vessel caused a spill.

---

## Smart India Hackathon

**Problem Statement:**  
**Leveraging satellite imagery to determine oil spills at sea along with AIS data correlations to identify vessel responsible for the spill.**

### Our Approach

```text
Satellite Imagery
       ↓
Oil Slick Detection
       ↓
Backward Drift 
       ↓
Probable Origin Zone
       ↓
 AIS Correlation
       ↓
Candidate Vessel Generation
       ↓
Evidence Extraction
       ↓
Vessel Compatibility Scoring
       ↓
Evidence Fusion
       ↓
Ranked Investigation Leads
       ↓
Interactive GIS Dashboard
```

---

# Problem

Marine oil spills are difficult to investigate because the location where an oil slick is **observed** may not be the location where the oil was **released**.

Investigators need to connect multiple sources of evidence:

-  Satellite imagery -> *Where is the slick?*
-  Ocean currents and wind -> *How could the slick have moved?*
-  Drift modelling -> *Where and when could it have originated?*
-  AIS data -> *Which vessels were present in that region?*
-  Geospatial analysis -> *How close were those vessels to the probable origin?*
-  Evidence fusion -> *Which candidates are most consistent with the available evidence?*

### The Challenge

Existing information is distributed across different datasets and systems, making manual investigation time-consuming and difficult to reproduce.

**ORCA connects these signals into one investigation workflow.**

---

#  Proposed Solution

ORCA follows a **Detect → Trace → Correlate → Explain** approach.

### 1. Detect

Use Sentinel-1 SAR imagery and machine learning to detect and segment suspected oil slicks.

### 2. Trace

Use ocean currents and wind fields with a physics-based drift/hindcast model to reconstruct possible paths of the slick.

### 3. Correlate

Use the resulting probable origin region and estimated release time window to search historical AIS data for relevant vessels.

### 4. Explain

Calculate spatial, temporal and trajectory evidence for each candidate vessel and produce an explainable ranking.

---

#  Why Our Approach Is Different

We are **not** proposing:

>  "AI looks at a satellite image and tells us which ship is guilty."

Instead:

>  **"AI detects the slick, physics reconstructs its probable origin, AIS provides vessel context, and evidence fusion ranks candidates based on multiple independent signals."**

This separation is important because each component solves a different problem.

### Core Idea

> **AI where learning is useful. Physics where physical modelling is more reliable. Evidence scoring where transparency matters.**

---

#  System Architecture

```text
                       ┌──────────────────┐
                       │ Sentinel-1 SAR   │
                       └────────┬─────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │ ML Oil Detection     │
                    │ (YOLO)    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Slick Characterization│
                    │ Area / Shape / Center│
                    └──────────┬───────────┘
                               │
                               ▼
                ┌──────────────────────────────┐
                │ Wind + Ocean Current Data    │
                └──────────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Backward Drift Model  │
                    │ Particle Advection    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Probable Origin Zone │
                    │ + Time Window        │
                    └──────────┬───────────┘
                               │
                               ▼
                       ┌──────────────┐
                       │ Synthetic    │
                       │ AIS Data     │
                       └──────┬───────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │ Candidate Filtering  │
                    │ Spatial + Temporal   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Feature Extraction   │
                    │ Distance / Time /    │
                    │ Trajectory / Heading │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Vessel Compatibility │
                    │ XGBoost / Scoring    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Evidence Fusion      │
                    │ + Uncertainty        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Ranked Candidates    │
                    │ + Explanation        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ GIS Investigation    │
                    │ Dashboard            │
                    └──────────────────────┘
```

---

#  Module 1: Oil Spill Detection

### Input

- Sentinel-1 SAR imagery
- Observation timestamp
- Geographic metadata

### Processing

```text
SAR Image
   ↓
Preprocessing
   ↓
YOLO
   ↓
Oil Probability Map
   ↓
Segmentation
```

### Output

- Spill detected/not detected
- Oil probability
- Spill polygon
- Area
- Centroid
- Detection confidence
- Slick geometry

### Why SAR?

SAR is particularly useful for maritime monitoring because it can operate during both day and night and under many cloudy conditions.

---

#  Module 2: Probable Origin Reconstruction

Detecting the slick only tells us **where it was observed**.

The oil may have travelled from another location.

Therefore, ORCA uses:

- Ocean currents
- Wind
- Observation time
- Estimated spill age
- Observed slick geometry

with a **particle-based drift/physics model**.

```text
Observed Oil
      +
Wind
      +
Ocean Currents
      ↓
Backward Simulation
      ↓
Multiple Possible Paths
      ↓
Origin Probability Field
```

### Output

Instead of claiming an exact release coordinate:

```text
Origin = (X, Y)
```

we produce:

```text
Probable Origin Zone
        +
Confidence
        +
Estimated Time Window
```

This allows the system to explicitly represent uncertainty.

---

# Module 3: AIS Correlation

Once we know:

```text
Probable Origin
       +
Estimated Release Window
```

We used Synthetic AIS data to train Xgboost model.

### Candidate Generation

```text
All AIS vessels
       ↓
Time filtering
       ↓
Spatial filtering
       ↓
Relevant vessel positions
       ↓
Candidate vessels
```

We do **not** run expensive analysis over every vessel in the region.

Only vessels that are spatially and temporally relevant proceed to the next stage.

---

# Module 4: Vessel Evidence & Scoring

For every candidate vessel, ORCA extracts evidence such as:

### Spatial

- Distance from probable origin
- Closest approach
- Position relative to origin probability

### Temporal

- Difference from estimated release time
- Presence during the release window
- Time spent near the origin region

### Trajectory

- Vessel movement
- Heading
- Speed
- Trajectory compatibility


These features are combined to calculate a **vessel compatibility score**.

---

# Pipeline

The final stage combines multiple evidence signals.

Conceptually:

```text
Spatial Evidence
       +
Temporal Evidence
       +
Trajectory Evidence
       +
Origin Probability
       +
AIS Quality
       ↓
Evidence Fusion
       ↓
Compatibility Score
       ↓
Candidate Ranking
```

For example:

| Rank | Vessel | Compatibility | Key Evidence |
|---:|---|---:|---|
|  1 | Vessel A | 0.87 | Strong spatial + temporal + trajectory match |
|  2 | Vessel B | 0.71 | Strong time match, weaker trajectory |
|  3 | Vessel C | 0.34 | Weak origin and temporal correspondence |

The score is an **evidence compatibility score**, not a probability of guilt.


---

#  Investigation Dashboard

The final interface provides a unified GIS view.

### Map Layers

-  Satellite imagery
-  Detected oil slick
-  Origin probability heatmap
-  Hindcast trajectory
-  Forecast trajectory
-  AIS vessel positions
-  Vessel trajectories
-  Wind/current vectors

### Investigation Panel

```text
┌───────────────────────────────────────┐
│          SPILL #001                   │
├───────────────────────────────────────┤
│ Area:              32.7 km²           │
│ Detection:         94%                │
│ Origin Confidence: 82%                │
│ Release Window:    09:30–11:30 UTC    │
├───────────────────────────────────────┤
│ Potential Vessels                     │
│                                       │
│ #1 Vessel A        87/100             │
│ #2 Vessel B        71/100             │
│ #3 Vessel C        34/100             │
└───────────────────────────────────────┘
```

The investigator can click a candidate vessel and inspect the underlying evidence.

---

#  Data Sources

The prototype is designed around multiple complementary data sources.

### Satellite

**Sentinel-1 SAR**

Used for:

- Oil slick detection
- Segmentation
- Slick characterization

### AIS

Synthetic vessel position and identity information used for:

- Candidate generation
- Vessel trajectories
- Spatial/temporal correlation

### Ocean & Weather

Wind and ocean-current fields used for:

- Drift modelling
- Backward hindcast
- Origin estimation
- Forward forecasting

### Research / Training Data

The prototype can leverage publicly available oil-slick/look-alike SAR datasets for model development and evaluation.
Xgboost model is trained on synthetic data.

---

#  ML & Scientific Models

ORCA deliberately avoids turning every stage into a deep-learning problem.

| Stage | Approach |
|---|---|
| Oil detection | **YOLO** |
| Oil movement | **Physics-based particle advection** |
| Origin estimation | Backward hindcast + probability field |
| AIS candidate generation | Spatial/temporal filtering |
| Vessel compatibility | **XGBoost / feature-based model** |
| Evidence fusion | **Weighted scoring** |
| Ranking | Top-N candidate ranking |

### Why This Architecture?

> **We use machine learning for perception and pattern recognition, while using physical modelling for ocean dynamics and transparent evidence scoring for investigation.**

---

# Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- MapLibre GL JS
- TanStack Query
- Recharts

### Backend

- Rust
- Axum
- Tokio
- SQLx
- WebSockets

### Data

- PostgreSQL
- PostGIS
- Redis
- GeoJSON
- Parquet / NetCDF / GeoTIFF where appropriate

### AI / Scientific Computing

- Python
- PyTorch
- scikit-learn
- XGBoost
- NumPy
- SciPy
- Xarray
- Rasterio
- GeoPandas
- Shapely

### Deployment

- Docker
- Docker Compose

---

#  MVP Scope

The SIH prototype focuses on demonstrating the **complete investigation loop**, rather than attempting nationwide real-time deployment.

### MVP

```text
✓ Satellite image
       ↓
✓ Oil detection
       ↓
✓ Drift/hindcast
       ↓
✓ Probable origin
       ↓
✓ Synthetic AIS correlation
       ↓
✓ Candidate vessels
       ↓
✓ Evidence scoring
       ↓
✓ Ranked candidates
       ↓
✓ Interactive GIS dashboard
```

### What We Will Demonstrate

A complete investigation of a selected maritime scenario:

> **Satellite observation → detected slick → reconstructed origin → relevant vessels → evidence-based ranking → visual investigation report**


---

#  Feasibility

### Why the MVP is Feasible

The prototype can be constructed using:

- Public satellite imagery
- Public/research oil-spill datasets
- A Synthetic AIS dataset
- Open-source ML frameworks

### Major Risks

| Risk | Mitigation |
|---|---|
| SAR look-alikes | Oil/look-alike classification + confidence |
| Drift uncertainty | Multiple simulations + probability zone |
| AIS gaps | Data-quality indicators + uncertainty |
| Limited attribution labels | Controlled/synthetic scenarios for prototype |
| False attribution | Candidate ranking instead of binary guilt |
| Large AIS volume | Spatial + temporal pre-filtering |
| Long computation | Asynchronous processing |

---

#  Impact

## Environmental

- Faster identification of suspected oil pollution
- Better understanding of spill movement
- Improved response planning

## Maritime Security

- Historical vessel movement intelligence
- Prioritized investigation leads
- Improved maritime situational awareness

## Government & Enforcement

- Unified investigation workflow
- Reduced manual data correlation
- Evidence visualization for investigators

---

#  Key Innovation

ORCA's innovation is not simply detecting oil spills.

The core value is the **integration of multiple evidence layers into an explainable investigation workflow**:

```text
Satellite
   +
Ocean Physics
   +
AIS
   +
Geospatial Intelligence
   +
Machine Learning
   +
Evidence Fusion
   ↓
Explainable Maritime Pollution Intelligence
```

### Our Core Proposition

> **"We don't just detect the spill. we reconstruct the evidence behind it."**

---

#  Research Foundation

The system is informed by research in:

- Satellite SAR-based oil spill detection
- Marine oil-spill trajectory modelling
- Ocean-current and wind-driven drift
- AIS-based maritime intelligence
- Geospatial data fusion

Selected references include:

1. **Li et al. (2023)**: *A self-evolving deep learning algorithm for automatic oil spill detection in Sentinel-1 SAR images.*
2. **Trujillo-Acatitla et al. (2024)**: *Marine oil spill detection and segmentation in SAR data with two steps Deep Learning framework.*
3. **Li et al. (2019)**: *The forecasting and analysis of oil spill drift trajectory during the Sanchi collision accident.*
4. **Pärt et al. (2023)**: *An ocean–wave–trajectory forecasting system for the eastern Baltic Sea.*

---

#  Prototype Limitations

The prototype has several important limitations:

- Satellite imagery may contain oil-look-alikes.
- Cloud/weather conditions can affect some observations.
- Drift modelling depends on the quality and resolution of environmental data.
- AIS data may be incomplete or unavailable for some vessels.
- Confirmed vessel-source attribution datasets are limited.
- Candidate ranking cannot establish legal responsibility.
- Prototype performance may not directly represent production-scale performance.

These limitations are treated as part of the investigation workflow rather than hidden from the user.

---

#  Responsible Use

ORCA is designed as an **investigation-support system**.

A high-ranked vessel should be interpreted as:

> **"A vessel whose available movement and contextual evidence is highly compatible with the reconstructed spill scenario."**

It should **not** be interpreted as:

> **"This vessel is legally responsible for the spill."**

Final responsibility must be established through appropriate investigation and additional evidence.

---

#  Future Scope

Potential extensions include:

- Improved oil/look-alike classification
- Multi-satellite fusion
- Near-real-time satellite ingestion
- Improved drift and uncertainty modelling
- Real-time AIS monitoring
- Vessel behavioural anomaly detection
- Investigator feedback loops
- Automated alerts
- Large-scale maritime processing
- Advanced uncertainty calibration
- Integration with additional government maritime datasets

---

#  Team

| Member | Role |
|---|---|
| Shagun Rajput | AI/ML |
| Aarav Jain | AI/ML |
| Bivash Chakroboraty | Backend |
| Abhinav Dobhal | Presenatation/Research |
| Bhavya | Frontend |
| Tanisha Dabbas | Research/Domain |

---

#  Running the Project

### Clone

```bash
git clone https://github.com/Shagun812/orca.git
```

### For starting the website:

Follow [Instructions.md](instructions.md)

---

#  Final Value Proposition

### The Problem

> **Oil spills can be detected, but determining where they originated and which vessels may be associated with them requires connecting fragmented datasets and uncertain physical processes.**

### Our Solution

> **ORCA combines satellite AI, ocean-drift reconstruction, AIS intelligence and explainable evidence fusion into a unified investigation workflow.**

### The Result

```text
DETECT
   ↓
TRACE
   ↓
CORRELATE
   ↓
EXPLAIN
   ↓
PRIORITIZE INVESTIGATION
```

> ##  ORCA
 ### **Oil-spill Response & Correlation Analytics**

**From an observed oil slick to an evidence-backed investigation trail.**

---
