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
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return { border: 'border-amber-500/50 hover:border-amber-500/80', pill: 'text-amber-500 border-amber-500/30 bg-amber-500/10' };
      case 'critical': return { border: 'border-red-500/50 hover:border-red-500/80', pill: 'text-red-500 border-red-500/30 bg-red-500/10' };
      case 'closed': return { border: 'border-white/20 hover:border-white/40', pill: 'text-white/50 border-white/10 bg-white/5' };
      default: return { border: 'border-white/[0.05] hover:border-white/40', pill: 'text-white/50 border-white/10' };
    }
  }
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const { data = [], isLoading, isError, error } = useQuery({ queryKey: ['investigations', 'all'], queryFn: fetchInvestigations })
  
  const filtered = useMemo(() => data.filter((item) => {
    const matchesText = `${item.id} ${item.title} ${item.description ?? ''} ${item.status}`.toLowerCase().includes(query.toLowerCase())
    return matchesText && (status === 'all' || item.status.toLowerCase() === status)
  }), [data, query, status])

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 relative z-10">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4 animate-slide-up">
        <div className="space-y-2 relative">
          <h1 className="relative text-5xl font-bold tracking-tight text-white z-10">
            Investigations
          </h1>
          <p className="relative text-lg text-[var(--color-muted)] font-light z-10">
            Open a case to review detection, drift, AIS evidence and vessel attribution.
          </p>
        </div>
        <Link to="/dashboard" className="btn-primary rounded-none shadow-none text-xs">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          NEW ANALYSIS
        </Link>
      </div>

      <div className="border-t border-white/[0.05] pt-6 flex flex-col md:flex-row gap-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative flex-1 w-full group">
          <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] group-focus-within:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            value={query} 
            onChange={(event) => setQuery(event.target.value)} 
            placeholder="Search case name or ID..." 
            className="w-full bg-transparent border-b border-white/[0.1] rounded-none pl-8 pr-4 py-3 text-white placeholder-[var(--color-muted)] focus:outline-none focus:border-white transition-colors font-light" 
          />
        </div>
        <div className="flex gap-6 overflow-x-auto items-center">
          {['all', 'open', 'critical', 'closed'].map((value) => (
            <button 
              key={value} 
              onClick={() => setStatus(value)} 
              className={`text-xs font-mono uppercase tracking-widest pb-1 border-b transition-colors whitespace-nowrap ${
                status === value 
                  ? 'text-white border-white' 
                  : 'text-[var(--color-muted)] border-transparent hover:text-white'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-0">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-transparent border-t border-white/[0.05] animate-pulse"></div>
          ))}
        </div>
      )}
      
      {isError && (
        <div className="border-t border-red-500/20 py-8">
          <p className="text-red-400 font-mono text-sm tracking-wider uppercase">{error instanceof Error ? error.message : 'Could not load investigations.'}</p>
        </div>
      )}
      
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="relative py-16 text-center border-t border-white/[0.05]">
          <h2 className="text-xl font-light text-white mb-3">No matching investigations</h2>
          <p className="text-[var(--color-muted)] mb-8 text-sm">
            Try adjusting your search or filters. If you haven't started yet, run a satellite analysis from the dashboard.
          </p>
          <button 
            onClick={() => {setQuery(''); setStatus('all');}} 
            className="btn-ghost rounded-none border border-white/20 text-xs px-6 py-3 shadow-none uppercase tracking-widest"
          >
            Clear Filters
          </button>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((inv) => {
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
  )
}
