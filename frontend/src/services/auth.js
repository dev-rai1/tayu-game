// TAYU account layer: Firebase Authentication, password-reset emails,
// Firestore profiles, and synced progress.
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

// Legacy compatibility data is read only to help older accounts move into Firebase.
const LKEY = 'tayu-accounts-v1'
const SKEY = 'tayu-session-v1'
const GKEY = 'tayu-guest-progress-v1'
const DEMO_ADMIN_CREDENTIAL_VERSION = 3
const readAccounts = () => { try { return JSON.parse(localStorage.getItem(LKEY) || '{}') } catch { return {} } }
const writeAccounts = (accounts) => localStorage.setItem(LKEY, JSON.stringify(accounts))
const normalizeEmail = (email) => String(email || '').trim().toLowerCase()
const localAccountFor = (email) => readAccounts()[normalizeEmail(email)] || null

// Remove the old persistent session key. Registered users now authenticate for
// each new browser session, while sessionStorage preserves normal page refreshes.
if (typeof window !== 'undefined') localStorage.removeItem(SKEY)

async function hashPw(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

// Retained only for compatibility if Firebase configuration is unavailable in a
// development build. Production credentials are never stored in client code.
export async function seedLocalAccounts() {
  const accounts = readAccounts()
  if (!accounts['tayu.finance@gmail.com'] || accounts['tayu.finance@gmail.com'].credentialVersion !== DEMO_ADMIN_CREDENTIAL_VERSION) {
    accounts['tayu.finance@gmail.com'] = {
      ...accounts['tayu.finance@gmail.com'],
      email: 'tayu.finance@gmail.com', salt: null, hash: null,
      credentialVersion: DEMO_ADMIN_CREDENTIAL_VERSION, needsPassword: true,
      role: 'admin', gradeLevels: '', foundVia: 'founder', social: '',
      createdAt: accounts['tayu.finance@gmail.com']?.createdAt || new Date().toISOString(),
      progress: accounts['tayu.finance@gmail.com']?.progress ?? null,
    }
  }
  if (!accounts['devr53247@gmail.com']) {
    accounts['devr53247@gmail.com'] = {
      email: 'devr53247@gmail.com', salt: null, hash: null, needsPassword: true,
      role: 'admin', gradeLevels: '', foundVia: 'founder', social: '', createdAt: new Date().toISOString(), progress: null,
    }
  }
  writeAccounts(accounts)
}

// ---- session ----
export function currentUser() {
  try { return JSON.parse(sessionStorage.getItem(SKEY) || 'null') } catch { return null }
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
  localStorage.removeItem(SKEY)
  if (user) sessionStorage.setItem(SKEY, JSON.stringify(user))
  else sessionStorage.removeItem(SKEY)
  window.dispatchEvent(new Event('tayu-auth-changed'))
}

function normalizeRole(role) {
  return ['teacher', 'student', 'other'].includes(role) ? role : 'student'
}

function firebaseError(error, fallback) {
  const messages = {
    'auth/email-already-in-use': 'That email already has an account. Use Log In or Forgot password.',
    'auth/invalid-email': 'Please enter a real email address.',
    'auth/invalid-credential': 'Email or password did not match.',
    'auth/user-not-found': 'Email or password did not match.',
    'auth/wrong-password': 'Email or password did not match.',
    'auth/user-disabled': 'This account has been disabled. Please contact TAYU.',
    'auth/weak-password': 'Password needs at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Please wait a little and try again.',
    'auth/network-request-failed': 'We could not reach the account service. Check your internet connection and try again.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled yet. Please contact TAYU.',
    'auth/configuration-not-found': 'Account services are not fully configured yet.',
    'auth/unauthorized-domain': 'This website is not authorized for account access yet.',
    'auth/invalid-continue-uri': 'The password-reset return address is not allowed.',
    'auth/invalid-api-key': 'The website account configuration is invalid.',
  }
  return new Error(messages[error?.code] || fallback || error?.message || 'Something went wrong. Please try again.')
}

function isCredentialMismatch(error) {
  return ['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password'].includes(error?.code)
}

function legacyMigrationMessage() {
  return 'This email has not been activated in the new account system yet. Open Sign Up, use the same email, and choose a password to activate it.'
}

async function firebaseProfile(firestore, uid) {
  const snapshot = await getDoc(doc(firestore, 'profiles', uid))
  return snapshot.exists() ? snapshot.data() : null
}

async function uploadLegacyProgress(firestore, uid, legacyProgress) {
  if (!legacyProgress) return false
  if (legacyProgress.wallet) saveWallet(legacyProgress.wallet)
  if (legacyProgress.profile) saveProfile(legacyProgress.profile)
  const savedAt = legacyProgress.savedAt || new Date().toISOString()
  await setDoc(doc(firestore, 'progress', uid), {
    data: { ...legacyProgress, savedAt },
    updatedAt: savedAt,
  }, { merge: true })
  return true
}

function markLegacyAccountMigrated(email, uid) {
  const accounts = readAccounts()
  if (!accounts[email]) return
  accounts[email] = {
    ...accounts[email],
    migratedToFirebase: true,
    firebaseUid: uid,
    migratedAt: new Date().toISOString(),
  }
  writeAccounts(accounts)
}

// ---- sign up ----
export async function signUp({ email, password, role, gradeLevels, foundVia, organizationName }) {
  email = normalizeEmail(email)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a real email address.')
  if (!password || password.length < 6) throw new Error('Password needs at least 6 characters.')
  if ((role === 'teacher' || role === 'student') && !String(organizationName || '').trim()) {
    throw new Error('Please enter your school or organization name.')
  }

  const legacyAccount = localAccountFor(email)
  const now = new Date().toISOString()
  const profile = {
    email,
    role: normalizeRole(role),
    gradeLevels: gradeLevels || legacyAccount?.gradeLevels || '',
    foundVia: foundVia || legacyAccount?.foundVia || '',
    organizationName: String(organizationName || legacyAccount?.organizationName || '').trim(),
    social: legacyAccount?.social || '',
    createdAt: legacyAccount?.createdAt || now,
    ...(legacyAccount ? { migratedFromLocal: true, migratedAt: now } : {}),
  }

  const firebase = await prepareFirebaseAuth()
  if (firebase) {
    try {
      const credential = await createUserWithEmailAndPassword(firebase.auth, email, password)
      await setDoc(doc(firebase.firestore, 'profiles', credential.user.uid), profile)
      setSession({ email, role: profile.role, cloud: true, id: credential.user.uid })
      const migrated = await uploadLegacyProgress(firebase.firestore, credential.user.uid, legacyAccount?.progress)
      if (legacyAccount) markLegacyAccountMigrated(email, credential.user.uid)
      return { email, role: profile.role, migrated }
    } catch (error) {
      throw firebaseError(error, 'We could not create the account. Please try again.')
    }
  }

  const accounts = readAccounts()
  if (accounts[email] && !accounts[email].needsPassword) throw new Error('That email already has an account. Try logging in.')
  const salt = Math.random().toString(36).slice(2)
  accounts[email] = {
    ...(accounts[email] || {}), email, salt, hash: await hashPw(password, salt), needsPassword: false,
    ...profile, role: accounts[email]?.role === 'admin' ? 'admin' : profile.role,
    createdAt: accounts[email]?.createdAt || profile.createdAt, progress: accounts[email]?.progress ?? null,
  }
  writeAccounts(accounts)
  setSession({ email, role: accounts[email].role, cloud: false })
  return { email, role: accounts[email].role, migrated: false }
}

// ---- sign in: restores the saved progress tied to the account ----
export async function signIn(email, password) {
  email = normalizeEmail(email)
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
      const legacyAccount = localAccountFor(email)
      if (isCredentialMismatch(error) && legacyAccount && !legacyAccount.migratedToFirebase) {
        throw new Error(legacyMigrationMessage())
      }
      throw firebaseError(error, 'Email or password did not match.')
    }
  }

  const accounts = readAccounts()
  const account = accounts[email]
  if (!account || account.needsPassword) throw new Error(account ? 'This account needs a password - use Sign Up to set one.' : 'No account with that email yet.')
  if ((await hashPw(password, account.salt)) !== account.hash) throw new Error('Email or password did not match.')
  setSession({ email, role: account.role, cloud: false })
  await syncDown()
  return { email, role: account.role }
}

