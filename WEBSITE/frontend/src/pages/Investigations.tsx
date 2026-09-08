import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'

type Investigation = { id: string; title: string; description?: string | null; status: string; created_at: string; spill_info?: { confidence: number; area_km2: number } | null }

async function fetchInvestigations(): Promise<Investigation[]> {
  const token = localStorage.getItem('token')
  const response = await fetch('/api/v1/investigations', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  if (!response.ok) throw new Error('Could not load investigations.')
  return response.json()
}

export default function Investigations() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const { data = [], isLoading, isError, error } = useQuery({ queryKey: ['investigations', 'all'], queryFn: fetchInvestigations })
  
  const filtered = useMemo(() => data.filter((item) => {
    const matchesText = `${item.id} ${item.title} ${item.description ?? ''} ${item.status}`.toLowerCase().includes(query.toLowerCase())
    return matchesText && (status === 'all' || item.status.toLowerCase() === status)
  }), [data, query, status])

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 relative z-10">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-[var(--color-signal-amber)]/[0.03] blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--color-electric-cyan)]/[0.02] blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4 animate-slide-up">
        <div className="space-y-2 relative">
          <h1 className="relative text-5xl font-bold tracking-tight text-white z-10">
            Investigations
          </h1>
          <p className="relative text-lg text-[var(--color-muted)] font-light z-10">
            Open a case to review detection, drift, AIS evidence and vessel attribution.
          </p>
        </div>
        <Link to="/dashboard" className="px-6 py-3 bg-[var(--color-signal-amber)] hover:bg-amber-400 text-black font-semibold rounded-xl flex items-center gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:-translate-y-0.5">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Analysis
        </Link>
      </div>

      <div className="rounded-3xl glass-level-2 border border-white/[0.04] p-4 flex flex-col md:flex-row gap-4 items-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative flex-1 w-full group">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)] group-focus-within:text-[var(--color-signal-amber)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            value={query} 
            onChange={(event) => setQuery(event.target.value)} 
            placeholder="Search case name or ID..." 
            className="w-full bg-black/40 border border-white/[0.05] rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[var(--color-signal-amber)]/50 focus:bg-black/60 transition-all" 
          />
        </div>
        <div className="flex bg-black/40 border border-white/[0.05] rounded-2xl p-1.5 w-full md:w-auto overflow-x-auto">
          {['all', 'open', 'critical', 'closed'].map((value) => (
            <button 
              key={value} 
              onClick={() => setStatus(value)} 
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold capitalize whitespace-nowrap transition-all ${
                status === value 
                  ? 'bg-[var(--color-signal-amber)]/10 text-[var(--color-signal-amber)] shadow-sm' 
                  : 'text-[var(--color-muted)] hover:text-white hover:bg-white/5'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-56 rounded-3xl bg-white/[0.02] border border-white/[0.05] animate-pulse"></div>
          ))}
        </div>
      )}
      
      {isError && (
        <div className="rounded-3xl bg-red-500/5 border border-red-500/20 p-8 text-center">
          <p className="text-red-400">{error instanceof Error ? error.message : 'Could not load investigations.'}</p>
        </div>
      )}
      
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="relative overflow-hidden rounded-3xl glass-level-2 border border-white/[0.04] p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-black/40 border border-white/[0.05] flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--color-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">No matching investigations</h2>
          <p className="text-[var(--color-muted)] mb-8 max-w-md mx-auto font-light">
            Try adjusting your search or filters. If you haven't started yet, run a satellite analysis from the dashboard.
          </p>
          <button onClick={() => {setQuery(''); setStatus('all');}} className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl transition-all">
            Clear Filters
          </button>
        </div>
      )}
      
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {filtered.map((item) => (
            <Link 
              key={item.id} 
              to={`/investigations/${item.id}`}
              className="group relative flex flex-col justify-between h-56 p-7 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/[0.04] hover:border-[var(--color-signal-amber)]/30 hover:shadow-[0_0_40px_rgba(245,158,11,0.05)] transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-signal-amber)]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 text-xs font-medium bg-white/5 text-white/70 rounded-md font-mono tracking-wider border border-white/[0.05]">
                    #{item.id.substring(0, 6)}
                  </span>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${
                    item.status === 'open' 
                      ? 'bg-[var(--color-signal-amber)]/10 text-[var(--color-signal-amber)] border border-[var(--color-signal-amber)]/20' 
                      : 'bg-white/5 text-white/50 border border-white/10'
                  }`}>
                    {item.status === 'open' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-signal-amber)] animate-pulse"></span>}
                    {item.status}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[var(--color-signal-amber)]/10 group-hover:border-[var(--color-signal-amber)]/30 transition-all duration-300 group-hover:scale-110">
                  <svg className="w-4 h-4 text-white/40 group-hover:text-[var(--color-signal-amber)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>

              <div className="relative z-10 mt-auto">
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-[var(--color-signal-amber)] transition-colors duration-300 line-clamp-1">
                  {item.title || 'Untitled Operation'}
                </h3>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="text-[var(--color-muted)]">
                    {item.spill_info ? (
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-medium">{Math.round(item.spill_info.confidence * 100)}% Match</span>
                        <span>·</span>
                        <span>{Number(item.spill_info.area_km2).toFixed(1)} km²</span>
                      </div>
                    ) : (
                      <span className="text-amber-500/70">Pending Detection</span>
                    )}
                  </div>
                  <div className="text-[var(--color-muted-light)] font-mono text-xs opacity-60">
                    {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
