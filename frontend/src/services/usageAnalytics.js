import { doc, setDoc } from 'firebase/firestore'
import { getFirebaseServices } from './firebase.js'
import { loadProfile, loadWallet } from './walletStore.js'

const AUTH_SESSION_KEY = 'tayu-session-v1'
const USAGE_SESSION_KEY = 'tayu-usage-session-v1'
const GUEST_ID_KEY = 'tayu-anonymous-guest-id-v1'
const HEARTBEAT_CAP_SECONDS = 45
const LEARNING_EVENT_LIMIT = 120

function authUser() {
  try { return JSON.parse(sessionStorage.getItem(AUTH_SESSION_KEY) || 'null') } catch { return null }
}

function readUsage() {
  try { return JSON.parse(sessionStorage.getItem(USAGE_SESSION_KEY) || 'null') } catch { return null }
}

function writeUsage(value) {
  if (value) sessionStorage.setItem(USAGE_SESSION_KEY, JSON.stringify(value))
  else sessionStorage.removeItem(USAGE_SESSION_KEY)
}

function guestId() {
  try {
    const existing = localStorage.getItem(GUEST_ID_KEY)
    if (existing) return existing
    const created = `guest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(GUEST_ID_KEY, created)
    return created
  } catch {
    return `guest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
  }
}

function analyticsUser() {
  const user = authUser()
  if (!user || user.accountType === 'dashboard_viewer') return null
  if (user.guest) return { ...user, id: guestId(), email: '', role: 'guest', guest: true }
  return user.id ? user : null
}

function guestProgressSnapshot() {
  const profile = loadProfile() || {}
  const wallet = loadWallet() || {}
  return {
    playerName: String(profile.name || '').slice(0, 40),
    avatar: profile.avatar || '',
    assessment: profile.assessment || null,
    completedModules: profile.completedModules || wallet.completedModules || [],
    currentWeek: Number(wallet.week || 1),
    objective: wallet.objective || '',
    gameComplete: Boolean(wallet.gameComplete),
    activeLearningPath: profile.activeLearningPath || null,
    updatedAt: new Date().toISOString(),
  }
}

function newSession(user, path = '') {
  const now = new Date().toISOString()
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    uid: user.id,
    email: String(user.email || '').toLowerCase(),
    role: user.role || (user.guest ? 'guest' : 'student'),
    guest: Boolean(user.guest),
    startedAt: now,
    lastSeenAt: now,
    lastTickAt: now,
    endedAt: '',
    durationSeconds: 0,
    path,
    currentModule: '',
    lastModule: '',
    moduleSeconds: {},
    eventCounts: {},
    learningEvents: [],
    device: /iPad|Tablet/i.test(navigator.userAgent || '') ? 'Tablet' : /Mobi|Android|iPhone/i.test(navigator.userAgent || '') ? 'Mobile' : 'Desktop',
  }
}

function advance(existing, path, moduleName) {
  const now = new Date()
  const previous = new Date(existing.lastTickAt || existing.lastSeenAt || existing.startedAt)
  const elapsed = Math.max(0, Math.min(HEARTBEAT_CAP_SECONDS, Math.round((now - previous) / 1000)))
  const activeModule = existing.currentModule || ''
  const moduleSeconds = { ...(existing.moduleSeconds || {}) }
  if (activeModule && elapsed > 0) moduleSeconds[activeModule] = Number(moduleSeconds[activeModule] || 0) + elapsed
  const nextModule = moduleName === undefined ? activeModule : moduleName
  return {
    ...existing,
    lastSeenAt: now.toISOString(),
    lastTickAt: now.toISOString(),
    durationSeconds: Math.max(0, Math.round((now - new Date(existing.startedAt)) / 1000)),
    path: path ?? existing.path ?? '',
    currentModule: nextModule,
    lastModule: nextModule || activeModule || existing.lastModule || '',
    moduleSeconds,
    eventCounts: existing.eventCounts || {},
    learningEvents: existing.learningEvents || [],
  }
}

export function learningEventKey(moduleName, type) {
  return `${String(moduleName || 'unknown')}:${String(type || 'event')}`
}

