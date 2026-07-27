import { doc, setDoc } from 'firebase/firestore'
import { prepareFirebaseAuth } from './firebase.js'

const SESSION_KEY = 'tayu-session-v1'

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

function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

function saveSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('tayu-auth-changed'))
}

export async function ensureAdminAccess(user = null) {
  const session = readSession()
  const candidate = { ...(session || {}), ...(user || {}) }
  const email = normalizeEmail(candidate.email)
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
  } catch {
    // The allowlisted Firebase rules still permit dashboard reads. Profile repair
    // can retry on the next login without blocking the admin from continuing.
  }

  return promoted
}
