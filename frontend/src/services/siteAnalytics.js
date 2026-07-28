import { addDoc, collection } from 'firebase/firestore'
import { getFirebaseServices } from './firebase.js'

const VISITOR_KEY = 'tayu-anonymous-visitor-v1'
const SESSION_KEY = 'tayu-site-session-v1'

function randomId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `${prefix}_${crypto.randomUUID()}`
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`
}

function visitorId() {
  let id = localStorage.getItem(VISITOR_KEY)
  if (!id) {
    id = randomId('visitor')
    localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}

function sessionId() {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = randomId('session')
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export async function recordPageView(path = window.location.pathname) {
  const firebase = getFirebaseServices()
  if (!firebase?.firestore || typeof window === 'undefined') return false
  const now = new Date().toISOString()
  await addDoc(collection(firebase.firestore, 'sitePageViews'), {
    visitorId: visitorId(),
    sessionId: sessionId(),
    path: String(path || '/').slice(0, 200),
    viewedAt: now,
    referrerHost: document.referrer ? (() => { try { return new URL(document.referrer).hostname } catch { return '' } })() : '',
    device: /iPad|Tablet/i.test(navigator.userAgent || '') ? 'Tablet' : /Mobi|Android|iPhone/i.test(navigator.userAgent || '') ? 'Mobile' : 'Desktop',
  })
  return true
}
