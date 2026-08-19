// Teacher/demo admin controls. Public module numbering is:
// 1 Market & Jars, 2 Lemonade, 3 Budget, 4 Bank,
// 5 Money Garden, 6 Paycheck Planet, 7 Finale.
import { useState, useEffect } from 'react'
import { useGame } from '../world/store.js'
import { isPaycheckWorldActive } from '../world/paycheckMode.js'
import { currentUser } from '../services/auth.js'

const ADMIN_PW = 'tayu1234'
let adminUnlocked = false

const B = 'min-h-[44px] rounded-lg px-3 text-sm font-bold transition active:scale-95 disabled:opacity-40'
const MODULE_NAME = {
  1: 'Market & Jars',
  2: 'Lemonade Stand',
  3: 'Budget Town',
  4: 'Bank of TAYU',
  5: 'Money Garden',
  6: 'Paycheck Planet',
  7: 'Finale Area',
}

function publicModuleStep(state) {
  if (isPaycheckWorldActive()) return 6
  if (state.gameComplete && state.objective === 'party') return 7
  if (state.week === 5) return 5
  return Math.max(1, Math.min(4, Number(state.week || 1)))
}

function openPublicModule(step) {
  localStorage.setItem('tayu-jump-module', String(step))
  window.location.href = '/world'
}

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

  useEffect(() => {
    const openGate = () => onAdminClick()
    window.addEventListener('tayu-admin-gesture', openGate)
    return () => window.removeEventListener('tayu-admin-gesture', openGate)
  }, [])

  const tryPw = () => {
    if (pw === ADMIN_PW) { adminUnlocked = true; setAsking(false); setOpen(true) }
    else setPwError(true)
  }

  const moduleStep = open && adminUnlocked ? publicModuleStep(g()) : 1
  const moduleBack = guard(() => { if (moduleStep > 1) openPublicModule(moduleStep - 1) })
  const moduleForward = guard(() => { if (moduleStep < 7) openPublicModule(moduleStep + 1) })

  const wkInfo = open && adminUnlocked && moduleStep !== 6 && moduleStep !== 7
    ? (() => { try { return g().adminCurrentWeek() } catch { return { n: 1, max: 1 } } })()
    : { n: 1, max: 1 }
  const jumpWeek = (d) => guard(() => g().adminJumpWeek(Math.max(1, Math.min(wkInfo.max, wkInfo.n + d))))()

  // Skip just the current interaction without jumping the whole week/module.
  // Late-game Bond/Tax modules are explicitly step-driven; earlier modules
  // commonly expose their next progression action on the current card.
  const skipCurrentStep = guard(() => {
    const s = g()
    if (s.week === 6 && typeof s.pushBondStep === 'function') {
      s.adminClearUi?.()
      s.pushBondStep((s.bondStep || 0) + 1)
      return
    }
    if (s.week === 7 && typeof s.pushTaxStep === 'function') {
      s.adminClearUi?.()
      s.pushTaxStep((s.taxStep || 0) + 1)
      return
    }
    const card = s.cards?.[0]
    const action = card?.buttons?.find((button) => button?.act)?.act
    if (action && typeof s.cardAct === 'function') {
      s.cardAct(action)
      return
    }
    throw new Error('No skippable step is active right now.')
  })

  const addMoney = guard(() => {
    if (moduleStep === 6 || moduleStep === 7) return
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
          className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] right-[calc(0.75rem+env(safe-area-inset-right,0px))] z-[1000] min-h-[42px] rounded-2xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 shadow-lg transition hover:-translate-y-0.5 hover:text-slate-950 hover:shadow-xl active:translate-y-0"
        >
          TAYU Admin
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
          className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] right-[calc(0.75rem+env(safe-area-inset-right,0px))] z-[1001] max-h-[calc(100dvh-5.5rem)] w-[320px] max-w-[calc(100vw-24px)] overflow-y-auto rounded-2xl border border-white/15 p-4 font-mono text-white shadow-2xl"
          style={{ background: '#4A4A4A' }}
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold tracking-widest">ADMIN</div>
            <button className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold active:scale-95" onClick={() => setOpen(false)}>Close</button>
          </div>

          <div className="mt-3 text-[11px] font-bold text-white/70">MODULE {moduleStep} of 7</div>
          <div className="mt-1 text-sm font-extrabold text-white">{MODULE_NAME[moduleStep]}</div>
          {currentUser()?.role === 'admin' && (
            <a href="/dashboard" className="mt-2 grid min-h-[44px] place-items-center rounded-lg bg-teal px-3 text-sm font-bold text-navy">View player data</a>
          )}
          <div className="mt-2 flex gap-2">
            <button className={`${B} flex-1 bg-white/20`} disabled={moduleStep <= 1} onClick={moduleBack}>&lt; Module</button>
            <button className={`${B} flex-1 bg-white text-black`} disabled={moduleStep >= 7} onClick={moduleForward}>
              {moduleStep === 6 ? 'Finale >' : 'Module >'}
            </button>
          </div>

          <div className="mt-3 text-[11px] font-bold text-white/70">CURRENT ACTIVITY</div>
          <button className={`${B} mt-1 w-full bg-teal text-navy`} onClick={skipCurrentStep}>Skip current step &gt;</button>
          <div className="mt-1 text-[10px] leading-snug text-white/55">Moves to the next interaction inside the current week without skipping the entire module.</div>

          <div className="mt-3 text-[11px] font-bold text-white/70">
            {moduleStep === 6 ? 'PAYCHECK PLANET: IN-WORLD ACTIVITY' : moduleStep === 7 ? 'FINALE' : `WEEK ${wkInfo.n} of ${wkInfo.max}`}
          </div>
          <div className="mt-1 flex gap-2">
            <button className={`${B} flex-1 bg-white/20`} disabled={wkInfo.n <= 1 || moduleStep === 6 || moduleStep === 7} onClick={() => jumpWeek(-1)}>&lt; Week back</button>
            <button className={`${B} flex-1 bg-white/20`} disabled={wkInfo.n >= wkInfo.max || moduleStep === 6 || moduleStep === 7} onClick={() => jumpWeek(+1)}>Week forward &gt;</button>
          </div>

          <div className="mt-3 text-[11px] font-bold text-white/70">ADD MONEY</div>
          {moduleStep === 6 ? (
            <div className="mt-1 rounded-lg bg-white/10 px-3 py-2 text-[11px] text-white/70">Paycheck Planet uses its own animated practice paycheck, so no admin money override is needed.</div>
          ) : (
            <div className="mt-1 flex gap-2">
              <input
                value={money} inputMode="numeric"
                onChange={(e) => setMoney(e.target.value.replace(/[^0-9.]/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && addMoney()}
                placeholder="$"
                disabled={moduleStep === 7}
                className="w-20 rounded-lg border border-white/30 bg-black/30 px-2 py-2 text-sm text-white outline-none disabled:opacity-40"
              />
              <button className={`${B} flex-1 bg-white text-black`} disabled={moduleStep === 7} onClick={addMoney}>Add</button>
            </div>
          )}

          {err && <div className="mt-2 rounded bg-red-900/60 px-2 py-1 text-[11px] text-red-100">{err}</div>}
        </div>
      )}
    </>
  )
}
