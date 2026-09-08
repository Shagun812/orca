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

  return <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-7">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-mono tracking-[.18em] uppercase text-[var(--color-electric-cyan)]">Case register</p><h1 className="text-headline-lg text-[var(--color-text-white)] mt-2">Investigations</h1><p className="text-body-md text-[var(--color-muted-light)] mt-2">Open a case to review detection, drift, AIS evidence and vessel attribution.</p></div><Link to="/dashboard" className="btn-primary justify-center">New analysis</Link></div>
    <div className="glass-level-1 p-3 rounded-xl border border-white/[0.08] flex flex-col sm:flex-row gap-3"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search case name or ID" className="input-field flex-1 glass-level-2 rounded-lg border border-white/[0.08]" /><div className="case-filter" role="group" aria-label="Filter cases by status">{['all', 'open', 'critical', 'closed'].map((value) => <button key={value} onClick={() => setStatus(value)} className={status === value ? 'active' : ''}>{value}</button>)}</div></div>
    {isLoading && <div className="text-center py-20 text-[var(--color-muted)]">Loading case register…</div>}
    {isError && <div className="glass-level-1 rounded-xl border border-red-400/20 p-6 text-red-200">{error instanceof Error ? error.message : 'Could not load investigations.'}</div>}
    {!isLoading && !isError && filtered.length === 0 && <div className="glass-level-1 p-14 text-center rounded-xl border border-white/[0.08]"><h2 className="text-headline-sm text-[var(--color-text-white)]">No matching investigations</h2><p className="text-body-md text-[var(--color-muted)] mt-2">Run a satellite analysis from the dashboard to create the first case.</p></div>}
    {!isLoading && !isError && filtered.length > 0 && <div className="overflow-x-auto glass-level-1 rounded-xl border border-white/[0.08]"><table className="w-full min-w-[720px] text-left"><thead className="border-b border-white/[0.08] text-[10px] uppercase tracking-[.15em] text-[var(--color-muted)]"><tr><th className="p-4 font-medium">Case</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Detection</th><th className="p-4 font-medium">Created</th><th className="p-4" /></tr></thead><tbody>{filtered.map((item) => <tr key={item.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.025]"><td className="p-4"><p className="text-[var(--color-text-white)] font-medium">{item.title || 'Untitled investigation'}</p><p className="text-[11px] font-mono text-[var(--color-muted)] mt-1">{item.id}</p></td><td className="p-4"><span className="pill">{item.status}</span></td><td className="p-4 text-sm text-[var(--color-muted-light)]">{item.spill_info ? `${Math.round(item.spill_info.confidence * 100)}% confidence · ${Number(item.spill_info.area_km2).toFixed(2)} km²` : 'Awaiting detection'}</td><td className="p-4 text-sm text-[var(--color-muted-light)]">{new Date(item.created_at).toLocaleString()}</td><td className="p-4"><Link to={`/investigations/${item.id}`} className="btn-ghost whitespace-nowrap">Open case</Link></td></tr>)}</tbody></table></div>}
  </div>
}
