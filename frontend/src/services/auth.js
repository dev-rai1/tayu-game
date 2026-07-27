// TAYU account layer.
// FIREBASE MODE when the VITE_FIREBASE_* variables are present: real Firebase
// Authentication, password-reset emails, Firestore profiles, and synced progress.
// LOCAL DEMO MODE otherwise: accounts and progress remain on this device only.
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { getFirebaseServices, isFirebaseConfigured, prepareFirebaseAuth } from './firebase.js'
import { loadWallet, saveWallet, loadProfile, saveProfile } from './walletStore.js'

export const isCloud = () => isFirebaseConfigured()

// ---- local demo store ----
const LKEY = 'tayu-accounts-v1'
const SKEY = 'tayu-session-v1'
const GKEY = 'tayu-guest-progress-v1'
const DEMO_ADMIN_CREDENTIAL_VERSION = 3
const readAccounts = () => { try { return JSON.parse(localStorage.getItem(LKEY) || '{}') } catch { return {} } }
const writeAccounts = (a) => localStorage.setItem(LKEY, JSON.stringify(a))

async function hashPw(pw, salt) {
  const data = new TextEncoder().encode(salt + ':' + pw)
  const h = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// These demo accounts are used only when Firebase is not configured. Production
// Firebase credentials are never stored in the client code.
export async function seedLocalAccounts() {
  const acc = readAccounts()
  if (!acc['tayu.finance@gmail.com'] || acc['tayu.finance@gmail.com'].credentialVersion !== DEMO_ADMIN_CREDENTIAL_VERSION) {
    acc['tayu.finance@gmail.com'] = {
      ...acc['tayu.finance@gmail.com'],
      email: 'tayu.finance@gmail.com', salt: null, hash: null,
      credentialVersion: DEMO_ADMIN_CREDENTIAL_VERSION, needsPassword: true,
      role: 'admin', gradeLevels: '', foundVia: 'founder', social: '',
      createdAt: acc['tayu.finance@gmail.com']?.createdAt || new Date().toISOString(),
      progress: acc['tayu.finance@gmail.com']?.progress ?? null,
    }
  }
  if (!acc['devr53247@gmail.com']) {
    acc['devr53247@gmail.com'] = {
      email: 'devr53247@gmail.com', salt: null, hash: null, needsPassword: true,
      role: 'admin', gradeLevels: '', foundVia: 'founder', social: '', createdAt: new Date().toISOString(), progress: null,
    }
  }
  writeAccounts(acc)
}

// ---- session ----
export function currentUser() {
  try { return JSON.parse(localStorage.getItem(SKEY) || 'null') } catch { return null }
}

function readGuestProgress() {
  try { return JSON.parse(localStorage.getItem(GKEY) || 'null') } catch { return null }
}

function saveGuestProgress() {
  const snapshot = { wallet: loadWallet(), profile: loadProfile(), savedAt: new Date().toISOString() }
  try { localStorage.setItem(GKEY, JSON.stringify(snapshot)) } catch { /* storage unavailable */ }
  return snapshot
}

export function startGuestSession() {
  if (currentUser()?.guest) saveGuestProgress()
  const saved = readGuestProgress()
  const guest = { role: 'guest', cloud: false, guest: true }
  setSession(guest)
  if (saved?.wallet) saveWallet(saved.wallet)
  if (saved?.profile) saveProfile(saved.profile)
  return guest
}

function setSession(user) {
  if (user) localStorage.setItem(SKEY, JSON.stringify(user))
  else localStorage.removeItem(SKEY)
  window.dispatchEvent(new Event('tayu-auth-changed'))
}

function normalizeRole(role) {
  return ['teacher', 'student', 'other'].includes(role) ? role : 'student'
}

function firebaseError(error, fallback) {
  const messages = {
    'auth/email-already-in-use': 'That email already has an account. Try logging in.',
    'auth/invalid-email': 'Please enter a real email address.',
    'auth/invalid-credential': 'Email or password did not match.',
    'auth/user-disabled': 'This account has been disabled. Please contact TAYU.',
    'auth/weak-password': 'Password needs at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Please wait a little and try again.',
    'auth/network-request-failed': 'We could not reach Firebase. Check your internet connection and try again.',
  }
  return new Error(messages[error?.code] || fallback || error?.message || 'Something went wrong. Please try again.')
}

async function firebaseProfile(firestore, uid) {
  const snap = await getDoc(doc(firestore, 'profiles', uid))
  return snap.exists() ? snap.data() : null
}

// ---- sign up ----
export async function signUp({ email, password, role, gradeLevels, foundVia, organizationName }) {
  email = String(email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a real email address.')
  if (!password || password.length < 6) throw new Error('Password needs at least 6 characters.')
  if ((role === 'teacher' || role === 'student') && !String(organizationName || '').trim()) {
    throw new Error('Please enter your school or organization name.')
  }

  const profile = {
    email,
    role: normalizeRole(role),
    gradeLevels: gradeLevels || '',
    foundVia: foundVia || '',
    organizationName: String(organizationName || '').trim(),
    social: '',
    createdAt: new Date().toISOString(),
  }

  const firebase = await prepareFirebaseAuth()
  if (firebase) {
    try {
      const credential = await createUserWithEmailAndPassword(firebase.auth, email, password)
      await setDoc(doc(firebase.firestore, 'profiles', credential.user.uid), profile)
      setSession({ email, role: profile.role, cloud: true, id: credential.user.uid })
      return { email, role: profile.role }
    } catch (error) {
      throw firebaseError(error, 'We could not create the account. Please try again.')
    }
  }

  const acc = readAccounts()
  if (acc[email] && !acc[email].needsPassword) throw new Error('That email already has an account. Try logging in.')
  const salt = Math.random().toString(36).slice(2)
  acc[email] = {
    ...(acc[email] || {}), email, salt, hash: await hashPw(password, salt), needsPassword: false,
    ...profile, role: acc[email]?.role === 'admin' ? 'admin' : profile.role,
    createdAt: acc[email]?.createdAt || profile.createdAt, progress: acc[email]?.progress ?? null,
  }
  writeAccounts(acc)
  setSession({ email, role: acc[email].role, cloud: false })
  return { email, role: acc[email].role }
}

// ---- sign in: restores the saved progress tied to the account ----
export async function signIn(email, password) {
  email = String(email || '').trim().toLowerCase()
  const firebase = await prepareFirebaseAuth()
  if (firebase) {
    try {
      const credential = await signInWithEmailAndPassword(firebase.auth, email, password)
      const profile = await firebaseProfile(firebase.firestore, credential.user.uid)
      const role = profile?.role || 'student'
      setSession({ email: credential.user.email || email, role, cloud: true, id: credential.user.uid })
      await syncDown()
      return { email, role }
    } catch (error) {
      throw firebaseError(error, 'Email or password did not match.')
    }
  }

  const acc = readAccounts()
  const a = acc[email]
  if (!a || a.needsPassword) throw new Error(a ? 'This account needs a password - use Sign Up to set one.' : 'No account with that email yet.')
  if ((await hashPw(password, a.salt)) !== a.hash) throw new Error('Email or password did not match.')
  setSession({ email, role: a.role, cloud: false })
  await syncDown()
  return { email, role: a.role }
}

export async function signOutUser() {
  const firebase = await prepareFirebaseAuth()
  if (firebase) await signOut(firebase.auth)
  setSession(null)
}

// ---- forgot password ----
export async function resetPassword(email) {
  email = String(email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a real email address.')
  const firebase = await prepareFirebaseAuth()
  if (!firebase) {
    throw new Error('Password-reset emails need Firebase to be connected. This device is currently using practice mode.')
  }

  try {
    await sendPasswordResetEmail(firebase.auth, email, {
      url: `${window.location.origin}/login?mode=signin`,
      handleCodeInApp: false,
    })
    return 'If an account uses that email, Firebase has sent a password-reset link. Check your inbox and spam folder.'
  } catch (error) {
    if (error?.code === 'auth/user-not-found') {
      return 'If an account uses that email, Firebase has sent a password-reset link. Check your inbox and spam folder.'
    }
    throw firebaseError(error, 'We could not send the reset email. Please try again.')
  }
}

function serializableSnapshot() {
  return JSON.parse(JSON.stringify({
    wallet: loadWallet(),
    profile: loadProfile(),
    savedAt: new Date().toISOString(),
  }))
}

// ---- progress sync ----
export async function syncUp() {
  const u = currentUser()
  if (!u) return
  const snapshot = serializableSnapshot()
  if (u.guest) {
    try { localStorage.setItem(GKEY, JSON.stringify(snapshot)) } catch { /* storage unavailable */ }
    return
  }

  const firebase = getFirebaseServices()
  if (firebase && u.id) {
    await setDoc(doc(firebase.firestore, 'progress', u.id), { data: snapshot, updatedAt: snapshot.savedAt }, { merge: true })
    return
  }

  const acc = readAccounts()
  if (acc[u.email]) { acc[u.email].progress = snapshot; writeAccounts(acc) }
}

export async function syncDown() {
  const u = currentUser()
  if (!u) return false
  let snap = null
  const firebase = getFirebaseServices()
  if (firebase && u.id) {
    const progress = await getDoc(doc(firebase.firestore, 'progress', u.id))
    snap = progress.exists() ? progress.data()?.data : null
  } else {
    snap = readAccounts()[u.email]?.progress || null
  }
  if (snap?.wallet) saveWallet(snap.wallet)
  if (snap?.profile) saveProfile(snap.profile)
  return Boolean(snap)
}

// ---- admin dashboard data ----
export async function adminData() {
  const u = currentUser()
  if (!u || u.role !== 'admin') throw new Error('Admin only.')
  const firebase = getFirebaseServices()
  if (firebase) {
    const [profileSnapshot, progressSnapshot] = await Promise.all([
      getDocs(collection(firebase.firestore, 'profiles')),
      getDocs(collection(firebase.firestore, 'progress')),
    ])
    const progressById = Object.fromEntries(progressSnapshot.docs.map((item) => [item.id, item.data()?.data || null]))
    return profileSnapshot.docs.map((item) => {
      const profile = item.data()
      return {
        email: profile.email || '',
        role: profile.role || 'student',
        gradeLevels: profile.gradeLevels || '',
        foundVia: profile.foundVia || '',
        social: profile.social || '',
        organizationName: profile.organizationName || '',
        organizationEmail: profile.organizationEmail || '',
        createdAt: profile.createdAt || '',
        progress: progressById[item.id] || null,
      }
    })
  }

  return Object.values(readAccounts()).map((a) => ({
    email: a.email, role: a.role, gradeLevels: a.gradeLevels, foundVia: a.foundVia,
    social: a.social || '', organizationName: a.organizationName || '',
    organizationEmail: a.organizationEmail || '', createdAt: a.createdAt, progress: a.progress,
  }))
}

// Keep a locally cached session aligned with Firebase's persisted auth state.
let stopFirebaseAuthSync = null
async function startFirebaseAuthSync() {
  if (!isCloud() || stopFirebaseAuthSync) return
  const firebase = await prepareFirebaseAuth()
  if (!firebase) return
  stopFirebaseAuthSync = onAuthStateChanged(firebase.auth, async (user) => {
    if (!user) {
      if (currentUser()?.cloud) setSession(null)
      return
    }
    // Anonymous auth belongs to the existing guest/solo-mode flow and should
    // never be promoted into a permanent student account session.
    if (user.isAnonymous) return
    try {
      const profile = await firebaseProfile(firebase.firestore, user.uid)
      setSession({ email: user.email || '', role: profile?.role || 'student', cloud: true, id: user.uid })
    } catch {
      setSession({ email: user.email || '', role: currentUser()?.role || 'student', cloud: true, id: user.uid })
    }
  })
}

// Keep cloud/local progress fresh: the wallet store announces every save.
let syncTimer = null
if (typeof window !== 'undefined') {
  window.addEventListener('tayu-progress-saved', () => {
    clearTimeout(syncTimer)
    syncTimer = setTimeout(() => syncUp().catch(() => {}), 2500)
  })
  if (isCloud()) startFirebaseAuthSync().catch(() => {})
  else seedLocalAccounts().catch(() => {})
}
