import { useEffect, useState, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Welcome from './pages/Welcome.jsx'
import About from './pages/About.jsx'
import Guru from './pages/Guru.jsx'
import TeacherDashboard from './pages/TeacherDashboard.jsx'
import { MediaCoverage } from './components/MediaCoverage.jsx'
import { celebrateWithMusic, initAutoplay } from './services/audio.js'
import { startUsageHeartbeat, touchUsage } from './services/usageAnalytics.js'
import { recordPageView } from './services/siteAnalytics.js'
import AdminRoute from './components/AdminRoute.jsx'
import DialogAccessibility from './components/DialogAccessibility.jsx'
import PathCompletionWatcher from './components/PathCompletionWatcher.jsx'
import SiteTrafficSummary from './components/SiteTrafficSummary.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import { MuteButton } from './components/MuteButton.jsx'
import WorldUtilityDock from './components/WorldUtilityDock.jsx'
import { Boundary, LoadingScreen } from './components/Boundary.jsx'
import { PrivacyChoices } from './components/PrivacyChoices.jsx'
import { currentUser, isCloud } from './services/auth.js'
import { loadProfile, saveProfile } from './services/walletStore.js'
import { MODULE_CATALOG } from './constants/modules.js'
import { preparePhysicalModuleLaunch } from './world/physicalModuleLaunch.js'
import { useTaxLab } from './world/taxLabStore.js'
import { installViewportSync } from './utils/viewport.js'
import './styles/viewport.css'

const AvatarCreate = lazy(() => import('./pages/AvatarCreate.jsx'))
const World = lazy(() => import('./pages/World.jsx'))
const PathComplete = lazy(() => import('./pages/PathComplete.jsx'))
const Auth = lazy(() => import('./pages/Auth.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const TeacherGuide = lazy(() => import('./pages/TeacherGuide.jsx'))
const ModuleSelect = lazy(() => import('./pages/ModuleSelect.jsx'))
const KnowledgeQuiz = lazy(() => import('./pages/KnowledgeQuiz.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const Privacy = lazy(() => import('./pages/Privacy.jsx'))
const Cookies = lazy(() => import('./pages/Cookies.jsx'))
const Accessibility = lazy(() => import('./pages/Accessibility.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

export const FINALE_REQUIRED_BADGES = MODULE_CATALOG.map((module) => module.badge)

export function isFinaleUnlocked(profile = loadProfile() || {}) {
  const earned = new Set(profile?.badges || [])
  return FINALE_REQUIRED_BADGES.length > 0 && FINALE_REQUIRED_BADGES.every((badge) => earned.has(badge))
}

function useAuthGateReady() {
  const [ready, setReady] = useState(() => Boolean(currentUser()) || !isCloud())

  useEffect(() => {
    if (ready) return undefined
    const finish = () => setReady(true)
    window.addEventListener('tayu-auth-changed', finish, { once: true })
    const timer = window.setTimeout(finish, 1500)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('tayu-auth-changed', finish)
    }
  }, [ready])

  return ready
}

function PreQuizGate({ children }) {
  const authReady = useAuthGateReady()
  if (!authReady) return <LoadingScreen label="Restoring your account..." />
  const user = currentUser()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin' && user.role !== 'teacher' && !loadProfile()?.assessment?.pre) return <Navigate to="/assessment/pre" replace />
  return children
}

function FinaleGate({ children }) {
  const authReady = useAuthGateReady()
  if (!authReady) return <LoadingScreen label="Checking your TAYU journey..." />
  const user = currentUser()
  if (!user) return <Navigate to="/login" replace />

  // The Finale is never unlocked by an old gameComplete/enterParty flag or a
  // direct URL. Every core module badge, including Module 7 Tax Office, must
  // actually be saved on the learner profile first.
  if (!isFinaleUnlocked(loadProfile() || {})) return <Navigate to="/modules" replace />
  return children
}

function TeacherGate({ children }) {
  const authReady = useAuthGateReady()
  if (!authReady) return <LoadingScreen label="Restoring your teacher account..." />
  const user = currentUser()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'teacher') return <Navigate to="/modules" replace />
  return children
}

function LegacyPaycheckRedirect() {
  try { localStorage.setItem('tayu-jump-module', '5') } catch { /* ignore */ }
  return <Navigate to="/world" replace />
}

function DirectModule67World() {
  try {
    const raw = localStorage.getItem('tayu-module-entry-intent')
    const intent = raw ? JSON.parse(raw) : null
    const moduleId = String(intent?.moduleId || localStorage.getItem('tayu-jump-module') || '')
    if (moduleId === '6' || moduleId === '7') {
      localStorage.removeItem('tayu-module-entry-intent')
      if (moduleId === '7') {
        saveProfile({ taxLabProgress: null, taxLab: null })
        useTaxLab.getState().reset()
      }
      // Set the physical-launch marker AND run the placement/reassert timers.
      // Previously this route only set bond-only/tax-origin and activated the
      // world, but never set tayu-physical-module-launch, so the World mount
      // effect had nothing to read and stranded the player back at spawn.
      preparePhysicalModuleLaunch(Number(moduleId))
    }
  } catch { /* storage can be unavailable */ }
  return <World />
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
  useEffect(() => { recordPageView(`${pathname}${search}`).catch(() => {}) }, [pathname, search])
  return null
}

function CertificateMusicTrigger() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname === '/guru' || pathname === '/path-complete') celebrateWithMusic()
  }, [pathname])
  return null
}

const TITLE_MAP = {
  '/': 'TAYU | Learn Money by Playing',
  '/about': 'About TAYU',
  '/privacy': 'Privacy | TAYU',
  '/cookies': 'Cookies & Storage | TAYU',
  '/accessibility': 'Accessibility | TAYU',
  '/login': 'Log In or Sign Up | TAYU',
  '/modules': 'Learning Modules | TAYU',
  '/avatar': 'Create Your Avatar | TAYU',
  '/world': 'TAYU Learning World',
  '/guru': 'TAYU Celebration',
  '/path-complete': 'Learning Path Complete | TAYU',
  '/settings': 'Settings | TAYU',
  '/teacher': 'Teacher Dashboard | TAYU',
  '/teacher-guide': 'Teacher Guide | TAYU',
  '/dashboard': 'Admin Dashboard | TAYU',
}

function PageMetadata() {
  const { pathname } = useLocation()
  useEffect(() => {
    let title = TITLE_MAP[pathname]
    if (!title && pathname.startsWith('/assessment/')) title = 'Knowledge Check | TAYU'
    document.title = title || 'Page Not Found | TAYU'
  }, [pathname])
  return null
}

export default function App() {
  useEffect(() => {
    if (!/^\/(world|party|guru|path-complete)/.test(window.location.pathname)) initAutoplay()
  }, [])
  useEffect(() => installViewportSync(), [])

  return (
    <div className="tayu-app-viewport bg-navy text-white font-body">
      <PageMetadata />
      <DialogAccessibility />
      <div id="app-content" tabIndex="-1">
        <Boundary name="routes" hard>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<><div className="relative z-20 bg-[#eef8ff] px-4 py-2"><MediaCoverage compact /></div><Welcome /></>} />
              <Route path="/about" element={<><div className="relative z-20 bg-[#eef8ff] px-4 py-2"><MediaCoverage compact about /></div><About /></>} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/accessibility" element={<Accessibility />} />
              <Route path="/avatar" element={<PreQuizGate><Suspense fallback={<LoadingScreen label="Getting the dress-up room ready..." />}><AvatarCreate /></Suspense></PreQuizGate>} />
              <Route path="/world" element={<PreQuizGate><Suspense fallback={<LoadingScreen />}><DirectModule67World /></Suspense></PreQuizGate>} />
              <Route path="/tax-paycheck" element={<PreQuizGate><LegacyPaycheckRedirect /></PreQuizGate>} />
              <Route path="/party" element={<Navigate to="/guru" replace />} />
              <Route path="/guru" element={<FinaleGate><Guru /></FinaleGate>} />
              <Route path="/path-complete" element={<PreQuizGate><Suspense fallback={<LoadingScreen label="Preparing your path certificate..." />}><PathComplete /></Suspense></PreQuizGate>} />
              <Route path="/login" element={<Suspense fallback={<LoadingScreen />}><Auth /></Suspense>} />
              <Route path="/modules" element={<PreQuizGate><Suspense fallback={<LoadingScreen />}><ModuleSelect /></Suspense></PreQuizGate>} />
              <Route path="/settings" element={<PreQuizGate><Suspense fallback={<LoadingScreen label="Opening player settings..." />}><Settings /></Suspense></PreQuizGate>} />
              <Route path="/teacher" element={<TeacherGate><TeacherDashboard /></TeacherGate>} />
              <Route path="/teacher-guide" element={<TeacherGate><Suspense fallback={<LoadingScreen label="Opening the teacher guide..." />}><TeacherGuide /></Suspense></TeacherGate>} />
              <Route path="/dashboard" element={<AdminRoute><Suspense fallback={<LoadingScreen />}><><SiteTrafficSummary /><Dashboard /></></Suspense></AdminRoute>} />
              <Route path="/assessment/:phase" element={<Suspense fallback={<LoadingScreen />}><KnowledgeQuiz /></Suspense>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Boundary>
      </div>
      <WorldUtilityDock />
      <UsageTracker />
      <SiteViewTracker />
      <CertificateMusicTrigger />
      <PathCompletionWatcher />
      <AccountMusicControl />
      <PrivacyChoices />
      <SiteFooter />
    </div>
  )
}
