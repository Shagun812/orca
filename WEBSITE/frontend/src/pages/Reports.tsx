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
  return <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
    <div className="flex justify-between items-end print:hidden"><div><p className="text-label-sm text-[var(--color-electric-cyan)]">EVIDENCE EXPORT</p><h1 className="text-headline-lg text-white mt-2">Case report</h1></div><button className="btn-primary" onClick={() => window.print()}>Print / save PDF</button></div>
    <select className="model-input print:hidden" value={id} onChange={(event) => setSelected(event.target.value)}>{cases.data.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.status}</option>)}</select>
    {report.isLoading && <p className="text-[var(--color-muted)]">Loading evidence…</p>}
    {report.data && <article className="case-panel report-sheet space-y-8"><header className="border-b border-white/10 pb-6"><p className="text-label-sm text-[var(--color-electric-cyan)] tracking-widest">OILWATCH AI · INVESTIGATION REPORT</p><h2 className="text-4xl font-light text-white mt-3">{report.data.title}</h2><p className="font-mono text-xs text-[var(--color-muted)] mt-2">CASE {report.data.id} · {report.data.status}</p></header>{spill ? <><ReportMap spill={spill} /><section className="grid grid-cols-3 gap-6"><Metric label="Confidence" value={`${Math.round(spill.confidence * 100)}%`} /><Metric label="ML area" value={`${spill.area_km2.toFixed(2)} km²`} /><Metric label="Observed" value={spill.observed_at ? new Date(spill.observed_at).toLocaleDateString() : '—'} /></section><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><Evidence spill={spill} /><div className="space-y-8"><ApparentRegion spill={spill} />{spill.drift_origin && <DriftOrigin drift={spill.drift_origin} />}</div></div><VesselRanks ranks={spill.vessel_rankings || []} /></> : <p className="text-[var(--color-muted)]">This case has no completed ML detection.</p>}<Link className="btn-ghost print:hidden" to={`/investigations/${report.data.id}`}>Open case workspace</Link></article>}
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
