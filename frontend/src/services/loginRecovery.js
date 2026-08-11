import { getDoc, doc } from 'firebase/firestore'
import { prepareFirebaseAuth } from './firebase.js'

const SESSION_KEY = 'tayu-session-v1'

function existingSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
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

  const session = {
    email: user.email || '',
    role,
    cloud: true,
    id: user.uid,
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event('tayu-auth-changed'))
  return session
}
