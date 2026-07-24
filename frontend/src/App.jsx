import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Welcome from './pages/Welcome.jsx'
import About from './pages/About.jsx'
import { initAutoplay } from './services/audio.js'
import { AdminPanel } from './components/AdminPanel.jsx'
import { Boundary, LoadingScreen } from './components/Boundary.jsx'

// R10 v8 7.2: the heavy trees (three/R3F for the creator + world, jsPDF for
// the certificate) are LAZY - the landing paints fast on classroom wifi and
// a child only downloads the page they enter.
const AvatarCreate = lazy(() => import('./pages/AvatarCreate.jsx'))
const World = lazy(() => import('./pages/World.jsx'))
const Guru = lazy(() => import('./pages/Guru.jsx'))
const Auth = lazy(() => import('./pages/Auth.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const ModuleSelect = lazy(() => import('./pages/ModuleSelect.jsx'))

// TAYU - Landing → (About) → Avatar creator → walkable 3D world.
export default function App() {
  // B1: lobby music from the very first moment we are allowed to play it.
  // World/party pages pick their own identity, so only arm it on lobby routes.
  useEffect(() => {
    if (!/^\/(world|party|guru)/.test(window.location.pathname)) initAutoplay()
  }, [])
  // v9 must-fix 2 (supersedes v8): the Admin button is ALWAYS present,
  // small and low-key, bottom-right on every screen - password gate intact.
  return (
    <div className="min-h-screen bg-navy text-white font-body">
      <Boundary name="routes" hard>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/about" element={<About />} />
            <Route path="/avatar" element={<Suspense fallback={<LoadingScreen label="Getting the dress-up room ready..." />}><AvatarCreate /></Suspense>} />
            <Route path="/world" element={<Suspense fallback={<LoadingScreen />}><World /></Suspense>} />
            <Route path="/party" element={<Navigate to="/guru" replace />} />
            <Route path="/guru" element={<Suspense fallback={<LoadingScreen label="Rolling out the red carpet..." />}><Guru /></Suspense>} />
            <Route path="/login" element={<Suspense fallback={<LoadingScreen />}><Auth /></Suspense>} />
            <Route path="/modules" element={<Suspense fallback={<LoadingScreen />}><ModuleSelect /></Suspense>} />
            <Route path="/dashboard" element={<Suspense fallback={<LoadingScreen />}><Dashboard /></Suspense>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Boundary>
      <AdminPanel showButton />
    </div>
  )
}
