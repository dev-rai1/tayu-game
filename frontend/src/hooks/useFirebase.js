import { initializeApp, getApps } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

// Lazy Firebase init. Used for anonymous auth + solo-mode save/resume.
// Returns null cleanly if env vars are absent so the app still boots locally.

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
}

let app = null
function ensureApp() {
  if (!config.apiKey) return null
  if (!app) app = getApps().length ? getApps()[0] : initializeApp(config)
  return app
}

export function useFirebase() {
  const ready = ensureApp()
  const auth = ready ? getAuth(ready) : null
  const db = ready ? getDatabase(ready) : null

  const signIn = async () => {
    if (!auth) return null
    const cred = await signInAnonymously(auth)
    return cred.user
  }

  return { app: ready, auth, db, signIn, configured: Boolean(ready) }
}
