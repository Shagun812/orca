import { Outlet, NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '◈' },
  { label: 'Investigations', path: '/investigations', icon: '◉' },
  { label: 'Reports', path: '/reports', icon: '▤' },
  { label: 'Settings', path: '/settings', icon: '⚙' },
]

export default function AppShell() {
  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--color-void)]">
      {/* Top Navigation Header */}
      <header className="h-16 min-h-[4rem] glass-level-2 border-b border-white/[0.06] flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-8">
          {/* Logo area */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-signal-amber)]/20 flex items-center justify-center">
              <span className="text-[var(--color-signal-amber)] text-sm font-bold">OW</span>
            </div>
            <div>
              <h1 className="text-[var(--color-text-white)] text-headline-sm font-semibold text-sm tracking-tight">
                OilWatch AI
              </h1>
              <p className="text-label-sm text-[var(--color-muted)] text-[10px] hidden sm:block">
                MARITIME INTELLIGENCE
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-body-md transition-all duration-150 ${
                    isActive
                      ? 'bg-white/[0.06] text-[var(--color-text-white)] border border-white/[0.08]'
                      : 'text-[var(--color-muted-light)] hover:text-[var(--color-text-white)] hover:bg-white/[0.02]'
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                <span className="font-medium text-[13px]">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right side controls / status */}
        <div className="flex items-center gap-4">
          <div className="pill hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="pill-label">SYS</span>
            <span>Online</span>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 overflow-auto relative">
        <Outlet />
      </main>
    </div>
  )
}
