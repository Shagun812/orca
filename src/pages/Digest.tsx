
import { useQuery } from '@tanstack/react-query'
import Map, { Layer, Source } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Link } from 'react-router-dom'

export default function Digest() {
  const { data: investigations, isLoading } = useQuery({
    queryKey: ['investigations', 'all'],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/v1/investigations?limit=50', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) return []
      return res.json()
    }
  })

  const today = new Date();
  
  const totalSpills = investigations?.length || 0;
  const criticalSpills = investigations?.filter((i: any) => i.status === 'critical').length || 0;
  
  const spillPoints = {
    type: 'FeatureCollection',
    features: (investigations || []).filter((inv: any) => inv.spill_info?.geometry).map((inv: any) => {
      const ring = inv.spill_info.geometry.coordinates[0];
      const lng = ring.reduce((sum: number, p: number[]) => sum + p[0], 0) / ring.length;
      const lat = ring.reduce((sum: number, p: number[]) => sum + p[1], 0) / ring.length;
      return { type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] } }
    })
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 relative z-10 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4 animate-slide-up">
        <div className="space-y-3 relative">
          <p className="text-[10px] font-mono uppercase tracking-widest text-red-400">00:00 UTC SITREP</p>
          <h1 className="relative text-5xl font-bold tracking-tight text-white z-10 uppercase">
            Daily Intelligence Digest
          </h1>
          <p className="relative text-lg text-[var(--color-muted)] font-light z-10 max-w-2xl">
            Summary of all regional maritime activity and active anomaly detections for {today.toLocaleDateString()}.
          </p>
        </div>
        <button className="btn-ghost rounded-none border border-white/20 text-xs px-6 py-3 uppercase tracking-widest hover:bg-white/10 transition-colors">
          EXPORT PDF
        </button>
      </div>

      <section className="h-[400px] w-full border border-white/[0.05] relative animate-slide-up bg-black/50 overflow-hidden" style={{ animationDelay: '0.1s' }}>
        <Map 
          initialViewState={{ longitude: 80.61, latitude: 15.79, zoom: 3 }} 
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" 
          attributionControl={false}
        >
          {spillPoints.features.length > 0 && (
            <Source id="spills" type="geojson" data={spillPoints as any}>
              <Layer 
                id="spill-heat" 
                type="heatmap" 
                paint={{
                  'heatmap-weight': 1,
                  'heatmap-intensity': 1,
                  'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(239,68,68,0)', 0.2, 'rgba(246,184,75,0.5)', 1, 'rgba(239,68,68,1)'],
                  'heatmap-radius': 30,
                  'heatmap-opacity': 0.8
                }} 
              />
              <Layer 
                id="spill-points" 
                type="circle" 
                paint={{ 'circle-radius': 4, 'circle-color': '#ffffff', 'circle-stroke-color': '#ef4444', 'circle-stroke-width': 2 }} 
              />
            </Source>
          )}
        </Map>
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-white/[0.05] p-4 text-[10px] font-mono uppercase tracking-widest">
          <p className="text-white/50 mb-2">MACRO OVERVIEW</p>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> ACTIVE SPILLS</div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="border border-white/[0.05] p-6 bg-white/[0.02]">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)]">New Detections</p>
          <p className="text-5xl font-light text-white font-mono mt-4">{totalSpills}</p>
        </div>
        <div className="border border-red-500/30 p-6 bg-red-500/[0.05]">
          <p className="text-[10px] font-mono uppercase tracking-widest text-red-400">Critical Threats</p>
          <p className="text-5xl font-light text-white font-mono mt-4">{criticalSpills}</p>
        </div>
        <div className="border border-white/[0.05] p-6 bg-white/[0.02]">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)]">Vessels Tracked</p>
          <p className="text-5xl font-light text-white font-mono mt-4">2,841</p>
        </div>
      </div>

      <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-sm uppercase tracking-widest text-white border-b border-white/[0.1] pb-4 mb-6">Executive Summary</h2>
        <div className="prose prose-invert max-w-none text-white/70 font-light leading-relaxed">
          <p>
            In the last 24 hours, the ORCA orbital platform processed 14 SAR passes over high-risk zones. 
            A total of {totalSpills} distinct oil patches were identified using the deep learning architecture. 
            {criticalSpills > 0 ? `${criticalSpills} incidents have been automatically flagged as CRITICAL due to their proximity to protected coastal zones.` : 'No immediate coastal threats have been identified.'}
          </p>
          <p className="mt-4">
            Automated oceanographic drift modeling and AIS attribution algorithms have been executed across all active investigations.
          </p>
        </div>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between border-b border-white/[0.1] pb-4 mb-6">
          <h2 className="text-sm uppercase tracking-widest text-white">Prime Suspects (Last 24H)</h2>
        </div>
        
        {isLoading ? (
          <div className="h-32 bg-white/[0.02] border border-white/[0.05] animate-pulse"></div>
        ) : (
          <div className="border border-white/[0.05] overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02]">
                <tr className="border-b border-white/[0.05] text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)]">
                  <th className="p-4 font-normal">Related Case</th>
                  <th className="p-4 font-normal">Prime Suspect</th>
                  <th className="p-4 font-normal text-right">Probability</th>
                </tr>
              </thead>
              <tbody>
                {investigations?.slice(0, 5).map((inv: any) => {
                  const topCandidate = inv.spill_info?.vessel_rankings?.[0];
                  return (
                    <tr key={inv.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <Link to={`/investigations/${inv.id}`} className="font-mono text-cyan-400 hover:text-cyan-300">
                          {inv.id.split('-')[0]}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="text-white font-semibold">{topCandidate?.vessel_name || 'Unknown Vessel'}</div>
                        <div className="text-[10px] font-mono text-[var(--color-muted)] mt-1 tracking-widest">{topCandidate?.mmsi || 'No AIS linkage yet'}</div>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-white">
                        {topCandidate ? `${Math.round(topCandidate.score)}%` : 'â€”'}
                      </td>
                    </tr>
                  )
                })}
                {investigations?.length === 0 && (
                  <tr><td colSpan={3} className="p-4 text-center text-white/50 text-xs font-mono uppercase">No suspicious vessels identified today</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
