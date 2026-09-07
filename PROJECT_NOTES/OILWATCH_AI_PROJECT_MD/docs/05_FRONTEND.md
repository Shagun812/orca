# 05 — Frontend

## Stack
- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- MapLibre GL JS
- Recharts
- Optional Zustand

## Pages
```text
/login
/dashboard
/investigations
/investigations/:id
/vessels/:id
/reports
/settings
```

## Investigation dashboard
Show:
- satellite imagery
- spill polygon
- spill centroid
- origin probability zone
- hindcast/forecast paths
- AIS vessel positions
- vessel trajectories
- candidate ranking
- evidence/confidence

## Map layers
```text
Satellite
Oil spill
Origin probability
Hindcast
Forecast
AIS vessels
AIS trajectories
Optional wind/current vectors
```

## Data flow
```text
React → TanStack Query → Rust API → JSON/GeoJSON → UI + MapLibre
```

## Realtime
```text
Rust → WebSocket → React → progress/result updates
```
