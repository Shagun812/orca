import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Map, { Layer, Popup, Source } from 'react-map-gl/maplibre'
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
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
    if (!Number.isFinite(lookback) || lookback <= 0 || lookback > 168 || !Number.isFinite(buffer) || buffer <= 0 || buffer > 200) return setFormError('Lookback must be 1â€“168 hours and origin buffer must be 1â€“200 km.')
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

  if (isLoading) return <div className="p-8 text-[var(--color-muted)]">Loading caseâ€¦</div>
  const center = inv?.spill_info?.geometry?.coordinates?.[0]?.[0] || [80.61, 15.79]
  const status = job?.type ? `${job.type} Â· ${job.status}` : inv?.status || 'open'

  return <div className="relative h-full min-h-[680px] bg-transparent">
    <Map initialViewState={{ longitude: center[0], latitude: center[1], zoom: 8.5 }} mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" attributionControl={false} interactiveLayerIds={['uploaded-waypoints-dot', 'uploaded-vessels-dot', 'waypoints-dot', 'vessels-dot', 'spill-impact-area', 'spill-impact-dot']} onMouseMove={(event: any) => { const feature = event.features?.[0]; if (feature) setHoveredPoint({ longitude: event.lngLat.lng, latitude: event.lngLat.lat, ...feature.properties }); else setHoveredPoint(null) }} onMouseLeave={() => setHoveredPoint(null)}>

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
      {hoveredPoint && <Popup longitude={hoveredPoint.longitude} latitude={hoveredPoint.latitude} closeButton={false} closeOnClick={false} offset={12} className="ais-popup"><div>{hoveredPoint.area_km2 ? <><strong>Apparent oil-spill region</strong><p>{Number(hoveredPoint.area_km2).toFixed(2)} kmÂ² Â· radius {Number(hoveredPoint.radius_km).toFixed(2)} km</p>{spillCoordinates && <p>{spillCoordinates.latitude.toFixed(5)}, {spillCoordinates.longitude.toFixed(5)}</p>}</> : <><strong>{hoveredPoint.name || hoveredPoint.mmsi || 'AIS waypoint'}</strong><p>MMSI {hoveredPoint.mmsi || 'â€”'}</p>{hoveredPoint.timestamp && <p>{new Date(hoveredPoint.timestamp).toLocaleString()}</p>}{hoveredPoint.speed_knots !== undefined && <p>{hoveredPoint.speed_knots} kn Â· {hoveredPoint.course_deg}Â° Â· {hoveredPoint.vessel_type || 'Unknown'}</p>}</>}</div></Popup>}
    </Map>
    
    
    <div className="absolute top-5 right-5 pointer-events-auto z-10">
      <Link to="/investigations" className="btn-ghost rounded-none text-[10px] shadow-none uppercase tracking-widest border border-white/20 px-6 py-3 bg-black/65 backdrop-blur-md hover:bg-white/10 transition-colors">ALL CASES</Link>
    </div>

    <div className={`absolute top-0 bottom-0 left-0 w-[480px] bg-black/80 backdrop-blur-2xl border-r border-white/[0.05] z-20 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[30px_0_60px_rgba(0,0,0,0.5)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute -right-8 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-2xl border border-white/[0.05] border-l-0 w-8 h-24 flex items-center justify-center text-white/50 hover:text-white pointer-events-auto transition-colors shadow-[10px_0_20px_rgba(0,0,0,0.2)]"
      >
        <svg className={`w-4 h-4 transition-transform duration-500 ${isSidebarOpen ? 'rotate-0' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="p-8 border-b border-white/[0.05] flex-shrink-0 pointer-events-auto bg-black/20">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)]">CASE {id?.slice(0, 8)}</p>
        <h1 className="text-3xl font-light tracking-tight text-white mt-1">Spill investigation</h1>
        <div className="flex items-center gap-4 mt-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[white]">{caseStatus || status}</span>
          <span className="w-px h-3 bg-white/20"></span>
          <div className="flex items-center gap-2">
            {['open', 'critical', 'closed'].map((value) => 
              <button 
                key={value} 
                onClick={() => void changeCaseStatus(value)} 
                className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 border transition-colors ${
                  (caseStatus || inv?.status) === value ? 'border-white text-white bg-white/10' : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {value}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 overflow-y-auto flex-1 custom-scroll space-y-10 pointer-events-auto">

      
      <section>
        <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] border-b border-white/[0.05] pb-2">01 // SATELLITE OBSERVATION</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-white">{inv?.spill_info ? 'Detection complete' : job?.type === 'detect' && job?.status === 'completed' ? 'No spill detected' : 'Waiting for detection'}</span>
          {inv?.spill_info && <span className="text-[10px] font-mono text-white px-2 py-1 bg-white/10">{Math.round((inv.spill_info.confidence || 0) * 100)}% DETECTED</span>}
        </div>
        {inv?.spill_info?.image_url && 
          <div className="relative mt-4 border border-white/10 bg-black/65 backdrop-blur-md">
            <img src={inv.spill_info.image_url} alt="The uploaded satellite observation" className="block h-auto w-full opacity-80 mix-blend-screen" />
            {detectedPatch && <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full"><polygon points={detectedPatch} className="patch-polygon" /></svg>}
            <span className="absolute left-2 top-2 bg-white px-2 py-1 text-[10px] font-bold tracking-widest uppercase text-black">ML PATCH</span>
          </div>
        }
      </section>
      
      <section>
        <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] border-b border-white/[0.05] pb-2">02 // DRIFT ANALYSIS</p>
        {!inv?.spill_info && job?.type === 'detect' && job?.status === 'completed' ? <p className="text-sm text-[var(--color-muted)] mt-4">No detection geometry available to run drift analysis.</p> : !inv?.spill_info && <p className="text-sm text-[var(--color-muted)] mt-4">Waiting for the satellite detector to return geometryâ€¦</p>}
        {inv?.spill_info && !drift && <p className="text-sm text-white mt-4">Drift model is running automatically from the detected geometryâ€¦</p>}
        {drift && 
          <div className="mt-4 border-l-2 border-white/20 pl-4">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-muted)]">Source Origin</span>
                <p className="font-mono text-white text-sm mt-1">{Number(originCoordinates?.latitude).toFixed(5)}, {Number(originCoordinates?.longitude).toFixed(5)}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-muted)]">Apparent Region</span>
                <p className="font-mono text-white text-sm mt-1">{spillCoordinates ? `${spillCoordinates.latitude.toFixed(5)}, ${spillCoordinates.longitude.toFixed(5)}` : 'â€”'}</p>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-muted)]">Drift Distance</span>
                <strong className="font-mono text-white text-sm">{driftDistanceKm ? `${driftDistanceKm.toFixed(2)} km` : 'â€”'}</strong>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-muted)]">Origin Uncert.</span>
                <strong className="font-mono text-white text-sm">{Number(drift.uncertainty_km).toFixed(1)} km</strong>
              </div>
            </div>
          </div>
        }
      </section>

      {drift && (
        <section>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] border-b border-white/[0.05] pb-2">03 // AIS VESSEL DATA</p>
          <textarea value={aisInput} onChange={(event) => setAisInput(event.target.value)} placeholder={aisExample} className="w-full mt-4 bg-transparent border border-white/10 text-white font-mono text-xs p-3 focus:outline-none focus:border-white transition-colors placeholder-[var(--color-muted)]" rows={5} />
          
          {aisRecords.length > 0 && (
            <div className="mt-4 border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02]">
                  <tr className="border-b border-white/10 text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)]">
                    <th className="p-2 font-normal">MMSI</th><th className="p-2 font-normal">Time</th><th className="p-2 font-normal">Lat</th><th className="p-2 font-normal">Lon</th><th className="p-2 font-normal">kn</th><th className="p-2 font-normal">Â°</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {aisRecords.slice(0, 8).map((row: AisPosition, index: number) => (
                    <tr key={`${row.mmsi}-${row.timestamp}-${index}`} className="border-b border-white/[0.05] last:border-0 text-white/70">
                      <td className="p-2">{row.mmsi}</td><td className="p-2">{new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td><td className="p-2">{Number(row.latitude).toFixed(3)}</td><td className="p-2">{Number(row.longitude).toFixed(3)}</td><td className="p-2">{row.speed_knots}</td><td className="p-2">{row.course_deg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {aisRecords.length > 8 && <p className="p-2 text-[10px] font-mono text-center text-[var(--color-muted)] bg-white/[0.02] uppercase tracking-widest border-t border-white/10">+ {aisRecords.length - 8} MORE POSITIONS</p>}
            </div>
          )}
          <button className="btn-primary mt-4 w-full justify-center rounded-none shadow-none text-xs" onClick={() => void rankVessels()} disabled={!aisInput.trim() || (job && !['completed', 'failed'].includes(job.status))}>RANK VESSELS</button>
        </section>
      )}
      
      {formError && <p className="text-sm font-mono text-red-400">{formError}</p>}
      {job && <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)]">Model job: {job.progress}% {job.error_message ? `// ${job.error_message}` : ''}</p>}
      
      {displayedRankings.length > 0 && (
        <section>
          <div className="flex justify-between items-end border-b border-white/[0.05] pb-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)]">ATTRIBUTION RANKING</p>
            <span className="text-[10px] font-mono text-white">{displayedRankings.length} LEADS</span>
          </div>
          <div className="mt-4 border border-white/10 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02]">
                <tr className="border-b border-white/10 text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)]">
                  <th className="p-3 font-normal">Rank</th><th className="p-3 font-normal">Vessel / MMSI</th><th className="p-3 font-normal text-right">Probability</th>
                </tr>
              </thead>
              <tbody>
                {displayedRankings.map((candidate: any) => (
                  <tr key={candidate.vessel_id || candidate.mmsi} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 font-mono text-white/50">0{candidate.rank}</td>
                    <td className="p-3">
                      <div className="font-semibold text-white tracking-wide">{candidate.trajectory?.at(-1)?.vessel_name || candidate.vessel_name || 'Unknown Vessel'}</div>
                      <div className="font-mono text-[10px] text-[var(--color-muted)] mt-1 tracking-widest">{candidate.vessel_id || candidate.mmsi}</div>
                    </td>
                    <td className="p-3 font-mono text-white text-right font-bold">{Math.round(candidate.score)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div></div>
    
    <div className="absolute right-5 bottom-5 bg-black/65 backdrop-blur-md border border-white/[0.05] p-4 pointer-events-auto">
      <div className="space-y-3 font-mono text-[10px] uppercase tracking-widest text-white/70">
        <div className="flex items-center gap-2"><span className="w-3 h-3 border border-white block"></span> Detected spill</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500/20 block border border-red-500 border-dashed"></span> ML area radius</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 border border-cyan-400 block border-dashed"></span> Likely origin & region</div>
        <div className="flex items-center gap-2"><span className="w-4 h-1 bg-amber-400 block border-dashed"></span> Drift path</div>
        <div className="flex items-center gap-2"><span className="w-4 h-px bg-cyan-600 block"></span> AIS route</div>
      </div>
    </div>
  </div>
}






