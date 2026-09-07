# OILWATCH AI — Frontend Build Instructions

Scope: frontend only. Color scheme/visual polish comes later — this is structure, data flow, and pages.

## 1. Stack
- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query (server state, caching, polling)
- MapLibre GL JS (map rendering)
- Recharts (charts — confidence scores, timelines)
- Zustand (optional, for lightweight client state like active map layers)

## 2. Pages
```text
/               (public landing page)
/login
/dashboard
/investigations
/investigations/:id
/vessels/:id
/reports
/settings
```

## 3. Page responsibilities

### `/` — landing page
Public, unauthenticated, marketing-facing. Separate layout from the app shell (no sidebar/nav from the dashboard).

**Sections, top to bottom:**
1. **Hero** — product name, one-line value prop (e.g. "Detect oil spills. Trace them back to the vessel."), primary CTA ("Get Started" / "Login") secondary CTA ("See how it works"). Background: a stylized map/satellite visual works well thematically.
2. **Problem statement** — short block on why manual spill attribution is slow/hard today.
3. **How it works** — the core flow as a visual step sequence:
   ```text
   Satellite Detection → Drift/Hindcast → AIS Correlation → Vessel Ranking → Evidence Dashboard
   ```
   Use icons + short labels per step, not paragraphs.
4. **Feature highlights** (3–4 cards) — e.g. "Satellite-based spill detection", "Drift & origin estimation", "AIS vessel correlation", "Investigation-grade evidence reports".
5. **Live-feel visual** — a static/mock preview of the investigation dashboard (map with spill polygon + candidate ranking) to show the product, not just describe it. Screenshot or a simplified non-interactive MapLibre embed.
6. **Trust/framing note** — a short line making clear this is an investigative evidence tool, not a legal-proof tool. Keep it honest, keep it short.
7. **CTA footer** — repeat primary CTA, plus basic footer links (about, contact, login).

**Notes:**
- Fully responsive — this is the page people share links to.
- Keep it static/marketing-only: no live data fetching, no auth-gated content. Any dashboard preview here is a mock/static image, not a real MapLibre instance pulling live AIS data.
- Route `/` to this page when logged out; redirect authenticated users straight to `/dashboard`.

### `/login`
Auth form → hits backend auth endpoint → stores session/JWT.

### `/dashboard`
Overview: active investigations, recent jobs, alerts.

### `/investigations`
List/table of investigations. Create-new action → `POST /investigations`.

### `/investigations/:id` — the core screen
This is the main investigation workspace. Combines a map with supporting panels. Show:
- satellite imagery (as a map layer)
- spill polygon
- spill centroid
- origin probability zone
- hindcast/forecast paths
- AIS vessel positions
- vessel trajectories
- candidate vessel ranking (table/list, sorted by score)
- evidence/confidence breakdown per candidate

### `/vessels/:id`
Vessel detail: track history, AIS metadata, which investigations it's a candidate in.

### `/reports`
List/generate/export investigation reports.

### `/settings`
User/account settings.

## 4. Map layers (MapLibre)
Build these as toggleable layers, not one flat render:
```text
Satellite imagery
Oil spill polygon
Origin probability zone
Hindcast path
Forecast path
AIS vessels
AIS trajectories
Optional: wind/current vectors
```
Layer toggle UI belongs in the investigation detail page, not global nav.

## 5. Data flow
```text
React → TanStack Query → Rust API → JSON/GeoJSON → UI + MapLibre
```
- All server data goes through TanStack Query — no raw `fetch` scattered in components.
- Anything geometric (spill polygon, origin zone, tracks) comes back as GeoJSON and is fed straight to MapLibre sources/layers.
- Origin is a **zone + confidence + time window**, never render it as a single precise point/pin.

## 6. Realtime / async jobs
Long-running backend work (detection, drift, AIS correlation, attribution) runs as a job:
```text
Rust → WebSocket → React → progress/result updates
```
UI pattern:
1. User triggers an action (e.g. "Run detection") → `POST` request → backend returns `job_id`.
2. Frontend shows a progress/loading state tied to that job.
3. Frontend listens on WebSocket (or polls `GET /jobs/{id}` as fallback) for status updates.
4. On completion, invalidate/refetch the relevant TanStack Query so the UI updates with real data.

Build the loading/progress/error states for this up front — don't bolt them on later, since almost every core action (detect, drift, rank) goes through this async path.

## 7. API endpoints the frontend consumes

Base path: `/api/v1`

```text
GET    /investigations
POST   /investigations
GET    /investigations/{id}
PATCH  /investigations/{id}
DELETE /investigations/{id}

GET  /satellite/images
GET  /satellite/images/{id}
POST /satellite/images

GET  /spills
GET  /spills/{id}
POST /spills/detect
POST /spills/{id}/analyze

POST /drift/hindcast
POST /drift/forecast
GET  /drift/{id}

GET /ais/vessels
GET /ais/vessels/{id}
GET /ais/vessels/{id}/track
GET /ais/search

GET /spills/{spill_id}/candidates
GET /candidates/{candidate_id}

GET /jobs/{id}
```

### Candidate response shape (drives the ranking panel)
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
Render each candidate with its rank, overall score, and an expandable evidence breakdown (use Recharts for a simple score/evidence visualization if useful).

### Detection result shape (drives the spill layer)
```json
{
  "prediction_id": "pred_001",
  "spill_detected": true,
  "confidence": 0.94,
  "area_km2": 32.7,
  "geometry": {}
}
```

## 8. Performance rules
- Never expect to render raw/unfiltered AIS points — the backend already filters/simplifies these before sending. Just render what you get.
- Debounce/guard map re-renders when toggling layers or panning — spatial layers can get heavy.
- Paginate/virtualize investigation and vessel lists.

## 9. UI states to design for (not just the happy path)
```text
ML/job unavailable   → retry option + clear warning, not a silent failure
AIS unavailable       → "data unavailable for this window" message
No candidates found   → explicit empty state, not a blank panel
Low confidence result → visible uncertainty indicator (badge/tooltip)
Invalid input          → inline validation error
Slow analysis          → progress bar / spinner tied to job status
```

## 10. Framing to keep visible in the UI
Candidate-vessel rankings are an **evidence-based investigative lead, not proof**. Somewhere in the candidate panel (tooltip, banner, or footer note), make this framing visible to the user.

## 11. Build order (frontend-only slice)
1. Vite + React + TS + Tailwind scaffold. Routing for all pages (stub content is fine).
2. Landing page (`/`) — static, no data dependencies, good first thing to build/demo.
3. Auth flow (`/login`) + protected routes.
4. Investigations list + create + detail shell (no map yet).
5. Add MapLibre to investigation detail: base map + satellite layer + spill polygon layer, wired to mocked/real backend data via TanStack Query.
6. Add origin zone, hindcast/forecast, AIS vessel and trajectory layers with toggles.
7. Candidate ranking panel + evidence breakdown.
8. WebSocket/job-status integration for async actions (detect, drift, analyze).
9. Vessel detail page, reports page, settings page.
10. Empty/error/loading states across all of the above.
