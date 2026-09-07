# Frontend App Module

## Purpose
The React frontend for OilWatch AI provides an intuitive, high-performance interface for maritime analysts to review detected oil spills, trigger drift modelling, and analyze candidate vessels. Built with Vite, React, TypeScript, Tailwind CSS v4, and React Map GL.

## Modules / Core File
- `AppShell.tsx`: The primary authenticated layout implementing the "Intelligence Rail" pattern on the left, housing global navigation and system status.
- `Dashboard.tsx`: High-level metrics and a summary of recent/open investigations.
- `Investigations.tsx`: List view of all investigations with search/filter capabilities.
- `InvestigationDetail.tsx`: The core analysis view. Implements a full-bleed MapLibre map rendering spill GeoJSON and the "Dock & Island" UI overlay for candidate ranking and job controls.
- `VesselDetail.tsx`: Deep dive into a specific vessel candidate, showing evidence breakdown (spatial, temporal, trajectory scores) and AIS track mapping.
- `index.css`: The source of truth for the `nocturne_maritime` design system, utilizing CSS variables for colors, typography, and glassmorphism levels.

## Data Flow
- All server state is managed via `@tanstack/react-query` to ensure data freshness, request deduplication, and intelligent caching.
- Queries are executed against the local Rust backend running on `http://127.0.0.1:3000/api/v1/...`, proxied through the Vite dev server during development.
- For long-running ML pipelines, the UI initiates a POST request which returns a `job_id`. The client then polls `GET /api/v1/jobs/:id` (or listens via WebSockets) to update progress states in the UI before fetching the final result data.

## Key Dependencies
- `react`, `react-dom`, `react-router-dom`: Core UI and routing.
- `maplibre-gl`, `react-map-gl`: Geospatial mapping and GeoJSON rendering.
- `@tanstack/react-query`: Server state management.
- `@tailwindcss/vite`, `tailwindcss`: Utility-first CSS styling and custom theme variables.
