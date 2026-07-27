import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Welcome from './pages/Welcome.jsx'
import About from './pages/About.jsx'
import { MediaCoverage } from './components/MediaCoverage.jsx'
import { initAutoplay } from './services/audio.js'
import { AdminPanel } from './components/AdminPanel.jsx'
import AdminDashboardButton from './components/AdminDashboardButton.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import { Boundary, LoadingScreen } from './components/Boundary.jsx'
import { currentUser } from './services/auth.js'
import { loadProfile } from './services/walletStore.js'

// R10 v8 7.2: the heavy trees (three/R3F for the creator + world, jsPDF for
// the certificate) are LAZY - the landing paints fast on classroom wifi and
// a child only downloads the page they enter.
const AvatarCreate = lazy(() => import('./pages/AvatarCreate.jsx'))
const World = lazy(() => import('./pages/World.jsx'))
const Guru = lazy(() => import('./pages/Guru.jsx'))
const Auth = lazy(() => import('./pages/Auth.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const ModuleSelect = lazy(() => import('./pages/ModuleSelect.jsx'))
const KnowledgeQuiz = lazy(() => import('./pages/KnowledgeQuiz.jsx'))

function PreQuizGate({ children }) {
  const user = currentUser()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin' && !loadProfile()?.assessment?.pre) return <Navigate to="/assessment/pre" replace />
  return children
}

// TAYU - Landing → (About) → Avatar creator → walkable 3D world.
export default function App() {
  // B1: lobby music from the very first moment we are allowed to play it.
  // World/party pages pick their own identity, so only arm it on lobby routes.
  useEffect(() => {
    if (!/^\/(world|party|guru)/.test(window.location.pathname)) initAutoplay()
  }, [])
  // The game-control Admin button remains available, while signed-in TAYU
  // administrators also receive a separate direct link to player analytics.
  return (
    <div className="min-h-screen bg-navy text-white font-body">
      <a href="#app-content" className="skip-link">Skip to the game</a>
      <div id="app-content" tabIndex="-1">
        <Boundary name="routes" hard>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
            <Route path="/" element={<><div className="relative z-20 bg-[#eef8ff] px-4 py-2"><MediaCoverage compact /></div><Welcome /></>} />
            <Route path="/about" element={<><div className="relative z-20 bg-[#eef8ff] px-4 py-2"><MediaCoverage compact about /></div><About /></>} />
            <Route path="/avatar" element={<PreQuizGate><Suspense fallback={<LoadingScreen label="Getting the dress-up room ready..." />}><AvatarCreate /></Suspense></PreQuizGate>} />
            <Route path="/world" element={<PreQuizGate><Suspense fallback={<LoadingScreen />}><World /></Suspense></PreQuizGate>} />
            <Route path="/party" element={<Navigate to="/guru" replace />} />
            <Route path="/guru" element={<Suspense fallback={<LoadingScreen label="Rolling out the red carpet..." />}><Guru /></Suspense>} />
            <Route path="/login" element={<Suspense fallback={<LoadingScreen />}><Auth /></Suspense>} />
            <Route path="/modules" element={<PreQuizGate><Suspense fallback={<LoadingScreen />}><ModuleSelect /></Suspense></PreQuizGate>} />
            <Route path="/dashboard" element={<AdminRoute><Suspense fallback={<LoadingScreen />}><Dashboard /></Suspense></AdminRoute>} />
            <Route path="/assessment/:phase" element={<Suspense fallback={<LoadingScreen />}><KnowledgeQuiz /></Suspense>} />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Boundary>
      </div>
      <AdminDashboardButton />
      <AdminPanel showButton />
    </div>
  )
}
