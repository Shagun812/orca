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
      const res = await fetch('/api/v1/investigations?limit=6', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) return []
      return res.json()
    }
  })

  const handleUploadComplete = (jobId: string, investigationId: string) => {
    setShowUpload(false)
    navigate(`/investigations/${investigationId}?job=${jobId}`)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 relative z-10">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-[var(--color-signal-amber)]/[0.03] blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--color-electric-cyan)]/[0.02] blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4 animate-slide-up">
        <div className="space-y-3 relative">
          <h1 className="relative text-5xl font-bold tracking-tight text-white z-10">
            Intelligence Overview
          </h1>
          <p className="relative text-lg text-[var(--color-muted)] font-light z-10 max-w-2xl">
            Real-time monitoring and active maritime investigations
          </p>
        </div>
        <button 
          className="px-6 py-3 bg-[var(--color-signal-amber)] hover:bg-amber-400 text-black font-semibold rounded-xl flex items-center gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:-translate-y-0.5" 
          onClick={() => setShowUpload(true)}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Investigation
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {[
          { label: 'Active Cases', value: '12', trend: '+2 this week', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'var(--color-signal-amber)' },
          { label: 'Satellites Linked', value: '4', trend: 'Optimal Coverage', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'var(--color-electric-cyan)' }
        ].map((kpi, i) => (
          <div key={i} className="glass-level-2 rounded-2xl p-6 border border-white/[0.04] hover:border-white/10 transition-colors flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-muted)]">{kpi.label}</span>
              <svg className="w-5 h-5 opacity-80" style={{ color: kpi.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={kpi.icon} />
              </svg>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-bold text-white">{kpi.value}</span>
              <span className="text-xs font-mono text-[var(--color-muted)] mb-1">{kpi.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Investigations Grid */}
      <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-white">Recent Activity</h2>
          <Link to="/investigations" className="text-sm font-medium text-[var(--color-signal-amber)] hover:text-amber-400 transition-colors flex items-center gap-1 group">
            View All
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-56 rounded-3xl bg-white/[0.02] border border-white/[0.05] animate-pulse"></div>
            ))}
          </div>
        ) : !investigations || investigations.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl glass-level-2 border border-white/[0.04] p-16 text-center group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-signal-amber)]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-black/40 border border-white/[0.05] flex items-center justify-center">
                <svg className="w-10 h-10 text-[var(--color-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">No Active Cases</h3>
              <p className="text-[var(--color-muted)] mb-8 font-light">
                Upload a SAR satellite image to trigger the AI detection pipeline and start your first investigation.
              </p>
              <button 
                className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl flex items-center justify-center gap-2 mx-auto transition-all"
                onClick={() => setShowUpload(true)}
              >
                <svg className="w-5 h-5 text-[var(--color-signal-amber)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Imagery
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investigations?.map((inv: any) => (
              <Link 
                key={inv.id} 
                to={`/investigations/${inv.id}`}
                className="group relative flex flex-col justify-between h-56 p-7 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/[0.04] hover:border-[var(--color-signal-amber)]/30 hover:shadow-[0_0_40px_rgba(245,158,11,0.05)] transition-all duration-500 overflow-hidden"
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-signal-amber)]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 text-xs font-medium bg-white/5 text-white/70 rounded-md font-mono tracking-wider border border-white/[0.05]">
                      #{inv.id.substring(0, 6)}
                    </span>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${
                      inv.status === 'open' 
                        ? 'bg-[var(--color-signal-amber)]/10 text-[var(--color-signal-amber)] border border-[var(--color-signal-amber)]/20' 
                        : 'bg-white/5 text-white/50 border border-white/10'
                    }`}>
                      {inv.status === 'open' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-signal-amber)] animate-pulse"></span>}
                      {inv.status || 'open'}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[var(--color-signal-amber)]/10 group-hover:border-[var(--color-signal-amber)]/30 transition-all duration-300 group-hover:scale-110">
                    <svg className="w-4 h-4 text-white/40 group-hover:text-[var(--color-signal-amber)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>

                <div className="relative z-10 mt-auto">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[var(--color-signal-amber)] transition-colors duration-300 line-clamp-1">
                    {inv.title || 'Untitled Operation'}
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-mono text-[var(--color-muted)] uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(inv.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  )
}
