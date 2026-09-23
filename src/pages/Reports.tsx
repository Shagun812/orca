import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import Map, { Layer, Source } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

type Summary = { id: string; title: string; status: string; created_at: string }
type Spill = { confidence: number; area_km2: number; observed_at?: string; image_url?: string; geometry?: any; observation_bbox?: any; vessel_rankings?: { mmsi: string; vessel_name?: string; rank: number; score: number }[]; drift_origin?: { center: any; radius_km: number; polygon: any; uncertainty_km: number; window_start: string; window_end: string } }
type Report = Summary & { description?: string; spill_info?: Spill }
const headers = (): Record<string, string> => { const token = localStorage.getItem('token'); return token ? { Authorization: `Bearer ${token}` } : {} }

export default function Reports() {
  const [selected, setSelected] = useState('')
  const cases = useQuery({ queryKey: ['report-cases'], queryFn: async (): Promise<Summary[]> => { const r = await fetch('/api/v1/investigations', { headers: headers() }); if (!r.ok) throw new Error('Could not load cases'); return r.json() } })
  const id = selected || cases.data?.[0]?.id || ''
  const report = useQuery({ queryKey: ['report', id], enabled: !!id, queryFn: async (): Promise<Report> => { const r = await fetch(`/api/v1/investigations/${id}`, { headers: headers() }); if (!r.ok) throw new Error('Could not load case'); return r.json() } })
  if (cases.isLoading) return <div className="p-8 text-[var(--color-muted)]">Loading reports…</div>
  if (!cases.data?.length) return <div className="p-8"><p className="text-white">No reportable cases yet.</p></div>
  const spill = report.data?.spill_info
  return <div className="p-8 max-w-5xl mx-auto space-y-12 relative z-10">
    {/* Background ambient glow */}
        
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4 print:hidden animate-slide-up">
      <div className="space-y-2 relative w-full max-w-md">
        <h1 className="relative text-5xl font-bold tracking-tight text-white z-10">
          Case Reports
        </h1>
        <p className="relative text-lg text-[var(--color-muted)] font-light z-10 mb-6">
          Evidence exports for active investigations.
        </p>
        
        <div className="relative mt-4">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <select 
            className="w-full bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded-2xl pl-12 pr-10 py-4 text-white focus:outline-none focus:border-[white]/50 focus:bg-black/60 appearance-none font-medium transition-colors" 
            value={id} 
            onChange={(event) => setSelected(event.target.value)}
          >
            {cases.data.map((item) => <option key={item.id} value={item.id} className="bg-black text-white">{item.title || 'Untitled'} · {item.status.toUpperCase()}</option>)}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      <button className="px-6 py-3 bg-[white] hover:bg-[#e5e5e5] text-black font-semibold rounded-xl flex items-center gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:-translate-y-0.5" onClick={() => window.print()}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print / PDF
      </button>
    </div>
    
    {report.isLoading && (
      <div className="h-96 rounded-3xl bg-white/[0.02] border border-white/[0.05] animate-pulse"></div>
    )}
    {report.data && (
      <article className="border border-white/[0.05] p-8 md:p-12 space-y-12 animate-slide-up bg-black/65 backdrop-blur-md" style={{ animationDelay: '0.1s' }}>
        <header className="border-b border-white/[0.05] pb-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] font-bold uppercase tracking-[.2em] text-white">ORCA</span>
            <span className="w-1 h-1 bg-white/20"></span>
            <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[var(--color-muted)]">INVESTIGATION REPORT</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-6">
            {report.data.title || 'Untitled'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
              CASE ID: {report.data.id.split('-')[0]}
            </span>
            <span className="w-px h-3 bg-white/10"></span>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${
              report.data.status === 'open' ? 'text-white' : 'text-white/50'
            }`}>
              STATUS: {report.data.status}
            </span>
            <span className="w-px h-3 bg-white/10"></span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted)]">
              {new Date(report.data.created_at).toLocaleDateString()}
            </span>
          </div>
        </header>

        {spill ? (
          <>
            <ReportMap spill={spill} />
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/[0.05] pt-8">
              <Metric label="Confidence" value={`${Math.round(spill.confidence * 100)}%`} />
              <Metric label="ML area" value={`${spill.area_km2.toFixed(2)} km²`} />
              <Metric label="Observed" value={spill.observed_at ? new Date(spill.observed_at).toLocaleDateString() : '—'} />
            </section>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-white/[0.05] pt-8">
              <Evidence spill={spill} />
              <div className="space-y-12">
                <ApparentRegion spill={spill} />
                {spill.drift_origin && <DriftOrigin drift={spill.drift_origin} />}
              </div>
            </div>
            
            <div className="border-t border-white/[0.05] pt-8">
              <VesselRanks ranks={spill.vessel_rankings || []} />
            </div>
          </>
        ) : (
          <div className="py-16 text-center border-t border-white/[0.05]">
            <p className="text-[var(--color-muted)] font-mono text-xs uppercase tracking-widest">This case has no completed ML detection.</p>
          </div>
        )}
        
        <div className="pt-8 border-t border-white/[0.05] flex justify-between items-center print:hidden">
          <Link className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] hover:text-white transition-colors" to={`/investigations/${report.data.id}`}>
            ← BACK TO WORKSPACE
          </Link>
        </div>
      </article>
    )}
  </div>
}

function Metric({ label, value }: { label: string; value: string }) { 
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)]">{label}</p>
      <p className="text-3xl font-light text-white font-mono">{value}</p>
    </div> 
  ) 
}

function Evidence({ spill }: { spill: Spill }) { 
  const polygon = usePolygon(spill); 
  return (
    <section>
      <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-4">ML DETECTION EVIDENCE</p>
      <div className="relative overflow-hidden border border-white/10 bg-black/65 backdrop-blur-md">
        <img className="block w-full opacity-80 mix-blend-screen" src={spill.image_url} alt="Uploaded satellite image with ML patch" />
        {polygon && <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full"><polygon points={polygon} className="patch-polygon" /></svg>}
        <span className="absolute top-3 left-3 bg-white px-2 py-1 text-[10px] font-bold tracking-widest uppercase text-black">ML DETECTED</span>
      </div>
    </section> 
  ) 
}

function ApparentRegion({ spill }: { spill: Spill }) { 
  const point = useCentroid(spill); 
  return (
    <section>
      <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-2">APPARENT OIL REGION</p>
      <p className="font-mono text-white text-lg">{point ? `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}` : 'Coordinates unavailable'}</p>
      <p className="text-[10px] font-mono text-[var(--color-muted)] mt-2 uppercase tracking-widest">Centroid · {spill.area_km2.toFixed(2)} km²</p>
    </section> 
  ) 
}

function DriftOrigin({ drift }: { drift: NonNullable<Spill['drift_origin']> }) { 
  const center = drift.center?.coordinates; 
  return (
    <section>
      <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-2">DRIFT MODEL ORIGIN ZONE</p>
      <p className="font-mono text-white text-lg">{center ? `${center[1].toFixed(5)}, ${center[0].toFixed(5)}` : 'Coordinates unavailable'}</p>
      <p className="text-[10px] font-mono text-[var(--color-muted)] mt-2 uppercase tracking-widest">Radius {drift.radius_km.toFixed(2)}km · Uncert. {drift.uncertainty_km.toFixed(2)}km</p>
      <p className="text-[10px] font-mono text-[var(--color-muted)] mt-1 uppercase tracking-widest">Window: {new Date(drift.window_start).toLocaleDateString()} - {new Date(drift.window_end).toLocaleDateString()}</p>
    </section> 
  ) 
}

function VesselRanks({ ranks }: { ranks: NonNullable<Spill['vessel_rankings']> }) { 
  if (!ranks.length) return null; 
  return (
    <section>
      <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-6">ATTRIBUTION RANKING</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)]">
              <th className="pb-3 font-normal">Rank</th>
              <th className="pb-3 font-normal">Vessel / MMSI</th>
              <th className="pb-3 font-normal text-right">Probability</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {ranks.map((item) => (
              <tr key={item.mmsi} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="py-4 font-mono text-white/50">0{item.rank}</td>
                <td className="py-4">
                  <div className="font-semibold text-white tracking-wide">{item.vessel_name || 'Unknown Vessel'}</div>
                  <div className="font-mono text-[10px] text-[var(--color-muted)] mt-1 tracking-widest">{item.mmsi}</div>
                </td>
                <td className="py-4 font-mono text-white text-right">{Math.round(item.score)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section> 
  ) 
}

function useCentroid(spill: Spill) { return useMemo(() => { const ring = spill.geometry?.coordinates?.[0]; if (!ring?.length) return null; const p = ring.slice(0, -1); return { latitude: p.reduce((s: number, v: number[]) => s + v[1], 0) / p.length, longitude: p.reduce((s: number, v: number[]) => s + v[0], 0) / p.length } }, [spill]) }
function usePolygon(spill: Spill) { return useMemo(() => { const g = spill.geometry?.coordinates?.[0], b = spill.observation_bbox?.coordinates?.[0]; if (!g?.length || !b?.length) return ''; const [west, south] = b[0], [east, north] = b[2]; return g.map(([lon, lat]: number[]) => `${(lon - west) / (east - west) * 100},${(north - lat) / (north - south) * 100}`).join(' ') }, [spill]) }

function ReportMap({ spill }: { spill: Spill }) {
  const [viewState] = useState(() => {
    let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
    const updateBounds = (coords: any[]) => {
      coords.forEach(c => {
        if (Array.isArray(c[0])) updateBounds(c);
        else if (c.length >= 2) {
          minLng = Math.min(minLng, c[0]); maxLng = Math.max(maxLng, c[0]);
          minLat = Math.min(minLat, c[1]); maxLat = Math.max(maxLat, c[1]);
        }
      });
    };
    if (spill.geometry?.coordinates) updateBounds(spill.geometry.coordinates);
    if (spill.drift_origin?.polygon?.coordinates) updateBounds(spill.drift_origin.polygon.coordinates);
    
    if (minLng === 180) return { longitude: 80.61, latitude: 15.79, zoom: 8.5 };
    
    const longitude = (minLng + maxLng) / 2;
    const latitude = (minLat + maxLat) / 2;
    const maxDiff = Math.max(maxLng - minLng, maxLat - minLat);
    let zoom = 8.5;
    if (maxDiff > 0) zoom = Math.log2(360 / maxDiff) - 1.2;
    return { longitude, latitude, zoom: Math.min(Math.max(zoom, 4), 12) };
  });

  return (
    <section className="h-[400px] w-full overflow-hidden border border-white/10 relative print:h-[300px]">
      <Map initialViewState={viewState} mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" attributionControl={false} interactive={false} preserveDrawingBuffer={true}>
        {spill.drift_origin?.polygon && (
          <Source id="drift" type="geojson" data={{ type: 'Feature', geometry: spill.drift_origin.polygon, properties: {} }}>
            <Layer id="drift-fill" type="fill" paint={{ 'fill-color': '#ffffff', 'fill-opacity': 0.05 }} />
            <Layer id="drift-line" type="line" paint={{ 'line-color': '#ffffff', 'line-width': 1, 'line-dasharray': [2, 2] }} />
          </Source>
        )}
        {spill.geometry && (
          <Source id="spill" type="geojson" data={{ type: 'Feature', geometry: spill.geometry, properties: {} }}>
            <Layer id="spill-fill" type="fill" paint={{ 'fill-color': '#ffffff', 'fill-opacity': 0.15 }} />
            <Layer id="spill-line" type="line" paint={{ 'line-color': '#ffffff', 'line-width': 1 }} />
          </Source>
        )}
      </Map>
    </section>
  )
}
