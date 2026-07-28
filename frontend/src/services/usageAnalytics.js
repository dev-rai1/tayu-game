import { doc, setDoc } from 'firebase/firestore'
import { getFirebaseServices } from './firebase.js'

const AUTH_SESSION_KEY = 'tayu-session-v1'
const USAGE_SESSION_KEY = 'tayu-usage-session-v1'
const HEARTBEAT_CAP_SECONDS = 45

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

function newSession(user, path = '') {
  const now = new Date().toISOString()
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    uid: user.id,
    email: String(user.email || '').toLowerCase(),
    startedAt: now,
    lastSeenAt: now,
    lastTickAt: now,
    endedAt: '',
    durationSeconds: 0,
    path,
    currentModule: '',
    moduleSeconds: {},
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
  return {
    ...existing,
    lastSeenAt: now.toISOString(),
    lastTickAt: now.toISOString(),
    durationSeconds: Math.max(0, Math.round((now - new Date(existing.startedAt)) / 1000)),
    path: path ?? existing.path ?? '',
    currentModule: moduleName === undefined ? activeModule : moduleName,
    moduleSeconds,
  }
}

async function persist(session) {
  const firebase = getFirebaseServices()
  if (!firebase?.firestore || !session?.uid) return false
  await setDoc(doc(firebase.firestore, 'usageSessions', `${session.uid}_${session.id}`), {
    uid: session.uid,
    email: session.email,
    sessionId: session.id,
    startedAt: session.startedAt,
    lastSeenAt: session.lastSeenAt,
    endedAt: session.endedAt || '',
    durationSeconds: Number(session.durationSeconds || 0),
    path: session.path || '',
    currentModule: session.currentModule || '',
    moduleSeconds: session.moduleSeconds || {},
    device: session.device || 'Unknown',
  }, { merge: true })
  return true
}

export async function touchUsage({ path, moduleName } = {}) {
  const user = authUser()
  if (!user?.id || user.guest || user.accountType === 'dashboard_viewer') return null
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
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('pagehide', onPageHide)
  return () => {
    window.clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pagehide', onPageHide)
  }
}