export function appendLearningEvent(session, event, occurredAt = new Date().toISOString()) {
  const moduleName = String(event?.moduleName || session?.currentModule || session?.lastModule || 'unknown')
  const type = String(event?.type || 'event')
  const key = learningEventKey(moduleName, type)
  const eventCounts = {
    ...(session?.eventCounts || {}),
    [key]: Number(session?.eventCounts?.[key] || 0) + 1,
  }
  const learningEvents = [
    ...(session?.learningEvents || []),
    {
      moduleName,
      type,
      outcome: String(event?.outcome || '').slice(0, 40),
      detail: String(event?.detail || '').slice(0, 160),
      occurredAt,
    },
  ].slice(-LEARNING_EVENT_LIMIT)
  return { ...session, eventCounts, learningEvents, lastModule: moduleName === 'unknown' ? session?.lastModule || '' : moduleName }
}

async function persist(session) {
  const firebase = getFirebaseServices()
  if (!firebase?.firestore || !session?.uid) return false
  const payload = {
    uid: session.uid,
    email: session.email,
    role: session.role || '',
    guest: Boolean(session.guest),
    sessionId: session.id,
    startedAt: session.startedAt,
    lastSeenAt: session.lastSeenAt,
    endedAt: session.endedAt || '',
    durationSeconds: Number(session.durationSeconds || 0),
    path: session.path || '',
    currentModule: session.currentModule || '',
    lastModule: session.lastModule || '',
    moduleSeconds: session.moduleSeconds || {},
    eventCounts: session.eventCounts || {},
    learningEvents: session.learningEvents || [],
    device: session.device || 'Unknown',
  }
  if (session.guest) payload.guestProgress = guestProgressSnapshot()
  await setDoc(doc(firebase.firestore, 'usageSessions', `${session.uid}_${session.id}`), payload, { merge: true })
  return true
}

export async function touchUsage({ path, moduleName } = {}) {
  const user = analyticsUser()
  if (!user) return null
  let session = readUsage()
  if (!session || session.uid !== user.id || session.endedAt) session = newSession(user, path || window.location.pathname)
  session = advance(session, path, moduleName)
  writeUsage(session)
  await persist(session).catch(() => {})
  return session
}

export async function setUsageModule(moduleName) {
  return touchUsage({ path: window.location.pathname, moduleName })
}

export async function recordLearningEvent({ moduleName, type, outcome = '', detail = '' } = {}) {
  const user = analyticsUser()
  if (!user || !type) return null
  let session = readUsage()
  if (!session || session.uid !== user.id || session.endedAt) session = newSession(user, window.location.pathname)
  session = advance(session, window.location.pathname, moduleName === undefined ? session.currentModule : moduleName)
  session = appendLearningEvent(session, { moduleName, type, outcome, detail })
  writeUsage(session)
  await persist(session).catch(() => {})
  return session
}

export async function closeUsageSession() {
  const session = readUsage()
  if (!session || session.endedAt) return
  const closed = advance(session, window.location.pathname, '')
  closed.endedAt = closed.lastSeenAt
  writeUsage(closed)
  await persist(closed).catch(() => {})
}

export function startUsageHeartbeat(pathname) {
  touchUsage({ path: pathname }).catch(() => {})
  const timer = window.setInterval(() => {
    if (document.visibilityState === 'visible') touchUsage({ path: window.location.pathname }).catch(() => {})
  }, 15000)
  const onVisibility = () => {
    if (document.visibilityState === 'visible') touchUsage({ path: window.location.pathname }).catch(() => {})
  }
  const onPageHide = () => closeUsageSession().catch(() => {})
  const onAuthChange = () => {
    if (authUser()) touchUsage({ path: window.location.pathname }).catch(() => {})
    else closeUsageSession().catch(() => {})
  }
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('pagehide', onPageHide)
  window.addEventListener('tayu-auth-changed', onAuthChange)
  return () => {
    window.clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pagehide', onPageHide)
    window.removeEventListener('tayu-auth-changed', onAuthChange)
  }
}
