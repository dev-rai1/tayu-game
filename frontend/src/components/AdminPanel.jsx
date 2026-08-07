// ROUND 8 (7.3): THE SIMPLIFIED ADMIN PANEL.
// A low-key Admin button on every screen, password-gated (tayu1234).
// SOLID opaque gray background, and exactly THREE working controls:
//   1. Skip module  2. Week back / forward  3. Add money
// Everything else from Round 6 (fast-forward, auto-play, set name, unlock
// all, reset) is gone by design.
import { useState, useEffect } from 'react'
import { useGame } from '../world/store.js'
import { currentUser } from '../services/auth.js'

const ADMIN_PW = 'tayu1234'
let adminUnlocked = false // memory only - re-locks on every reload

const B = 'min-h-[44px] rounded-lg px-3 text-sm font-bold transition active:scale-95 disabled:opacity-40'

export function AdminPanel({ showButton = true }) {
  const [open, setOpen] = useState(false)
  const [asking, setAsking] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [money, setMoney] = useState('')
  const [err, setErr] = useState(null)
  const [, force] = useState(0)

  const g = () => useGame.getState()
  const rerender = () => force((v) => v + 1)
  const guard = (fn) => () => {
    try { setErr(null); fn(); rerender() } catch (e) { setErr(String(e?.message || e)) }
  }

  const onAdminClick = () => {
    if (adminUnlocked) { setOpen(true); return }
    setAsking(true); setPw(''); setPwError(false)
  }
  // R10 v8 6.3: on kid-facing screens the button is GONE; teachers open the
  // gate with 5 quick taps on the TAYU logo (Hud dispatches this event).
  useEffect(() => {
    const openGate = () => onAdminClick()
    window.addEventListener('tayu-admin-gesture', openGate)
    return () => window.removeEventListener('tayu-admin-gesture', openGate)
  }, [])
  const tryPw = () => {
    if (pw === ADMIN_PW) { adminUnlocked = true; setAsking(false); setOpen(true) }
    else setPwError(true)
  }

  // 1) module navigation. The Party Area is the sixth and final admin stop.
  const moduleStep = open && adminUnlocked
    ? (g().gameComplete && g().objective === 'party' ? 6 : g().week)
    : 1
  const moduleBack = guard(() => {
    const step = g().gameComplete && g().objective === 'party' ? 6 : g().week
    if (step > 1) g().adminJumpModule(step - 1)
  })
  const moduleForward = guard(() => {
    const step = g().gameComplete && g().objective === 'party' ? 6 : g().week
    if (step < 6) g().adminJumpModule(step + 1)
  })

  // 2) one week back / forward inside the current module
  const wkInfo = open && adminUnlocked ? (() => { try { return g().adminCurrentWeek() } catch { return { n: 1, max: 1 } } })() : { n: 1, max: 1 }
  const jumpWeek = (d) => guard(() => g().adminJumpWeek(Math.max(1, Math.min(wkInfo.max, wkInfo.n + d))))()

  // 3) add money to whatever wallet the current module uses
  const addMoney = guard(() => {
    const amt = Math.max(0, Number(money) || 0)
    if (!amt) return
    const s = g()
    const current = s.week === 5 && s.mg ? s.mg.cash
      : s.week === 4 && s.bk ? s.bk.savings
      : s.allocations.save
    s.adminSetMoney(current + amt)
    setMoney('')
  })

  return (
    <>
      {showButton && (
        <button
          onClick={onAdminClick}
          aria-label="Admin access for teachers"
          className="fixed z-[1000] min-h-[44px] max-w-[calc(100vw-1.5rem)] rounded-xl border border-white/50 bg-black/75 px-3 py-2 text-xs font-extrabold text-white shadow-xl transition hover:bg-black hover:text-white"
          style={{
            right: 'max(12px, env(safe-area-inset-right, 0px))',
            bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          Admin
        </button>
      )}

      {asking && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/70 p-4" onClick={() => setAsking(false)}>
          <div className="w-full max-w-xs rounded-xl p-4 font-mono text-white" style={{ background: '#4A4A4A' }} onClick={(e) => e.stopPropagation()}>
            <div className="text-xs font-bold tracking-widest text-white">ADMIN ACCESS</div>
            <input
              type="password" autoFocus value={pw}
              onChange={(e) => { setPw(e.target.value); setPwError(false) }}
              onKeyDown={(e) => e.key === 'Enter' && tryPw()}
              placeholder="Password"
              className="mt-2 w-full rounded-lg border border-white/30 bg-black/30 px-3 py-2 text-sm text-white outline-none"
            />
            {pwError && <div className="mt-1 text-xs text-red-300">Incorrect password</div>}
            <div className="mt-3 flex gap-2">
              <button className={`${B} flex-1 bg-white/20 text-white`} onClick={() => setAsking(false)}>Cancel</button>
              <button className={`${B} flex-1 bg-white text-black`} onClick={tryPw}>Unlock</button>
            </div>
          </div>
        </div>
      )}

      {open && adminUnlocked && (
        <div
          className="fixed z-[1001] max-h-[calc(100dvh-1.5rem)] w-[min(300px,calc(100vw-1.5rem))] overflow-y-auto rounded-xl p-4 font-mono text-white shadow-2xl"
          style={{
            background: '#4A4A4A',
            right: 'max(12px, env(safe-area-inset-right, 0px))',
            bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-bold tracking-widest">ADMIN</div>
            <button className="min-h-[44px] rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold active:scale-95" onClick={() => setOpen(false)}>Close</button>
          </div>

          <div className="mt-3 text-[11px] font-bold text-white/70">
            {moduleStep === 6 ? 'PARTY AREA 6 of 6' : `MODULE ${moduleStep} of 6`}
          </div>
          {currentUser()?.role === 'admin' && (
            <a href="/dashboard" className="mt-2 grid min-h-[44px] place-items-center rounded-lg bg-teal px-3 text-center text-sm font-bold text-navy">
              View player data
            </a>
          )}
          <div className="mt-1 flex gap-2">
            <button className={`${B} min-w-0 flex-1 bg-white/20`} disabled={moduleStep <= 1} onClick={moduleBack}>&lt; Module</button>
            <button className={`${B} min-w-0 flex-1 bg-white text-black`} disabled={moduleStep >= 6} onClick={moduleForward}>
              {moduleStep === 5 ? 'Party >' : 'Module >'}
            </button>
          </div>

          <div className="mt-3 text-[11px] font-bold text-white/70">WEEK {wkInfo.n} of {wkInfo.max}</div>
          <div className="mt-1 flex gap-2">
            <button className={`${B} min-w-0 flex-1 bg-white/20`} disabled={wkInfo.n <= 1 || moduleStep === 6} onClick={() => jumpWeek(-1)}>&lt; Week back</button>
            <button className={`${B} min-w-0 flex-1 bg-white/20`} disabled={wkInfo.n >= wkInfo.max || moduleStep === 6} onClick={() => jumpWeek(+1)}>Week forward &gt;</button>
          </div>

          <div className="mt-3 text-[11px] font-bold text-white/70">ADD MONEY</div>
          <div className="mt-1 flex gap-2">
            <input
              value={money} inputMode="numeric"
              onChange={(e) => setMoney(e.target.value.replace(/[^0-9.]/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && addMoney()}
              placeholder="$"
              className="w-20 min-w-0 rounded-lg border border-white/30 bg-black/30 px-2 py-2 text-sm text-white outline-none"
            />
            <button className={`${B} min-w-0 flex-1 bg-white text-black`} onClick={addMoney}>Add</button>
          </div>

          {err && <div className="mt-2 rounded bg-red-900/60 px-2 py-1 text-[11px] text-red-100">{err}</div>}
        </div>
      )}
    </>
  )
}
