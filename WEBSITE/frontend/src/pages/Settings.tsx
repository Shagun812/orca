export default function Settings() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-headline-lg text-[var(--color-text-white)] mb-2">Settings</h1>
        <p className="text-body-lg text-[var(--color-muted-light)]">System configuration and user preferences.</p>
      </div>

      <div className="glass-level-1 rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-headline-sm text-[var(--color-text-white)]">Account</h3>
          <p className="text-body-sm text-[var(--color-muted)] mt-1">Manage your analyst profile.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-label-md text-[var(--color-muted-light)] mb-2 block">EMAIL</label>
            <input type="email" value="analyst@oilwatch.ai" disabled className="input-field glass-level-2 rounded-lg opacity-50 cursor-not-allowed" />
          </div>
          <button className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-400/10 border-red-400/20">
            Sign Out
          </button>
        </div>
      </div>
      
      <div className="glass-level-1 rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-headline-sm text-[var(--color-text-white)]">Map Preferences</h3>
          <p className="text-body-sm text-[var(--color-muted)] mt-1">Configure default geospatial visualization options.</p>
        </div>
        <div className="p-6">
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-transparent text-[var(--color-signal-amber)] focus:ring-[var(--color-signal-amber)] focus:ring-offset-0" defaultChecked />
            <span className="text-body-md text-[var(--color-text-white)]">Show raw AIS data points by default</span>
          </label>
        </div>
      </div>
    </div>
  )
}
