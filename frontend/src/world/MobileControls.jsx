// R10 v8 SECTION 1: THE TOUCH CONTROL SYSTEM.
// - FLOATING thumbstick: appears wherever the child first touches the left
//   half of the screen (small hands never reach for a fixed spot). Outer ring
//   Deep Navy at 30%, knob Teal, springs back in ~180ms, 12% dead zone.
// - ACTION BUTTON bottom-right: 68px Electric Blue, context label above it,
//   pulses Gold when an interactable is in range. Fires the same
//   'tayu-interact' event the E key uses.
// - A quick tap in the stick zone falls through to tap-to-move (a
//   'tayu-ground-tap' event Player.jsx raycasts), so cause-and-effect
//   walking still works for the youngest players.
// All bottom offsets respect the home-bar safe area.
import { useEffect, useRef, useState } from 'react'
import { joystick } from './store.js'
import { useGame } from './store.js'
import { isFrozen } from './Player.jsx'

// Capability-based detection (v8 1.0): a touchscreen laptop gets touch
// controls too. Never decide by screen size.
export const isTouch = typeof window !== 'undefined' && (
  navigator.maxTouchPoints > 0 ||
  'ontouchstart' in window ||
  (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
  new URLSearchParams(window.location.search).has('touch') // QA override
)

const MAX_R = 48 // knob travel
const DEAD = 0.12 // resting-thumb dead zone (v8 1.1)
const SAFE_BOTTOM = 'calc(18px + env(safe-area-inset-bottom, 0px))'

function FloatingStick({ frozen }) {
  const [stick, setStick] = useState(null) // { ox, oy, kx, ky, springing }
  const drag = useRef(null) // { id, ox, oy, t0, moved }
  const zone = useRef()

  useEffect(() => {
    if (frozen) { joystick.x = 0; joystick.y = 0; drag.current = null; setStick(null) }
  }, [frozen])

  const onDown = (e) => {
    if (drag.current) return
    e.preventDefault()
    drag.current = { id: e.pointerId, ox: e.clientX, oy: e.clientY, t0: performance.now(), moved: 0 }
    try { zone.current.setPointerCapture(e.pointerId) } catch { /* pointer already gone - fine */ }
    setStick({ ox: e.clientX, oy: e.clientY, kx: 0, ky: 0, springing: false })
  }
  const onMove = (e) => {
    const d = drag.current
    if (!d || e.pointerId !== d.id) return
    let dx = e.clientX - d.ox, dy = e.clientY - d.oy
    const len = Math.hypot(dx, dy)
    d.moved = Math.max(d.moved, len)
    if (len > MAX_R) { dx = (dx / len) * MAX_R; dy = (dy / len) * MAX_R }
    let jx = dx / MAX_R, jy = -dy / MAX_R
    if (Math.hypot(jx, jy) < DEAD) { jx = 0; jy = 0 } // resting thumb never drifts
    joystick.x = jx
    joystick.y = jy
    setStick((s) => (s ? { ...s, kx: dx, ky: dy, springing: false } : s))
  }
  const onUp = (e) => {
    const d = drag.current
    if (!d || e.pointerId !== d.id) return
    drag.current = null
    joystick.x = 0; joystick.y = 0
    // a quick, small touch = the child meant "walk THERE" (tap-to-move)
    if (d.moved < 10 && performance.now() - d.t0 < 350) {
      window.dispatchEvent(new CustomEvent('tayu-ground-tap', { detail: { x: e.clientX, y: e.clientY } }))
      setStick(null)
      return
    }
    setStick((s) => (s ? { ...s, kx: 0, ky: 0, springing: true } : s))
    setTimeout(() => setStick(null), 200)
  }

  return (
    <>
      {/* the invisible spawn zone: bottom-left area of the screen */}
      <div
        ref={zone}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{
          position: 'fixed', left: 0, bottom: 0, width: '45vw', height: '55vh',
          zIndex: 90, touchAction: 'none',
          pointerEvents: frozen ? 'none' : 'auto',
        }}
        aria-hidden
      />
      {/* the stick itself, spawned under the thumb */}
      {stick && !frozen && (
        <div style={{ position: 'fixed', left: stick.ox, top: stick.oy, zIndex: 91, pointerEvents: 'none', transform: 'translate(-50%, -50%)' }}>
          <div style={{
            width: 108, height: 108, borderRadius: '50%',
            background: 'rgba(7,23,72,0.30)', border: '2px solid rgba(255,255,255,0.25)',
            position: 'absolute', left: -54, top: -54,
          }} />
          <div style={{
            position: 'absolute', left: -21, top: -21, width: 42, height: 42, borderRadius: '50%',
            background: '#00DCA0', boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
            transform: `translate(${stick.kx}px, ${stick.ky}px)`,
            transition: stick.springing ? 'transform 0.18s cubic-bezier(0.22,1,0.36,1)' : 'none',
          }} />
        </div>
      )}
    </>
  )
}

// the big blue DO button - the one act channel on touch (v8 1.2)
function ActionButton({ frozen }) {
  const near = useGame((s) => s.near)
  const active = !!near && !frozen
  return (
    <div style={{ position: 'fixed', right: 'calc(16px + env(safe-area-inset-right, 0px))', bottom: SAFE_BOTTOM, zIndex: 95, textAlign: 'center', pointerEvents: 'none' }}>
      {/* context label: the child always knows what the button will do */}
      {active && (
        <div className="pop-in" style={{
          marginBottom: 8, maxWidth: 190, padding: '8px 12px', borderRadius: 14,
          background: 'rgba(7,23,72,0.88)', color: '#fff', fontSize: 13, fontWeight: 800, lineHeight: 1.25,
        }}>
          {near.label}
        </div>
      )}
      <button
        aria-label={active ? near.label : 'Action button'}
        onPointerDown={(e) => { e.preventDefault(); if (active) window.dispatchEvent(new Event('tayu-interact')) }}
        className={active ? 'tayu-action-pulse' : ''}
        style={{
          width: active ? 64 : 44, height: active ? 64 : 44, borderRadius: '50%', border: 'none',
          background: '#1464F0', color: '#fff',
          opacity: frozen ? 0 : active ? 1 : 0.3,
          pointerEvents: frozen ? 'none' : 'auto',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(7,23,72,0.35)',
          transition: 'opacity 0.2s, width 0.2s, height 0.2s',
          touchAction: 'none',
        }}
      >
        {/* a simple tap-hand icon, no text needed */}
        <svg width={active ? 30 : 20} height={active ? 30 : 20} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="4.6" stroke="#fff" strokeWidth="2.2" />
          <path d="M12 2.5v3.4M12 18.1v3.4M2.5 12h3.4M18.1 12h3.4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

export function MobileControls() {
  const frozen = useGame(isFrozen)
  const [hint, setHint] = useState(() => !localStorage.getItem('tayu-pad-hint2'))
  useEffect(() => {
    if (!hint) return
    const t = setTimeout(() => { setHint(false); localStorage.setItem('tayu-pad-hint2', '1') }, 6000)
    return () => clearTimeout(t)
  }, [hint])
  return (
    <>
      <FloatingStick frozen={frozen} />
      <ActionButton frozen={frozen} />
      {hint && !frozen && (
        <div className="glass--navy" style={{
          position: 'fixed', left: 16, bottom: `calc(96px + env(safe-area-inset-bottom, 0px))`, zIndex: 92,
          width: 200, padding: '10px 12px', borderRadius: 14, fontSize: 13, fontWeight: 700, color: '#fff',
        }}>
          Touch here and drag to walk. Or just tap the ground!
        </div>
      )}
    </>
  )
}
