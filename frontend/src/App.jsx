import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Welcome from './pages/Welcome.jsx'
import About from './pages/About.jsx'
import { MediaCoverage } from './components/MediaCoverage.jsx'
import { celebrateWithMusic, initAutoplay } from './services/audio.js'
import { startUsageHeartbeat, touchUsage } from './services/usageAnalytics.js'
import { recordPageView } from './services/siteAnalytics.js'
import { AdminPanel } from './components/AdminPanel.jsx'
import AdminDashboardButton from './components/AdminDashboardButton.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import { MuteButton } from './components/MuteButton.jsx'
import { Boundary, LoadingScreen } from './components/Boundary.jsx'
import { currentUser } from './services/auth.js'
import { loadProfile } from './services/walletStore.js'

const AvatarCreate = lazy(() => import('./pages/AvatarCreate.jsx'))
const World = lazy(() => import('./pages/World.jsx'))
const Guru = lazy(() => import('./pages/Guru.jsx'))
const Auth = lazy(() => import('./pages/Auth.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard.jsx'))
const ModuleSelect = lazy(() => import('./pages/ModuleSelect.jsx'))
const KnowledgeQuiz = lazy(() => import('./pages/KnowledgeQuiz.jsx'))

function PreQuizGate({ children }) {
  const user = currentUser()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin' && user.role !== 'teacher' && !loadProfile()?.assessment?.pre) return <Navigate to="/assessment/pre" replace />
  return children
}

function TeacherGate({ children }) {
  const user = currentUser()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'teacher') return <Navigate to="/modules" replace />
  return children
}

function AccountMusicControl() {
  const { pathname } = useLocation()
  const show = pathname === '/login' || pathname.startsWith('/assessment/')
  if (!show) return null
  return <MuteButton showLabel className="fixed right-4 top-4 z-[700] border border-white/15 backdrop-blur-sm" />
}

function UsageTracker() {
  const { pathname } = useLocation()
  useEffect(() => startUsageHeartbeat(pathname), [])
  useEffect(() => { touchUsage({ path: pathname }).catch(() => {}) }, [pathname])
  useEffect(() => {
    const onAuth = () => touchUsage({ path: window.location.pathname }).catch(() => {})
    window.addEventListener('tayu-auth-changed', onAuth)
    return () => window.removeEventListener('tayu-auth-changed', onAuth)
  }, [])
  return null
}

function SiteViewTracker() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    recordPageView(`${pathname}${search}`).catch(() => {})
  }, [pathname, search])
  return null
}

function CertificateMusicTrigger() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname === '/guru') celebrateWithMusic()
  }, [pathname])
  return null
}

export default function App() {
  useEffect(() => {
    if (!/^\/(world|party|guru)/.test(window.location.pathname)) initAutoplay()
  }, [])
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
              <Route path="/teacher" element={<TeacherGate><Suspense fallback={<LoadingScreen />}><TeacherDashboard /></Suspense></TeacherGate>} />
              <Route path="/dashboard" element={<AdminRoute><Suspense fallback={<LoadingScreen />}><Dashboard /></Suspense></AdminRoute>} />
              <Route path="/assessment/:phase" element={<Suspense fallback={<LoadingScreen />}><KnowledgeQuiz /></Suspense>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Boundary>
      </div>
      <UsageTracker />
      <SiteViewTracker />
      <CertificateMusicTrigger />
      <AccountMusicControl />
      <AdminDashboardButton />
      <AdminPanel showButton />
    </div>
  )
}
