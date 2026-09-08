import { Outlet } from 'react-router-dom'
import StaggeredMenu from './StaggeredMenu'

const menuItems = [
  { label: 'Dashboard', ariaLabel: 'Go to dashboard', link: '/dashboard' },
  { label: 'Investigations', ariaLabel: 'View investigations', link: '/investigations' },
  { label: 'Reports', ariaLabel: 'View reports', link: '/reports' },
  { label: 'Settings', ariaLabel: 'Open settings', link: '/settings' }
];

export default function AppShell() {
  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--color-void)]">
      {/* Top Navigation Header */}
      <div className="absolute top-0 left-0 w-full z-50 pointer-events-none h-24">
        <StaggeredMenu
          position="right"
          items={menuItems}
          displaySocials={false}
          displayItemNumbering={false}
          menuButtonColor="#ffffff"
          openMenuButtonColor="#fff"
          changeMenuColorOnOpen={true}
          colors={['#201f22', '#131315']}
          accentColor="#f59e0b"
          isFixed={true}
        />
      </div>

      {/* Main content area */}
      <main className="flex-1 overflow-auto relative pt-24">
        <Outlet />
      </main>
    </div>
  )
}
