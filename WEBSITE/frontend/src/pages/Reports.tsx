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
    <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-[var(--color-signal-amber)]/[0.03] blur-[120px] rounded-full pointer-events-none -z-10" />
    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--color-electric-cyan)]/[0.02] blur-[120px] rounded-full pointer-events-none -z-10" />

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
            className="w-full bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded-2xl pl-12 pr-10 py-4 text-white focus:outline-none focus:border-[var(--color-signal-amber)]/50 focus:bg-black/60 appearance-none font-medium transition-colors" 
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
      <button className="px-6 py-3 bg-[var(--color-signal-amber)] hover:bg-amber-400 text-black font-semibold rounded-xl flex items-center gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:-translate-y-0.5" onClick={() => window.print()}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print / PDF
      </button>
    </div>
    
    {report.isLoading && (
      <div className="h-96 rounded-3xl bg-white/[0.02] border border-white/[0.05] animate-pulse"></div>
    )}
    {report.data && <article className="rounded-3xl glass-level-2 border border-white/[0.04] p-8 md:p-12 space-y-10 animate-slide-up" style={{ animationDelay: '0.1s' }}><header className="border-b border-white/[0.04] pb-8"><div className="flex items-center gap-3 mb-4"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-[var(--color-signal-amber)]">ORCA</span><span className="w-1 h-1 rounded-full bg-white/20"></span><span className="text-[10px] font-bold uppercase tracking-[.2em] text-[var(--color-muted)]">INVESTIGATION REPORT</span></div><h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">{report.data.title || 'Untitled'}</h2><div className="flex items-center gap-4"><span className="px-3 py-1 bg-white/5 border border-white/[0.05] rounded-md font-mono text-xs text-white/50 tracking-wider">CASE {report.data.id}</span><span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-md border ${report.data.status === 'open' ? 'bg-[var(--color-signal-amber)]/10 text-[var(--color-signal-amber)] border-[var(--color-signal-amber)]/20' : 'bg-white/5 text-white/50 border-white/10'}`}>{report.data.status}</span></div></header>{spill ? <><ReportMap spill={spill} /><section className="grid grid-cols-3 gap-6"><Metric label="Confidence" value={`${Math.round(spill.confidence * 100)}%`} /><Metric label="ML area" value={`${spill.area_km2.toFixed(2)} km²`} /><Metric label="Observed" value={spill.observed_at ? new Date(spill.observed_at).toLocaleDateString() : '—'} /></section><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><Evidence spill={spill} /><div className="space-y-8"><ApparentRegion spill={spill} />{spill.drift_origin && <DriftOrigin drift={spill.drift_origin} />}</div></div><VesselRanks ranks={spill.vessel_rankings || []} /></> : <div className="py-12 text-center rounded-2xl border border-white/5 bg-white/[0.01]"><p className="text-[var(--color-muted)]">This case has no completed ML detection.</p></div>}<div className="pt-8 border-t border-white/[0.04] text-center print:hidden"><Link className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl inline-flex items-center gap-2 transition-all" to={`/investigations/${report.data.id}`}>Open workspace <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></Link></div></article>}
  </div>
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/10 bg-black/20 p-5"><p className="text-label-sm text-[var(--color-muted)] tracking-wider">{label}</p><p className="text-2xl font-light text-white mt-2">{value}</p></div> }
function Evidence({ spill }: { spill: Spill }) { const polygon = usePolygon(spill); return <section><p className="text-label-sm text-[var(--color-muted)] mb-2">ML DETECTION EVIDENCE</p><div className="relative overflow-hidden rounded-lg border border-white/10 bg-black"><img className="block w-full" src={spill.image_url} alt="Uploaded satellite image with ML patch" />{polygon && <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full"><polygon points={polygon} className="patch-polygon" /></svg>}<span className="absolute top-3 left-3 rounded bg-amber-400 px-2 py-1 text-[10px] font-mono text-black">ML DETECTED PATCH</span></div></section> }
function ApparentRegion({ spill }: { spill: Spill }) { const point = useCentroid(spill); return <section><p className="text-label-sm text-[var(--color-muted)]">APPARENT OIL REGION</p><p className="font-mono text-white mt-2">{point ? `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}` : 'Coordinates unavailable'}</p><p className="text-xs text-[var(--color-muted)] mt-1">Observed ML patch centroid · {spill.area_km2.toFixed(2)} km²</p></section> }
function DriftOrigin({ drift }: { drift: NonNullable<Spill['drift_origin']> }) { const center = drift.center?.coordinates; return <section><p className="text-label-sm text-[var(--color-muted)]">DRIFT MODEL ORIGIN ZONE</p><p className="font-mono text-white mt-2">{center ? `${center[1].toFixed(5)}, ${center[0].toFixed(5)}` : 'Coordinates unavailable'}</p><p className="text-xs text-[var(--color-muted)] mt-1">Radius {drift.radius_km.toFixed(2)} km · Uncertainty {drift.uncertainty_km.toFixed(2)} km</p><p className="text-xs text-[var(--color-muted)] mt-1">Time window: {new Date(drift.window_start).toLocaleString()} to {new Date(drift.window_end).toLocaleString()}</p></section> }
function VesselRanks({ ranks }: { ranks: NonNullable<Spill['vessel_rankings']> }) { if (!ranks.length) return null; return <section><p className="text-label-sm text-[var(--color-muted)] mb-2">ML VESSEL RANKING</p><div className="ais-table-wrap"><table className="ais-table"><thead><tr><th>Rank</th><th>Vessel / MMSI</th><th>Probability</th></tr></thead><tbody>{ranks.map((item) => <tr key={item.mmsi}><td>#{item.rank}</td><td>{item.vessel_name || item.mmsi}<small>{item.mmsi}</small></td><td><strong>{Math.round(item.score)}%</strong></td></tr>)}</tbody></table></div></section> }
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
    <section className="h-[400px] w-full rounded-lg overflow-hidden border border-white/10 relative print:h-[300px]">
      <Map initialViewState={viewState} mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" attributionControl={false} interactive={false} preserveDrawingBuffer={true}>
        {spill.observation_bbox && <Source id="obs" type="geojson" data={spill.observation_bbox as any}><Layer id="obs-line" type="line" paint={{ 'line-color': '#e13468', 'line-width': 1, 'line-dasharray': [4, 4] }} /></Source>}
        {spill.geometry && <Source id="spill" type="geojson" data={spill.geometry as any}><Layer id="spill-fill" type="fill" paint={{ 'fill-color': '#f6b84b', 'fill-opacity': 0.24 }} /><Layer id="spill-outline" type="line" paint={{ 'line-color': '#f6b84b', 'line-width': 2 }} /></Source>}
        {spill.drift_origin?.polygon && <Source id="origin" type="geojson" data={spill.drift_origin.polygon as any}><Layer id="origin-fill" type="fill" paint={{ 'fill-color': '#68cad1', 'fill-opacity': 0.15 }} /><Layer id="origin-line" type="line" paint={{ 'line-color': '#68cad1', 'line-width': 2, 'line-dasharray': [2, 2] }} /></Source>}
      </Map>
      <div className="map-legend absolute right-5 bottom-5">
        <span><i className="spill-key" /> apparent region (spill)</span>
        {spill.observation_bbox && <span><i className="impact-key" /> ML area radius</span>}
        {spill.drift_origin && <span><i className="origin-key" /> likely origin</span>}
      </div>
    </section>
  )
}
