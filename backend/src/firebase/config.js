// Firebase Admin init. No-ops cleanly if creds are absent so the scaffold runs
// on the in-memory store during local dev.
import admin from 'firebase-admin'

let app = null

export function initFirebase() {
  if (app) return app
  const raw = process.env.FIREBASE_ADMIN_KEY
  const databaseURL = process.env.FIREBASE_DATABASE_URL
  if (!raw || !databaseURL) {
    console.warn('[firebase] FIREBASE_ADMIN_KEY/DATABASE_URL not set — using in-memory store.')
    return null
  }
  const credential = admin.credential.cert(JSON.parse(raw))
  app = admin.initializeApp({ credential, databaseURL })
  return app
}

export function db() {
  const a = initFirebase()
  return a ? admin.database() : null
}
