import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Digest from './pages/Digest'
import Investigations from './pages/Investigations'
import InvestigationDetail from './pages/InvestigationDetail'
import VesselDetail from './pages/VesselDetail'
import Reports from './pages/Reports'
import Telemetry from './pages/Telemetry'
import Settings from './pages/Settings'
import AppShell from './components/AppShell'
import Preloader from './components/Preloader'


function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <>
      <Preloader />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />

        {/* Authenticated app shell */}
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/digest" element={<PageWrapper><Digest /></PageWrapper>} />
          <Route path="/investigations" element={<PageWrapper><Investigations /></PageWrapper>} />
          <Route path="/investigations/:id" element={<PageWrapper><InvestigationDetail /></PageWrapper>} />
          <Route path="/vessels/:id" element={<PageWrapper><VesselDetail /></PageWrapper>} />
          <Route path="/reports" element={<PageWrapper><Reports /></PageWrapper>} />
          <Route path="/telemetry" element={<PageWrapper><Telemetry /></PageWrapper>} />
          <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
        </Route>
      </Routes>
    </AnimatePresence>
    </>
  )
}
