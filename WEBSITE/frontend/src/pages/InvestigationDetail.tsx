import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Map, { Layer, NavigationControl, Popup, Source } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useMemo, useRef, useState } from 'react'

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
  const [driftResult, setDriftResult] = useState<any>(null)
  const [attributionResult, setAttributionResult] = useState<any>(null)
  const [hoveredPoint, setHoveredPoint] = useState<any>(null)
  const [caseStatus, setCaseStatus] = useState<string | null>(null)
  const autoDriftStarted = useRef(false)
  const autoRankStarted = useRef(false)
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

  const { data: inv, isLoading, refetch: refetchInvestigation } = useQuery({ queryKey: ['investigation', id], queryFn: async () => { const response = await fetch(`/api/v1/investigations/${id}`, { headers }); if (!response.ok) throw new Error('Could not load this case.'); return response.json() } })
  const { data: job } = useQuery({ queryKey: ['job', jobId], enabled: !!jobId, queryFn: async () => { const response = await fetch(`/api/v1/jobs/${jobId}`, { headers }); if (!response.ok) throw new Error('Could not load model job.'); const data = await response.json(); data.type = data.type || data.job_type; return data }, refetchInterval: (result: any) => ['completed', 'failed'].includes(result?.status) ? false : 1500 })

  useEffect(() => {
    if (job?.status !== 'completed') return
    if (job.type === 'drift') setDriftResult(job.result_data)
    if (job.type === 'attribution') setAttributionResult(job.result_data)
  }, [job])
  const drift = driftResult || (job?.type === 'drift' && job?.status === 'completed' ? job.result_data : null)
  const attribution = attributionResult || (job?.type === 'attribution' && job?.status === 'completed' ? job.result_data : null)
  const displayedRankings = attribution?.candidates || inv?.spill_info?.vessel_rankings || []
  const vesselRoutes = useMemo(() => ({ type: 'FeatureCollection', features: (attribution?.candidates || []).filter((candidate: any) => candidate.trajectory?.length > 1).map((candidate: any) => ({ type: 'Feature', properties: { mmsi: candidate.vessel_id, rank: candidate.rank, score: candidate.score }, geometry: { type: 'LineString', coordinates: candidate.trajectory.map((point: AisPosition) => [point.longitude, point.latitude]) } })) }), [attribution])
  const vesselPoints = useMemo(() => ({ type: 'FeatureCollection', features: (attribution?.candidates || []).flatMap((candidate: any) => { const last = candidate.trajectory?.at(-1); return last ? [{ type: 'Feature', properties: { mmsi: candidate.vessel_id, rank: candidate.rank }, geometry: { type: 'Point', coordinates: [last.longitude, last.latitude] } }] : [] }) }), [attribution])
  const vesselWaypoints = useMemo(() => ({ type: 'FeatureCollection', features: (attribution?.candidates || []).flatMap((candidate: any) => (candidate.trajectory || []).map((point: AisPosition, index: number) => ({ type: 'Feature', properties: { mmsi: candidate.vessel_id, index, timestamp: point.timestamp }, geometry: { type: 'Point', coordinates: [point.longitude, point.latitude] } }))) }), [attribution])
  const driftPath = useMemo(() => ({ type: 'FeatureCollection', features: drift?.path?.length > 1 ? [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: drift.path.map((point: any) => [point.longitude, point.latitude]) } }] : [] }), [drift])
  const originPoint = useMemo(() => ({ type: 'FeatureCollection', features: drift?.origin_zone?.center ? [{ type: 'Feature', properties: { radius: drift.origin_zone.radius_km }, geometry: { type: 'Point', coordinates: [drift.origin_zone.center.longitude, drift.origin_zone.center.latitude] } }] : [] }), [drift])
  const aisRecords = useMemo(() => { try { const rows = JSON.parse(aisInput); return Array.isArray(rows) ? rows : [] } catch { return [] } }, [aisInput])
  const uploadedAisRoutes = useMemo(() => {
    const grouped = new globalThis.Map<string, AisPosition[]>()
    aisRecords.forEach((record: AisPosition) => {
      if (!Number.isFinite(Number(record.longitude)) || !Number.isFinite(Number(record.latitude))) return
      const points = grouped.get(record.mmsi) || []
      points.push(record); grouped.set(record.mmsi, points)
    })
    return { type: 'FeatureCollection', features: [...grouped.entries()].filter(([, points]) => points.length > 1).map(([mmsi, points]) => ({ type: 'Feature', properties: { mmsi }, geometry: { type: 'LineString', coordinates: points.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((point) => [Number(point.longitude), Number(point.latitude)]) } })) }
  }, [aisRecords])
  const uploadedAisWaypoints = useMemo(() => ({ type: 'FeatureCollection', features: aisRecords.filter((point: AisPosition) => Number.isFinite(Number(point.longitude)) && Number.isFinite(Number(point.latitude))).map((point: AisPosition, index: number) => ({ type: 'Feature', properties: { mmsi: point.mmsi, timestamp: point.timestamp, name: point.vessel_name || point.mmsi, speed_knots: point.speed_knots, course_deg: point.course_deg, vessel_type: point.vessel_type || 'Unknown', index }, geometry: { type: 'Point', coordinates: [Number(point.longitude), Number(point.latitude)] } })) }), [aisRecords])
  const uploadedVessels = useMemo(() => {
    const newest = new globalThis.Map<string, AisPosition>()
    aisRecords.forEach((point: AisPosition) => { const existing = newest.get(point.mmsi); if (!existing || new Date(point.timestamp).getTime() >= new Date(existing.timestamp).getTime()) newest.set(point.mmsi, point) })
    return { type: 'FeatureCollection', features: [...newest.values()].filter((point) => Number.isFinite(Number(point.longitude)) && Number.isFinite(Number(point.latitude))).map((point) => ({ type: 'Feature', properties: { mmsi: point.mmsi, name: point.vessel_name || point.mmsi }, geometry: { type: 'Point', coordinates: [Number(point.longitude), Number(point.latitude)] } })) }
  }, [aisRecords])
  const detectedPatch = useMemo(() => {
    const geometry = inv?.spill_info?.geometry?.coordinates?.[0]; const bbox = inv?.spill_info?.observation_bbox?.coordinates?.[0]
    if (!geometry?.length || !bbox?.length) return ''
    const west = bbox[0][0], south = bbox[0][1], east = bbox[2][0], north = bbox[2][1]
    return geometry.map(([longitude, latitude]: number[]) => `${((longitude - west) / (east - west)) * 100},${((north - latitude) / (north - south)) * 100}`).join(' ')
  }, [inv])
  const spillImpact = useMemo(() => {
    const ring = inv?.spill_info?.geometry?.coordinates?.[0]
    const areaKm2 = Number(inv?.spill_info?.area_km2)
    if (!ring?.length || !Number.isFinite(areaKm2) || areaKm2 <= 0) return { type: 'FeatureCollection', features: [] }
    const points = ring.slice(0, -1)
    const longitude = points.reduce((sum: number, point: number[]) => sum + point[0], 0) / points.length
    const latitude = points.reduce((sum: number, point: number[]) => sum + point[1], 0) / points.length
    const radiusKm = Math.sqrt(areaKm2 / Math.PI)
    const latitudeRadius = radiusKm / 111.32
    const longitudeRadius = radiusKm / Math.max(0.000001, 111.32 * Math.cos(latitude * Math.PI / 180))
    const circle = Array.from({ length: 33 }, (_, index) => {
      const angle = 2 * Math.PI * index / 32
      return [longitude + longitudeRadius * Math.cos(angle), latitude + latitudeRadius * Math.sin(angle)]
    })
    return { type: 'FeatureCollection', features: [
      { type: 'Feature', properties: { area_km2: areaKm2, radius_km: radiusKm }, geometry: { type: 'Polygon', coordinates: [circle] } },
      { type: 'Feature', properties: { area_km2: areaKm2, radius_km: radiusKm }, geometry: { type: 'Point', coordinates: [longitude, latitude] } },
    ] }
  }, [inv])
  const spillCoordinates = useMemo(() => {
    const ring = inv?.spill_info?.geometry?.coordinates?.[0]
    if (!ring?.length) return null
    const points = ring.slice(0, -1)
    return { latitude: points.reduce((sum: number, point: number[]) => sum + point[1], 0) / points.length, longitude: points.reduce((sum: number, point: number[]) => sum + point[0], 0) / points.length }
  }, [inv])
  const originCoordinates = drift?.origin_zone?.center || null
  const driftDistanceKm = useMemo(() => {
    if (!spillCoordinates || !originCoordinates) return null
    const toRadians = (value: number) => value * Math.PI / 180
    const dLat = toRadians(originCoordinates.latitude - spillCoordinates.latitude), dLon = toRadians(originCoordinates.longitude - spillCoordinates.longitude)
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(spillCoordinates.latitude)) * Math.cos(toRadians(originCoordinates.latitude)) * Math.sin(dLon / 2) ** 2
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }, [spillCoordinates, originCoordinates])
  const originToApparent = useMemo(() => ({ type: 'FeatureCollection', features: originCoordinates && spillCoordinates ? [{ type: 'Feature', properties: { distance_km: driftDistanceKm }, geometry: { type: 'LineString', coordinates: [[originCoordinates.longitude, originCoordinates.latitude], [spillCoordinates.longitude, spillCoordinates.latitude]] } }] : [] }), [originCoordinates, spillCoordinates, driftDistanceKm])

  const changeCaseStatus = async (nextStatus: string) => {
    if (!id) return
    const response = await fetch(`/api/v1/investigations/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ status: nextStatus }) })
    if (!response.ok) return setFormError('Could not update case status.')
    setCaseStatus(nextStatus)
  }

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

  // The pipeline is intentionally sequential: drift needs the detector geometry,
  // and vessel scoring needs the resulting origin zone. No manual second click.
  useEffect(() => {
    if (job?.type === 'detect' && ['completed', 'failed'].includes(job.status)) void refetchInvestigation()
  }, [job?.id, job?.type, job?.status, refetchInvestigation])

  useEffect(() => {
    if (!autoDriftStarted.current && inv?.spill_info?.geometry) {
      if (job?.type === 'detect' && job?.status !== 'completed') return
      if (job?.type === 'detect' && job.result_data?.spill_detected === false) {
        autoDriftStarted.current = true
        return
      }
      autoDriftStarted.current = true
      void runHindcast()
      return
    }
    if (job?.type === 'drift' && job?.status === 'completed' && drift && aisRecords.length > 0 && !autoRankStarted.current) {
      autoRankStarted.current = true
      void rankVessels()
    }
  }, [job?.id, job?.type, job?.status, inv?.spill_info?.geometry, drift, aisRecords.length])

  if (isLoading) return <div className="p-8 text-[var(--color-muted)]">Loading case…</div>
  const center = inv?.spill_info?.geometry?.coordinates?.[0]?.[0] || [80.61, 15.79]
  const status = job?.type ? `${job.type} · ${job.status}` : inv?.status || 'open'

  return <div className="relative h-full min-h-[680px] bg-[#0b1012]">
    <Map initialViewState={{ longitude: center[0], latitude: center[1], zoom: 8.5 }} mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" attributionControl={false} interactiveLayerIds={['uploaded-waypoints-dot', 'uploaded-vessels-dot', 'waypoints-dot', 'vessels-dot', 'spill-impact-area', 'spill-impact-dot']} onMouseMove={(event: any) => { const feature = event.features?.[0]; if (feature) setHoveredPoint({ longitude: event.lngLat.lng, latitude: event.lngLat.lat, ...feature.properties }); else setHoveredPoint(null) }} onMouseLeave={() => setHoveredPoint(null)}>
      <NavigationControl position="bottom-right" />
      {inv?.spill_info?.geometry && <Source id="spill" type="geojson" data={inv.spill_info.geometry as any}><Layer id="spill-fill" type="fill" paint={{ 'fill-color': '#f6b84b', 'fill-opacity': 0.24 }} /><Layer id="spill-outline" type="line" paint={{ 'line-color': '#f6b84b', 'line-width': 2 }} /></Source>}
      {drift && spillImpact.features.length > 0 && <Source id="spill-impact" type="geojson" data={spillImpact as any}><Layer id="spill-impact-area" type="fill" filter={['==', '$type', 'Polygon']} paint={{ 'fill-color': '#ef4444', 'fill-opacity': 0.10 }} /><Layer id="spill-impact-line" type="line" filter={['==', '$type', 'Polygon']} paint={{ 'line-color': '#ef4444', 'line-width': 2, 'line-dasharray': [2, 2] }} /><Layer id="spill-impact-dot" type="circle" filter={['==', '$type', 'Point']} paint={{ 'circle-radius': 6, 'circle-color': '#ef4444', 'circle-stroke-color': '#fff', 'circle-stroke-width': 1.5 }} /></Source>}
      {drift?.origin_zone && <Source id="origin" type="geojson" data={drift.origin_zone as any}><Layer id="origin-line" type="line" paint={{ 'line-color': '#68cad1', 'line-width': 1.5, 'line-dasharray': [2, 2] }} /></Source>}
      {driftPath.features.length > 0 && <Source id="drift-path" type="geojson" data={driftPath as any}><Layer id="drift-path-line" type="line" paint={{ 'line-color': '#f6b84b', 'line-width': 4, 'line-dasharray': [2, 2], 'line-opacity': 0.85 }} /></Source>}
      {originPoint.features.length > 0 && <Source id="origin-point" type="geojson" data={originPoint as any}><Layer id="origin-halo" type="circle" paint={{ 'circle-radius': 11, 'circle-color': '#68cad1', 'circle-opacity': 0.18 }} /><Layer id="origin-center" type="circle" paint={{ 'circle-radius': 4.5, 'circle-color': '#68cad1', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.5 }} /></Source>}
      {originToApparent.features.length > 0 && <Source id="origin-apparent" type="geojson" data={originToApparent as any}><Layer id="origin-apparent-line" type="line" paint={{ 'line-color': '#ef4444', 'line-width': 1.5, 'line-dasharray': [1.5, 2], 'line-opacity': 0.9 }} /></Source>}
      {uploadedAisRoutes.features.length > 0 && <Source id="uploaded-routes" type="geojson" data={uploadedAisRoutes as any}><Layer id="uploaded-routes-line" type="line" paint={{ 'line-color': '#508d94', 'line-width': 1.5, 'line-opacity': 0.7 }} /></Source>}
      {uploadedAisWaypoints.features.length > 0 && <Source id="uploaded-waypoints" type="geojson" data={uploadedAisWaypoints as any}><Layer id="uploaded-waypoints-dot" type="circle" paint={{ 'circle-radius': 3.5, 'circle-color': '#0b1012', 'circle-stroke-color': '#72d0d5', 'circle-stroke-width': 1.5 }} /></Source>}
      {uploadedVessels.features.length > 0 && <Source id="uploaded-vessels" type="geojson" data={uploadedVessels as any}><Layer id="uploaded-vessels-dot" type="circle" paint={{ 'circle-radius': 6, 'circle-color': '#72d0d5', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.5 }} /><Layer id="uploaded-vessels-label" type="symbol" layout={{ 'text-field': ['get', 'name'], 'text-size': 11, 'text-offset': [0, 1.25], 'text-anchor': 'top' }} paint={{ 'text-color': '#dffcff', 'text-halo-color': '#0b1012', 'text-halo-width': 1.5 }} /></Source>}
      {vesselRoutes.features.length > 0 && <Source id="routes" type="geojson" data={vesselRoutes as any}><Layer id="routes-line" type="line" paint={{ 'line-color': '#72d0d5', 'line-width': 2.5, 'line-opacity': 0.9 }} /></Source>}
      {vesselWaypoints.features.length > 0 && <Source id="waypoints" type="geojson" data={vesselWaypoints as any}><Layer id="waypoints-dot" type="circle" paint={{ 'circle-radius': 3.5, 'circle-color': '#0b1012', 'circle-stroke-color': '#72d0d5', 'circle-stroke-width': 1.5 }} /></Source>}
      {vesselPoints.features.length > 0 && <Source id="vessels" type="geojson" data={vesselPoints as any}><Layer id="vessels-dot" type="circle" paint={{ 'circle-radius': 5, 'circle-color': '#fff', 'circle-stroke-color': '#0f777e', 'circle-stroke-width': 3 }} /></Source>}
      {hoveredPoint && <Popup longitude={hoveredPoint.longitude} latitude={hoveredPoint.latitude} closeButton={false} closeOnClick={false} offset={12} className="ais-popup"><div>{hoveredPoint.area_km2 ? <><strong>Apparent oil-spill region</strong><p>{Number(hoveredPoint.area_km2).toFixed(2)} km² · radius {Number(hoveredPoint.radius_km).toFixed(2)} km</p>{spillCoordinates && <p>{spillCoordinates.latitude.toFixed(5)}, {spillCoordinates.longitude.toFixed(5)}</p>}</> : <><strong>{hoveredPoint.name || hoveredPoint.mmsi || 'AIS waypoint'}</strong><p>MMSI {hoveredPoint.mmsi || '—'}</p>{hoveredPoint.timestamp && <p>{new Date(hoveredPoint.timestamp).toLocaleString()}</p>}{hoveredPoint.speed_knots !== undefined && <p>{hoveredPoint.speed_knots} kn · {hoveredPoint.course_deg}° · {hoveredPoint.vessel_type || 'Unknown'}</p>}</>}</div></Popup>}
    </Map>

    <header className="absolute top-5 left-5 right-5 flex items-start justify-between pointer-events-none"><div className="case-header pointer-events-auto"><p className="text-label-sm text-[var(--color-muted)]">Case {id?.slice(0, 8)}</p><h1 className="text-headline-md text-white mt-1">Spill investigation</h1><div className="case-actions mt-3"><span className="text-body-sm text-[var(--color-muted-light)] capitalize mr-2">{caseStatus || status}</span>{['open', 'critical', 'closed'].map((value) => <button key={value} onClick={() => void changeCaseStatus(value)} className={(caseStatus || inv?.status) === value ? 'active' : ''}>{value}</button>)}</div></div><Link to="/investigations" className="btn-ghost pointer-events-auto">All cases</Link></header>

    <aside className="case-panel absolute left-5 top-32 bottom-5 w-[min(390px,calc(100vw-40px))] overflow-y-auto pointer-events-auto">
      <section><p className="text-label-sm text-[var(--color-muted)]">01 · satellite observation</p><div className="mt-3 flex items-center justify-between"><span className="text-body-md text-white">{inv?.spill_info ? 'Detection complete' : job?.type === 'detect' && job?.status === 'completed' ? 'No spill detected' : 'Waiting for detection'}</span>{inv?.spill_info && <span className="pill">{Math.round((inv.spill_info.confidence || 0) * 100)}% confidence</span>}</div>{inv?.spill_info?.image_url && <div className="patch-preview relative mt-3 overflow-hidden rounded-lg border border-white/10 bg-black"><img src={inv.spill_info.image_url} alt="The uploaded satellite observation" className="block h-auto w-full" />{detectedPatch && <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full"><polygon points={detectedPatch} className="patch-polygon" /></svg>}<span className="absolute left-2 top-2 rounded bg-amber-400 px-2 py-1 text-label-sm text-black">ML detected patch</span></div>}<p className="mt-2 text-label-sm text-[var(--color-muted)]">This is the uploaded image. Amber outline = geometry returned by the ML detector.</p></section>
      <div className="divider" />
      <section><p className="text-label-sm text-[var(--color-muted)]">02 · drift analysis</p>{!inv?.spill_info && job?.type === 'detect' && job?.status === 'completed' ? <p className="text-body-sm text-[var(--color-muted-light)] mt-2">No detection geometry available to run drift analysis.</p> : !inv?.spill_info && <p className="text-body-sm text-[var(--color-muted-light)] mt-2">Waiting for the satellite detector to return geometry…</p>}{inv?.spill_info && !drift && <p className="text-body-sm text-[var(--color-electric-cyan)] mt-2">Drift model is running automatically from the detected geometry…</p>}{drift && <div className="mt-3 rounded-lg border border-[var(--color-electric-cyan)]/30 bg-[var(--color-electric-cyan)]/5 p-3"><p className="text-label-sm text-[var(--color-electric-cyan)]">DRIFT OUTPUT</p><div className="mt-3 space-y-3 text-body-sm"><div><span className="text-[var(--color-muted)]">Original spill / likely source</span><p className="font-mono text-white mt-1">{Number(originCoordinates?.latitude).toFixed(5)}, {Number(originCoordinates?.longitude).toFixed(5)}</p></div><div><span className="text-[var(--color-muted)]">Apparent oil region / observed patch</span><p className="font-mono text-white mt-1">{spillCoordinates ? `${spillCoordinates.latitude.toFixed(5)}, ${spillCoordinates.longitude.toFixed(5)}` : '—'}</p></div><div className="flex justify-between"><span className="text-[var(--color-muted)]">Drift distance</span><strong className="font-mono text-white">{driftDistanceKm ? `${driftDistanceKm.toFixed(2)} km` : '—'}</strong></div><div className="flex justify-between"><span className="text-[var(--color-muted)]">Origin uncertainty</span><strong className="font-mono text-white">{Number(drift.uncertainty_km).toFixed(1)} km</strong></div></div><p className="mt-3 text-label-sm text-[var(--color-muted)]">Red line connects source to apparent region. Hover the red circle for ML area coordinates.</p></div>}</section>
      {drift && <><div className="divider" /><section><p className="text-label-sm text-[var(--color-muted)]">03 · AIS vessel data</p><p className="text-body-sm text-[var(--color-muted-light)] mt-2">Each row is an AIS waypoint. The model uses these records for filtering and vessel scores; the map draws the evidence trail.</p><textarea value={aisInput} onChange={(event) => setAisInput(event.target.value)} placeholder={aisExample} className="ais-input mt-3" rows={7} />{aisRecords.length > 0 && <div className="ais-table-wrap mt-3"><table className="ais-table"><thead><tr><th>MMSI</th><th>Time</th><th>Lat</th><th>Lon</th><th>kn</th><th>°</th></tr></thead><tbody>{aisRecords.slice(0, 12).map((row: AisPosition, index: number) => <tr key={`${row.mmsi}-${row.timestamp}-${index}`}><td>{row.mmsi}</td><td>{new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td><td>{Number(row.latitude).toFixed(3)}</td><td>{Number(row.longitude).toFixed(3)}</td><td>{row.speed_knots}</td><td>{row.course_deg}</td></tr>)}</tbody></table>{aisRecords.length > 12 && <p className="p-2 text-label-sm text-[var(--color-muted)]">+ {aisRecords.length - 12} more AIS positions</p>}</div>}<button className="btn-primary mt-3 w-full justify-center" onClick={() => void rankVessels()} disabled={!aisInput.trim() || (job && !['completed', 'failed'].includes(job.status))}>Rank vessels & show paths</button></section></>}
      {formError && <p className="mt-3 text-body-sm text-[var(--color-error)]">{formError}</p>}
      {job && <p className="mt-3 text-label-sm text-[var(--color-muted)]">Model job: {job.progress}% {job.error_message ? `· ${job.error_message}` : ''}</p>}
      {displayedRankings.length > 0 && <><div className="divider" /><section><div className="flex justify-between"><p className="text-label-sm text-[var(--color-muted)]">ML vessel attribution</p><span className="text-label-sm text-[var(--color-electric-cyan)]">{displayedRankings.length} leads</span></div><div className="ais-table-wrap mt-3"><table className="ais-table"><thead><tr><th>Rank</th><th>Vessel / MMSI</th><th>Probability</th><th>Points</th></tr></thead><tbody>{displayedRankings.map((candidate: any) => <tr key={candidate.vessel_id || candidate.mmsi}><td className="text-[var(--color-signal-amber)]">#{candidate.rank}</td><td>{candidate.trajectory?.at(-1)?.vessel_name || candidate.vessel_name || candidate.vessel_id || candidate.mmsi}<small>{candidate.vessel_id || candidate.mmsi}</small></td><td><strong>{Math.round(candidate.score)}%</strong></td><td>{candidate.positions_used}</td></tr>)}</tbody></table></div></section></>}
    </aside>
    <div className="map-legend absolute right-5 bottom-5"><span><i className="spill-key" /> detected spill</span><span><i className="impact-key" /> ML area radius</span><span><i className="origin-key" /> likely origin & region</span><span><i className="drift-key" /> drift path</span><span><i className="route-key" /> AIS route + waypoints</span></div>
  </div>
}
