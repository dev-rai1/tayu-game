// R12 PART 2/3: THE ACCOUNT LAYER.
// CLOUD MODE when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set (Vercel
// env vars): real Supabase Auth (hashed passwords, reset emails) + profiles/
// progress tables - see supabase-setup.sql and AUTH_README.md.
// LOCAL DEMO MODE otherwise: the full flow works on this device only -
// accounts live in localStorage with SHA-256 salted password hashes, reset
// emails are unavailable (the UI says so). Email/password ONLY - no Google.
import { loadWallet, saveWallet, loadProfile, saveProfile } from './walletStore.js'

const SB_URL = import.meta.env.VITE_SUPABASE_URL
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
export const isCloud = () => !!(SB_URL && SB_KEY)

let sb = null
async function client() {
  if (!isCloud()) return null
  if (!sb) {
    const { createClient } = await import('@supabase/supabase-js')
    sb = createClient(SB_URL, SB_KEY)
  }
  return sb
}

// ---- local demo store ----
const LKEY = 'tayu-accounts-v1'
const SKEY = 'tayu-session-v1'
const readAccounts = () => { try { return JSON.parse(localStorage.getItem(LKEY) || '{}') } catch { return {} } }
const writeAccounts = (a) => localStorage.setItem(LKEY, JSON.stringify(a))

async function hashPw(pw, salt) {
  const data = new TextEncoder().encode(salt + ':' + pw)
  const h = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// The admin + Dev accounts exist from the first run (local mode). In cloud
// mode they are created via supabase-setup.sql / the Supabase dashboard so
// the credential never ships in client code beyond this demo fallback.
export async function seedLocalAccounts() {
  const acc = readAccounts()
  if (!acc['tayu.finance@gmail.com']) {
    const salt = 'tayu-admin-salt'
    acc['tayu.finance@gmail.com'] = {
      email: 'tayu.finance@gmail.com', salt, hash: await hashPw('tayuadmin9876', salt),
      role: 'admin', gradeLevels: '', foundVia: 'founder', social: '', createdAt: new Date().toISOString(), progress: null,
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
function setSession(user) {
  if (user) localStorage.setItem(SKEY, JSON.stringify(user))
  else localStorage.removeItem(SKEY)
  window.dispatchEvent(new Event('tayu-auth-changed'))
}

// ---- sign up (captures the email + all profile questions) ----
export async function signUp({ email, password, role, gradeLevels, foundVia, organizationName }) {
  email = String(email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a real email address.')
  if (!password || password.length < 6) throw new Error('Password needs at least 6 characters.')
  if ((role === 'teacher' || role === 'student') && !String(organizationName || '').trim())
    throw new Error('Please enter your school or organization name.')
  const profile = {
    role: role || 'student', gradeLevels: gradeLevels || '', foundVia: foundVia || '',
    organizationName: String(organizationName || '').trim(),
  }
  const c = await client()
  if (c) {
    const { data, error } = await c.auth.signUp({ email, password })
    if (error) throw new Error(error.message)
    await c.from('profiles').upsert({ id: data.user.id, email, ...profile, created_at: new Date().toISOString() })
    setSession({ email, role: profile.role, cloud: true, id: data.user.id })
    return { email }
  }
  const acc = readAccounts()
  if (acc[email] && !acc[email].needsPassword) throw new Error('That email already has an account. Try logging in.')
  const salt = Math.random().toString(36).slice(2)
  acc[email] = { ...(acc[email] || {}), email, salt, hash: await hashPw(password, salt), needsPassword: false, ...profile, role: acc[email]?.role === 'admin' ? 'admin' : profile.role, createdAt: acc[email]?.createdAt || new Date().toISOString(), progress: acc[email]?.progress ?? null }
  writeAccounts(acc)
  setSession({ email, role: acc[email].role, cloud: false })
  return { email }
}

// ---- sign in: restores the saved progress tied to the account ----
export async function signIn(email, password) {
  email = String(email || '').trim().toLowerCase()
  const c = await client()
  if (c) {
    const { data, error } = await c.auth.signInWithPassword({ email, password })
    if (error) throw new Error('Email or password did not match.')
    const { data: prof } = await c.from('profiles').select('*').eq('id', data.user.id).single()
    setSession({ email, role: prof?.role || 'student', cloud: true, id: data.user.id })
    await syncDown()
    return { email, role: prof?.role || 'student' }
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
  const c = await client()
  if (c) await c.auth.signOut()
  setSession(null)
}

// ---- forgot password ----
export async function resetPassword(email) {
  email = String(email || '').trim().toLowerCase()
  const c = await client()
  if (c) {
    const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/login' })
    if (error) throw new Error(error.message)
    return 'Check your email for the reset link!'
  }
  throw new Error('Reset emails need the cloud backend (Supabase keys). In demo mode, sign up again with the same email to set a new password.')
}

// ---- progress sync (wallet + profile snapshots tied to the account) ----
export async function syncUp() {
  const u = currentUser()
  if (!u) return
  const snapshot = { wallet: loadWallet(), profile: loadProfile(), savedAt: new Date().toISOString() }
  const c = await client()
  if (c && u.id) {
    await c.from('progress').upsert({ user_id: u.id, data: snapshot, updated_at: snapshot.savedAt })
    return
  }
  const acc = readAccounts()
  if (acc[u.email]) { acc[u.email].progress = snapshot; writeAccounts(acc) }
}

export async function syncDown() {
  const u = currentUser()
  if (!u) return false
  let snap = null
  const c = await client()
  if (c && u.id) {
    const { data } = await c.from('progress').select('data').eq('user_id', u.id).single()
    snap = data?.data || null
  } else {
    snap = readAccounts()[u.email]?.progress || null
  }
  if (snap?.wallet) saveWallet(snap.wallet)
  if (snap?.profile) saveProfile(snap.profile)
  return !!snap
}

// ---- the admin dashboard's data (role=admin only) ----
export async function adminData() {
  const u = currentUser()
  if (!u || u.role !== 'admin') throw new Error('Admin only.')
  const c = await client()
  if (c) {
    const { data: profiles } = await c.from('profiles').select('*')
    const { data: progress } = await c.from('progress').select('*')
    const progById = Object.fromEntries((progress || []).map((p) => [p.user_id, p.data]))
    return (profiles || []).map((p) => ({
      email: p.email, role: p.role, gradeLevels: p.grade_levels ?? p.gradeLevels ?? '', foundVia: p.found_via ?? p.foundVia ?? '',
      organizationName: p.organization_name ?? p.organizationName ?? '', organizationEmail: p.organization_email ?? p.organizationEmail ?? '',
      createdAt: p.created_at, progress: progById[p.id] || null,
    }))
  }
  return Object.values(readAccounts()).map((a) => ({
    email: a.email, role: a.role, gradeLevels: a.gradeLevels, foundVia: a.foundVia,
    organizationName: a.organizationName || '', organizationEmail: a.organizationEmail || '',
    createdAt: a.createdAt, progress: a.progress,
  }))
}

// keep cloud/local progress fresh: the wallet store announces every save
let syncTimer = null
if (typeof window !== 'undefined') {
  window.addEventListener('tayu-progress-saved', () => {
    clearTimeout(syncTimer)
    syncTimer = setTimeout(() => syncUp().catch(() => {}), 2500)
  })
  seedLocalAccounts().catch(() => {})
}
