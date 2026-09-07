import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

export default function Investigations() {
  const { data: investigations, isLoading } = useQuery({
    queryKey: ['investigations', 'all'],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/v1/investigations', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch investigations')
      return res.json()
    }
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-[var(--color-text-white)] mb-2">Investigations</h1>
          <p className="text-body-lg text-[var(--color-muted-light)]">Manage and review potential spill events.</p>
        </div>
        <button className="btn-primary">New Investigation</button>
      </div>

      <div className="glass-level-1 p-4 rounded-xl border border-white/[0.06] flex gap-4">
        <input 
          type="text" 
          placeholder="Search by ID, location, or status..." 
          className="input-field flex-1 glass-level-2 rounded-lg border border-white/[0.06]"
        />
        <select className="input-field w-48 glass-level-2 rounded-lg border border-white/[0.06] appearance-none">
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-[var(--color-muted)]">Loading investigations data...</div>
      ) : investigations?.length === 0 ? (
        <div className="glass-level-1 p-16 text-center rounded-xl border border-white/[0.06]">
          <div className="text-4xl mb-4 opacity-50"></div>
          <h3 className="text-headline-sm text-[var(--color-text-white)] mb-2">No investigations found</h3>
          <p className="text-body-md text-[var(--color-muted)] mb-6">There are currently no active or past investigations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {investigations?.map((inv: any) => (
            <div key={inv.id} className="glass-level-1 rounded-xl border border-white/[0.06] p-6 hover:border-white/[0.15] transition-colors flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="pill bg-white/5 border-white/10 text-white/70">
                  ID: {inv.id.substring(0, 8)}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border ${
                  inv.status === 'open' 
                    ? 'border-[var(--color-signal-amber)]/30 text-[var(--color-signal-amber)] bg-[var(--color-signal-amber)]/10'
                    : 'border-white/10 text-white/60 bg-white/5'
                }`}>
                  {inv.status}
                </span>
              </div>
              
              <div className="space-y-3 flex-1 mb-6">
                <div className="flex justify-between">
                  <span className="text-body-sm text-[var(--color-muted)]">Detected</span>
                  <span className="text-body-sm text-[var(--color-text-white)]">
                    {new Date(inv.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-sm text-[var(--color-muted)]">Confidence</span>
                  <span className="text-body-sm text-[var(--color-text-white)]">
                    {(inv.spill_info.confidence_score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-sm text-[var(--color-muted)]">Area</span>
                  <span className="text-body-sm text-[var(--color-text-white)]">
                    {inv.spill_info.area_sqkm.toFixed(2)} sq km
                  </span>
                </div>
              </div>

              <Link to={`/investigations/${inv.id}`} className="btn-ghost w-full justify-center border-white/10">
                Open Case File
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
