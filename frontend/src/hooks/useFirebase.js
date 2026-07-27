import { signInAnonymously } from 'firebase/auth'
import { getFirebaseServices } from '../services/firebase.js'

// Shared Firebase access for anonymous solo-mode save/resume.
// Account login uses the same initialized app through services/auth.js.
export function useFirebase() {
  const services = getFirebaseServices()
  const auth = services?.auth || null

  const signIn = async () => {
    if (!auth) return null
    const cred = await signInAnonymously(auth)
    return cred.user
  }

  return {
    app: services?.app || null,
    auth,
    db: services?.realtimeDb || null,
    firestore: services?.firestore || null,
    signIn,
    configured: Boolean(services),
  }
}
