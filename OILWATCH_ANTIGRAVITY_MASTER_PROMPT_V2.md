# OILWATCH AI — ANTIGRAVITY MASTER PROMPT (v2 — grounded in real repo)

Paste this whole file into Antigravity. This version is built directly from the actual
`orca` repo contents — real MODEL schemas, real endpoints, real Stitch designs, real
logging conventions already in `PROJECT_NOTES/`. Nothing here is assumed.

---

## Repo structure (work inside this — do not restructure)

```text
orca/
├── MODEL/                      → real FastAPI intelligence service (Python) — teammate's, do not modify
├── PROJECT_NOTES/OILWATCH_AI_PROJECT_MD/
│   ├── docs/                   → build instruction docs (already written)
│   ├── docs/workflows/         → one .md per system workflow
│   ├── docs/modules/backend/   → one .md per backend module
│   ├── docs/modules/frontend/  → one .md per frontend module
│   └── docs/file_changes.md    → running change log table
└── WEBSITE/
    ├── backend/                → your target (currently empty — build here)
    ├── frontend/                → your target (currently empty — build here)
    └── FRONTEND-DESIGN/         → finalized Stitch screens — your visual spec
        ├── nocturne_maritime/DESIGN.md   → design system (colors, type, spacing, components)
        ├── oilwatch_ai_login/
        ├── oilwatch_ai_dashboard/
        ├── oilwatch_ai_investigations_list/
        ├── oilwatch_ai_investigation_detail/
        ├── oilwatch_ai_vessel_detail/
        ├── oilwatch_ai_reports/
        └── oilwatch_ai_settings/
```

Build backend in `WEBSITE/backend/` and frontend in `WEBSITE/frontend/`. Both are currently
empty — you are starting fresh there.

## Scope boundary

You are building `WEBSITE/backend/` and `WEBSITE/frontend/` only. Do not modify anything in
`MODEL/` — it is a finished, separately-owned FastAPI service. You integrate with it over
HTTP, you don't touch its code.

## The MODEL service is real and running — call it, never fabricate its output

`MODEL/` is a real FastAPI app (`uvicorn app.main:app`, default `http://127.0.0.1:8000`,
docs at `/docs`). Its own README says it is internally "mock-first for V1" — meaning some
of its logic (e.g. the spill segmentation model) is a deterministic placeholder until a
trained model is swapped in. That is my teammate's concern, not yours. **Your rule:** the
backend must call this real running service over HTTP for every ML-touching operation. Do
NOT write your own separate mock/fake JSON in the Rust backend or in the frontend to stand
in for it — that duplicates and drifts from the real contract below. If the service isn't
running yet in your environment, surface a clear "ML service unavailable" error state, don't
silently substitute fabricated data.

### Real endpoints (confirmed from `MODEL/app/api/` and `MODEL/app/schemas/`)

```text
GET  /health
POST /detect                → DetectionRequest  → DetectionResponse
POST /drift/hindcast        → DriftRequest      → DriftResponse
POST /drift/forecast        → DriftRequest      → DriftResponse
POST /attribution/rank      → AttributionRequest → AttributionResponse
POST /workflow/check-spill  → alias of /detect (Stage 1)
POST /workflow/set-radius   → alias of /drift/hindcast (Stage 2)
```

### Real schemas — use these exact field names, nothing invented

**DetectionRequest / DetectionResponse:**
```json
// request
{ "image_id": "img_001", "observed_at": "2026-09-07T06:20:00Z", "bbox": [80.1, 15.2, 81.4, 16.3], "image_path": null }

// response
{
  "prediction_id": "det-img_001",
  "spill_detected": true,
  "confidence": 0.86,
  "area_km2": 32.7,
  "geometry": { "type": "Polygon", "coordinates": [[[...]]] },
  "observed_at": "2026-09-07T06:20:00Z"
}
```

**DriftRequest / DriftResponse:**
```json
// request
{
  "spill_geometry": { "type": "Polygon", "coordinates": [[[...]]] },
  "observed_at": "2026-09-07T06:20:00Z",
  "lookback_hours": 24,
  "forecast_hours": 24,
  "origin_buffer_km": 10
}

// response
{
  "mode": "hindcast",
  "origin_zone": {
    "type": "Polygon",
    "coordinates": [[[...]]],
    "center": { "latitude": 15.79, "longitude": 80.61 },
    "radius_km": 10
  },
  "time_window": { "start": "2026-09-06T20:00:00Z", "end": "2026-09-07T06:00:00Z" },
  "path": [ { "latitude": 15.8, "longitude": 80.63, "timestamp": "..." } ],
  "uncertainty_km": 10
}
```
`origin_zone` is where the spill radius actually lives — `center` (lat/lon) + `radius_km`. This is the real source for "radius of the oil spill," not a separate top-level field.

**AISPosition (input to attribution):**
```json
{
  "mmsi": "123456789",
  "timestamp": "2026-09-07T05:10:00Z",
  "latitude": 15.77,
  "longitude": 80.6,
  "speed_knots": 11.2,
  "course_deg": 214.0,
  "heading_deg": 210.0,
  "vessel_type": "tanker",
  "imo": "IMO1234567",
  "vessel_name": "MV EXAMPLE"
}
```

