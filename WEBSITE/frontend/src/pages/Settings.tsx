export default function Settings() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12 relative z-10">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-[var(--color-signal-amber)]/[0.03] blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--color-electric-cyan)]/[0.02] blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4 animate-slide-up">
        <div className="space-y-2 relative">
          <h1 className="relative text-5xl font-bold tracking-tight text-white z-10">
            Settings
          </h1>
          <p className="relative text-lg text-[var(--color-muted)] font-light z-10">
            System configuration and user preferences.
          </p>
        </div>
      </div>

      <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="rounded-3xl glass-level-2 border border-white/[0.04] overflow-hidden">
          <div className="p-8 border-b border-white/[0.04]">
            <h3 className="text-2xl font-medium text-white">Account</h3>
            <p className="text-[var(--color-muted)] mt-2 font-light">Manage your analyst profile.</p>
          </div>
          <div className="p-8 space-y-6">
            <div>
              <label className="text-sm font-medium text-[var(--color-muted-light)] mb-3 block tracking-wide uppercase">Email Address</label>
              <input type="email" value="analyst@orca.ai" disabled className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-3.5 text-white opacity-50 cursor-not-allowed focus:outline-none" />
            </div>
            <button className="px-6 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all font-medium text-sm">
              Sign Out
            </button>
          </div>
        </div>
        
        <div className="rounded-3xl glass-level-2 border border-white/[0.04] overflow-hidden">
          <div className="p-8 border-b border-white/[0.04]">
            <h3 className="text-2xl font-medium text-white">Map Preferences</h3>
            <p className="text-[var(--color-muted)] mt-2 font-light">Configure default geospatial visualization options.</p>
          </div>
          <div className="p-8">
            <label className="flex items-center gap-4 group cursor-pointer">
              <div className="relative flex items-center justify-center w-6 h-6 rounded-md border border-white/20 group-hover:border-[var(--color-signal-amber)] transition-colors">
                <input type="checkbox" className="peer absolute opacity-0 w-full h-full cursor-pointer" defaultChecked />
                <svg className="w-4 h-4 text-[var(--color-signal-amber)] opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white group-hover:text-[var(--color-signal-amber)] transition-colors">Show raw AIS data points by default</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
