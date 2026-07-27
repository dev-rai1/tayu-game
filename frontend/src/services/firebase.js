import { getApps, initializeApp } from 'firebase/app'
import { browserSessionPersistence, getAuth, setPersistence } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { getFirestore } from 'firebase/firestore'

const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

function hasRequiredConfig(config) {
  return Boolean(config?.apiKey && config?.authDomain && config?.projectId)
}

function canUseHostingAutoConfig() {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname.toLowerCase()
  return host === 'tayufinance.app'
    || host === 'www.tayufinance.app'
    || host.endsWith('.web.app')
    || host.endsWith('.firebaseapp.com')
}

let firebaseConfig = hasRequiredConfig(envConfig) ? envConfig : null
let configPromise = null
let services = null
let persistenceReady = null

// Firebase Hosting exposes the web app's public config at this built-in path.
// This lets the deployed app connect to its Firebase project without requiring
// the public browser config to be duplicated as seven GitHub secrets.
async function loadFirebaseConfig() {
  if (hasRequiredConfig(firebaseConfig)) return firebaseConfig
  if (!canUseHostingAutoConfig() || typeof fetch !== 'function') return null

  if (!configPromise) {
    configPromise = fetch('/__/firebase/init.json', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Firebase config request failed with ${response.status}`)
        const config = await response.json()
        if (!hasRequiredConfig(config)) throw new Error('Firebase Hosting returned an incomplete config.')
        firebaseConfig = config
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('tayu-firebase-ready'))
        return firebaseConfig
      })
      .catch(() => null)
  }

  return configPromise
}

export function isFirebaseConfigured() {
  return hasRequiredConfig(firebaseConfig) || canUseHostingAutoConfig()
}

function initializeServices() {
  if (!hasRequiredConfig(firebaseConfig)) return null
  if (!services) {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
    services = {
      app,
      auth: getAuth(app),
      firestore: getFirestore(app),
      realtimeDb: firebaseConfig.databaseURL ? getDatabase(app) : null,
    }
  }
  return services
}

export function getFirebaseServices() {
  return initializeServices()
}

export async function prepareFirebaseAuth() {
  if (!hasRequiredConfig(firebaseConfig)) await loadFirebaseConfig()
  const ready = initializeServices()
  if (!ready) return null
  if (!persistenceReady) {
    // Keep the login only for the current browser session. Closing the browser
    // requires the user to log in again, while normal page refreshes still work.
    persistenceReady = setPersistence(ready.auth, browserSessionPersistence).catch(() => undefined)
  }
  await persistenceReady
  return ready
}
