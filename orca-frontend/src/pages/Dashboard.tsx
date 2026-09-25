import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import UploadModal from '../components/UploadModal'

export default function Dashboard() {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return { border: 'border-amber-500/50 hover:border-amber-500/80', pill: 'text-amber-500 border-amber-500/30 bg-amber-500/10' };
      case 'critical': return { border: 'border-red-500/50 hover:border-red-500/80', pill: 'text-red-500 border-red-500/30 bg-red-500/10' };
      case 'closed': return { border: 'border-white/20 hover:border-white/40', pill: 'text-white/50 border-white/10 bg-white/5' };
      default: return { border: 'border-white/[0.05] hover:border-white/40', pill: 'text-white/50 border-white/10' };
    }
  }
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
    <div className="p-8 max-w-7xl mx-auto space-y-16 relative z-10">
      
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
          className="btn-primary rounded-none shadow-none text-xs" 
          onClick={() => setShowUpload(true)}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          NEW INVESTIGATION
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {[
          { label: 'Active Cases', value: '12', trend: '+2 this week', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'white' },
          { label: 'Satellites Linked', value: '4', trend: 'Optimal Coverage', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'white' }
        ].map((kpi, i) => (
          <div key={i} className="border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 pt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] font-mono text-[var(--color-muted)]">{kpi.label}</span>
              <svg className="w-5 h-5 opacity-50" style={{ color: kpi.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={kpi.icon} />
              </svg>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-5xl font-light text-white font-mono">{kpi.value}</span>
              <span className="text-[10px] font-mono text-[var(--color-muted)] mb-2 uppercase">{kpi.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Investigations Grid */}
      <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
          <h2 className="text-sm uppercase tracking-widest text-white">Recent Activity</h2>
          <Link to="/investigations" className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted)] hover:text-white transition-colors flex items-center gap-1 group">
            View All
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-white/[0.02] border-t border-white/[0.05] animate-pulse"></div>
            ))}
          </div>
        ) : !investigations || investigations.length === 0 ? (
          <div className="relative py-16 text-center group border-t border-white/[0.05]">
            <div className="relative z-10 max-w-md mx-auto">
              <h3 className="text-xl font-light text-white mb-3">No Active Cases</h3>
              <p className="text-[var(--color-muted)] mb-8 text-sm">
                Initiate a new investigation to begin satellite processing.
              </p>
              <button 
                onClick={() => setShowUpload(true)} 
                className="btn-ghost rounded-none border border-white/20 text-xs px-6 py-3 shadow-none uppercase tracking-widest"
              >
                Upload Evidence
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {investigations.map((inv: any) => {
              const styles = getStatusStyles(inv.status)
              return (
              <Link 
                key={inv.id} 
                to={`/investigations/${inv.id}`}
                className={`group border bg-white/[0.03] backdrop-blur-xl p-6 pt-6 transition-all duration-300 flex flex-col justify-between min-h-[160px] ${styles.border}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold border ${styles.pill}`}>
                      {inv.status}
                    </span>
                    <span className="text-[10px] text-[var(--color-muted)] font-mono">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-gray-300 transition-colors mb-2">
                    {inv.title || 'Untitled Case'}
                  </h3>
                  {inv.description && (
                    <p className="text-sm text-[var(--color-muted)] line-clamp-2">
                      {inv.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between text-[10px] text-[var(--color-muted)] font-mono tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    CASE ID: {inv.id.split('-')[0]}
                  </span>
                  
                  {inv.spill_info && (
                    <span className="flex items-center gap-1.5 text-white/70">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {Math.round(inv.spill_info.confidence * 100)}% DETECTED
                    </span>
                  )}
                </div>
              </Link>
            )})}
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
