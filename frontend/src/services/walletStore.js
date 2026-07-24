// THE one persistent wallet object (v6 Section 4.2): { spend, save, give, week }.
// Written on every transaction; all systems read from this single object.
//
// NOTE: the repo has no Firebase project config (useFirebase.js has been a stub
// since v3), so persistence is localStorage with the exact schema the directive
// specifies - swap `read`/`write` for Firestore calls when credentials exist.
const KEY = 'tayu-wallet-v1'

export function loadWallet() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const w = JSON.parse(raw)
    if (typeof w?.spend !== 'number' || typeof w?.save !== 'number' || typeof w?.give !== 'number') return null
    return { spend: w.spend, save: w.save, give: w.give, week: w.week || 1, lemCum: w.lemCum || 0, mg: w.mg || null, bt: w.bt || null, bk: w.bk || null, split: w.split || null, guru: !!w.guru }
  } catch { return null }
}

// lemCum = cumulative lemonade Money Profit (Week 2 gate); mg = the Money
// Garden checkpoint { round, cash, companies, buys, news, seen } saved after
// every round (F15) so Continue restores the exact state.
export function saveWallet({ spend, save, give, week, lemCum = 0, mg = null, bt = null, bk = null, split = null, guru = false }) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ spend, save, give, week, lemCum, mg, bt, bk, split, guru }))
    window.dispatchEvent(new Event('tayu-progress-saved')) // R12: account sync listens
  } catch { /* storage unavailable */ }
}

export function clearWallet() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}

// ---- Player profile (Round 2, B2): name + avatar persist so Continue never
// re-asks. Also carries the music-mute preference (F2). ----
const PKEY = 'tayu-profile-v1'
export function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PKEY)) || null } catch { return null }
}
export function saveProfile(patch) {
  try {
    const cur = loadProfile() || {}
    localStorage.setItem(PKEY, JSON.stringify({ ...cur, ...patch }))
    window.dispatchEvent(new Event('tayu-progress-saved')) // R12: account sync listens
  } catch { /* storage unavailable */ }
}
