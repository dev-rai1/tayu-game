import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { prepareFirebaseAuth } from './firebase.js'

const SESSION_KEY = 'tayu-session-v1'
const DASHBOARD_PASSWORD_HASH = 'faef517dac0d52529db44ce91f07a860efebc208abcf4c8e8530e85fa300e512'

export const DASHBOARD_VIEWER_EMAIL = 'dashboard.viewer.v3@tayufinance.app'

export const ADMIN_EMAILS = Object.freeze([
  'tayu.finance@gmail.com',
  'devr53247@gmail.com',
])

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(normalizeEmail(email))
}

export function isDashboardViewerEmail(email) {
  return normalizeEmail(email) === DASHBOARD_VIEWER_EMAIL
}

function readSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}

function saveSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('tayu-auth-changed'))
}

async function passwordHash(password) {
  if (!globalThis.crypto?.subtle) throw new Error('Secure password checking is unavailable in this browser.')
  const bytes = new TextEncoder().encode(String(password || ''))
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function isDashboardPassword(password) {
  return (await passwordHash(password)) === DASHBOARD_PASSWORD_HASH
}

async function saveDashboardViewer(firebase, firebaseUser) {
  const now = new Date().toISOString()
  await setDoc(doc(firebase.firestore, 'profiles', firebaseUser.uid), {
    email: DASHBOARD_VIEWER_EMAIL,
    role: 'admin',
    accountType: 'dashboard_viewer',
    lastActiveAt: now,
  }, { merge: true })

  const session = {
    id: firebaseUser.uid,
    email: DASHBOARD_VIEWER_EMAIL,
    role: 'admin',
    accountType: 'dashboard_viewer',
    cloud: true,
  }
  saveSession(session)
  return session
}

export async function openDashboardWithPassword(password) {
  if (!(await isDashboardPassword(password))) throw new Error('Incorrect dashboard password.')
  const firebase = await prepareFirebaseAuth()
  if (!firebase) throw new Error('Dashboard access is temporarily unavailable. Refresh and try again.')

  let credential
  try {
    credential = await signInWithEmailAndPassword(firebase.auth, DASHBOARD_VIEWER_EMAIL, password)
  } catch (error) {
    if (!['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password'].includes(error?.code)) throw error
    try {
      credential = await createUserWithEmailAndPassword(firebase.auth, DASHBOARD_VIEWER_EMAIL, password)
    } catch (createError) {
      if (createError?.code === 'auth/email-already-in-use') {
        throw new Error('Dashboard access could not be verified. Refresh and try again.')
      }
      throw new Error('Dashboard access could not be verified. Try again.')
    }
  }
  return saveDashboardViewer(firebase, credential.user)
}

export async function ensureAdminAccess(user = null) {
  const session = readSession()
  const candidate = { ...(session || {}), ...(user || {}) }
  const email = normalizeEmail(candidate.email)

  if (isDashboardViewerEmail(email)) {
    const promoted = { ...candidate, email, role: 'admin', accountType: 'dashboard_viewer' }
    saveSession(promoted)
    return promoted
  }
  if (!isAdminEmail(email)) return null

  const promoted = { ...candidate, email, role: 'admin' }
  saveSession(promoted)
  try {
    const firebase = await prepareFirebaseAuth()
    const uid = promoted.id || firebase?.auth?.currentUser?.uid
    if (firebase?.firestore && uid) {
      await setDoc(doc(firebase.firestore, 'profiles', uid), {
        email,
        role: 'admin',
        lastActiveAt: new Date().toISOString(),
      }, { merge: true })
    }
  } catch { /* profile repair can retry later */ }
  return promoted
}