export async function signOutUser() {
  const firebase = await prepareFirebaseAuth()
  if (firebase) await signOut(firebase.auth)
  setSession(null)
}

// ---- forgot password ----
export async function resetPassword(email) {
  email = normalizeEmail(email)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a real email address.')
  const firebase = await prepareFirebaseAuth()
  if (!firebase) {
    throw new Error('Account services are temporarily unavailable. Please refresh and try again.')
  }

  try {
    // Use Firebase's hosted reset handler. A custom continue URL can cause reset
    // delivery to fail when the custom domain has not been added to Authorized domains.
    await sendPasswordResetEmail(firebase.auth, email)
    const legacyAccount = localAccountFor(email)
    const activationNote = legacyAccount && !legacyAccount.migratedToFirebase
      ? ' If no email arrives, use Sign Up with the same email to activate the account first.'
      : ''
    return `If an account uses that email, a password-reset link was sent. Check your inbox and spam folder.${activationNote}`
  } catch (error) {
    if (error?.code === 'auth/user-not-found') {
      return 'If an account uses that email, a password-reset link was sent. Check your inbox and spam folder.'
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
  const user = currentUser()
  if (!user) return
  const snapshot = serializableSnapshot()
  if (user.guest) {
    try { localStorage.setItem(GKEY, JSON.stringify(snapshot)) } catch { /* storage unavailable */ }
    return
  }

  const firebase = getFirebaseServices()
  if (firebase && user.id) {
    await setDoc(doc(firebase.firestore, 'progress', user.id), { data: snapshot, updatedAt: snapshot.savedAt }, { merge: true })
    return
  }

  const accounts = readAccounts()
  if (accounts[user.email]) { accounts[user.email].progress = snapshot; writeAccounts(accounts) }
}

export async function syncDown() {
  const user = currentUser()
  if (!user) return false
  let snapshot = null
  const firebase = getFirebaseServices()
  if (firebase && user.id) {
    const progress = await getDoc(doc(firebase.firestore, 'progress', user.id))
    snapshot = progress.exists() ? progress.data()?.data : null
  } else {
    snapshot = readAccounts()[user.email]?.progress || null
  }
  if (snapshot?.wallet) saveWallet(snapshot.wallet)
  if (snapshot?.profile) saveProfile(snapshot.profile)
  return Boolean(snapshot)
}

// ---- admin dashboard data ----
export async function adminData() {
  const user = currentUser()
  if (!user || user.role !== 'admin') throw new Error('Admin only.')
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

  return Object.values(readAccounts()).map((account) => ({
    email: account.email, role: account.role, gradeLevels: account.gradeLevels, foundVia: account.foundVia,
    social: account.social || '', organizationName: account.organizationName || '',
    organizationEmail: account.organizationEmail || '', createdAt: account.createdAt, progress: account.progress,
  }))
}

// Keep the session cache aligned with Firebase's current authentication state.
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
    // Anonymous authentication belongs to guest mode and should never be
    // promoted into a permanent student account session.
    if (user.isAnonymous) return
    try {
      const profile = await firebaseProfile(firebase.firestore, user.uid)
      setSession({ email: user.email || '', role: profile?.role || 'student', cloud: true, id: user.uid })
    } catch {
      setSession({ email: user.email || '', role: currentUser()?.role || 'student', cloud: true, id: user.uid })
    }
  })
}

// Keep account progress fresh whenever the wallet store announces a save.
let syncTimer = null
if (typeof window !== 'undefined') {
  window.addEventListener('tayu-progress-saved', () => {
    clearTimeout(syncTimer)
    syncTimer = setTimeout(() => syncUp().catch(() => {}), 2500)
  })
  if (isCloud()) startFirebaseAuthSync().catch(() => {})
  else seedLocalAccounts().catch(() => {})
}