**AttributionRequest / AttributionResponse:**
```json
// request
{
  "event_time": "2026-09-07T06:20:00Z",
  "origin_zone": { "...": "as returned by /drift/hindcast" },
  "time_window": { "start": "...", "end": "..." },
  "ais_positions": [ /* AISPosition[] */ ],
  "search_buffer_km": 20
}

// response
{
  "candidate_count": 3,
  "filtered_position_count": 480,
  "candidates": [
    {
      "vessel_id": "123456789",
      "rank": 1,
      "score": 78.42,
      "evidence": {
        "spatial_score": 0.91,
        "temporal_score": 0.85,
        "trajectory_score": 0.7,
        "dwell_score": 0.5,
        "ais_quality_score": 1.0
      },
      "features": {
        "min_distance_km": 1.8,
        "closest_approach_time": "2026-09-07T06:05:00Z",
        "time_difference_hours": 0.25,
        "time_inside_region_hours": 3.0,
        "trajectory_consistency": 0.7,
        "ais_quality": 1.0
      },
      "positions_used": 42
    }
  ]
}
```
`vessel_id` here is the MMSI. Ship name/type/IMO travel on the original `AISPosition` records, not on the candidate object itself — join them back by `mmsi` when displaying ship details in the UI.

**This is the real, confirmed contract for "spill radius, ship details, ship coordinates":**
- Spill radius → `DriftResponse.origin_zone.radius_km` (+ `center` for the point it's drawn around; the raw detected polygon comes from `DetectionResponse.geometry`)
- Ship coordinates → `AISPosition.latitude` / `.longitude` per candidate's positions, and `features.min_distance_km` / `closest_approach_time` for the key moment
- Ship details → `AISPosition.vessel_name`, `.mmsi`, `.imo`, `.vessel_type` — joined to the candidate by `mmsi == vessel_id`

## Backend rules

- Own orchestration and the database (PostgreSQL + PostGIS + Redis) — frontend never touches Postgres directly.
- Persist real `MODEL/` responses: store `origin_zone` (with `center`, `radius_km`) and the detected `geometry` as real PostGIS geometries, not raw JSON blobs only.
- Store AIS positions with a GiST index on position, B-tree on `timestamp`, keyed by `mmsi`, so trajectories build up over time — matching `docs/workflows/ais_filtering_pipeline.md`.
- Expensive operations (detect → drift → attribution) run as async jobs per `docs/workflows/async_job_pattern.md`: create job row → return `job_id` → background worker calls the real MODEL endpoints in sequence → persist result → WebSocket notification. Fallback: `GET /jobs/{id}` polling.
- Handle real failure modes: MODEL service unreachable, low confidence, no candidates, invalid bbox/coordinates.
- Pass `confidence`, `uncertainty_km`, and evidence scores straight through — never round away or hide uncertainty.

## Frontend rules

- Build every screen to exactly match the finalized Stitch designs in `WEBSITE/FRONTEND-DESIGN/oilwatch_ai_*` and the `nocturne_maritime` design system (dark near-monochrome base, signal amber for anomalies/alerts only, electric cyan for AIS/live tracks, Inter for UI text, JetBrains Mono for all coordinates/MMSI/timestamps/speed). Use `DESIGN.md`'s exact color tokens, type scale, and spacing values — don't approximate them.
- `oilwatch_ai_investigation_detail` is the core screen: full-bleed map, floating HUD panels (not boxed sidebars), candidate ranking as a floating dock per the design system's "Dock & Island Model."
- All server data through TanStack Query. All map geometry comes from real GeoJSON the backend derived from MODEL responses.
- Async actions (detect/drift/attribution) show real job progress via WebSocket, falling back to polling.
- Build every state — loading, error, empty (no candidates), low-confidence — none of these are placeholders; they reflect real backend/MODEL behavior.
- Render spill origin as the `origin_zone` circle/polygon, never a single pin. Show `uncertainty_km` and `confidence` visibly next to it.

## Documentation & logging — use the conventions already established in this repo, exactly

Do not invent new file names. This repo already has a logging structure in
`PROJECT_NOTES/OILWATCH_AI_PROJECT_MD/docs/` — use it as-is:

1. **`docs/file_changes.md`** — append one row per file created/modified, immediately after the change, in this existing table format:
   ```markdown
   | Date | File | Action | Purpose |
   |------|------|--------|---------|
   | YYYY-MM-DD | `path/to/file` | Created/Updated | <what it does / why> |
   ```

2. **`docs/workflows/<workflow_name>.md`** — one file per system-level workflow (e.g. `spill_to_candidate_pipeline.md` for the full detect→drift→attribution chain). Format: `Purpose`, then numbered `Stages`/`Flow` matching the style of the existing `async_job_pattern.md` and `ais_filtering_pipeline.md`.

3. **`docs/modules/backend/<module>.md`** and **`docs/modules/frontend/<module>.md`** — one file per meaningful module/service/component, matching the exact section headers already used in `investigation_service.md` and `map_integration.md`: `Purpose`, `Modules`/`Core File`, `Inputs/Outputs`/`Data Flow`, `Dependencies`/`Key Dependencies`.

4. **MODEL contract check** — since the MODEL schemas are now confirmed and locked above, any place your code's assumed field names diverge from this doc, note it explicitly in the relevant `file_changes.md` row's `Purpose` column (e.g. "field X differs from doc, see MODEL/app/schemas/drift.py") — don't silently rename or drop fields to make them match.

Update these logs as you go, per change — never batch them at the end of a session.

## Before starting

Confirm, in order:
1. You've read `MODEL/README.md`, `MODEL/app/schemas/*.py`, and confirm the endpoint/schema list above matches what's actually in the repo.
2. You've reviewed `nocturne_maritime/DESIGN.md` and all seven `oilwatch_ai_*` Stitch screens.
3. You understand: no fabricated ML data in the backend or frontend — every ML-derived value comes from a real call to the MODEL service.
4. You understand the logging convention above uses this repo's existing files (`file_changes.md`, `docs/workflows/`, `docs/modules/`) — not new ones.
