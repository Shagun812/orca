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
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
        <div className="space-y-2 relative">
          <div className="absolute -inset-1 rounded-full blur-xl bg-[var(--sm-accent)]/10 z-0 hidden md:block"></div>
          <h1 className="relative text-5xl font-semibold tracking-tight text-white z-10">
            Overview
          </h1>
          <p className="relative text-lg text-[var(--color-muted)] font-medium z-10">
            System activity and recent investigations
          </p>
        </div>
        <button 
          className="btn-primary flex items-center gap-2 group relative overflow-hidden" 
          onClick={() => setShowUpload(true)}
        >
          <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Investigation
          </span>
        </button>
      </div>

      {/* Investigations Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-white/90">Recent Activity</h2>
          <Link to="/investigations" className="text-sm font-medium text-[var(--sm-accent)] hover:text-white transition-colors flex items-center gap-1">
            View All
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-pulse"></div>
            ))}
          </div>
        ) : !investigations || investigations.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.05] p-12 text-center group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[var(--sm-accent)]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--sm-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">No Active Cases</h3>
              <p className="text-[var(--color-muted)] mb-8">
                Upload a SAR satellite image to trigger the AI detection pipeline and start your first investigation.
              </p>
              <button 
                className="btn-primary w-full max-w-xs mx-auto justify-center" 
                onClick={() => setShowUpload(true)}
              >
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
                className="group relative flex flex-col justify-between h-56 p-6 rounded-3xl bg-[#141417]/80 backdrop-blur-xl border border-white/[0.04] hover:border-white/[0.12] transition-all duration-500 overflow-hidden"
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--sm-accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 text-xs font-medium bg-white/5 text-white/70 rounded-full font-mono">
                      #{inv.id.substring(0, 6)}
                    </span>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                      inv.status === 'open' 
                        ? 'bg-[var(--sm-accent)]/20 text-[var(--sm-accent)] ring-1 ring-[var(--sm-accent)]/30' 
                        : 'bg-white/5 text-white/50 ring-1 ring-white/10'
                    }`}>
                      {inv.status === 'open' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--sm-accent)] animate-pulse"></span>}
                      {inv.status || 'open'}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
                    <svg className="w-4 h-4 text-white/50 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>

                <div className="relative z-10 mt-auto">
                  <h3 className="text-xl font-medium text-white mb-2 group-hover:text-[var(--sm-accent)] transition-colors duration-300 line-clamp-1">
                    {inv.title || 'Untitled Operation'}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-[var(--color-muted)]">
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
