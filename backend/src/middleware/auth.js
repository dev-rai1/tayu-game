import admin from 'firebase-admin'
import { initFirebase } from '../firebase/config.js'

// Verifies a Firebase Anonymous Auth ID token from the Authorization header.
// In dev with no Firebase configured, it passes through with a stub uid so the
// scaffold is usable. Tighten before production.
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!initFirebase()) {
    req.uid = 'dev-anonymous'
    return next()
  }
  if (!token) return res.status(401).json({ error: 'missing_token' })

  try {
    const decoded = await admin.auth().verifyIdToken(token)
    req.uid = decoded.uid
    next()
  } catch {
    res.status(401).json({ error: 'invalid_token' })
  }
}
