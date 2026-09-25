import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Logo from './Logo'

const menuItems = [
  { label: 'Dashboard', link: '/dashboard' },
  { label: 'Digest', link: '/digest' },
  { label: 'Reports', link: '/reports' },
  { label: 'Telemetry', link: '/telemetry' },
  { label: 'Settings', link: '/settings' }
];

export default function AppShell() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    setScrolled(e.currentTarget.scrollTop > 20);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-transparent">
      {/* Top Navigation Header */}
      <header className={`absolute top-0 left-0 w-full z-50 flex items-center justify-between px-8 transition-all duration-500 ease-out ${
        scrolled
          ? 'h-14 bg-black/70 backdrop-blur-3xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'h-16 bg-transparent border-b border-transparent'
      }`}>
        <Logo />
        <nav className="flex items-center gap-8">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.link);
            return (
              <Link 
                key={item.link} 
                to={item.link} 
                className={`text-xs uppercase tracking-widest font-mono transition-colors ${
                  isActive ? 'text-white font-bold' : 'text-[var(--color-muted)] hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Main content area */}
      <main className="flex-1 overflow-auto relative pt-16" onScroll={handleScroll}>
        <Outlet />
      </main>
    </div>
  )
}

