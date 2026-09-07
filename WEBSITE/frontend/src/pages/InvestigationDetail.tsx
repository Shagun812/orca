import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Map, { Source, Layer, NavigationControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useState, useEffect } from 'react'

export default function InvestigationDetail() {
  const { id } = useParams()
  const [jobId, setJobId] = useState<string | null>(null)

  // Fetch investigation details
  const { data: inv, isLoading } = useQuery({
    queryKey: ['investigations', id],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/v1/investigations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch investigation')
      return res.json()
    }
  })

  // Polling for job status if we have a job running
  const { data: jobStatus } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      if (!jobId) return null
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/v1/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return res.json()
    },
    enabled: !!jobId,
    refetchInterval: (data: any) => {
      if (data?.status === 'completed' || data?.status === 'failed') return false
      return 2000 // poll every 2s
    }
  })

  const startAttribution = async () => {
    // In a real flow, we'd pass the actual spill info and AIS positions
    // For now, hit the endpoint to start the drift/attribution pipeline
    const token = localStorage.getItem('token')
    const res = await fetch('/api/v1/spills/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        image_id: `img_${id}`,
        observed_at: new Date().toISOString(),
        bbox: [80.1, 15.2, 81.4, 16.3]
      })
    })
    if (res.ok) {
      const data = await res.json()
      setJobId(data.job_id)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-[var(--color-muted)]">Loading investigation...</div>
  }

  // Fallback map view state
  const initialViewState = {
    longitude: 80.61,
    latitude: 15.79,
    zoom: 9
  }

  return (
    <div className="relative w-full h-screen bg-[var(--color-void)] overflow-hidden">
      {/* ──── Full-Bleed Map ──── */}
      <Map
        initialViewState={initialViewState}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" />
        
        {/* Mocking spill polygon based on expected response */}
        {inv?.spill_info?.geometry && (
          <Source type="geojson" data={inv.spill_info.geometry}>
            <Layer
              id="spill-polygon"
              type="fill"
              paint={{
                'fill-color': 'var(--color-signal-amber)',
                'fill-opacity': 0.2,
                'fill-outline-color': 'var(--color-signal-amber)'
              }}
            />
          </Source>
        )}
      </Map>

      {/* ──── HUD Top Bar ──── */}
      <div className="absolute top-6 left-6 right-6 flex justify-between pointer-events-none">
        <div className="glass-level-2 px-6 py-4 rounded-xl border border-white/[0.06] flex items-center gap-6 pointer-events-auto">
          <div>
            <div className="text-label-sm text-[var(--color-muted)] mb-1">INVESTIGATION ID</div>
            <div className="text-headline-sm text-[var(--color-text-white)] font-mono">{id?.substring(0, 8)}</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <div className="text-label-sm text-[var(--color-muted)] mb-1">STATUS</div>
            <div className="text-body-sm text-[var(--color-signal-amber)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-signal-amber)] animate-pulse" />
              {jobStatus ? `JOB: ${jobStatus.status.toUpperCase()}` : inv?.status?.toUpperCase() || 'OPEN'}
            </div>
          </div>
        </div>

        <div className="pointer-events-auto">
          <Link to="/investigations" className="btn-ghost glass-level-2 border-white/10">
            Close Case
          </Link>
        </div>
      </div>

      {/* ──── Floating Dock (Candidate Ranking) ──── */}
      <div className="absolute top-32 bottom-6 left-6 w-[400px] flex flex-col gap-4 pointer-events-none">
        {/* Analysis Controls */}
        <div className="glass-level-2 p-5 rounded-xl border border-white/[0.06] pointer-events-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-sm text-[var(--color-text-white)]">Spill Attribution</h3>
            <span className="badge-anomaly">Action Required</span>
          </div>
          <p className="text-body-sm text-[var(--color-muted-light)]">
            Run drift hindcast and cross-reference AIS telemetry to rank candidate vessels.
          </p>
          <button 
            className="btn-primary w-full justify-center"
            onClick={startAttribution}
            disabled={!!jobId && jobStatus?.status !== 'completed' && jobStatus?.status !== 'failed'}
          >
            {jobId && jobStatus?.status === 'pending' ? 'Running Model...' : 'Run Correlation Analysis'}
          </button>

          {jobStatus && (
            <div className="text-label-sm text-[var(--color-muted)]">
              Job progress: {jobStatus.progress}%
              {jobStatus.error_message && <div className="text-[var(--color-error)] mt-1">{jobStatus.error_message}</div>}
            </div>
          )}
        </div>

        {/* Candidate List (Shown after job completion or if data exists) */}
        {jobStatus?.status === 'completed' && jobStatus.result_data && (
          <div className="glass-level-2 flex-1 rounded-xl border border-white/[0.06] flex flex-col pointer-events-auto overflow-hidden">
            <div className="p-4 border-b border-white/[0.06]">
              <h3 className="text-headline-sm text-[var(--color-text-white)]">Candidate Vessels</h3>
              <div className="text-body-sm text-[var(--color-muted)]">
                {jobStatus.result_data.candidates?.length || 0} matches found
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {jobStatus.result_data.candidates?.map((candidate: any, idx: number) => (
                <Link 
                  key={candidate.vessel_id}
                  to={`/vessels/${candidate.vessel_id}`}
                  className="block glass-level-1 p-4 rounded-lg border border-white/5 hover:border-[var(--color-signal-amber)]/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-label-sm text-[var(--color-muted)] mb-0.5">MMSI: {candidate.vessel_id}</div>
                      <div className="text-body-md text-[var(--color-text-white)] font-medium">
                        Rank {candidate.rank}
                      </div>
                    </div>
                    <div className="text-headline-md text-[var(--color-signal-amber)]">
                      {candidate.score.toFixed(0)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/[0.04]">
                    <div>
                      <div className="text-label-sm text-[var(--color-muted)]">SPATIAL</div>
                      <div className="text-body-sm text-white">{candidate.evidence.spatial_score.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-label-sm text-[var(--color-muted)]">TEMPORAL</div>
                      <div className="text-body-sm text-white">{candidate.evidence.temporal_score.toFixed(2)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
