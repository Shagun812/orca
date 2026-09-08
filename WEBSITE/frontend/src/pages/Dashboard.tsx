import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import UploadModal from '../components/UploadModal'

export default function Dashboard() {
  const navigate = useNavigate()
  const [showUpload, setShowUpload] = useState(false)

  const { data: investigations, isLoading } = useQuery({
    queryKey: ['investigations', 'recent'],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/v1/investigations?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) return []
      return res.json()
    }
  })

  const handleUploadComplete = (jobId: string, investigationId: string) => {
    setShowUpload(false)
    // Navigate to the newly created investigation view
    navigate(`/investigations/${investigationId}?job=${jobId}`)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-[var(--color-text-white)] mb-2">Dashboard</h1>
          <p className="text-body-lg text-[var(--color-muted-light)]">System overview and recent activity.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowUpload(true)}>
          Upload Satellite Image
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Investigations', value: investigations?.length ?? '—', trend: 'From database' },
          { label: 'Detection Pipeline', value: 'Ready', trend: 'MODEL service' },
          { label: 'Drift Modelling', value: 'Ready', trend: 'Hindcast / Forecast' },
          { label: 'Attribution Engine', value: 'Ready', trend: 'Vessel ranking' },
        ].map((stat, i) => (
          <div key={i} className="glass-level-1 p-5 rounded-xl border border-white border-opacity-[0.06]">
            <div className="text-label-md text-[var(--color-muted)] mb-2">{stat.label}</div>
            <div className="text-headline-lg text-[var(--color-text-white)] mb-1">
              {stat.value}
            </div>
            <div className="text-body-sm text-[var(--color-muted-light)]">{stat.trend}</div>
          </div>
        ))}
      </div>

      <div className="divider" />

      {/* How It Works — Pipeline Overview */}
      <div>
        <h2 className="text-headline-md text-[var(--color-text-white)] mb-4">Analysis Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '01', label: 'Upload', desc: 'Upload SAR satellite imagery' },
            { step: '02', label: 'Detect', desc: 'AI detects oil slick polygons' },
            { step: '03', label: 'Drift Model', desc: 'Hindcast origin zone & time window' },
            { step: '04', label: 'Attribute', desc: 'Rank candidate vessels by evidence' },
          ].map((item) => (
            <div key={item.step} className="glass-level-1 rounded-xl p-5 border border-white border-opacity-[0.04]">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-label-md text-[var(--color-signal-amber)]">STEP {item.step}</span>
              </div>
              <div className="text-headline-sm text-[var(--color-text-white)] mb-1">{item.label}</div>
              <div className="text-body-sm text-[var(--color-muted)]">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* Recent Investigations */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-headline-md text-[var(--color-text-white)]">Recent Investigations</h2>
          <Link to="/investigations" className="btn-ghost">View All</Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-[var(--color-muted)]">Loading investigations...</div>
        ) : !investigations || investigations.length === 0 ? (
          <div className="glass-level-1 p-12 text-center rounded-xl border border-white border-opacity-[0.06]">
            <div className="text-4xl mb-4 opacity-50"></div>
            <h3 className="text-headline-sm text-[var(--color-text-white)] mb-2">No investigations yet</h3>
            <p className="text-body-md text-[var(--color-muted)] mb-6">
              Upload a satellite image to start your first spill detection analysis.
            </p>
            <button className="btn-primary" onClick={() => setShowUpload(true)}>
              Upload Satellite Image
            </button>
          </div>
        ) : (
          <div className="glass-level-1 rounded-xl border border-white border-opacity-[0.06] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white border-opacity-[0.06] bg-white bg-opacity-[0.02]">
                  <th className="px-6 py-4 text-label-md text-[var(--color-muted)]">ID</th>
                  <th className="px-6 py-4 text-label-md text-[var(--color-muted)]">Title</th>
                  <th className="px-6 py-4 text-label-md text-[var(--color-muted)]">Status</th>
                  <th className="px-6 py-4 text-label-md text-[var(--color-muted)]">Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {investigations?.map((inv: any) => (
                  <tr key={inv.id} className="border-b border-white border-opacity-[0.04] hover:bg-white hover:bg-opacity-[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="pill">{inv.id.substring(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4 text-body-md text-[var(--color-text-white)]">
                      {inv.title || 'Untitled'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded border ${
                        inv.status === 'open'
                          ? 'border-[var(--color-signal-amber)] border-opacity-30 text-[var(--color-signal-amber)] bg-[var(--color-signal-amber)] bg-opacity-10'
                          : 'border-white border-opacity-10 text-white text-opacity-60 bg-white bg-opacity-5'
                      }`}>
                        {(inv.status || 'open').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body-md text-[var(--color-text-white)]">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/investigations/${inv.id}`} className="btn-ghost text-xs py-1.5 px-3">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  )
}
