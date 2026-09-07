# Map Integration

**Purpose**: Implements the primary visualization layer for investigations using MapLibre GL JS.

## Core File
- **`src/pages/InvestigationDetail.tsx`**: Renders the MapLibre map and the Candidate Ranking Panel side-by-side.

## Data Flow
1. **Mount**: `useEffect` initializes the `maplibregl.Map` instance using a dark-matter basemap tile.
2. **Data Fetching (Pending)**: TanStack query fetches GeoJSON data for spills, origins, and AIS.
3. **Layer Addition**: Once data arrives and the map emits the `load` event, `map.addSource` and `map.addLayer` are called to render vectors over the basemap.
4. **State Management**: Layer toggles in the UI (e.g. "Toggle AIS Layer") call `map.setLayoutProperty(layerId, 'visibility', 'none'|'visible')`.

## Key Dependencies
- `maplibre-gl` for rendering.
- MapLibre CSS injected into the component scope.
