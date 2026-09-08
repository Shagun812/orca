import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Map, { Layer, NavigationControl, Source } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMemo, useState } from 'react'

type AisPosition = { mmsi: string; timestamp: string; latitude: number; longitude: number; speed_knots: number; course_deg: number; heading_deg?: number | null; vessel_type?: string | null; imo?: string | null; vessel_name?: string | null }

const aisExample = JSON.stringify([{ mmsi: '123456789', timestamp: '2026-09-08T11:30:00Z', latitude: 15.79, longitude: 80.61, speed_knots: 11.2, course_deg: 88, heading_deg: 88, vessel_name: 'Example vessel' }], null, 2)

export default function InvestigationDetail() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const intake = useMemo(() => { try { return JSON.parse(sessionStorage.getItem(`case-inputs-${id}`) || '{}') } catch { return {} } }, [id])
  const [jobId, setJobId] = useState<string | null>(() => params.get('job'))
  const [aisInput, setAisInput] = useState(() => intake.ais_positions?.length ? JSON.stringify(intake.ais_positions, null, 2) : '')
  const [formError, setFormError] = useState('')
  const [lookbackHours, setLookbackHours] = useState('24')
  const [originBufferKm, setOriginBufferKm] = useState('10')
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

  const { data: inv, isLoading } = useQuery({ queryKey: ['investigation', id], queryFn: async () => { const response = await fetch(`/api/v1/investigations/${id}`, { headers }); if (!response.ok) throw new Error('Could not load this case.'); return response.json() } })
  const { data: job } = useQuery({ queryKey: ['job', jobId], enabled: !!jobId, queryFn: async () => { const response = await fetch(`/api/v1/jobs/${jobId}`, { headers }); if (!response.ok) throw new Error('Could not load model job.'); return response.json() }, refetchInterval: (result: any) => ['completed', 'failed'].includes(result?.status) ? false : 1500 })

  const drift = job?.type === 'drift' && job?.status === 'completed' ? job.result_data : null
  const attribution = job?.type === 'attribution' && job?.status === 'completed' ? job.result_data : null
  const vesselRoutes = useMemo(() => ({ type: 'FeatureCollection', features: (attribution?.candidates || []).filter((candidate: any) => candidate.trajectory?.length > 1).map((candidate: any) => ({ type: 'Feature', properties: { mmsi: candidate.vessel_id, rank: candidate.rank, score: candidate.score }, geometry: { type: 'LineString', coordinates: candidate.trajectory.map((point: AisPosition) => [point.longitude, point.latitude]) } })) }), [attribution])
  const vesselPoints = useMemo(() => ({ type: 'FeatureCollection', features: (attribution?.candidates || []).flatMap((candidate: any) => { const last = candidate.trajectory?.at(-1); return last ? [{ type: 'Feature', properties: { mmsi: candidate.vessel_id, rank: candidate.rank }, geometry: { type: 'Point', coordinates: [last.longitude, last.latitude] } }] : [] }) }), [attribution])

  const runHindcast = async () => {
    if (!inv?.spill_info?.geometry) return
    setFormError('')
    const lookback = Number(lookbackHours); const buffer = Number(originBufferKm)
    if (!Number.isFinite(lookback) || lookback <= 0 || lookback > 168 || !Number.isFinite(buffer) || buffer <= 0 || buffer > 200) return setFormError('Lookback must be 1–168 hours and origin buffer must be 1–200 km.')
    const response = await fetch('/api/v1/drift/hindcast', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ spill_geometry: inv.spill_info.geometry, observed_at: inv.spill_info.observed_at, lookback_hours: lookback, origin_buffer_km: buffer, current_u_mps: intake.current_u_mps, current_v_mps: intake.current_v_mps, wind_u_mps: intake.wind_u_mps, wind_v_mps: intake.wind_v_mps }) })
    if (!response.ok) return setFormError('The drift service could not start. Check that both backend and ML service are running.')
    setJobId((await response.json()).job_id)
  }

  const rankVessels = async () => {
    try {
      const aisPositions: AisPosition[] = JSON.parse(aisInput)
      if (!Array.isArray(aisPositions) || !aisPositions.length) throw new Error('Paste at least one AIS position.')
      const required = ['mmsi', 'timestamp', 'latitude', 'longitude', 'speed_knots', 'course_deg']
      if (aisPositions.some((row) => required.some((key) => row[key as keyof AisPosition] === undefined || row[key as keyof AisPosition] === ''))) throw new Error('Every AIS record needs MMSI, timestamp, latitude, longitude, speed_knots, and course_deg.')
      const response = await fetch('/api/v1/attribution/rank', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ event_time: inv.spill_info.observed_at, origin_zone: drift.origin_zone, time_window: drift.time_window, ais_positions: aisPositions, search_buffer_km: 20 }) })
      if (!response.ok) throw new Error('Vessel attribution could not start.')
      setFormError(''); setJobId((await response.json()).job_id)
    } catch (error: any) { setFormError(error.message || 'AIS input is not valid JSON.') }
  }

  if (isLoading) return <div className="p-8 text-[var(--color-muted)]">Loading case…</div>
  const center = inv?.spill_info?.geometry?.coordinates?.[0]?.[0] || [80.61, 15.79]
  const status = job ? `${job.type} · ${job.status}` : inv?.status || 'open'

  return <div className="relative h-full min-h-[680px] bg-[#0b1012]">
    <Map initialViewState={{ longitude: center[0], latitude: center[1], zoom: 8.5 }} mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" attributionControl={false}>
      <NavigationControl position="bottom-right" />
      {inv?.spill_info?.geometry && <Source id="spill" type="geojson" data={inv.spill_info.geometry as any}><Layer id="spill-fill" type="fill" paint={{ 'fill-color': '#f6b84b', 'fill-opacity': 0.24 }} /><Layer id="spill-outline" type="line" paint={{ 'line-color': '#f6b84b', 'line-width': 2 }} /></Source>}
      {drift?.origin_zone && <Source id="origin" type="geojson" data={drift.origin_zone as any}><Layer id="origin-line" type="line" paint={{ 'line-color': '#68cad1', 'line-width': 1.5, 'line-dasharray': [2, 2] }} /></Source>}
      {vesselRoutes.features.length > 0 && <Source id="routes" type="geojson" data={vesselRoutes as any}><Layer id="routes-line" type="line" paint={{ 'line-color': '#72d0d5', 'line-width': 2.5, 'line-opacity': 0.9 }} /></Source>}
      {vesselPoints.features.length > 0 && <Source id="vessels" type="geojson" data={vesselPoints as any}><Layer id="vessels-dot" type="circle" paint={{ 'circle-radius': 5, 'circle-color': '#fff', 'circle-stroke-color': '#0f777e', 'circle-stroke-width': 3 }} /></Source>}
    </Map>

    <header className="absolute top-5 left-5 right-5 flex items-start justify-between pointer-events-none"><div className="case-header pointer-events-auto"><p className="text-label-sm text-[var(--color-muted)]">Case {id?.slice(0, 8)}</p><h1 className="text-headline-md text-white mt-1">Spill investigation</h1><p className="text-body-sm text-[var(--color-muted-light)] mt-1 capitalize">{status}</p></div><Link to="/investigations" className="btn-ghost pointer-events-auto">All cases</Link></header>

    <aside className="case-panel absolute left-5 top-32 bottom-5 w-[min(390px,calc(100vw-40px))] overflow-y-auto pointer-events-auto">
      <section><p className="text-label-sm text-[var(--color-muted)]">01 · satellite observation</p><div className="mt-3 flex items-center justify-between"><span className="text-body-md text-white">{inv?.spill_info ? 'Detection complete' : 'Waiting for detection'}</span>{inv?.spill_info && <span className="pill">{Math.round((inv.spill_info.confidence || 0) * 100)}% confidence</span>}</div>{inv?.spill_info?.image_url && <div className="relative mt-3 overflow-hidden rounded-lg border border-white/10"><img src={inv.spill_info.image_url} alt="Satellite observation with detected oil patch" className="block max-h-44 w-full object-cover" /><span className="absolute left-2 top-2 rounded bg-amber-400 px-2 py-1 text-label-sm text-black">Detected oil patch</span></div>}</section>
      <div className="divider" />
      <section><p className="text-label-sm text-[var(--color-muted)]">02 · drift model</p><p className="text-body-sm text-[var(--color-muted-light)] mt-2">Estimate the likely origin from the detected geometry and observation time.</p><div className="grid grid-cols-2 gap-2 mt-3"><label className="text-label-sm text-[var(--color-muted)]">Lookback hours<input type="number" min="1" max="168" value={lookbackHours} onChange={(event) => setLookbackHours(event.target.value)} className="model-input" /></label><label className="text-label-sm text-[var(--color-muted)]">Origin buffer km<input type="number" min="1" max="200" value={originBufferKm} onChange={(event) => setOriginBufferKm(event.target.value)} className="model-input" /></label></div><button className="btn-primary mt-4 w-full justify-center" onClick={() => void runHindcast()} disabled={!inv?.spill_info?.geometry || (job && !['completed', 'failed'].includes(job.status))}>Run hindcast</button></section>
      {drift && <><div className="divider" /><section><p className="text-label-sm text-[var(--color-muted)]">03 · AIS vessel data</p><p className="text-body-sm text-[var(--color-muted-light)] mt-2">Paste a JSON array matching the model schema. The route shown on the map is built from the submitted AIS positions.</p><textarea value={aisInput} onChange={(event) => setAisInput(event.target.value)} placeholder={aisExample} className="ais-input mt-3" rows={10} /><button className="btn-primary mt-3 w-full justify-center" onClick={() => void rankVessels()} disabled={!aisInput.trim() || (job && !['completed', 'failed'].includes(job.status))}>Rank vessels & show paths</button></section></>}
      {formError && <p className="mt-3 text-body-sm text-[var(--color-error)]">{formError}</p>}
      {job && <p className="mt-3 text-label-sm text-[var(--color-muted)]">Model job: {job.progress}% {job.error_message ? `· ${job.error_message}` : ''}</p>}
      {attribution && <><div className="divider" /><section><div className="flex justify-between"><p className="text-label-sm text-[var(--color-muted)]">Vessel leads</p><span className="text-label-sm text-[var(--color-electric-cyan)]">{attribution.candidate_count} found</span></div><div className="mt-3 space-y-2">{attribution.candidates?.map((candidate: any) => <article key={candidate.vessel_id} className="candidate-row"><span className="text-label-sm text-[var(--color-signal-amber)]">#{candidate.rank}</span><div><strong className="text-body-sm text-white">{candidate.trajectory?.at(-1)?.vessel_name || candidate.vessel_id}</strong><p className="text-label-sm text-[var(--color-muted)]">MMSI {candidate.vessel_id} · {candidate.positions_used} positions</p></div><strong className="text-body-md text-white">{Math.round(candidate.score)}</strong></article>)}</div></section></>}
    </aside>
    <div className="map-legend absolute right-5 bottom-5"><span><i className="spill-key" /> detected spill</span><span><i className="origin-key" /> likely origin</span><span><i className="route-key" /> AIS route</span></div>
  </div>
}
