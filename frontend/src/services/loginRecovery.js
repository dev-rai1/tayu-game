import { signInWithEmailAndPassword } from 'firebase/auth'
import { getDoc, doc } from 'firebase/firestore'
import { prepareFirebaseAuth } from './firebase.js'

const SESSION_KEY = 'tayu-session-v1'
const LEGACY_ACCOUNTS_KEY = 'tayu-accounts-v1'

function existingSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}

function saveSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event('tayu-auth-changed'))
  return session
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function legacyAccount(email) {
  try {
    const accounts = JSON.parse(localStorage.getItem(LEGACY_ACCOUNTS_KEY) || '{}')
    return accounts[normalizeEmail(email)] || null
  } catch {
    return null
  }
}

async function hashPassword(password, salt) {
  if (!salt || !password || !globalThis.crypto?.subtle) return null
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function recoverLegacySession(email, password) {
  const account = legacyAccount(email)
  if (!account || account.needsPassword || !account.hash || !account.salt) return null
  const hash = await hashPassword(password, account.salt)
  if (!hash || hash !== account.hash) return null
  return saveSession({ email: normalizeEmail(email), role: account.role || 'student', cloud: false })
}

export async function recoverAuthenticatedSession() {
  const firebase = await prepareFirebaseAuth()
  const user = firebase?.auth?.currentUser
  if (!firebase || !user || user.isAnonymous) return null

  let role = existingSession()?.role || 'student'
  try {
    const snapshot = await getDoc(doc(firebase.firestore, 'profiles', user.uid))
    role = snapshot.exists() ? (snapshot.data()?.role || role) : role
  } catch {
    // A Firestore read failure must not invalidate successful Firebase Auth.
  }

  return saveSession({ email: user.email || '', role, cloud: true, id: user.uid })
}

// A valid password should get the player into TAYU even when profile/progress
// syncing is unavailable or the account still uses the older device-only login.
export async function recoverLogin(email, password) {
  const alreadyAuthenticated = await recoverAuthenticatedSession().catch(() => null)
  if (alreadyAuthenticated) return alreadyAuthenticated

  const firebase = await prepareFirebaseAuth().catch(() => null)
  if (firebase) {
    try {
      await signInWithEmailAndPassword(firebase.auth, normalizeEmail(email), password)
      const recovered = await recoverAuthenticatedSession().catch(() => null)
      if (recovered) return recovered
    } catch {
      // Fall through to the older device-only credentials below.
    }
  }

  return recoverLegacySession(email, password)
}
