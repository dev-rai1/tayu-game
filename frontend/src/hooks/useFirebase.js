import { signInAnonymously } from 'firebase/auth'
import { getFirebaseServices, isFirebaseConfigured, prepareFirebaseAuth } from '../services/firebase.js'

// Shared Firebase access for anonymous solo-mode save/resume.
// Account login uses the same initialized app through services/auth.js.
export function useFirebase() {
  const services = getFirebaseServices()

  const signIn = async () => {
    const ready = services || await prepareFirebaseAuth()
    if (!ready?.auth) return null
    const cred = await signInAnonymously(ready.auth)
    return cred.user
  }

  return {
    app: services?.app || null,
    auth: services?.auth || null,
    db: services?.realtimeDb || null,
    firestore: services?.firestore || null,
    signIn,
    configured: isFirebaseConfigured(),
  }
}
