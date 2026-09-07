import { useParams, Link } from 'react-router-dom'
import Map, { NavigationControl } from 'react-map-gl/maplibre'

export default function VesselDetail() {
  const { id } = useParams()

  return (
    <div className="relative w-full h-screen bg-[var(--color-void)] overflow-hidden flex flex-col md:flex-row">
      {/* ──── Left Panel: Vessel Intelligence ──── */}
      <div className="w-full md:w-[480px] h-full glass-level-2 border-r border-white/[0.06] flex flex-col z-10">
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <Link to={-1 as any} className="btn-ghost px-2">
            ← Back
          </Link>
          <div className="badge-anomaly">Candidate Vessel</div>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {/* Identity */}
          <div className="mb-8">
            <div className="text-label-sm text-[var(--color-muted)] mb-1">VESSEL IDENTITY</div>
            <h1 className="text-headline-lg text-[var(--color-text-white)] mb-2">MV UNKNOWN</h1>
            <div className="flex gap-2">
              <span className="pill border-[var(--color-secondary)]/30 text-[var(--color-secondary)]">TANKER</span>
              <span className="pill bg-white/5 border-white/10">MMSI: {id}</span>
            </div>
          </div>

          <div className="divider" />

          {/* Evidence Scoring */}
          <div className="mb-8">
            <h2 className="text-headline-sm text-[var(--color-text-white)] mb-4">Evidence Breakdown</h2>
            <div className="space-y-4">
              {[
                { label: 'Spatial Score (Proximity to spill)', score: 0.91, detail: 'Min distance: 1.8km' },
                { label: 'Temporal Score (Time window overlap)', score: 0.85, detail: 'Inside region: 3.0 hrs' },
                { label: 'Trajectory Consistency', score: 0.70, detail: 'Steady course matching drift' },
                { label: 'AIS Quality Score', score: 1.00, detail: '42 positions, no spoofing detected' }
              ].map((item, i) => (
                <div key={i} className="glass-level-1 p-4 rounded-xl border border-white/[0.04]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-body-sm text-[var(--color-muted-light)]">{item.label}</span>
                    <span className="text-body-md text-[var(--color-text-white)]">{(item.score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-[var(--color-signal-amber)]"
                      style={{ width: `${item.score * 100}%` }}
                    />
                  </div>
                  <div className="text-label-sm text-[var(--color-muted)]">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <button className="btn-primary w-full justify-center py-3">
            Flag for Enforcement Review
          </button>
        </div>
      </div>

      {/* ──── Right Panel: Track Map ──── */}
      <div className="flex-1 relative h-full">
        <Map
          initialViewState={{
            longitude: 80.6,
            latitude: 15.77,
            zoom: 10
          }}
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          attributionControl={false}
        >
          <NavigationControl position="bottom-right" />
          
          {/* Note: In a real implementation, we would render GeoJSON LineString of AIS positions here */}
          
        </Map>
        
        {/* Map overlay tags */}
        <div className="absolute top-4 right-4 flex gap-2">
          <div className="glass-level-2 px-3 py-1.5 rounded-lg border border-white/[0.06] text-label-sm text-[var(--color-secondary)]">
            AIS TRACK DISPLAYED
          </div>
        </div>
      </div>
    </div>
  )
}
