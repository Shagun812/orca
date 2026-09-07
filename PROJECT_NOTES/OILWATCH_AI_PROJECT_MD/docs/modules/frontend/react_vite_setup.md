# React & Vite Frontend Setup

**Purpose**: Defines the client-side architecture and tooling for the OilWatch AI application.

## Stack Details
- **Framework**: React + TypeScript.
- **Bundler**: Vite (chosen for fast HMR and minimal config).
- **Styling**: Tailwind CSS via PostCSS.
- **Routing**: `react-router-dom` for client-side navigation.
- **Data Fetching & State**: `@tanstack/react-query` handles all server state, polling, and caching.
- **Mapping**: `maplibre-gl` for rendering WebGL vector maps (satellite layers, spill polygons, AIS tracks).
- **Charting**: `recharts` for candidate evidence scoring breakdowns.
- **Icons**: `lucide-react` for simple, clean iconography.
- **Client State**: `zustand` (optional, for global lightweight state like active layers).

## Key Files
- `src/App.tsx`: Main entry point with `QueryClientProvider` and Router definition.
- `src/pages/`: Contains all route components (`/`, `/login`, `/dashboard`, `/investigations/:id`, etc.).
- `src/components/`: Reusable UI elements and map layers.
- `tailwind.config.js`: Tailwind theme configuration.
- `src/index.css`: Tailwind directives.

## Dependents
- Consumes the Rust Backend REST API and WebSockets (`/api/v1/*`).
