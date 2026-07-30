// Touch-first controls for phones and tablets.
// Keep the movement control inside a visible, bounded pad so it never blocks
// unrelated HUD buttons or lesson panels on small screens.
import { useEffect, useRef, useState } from 'react'
import { joystick, useGame } from './store.js'
import { isFrozen } from './Player.jsx'

const MAX_R = 42
const DEAD = 0.12
const SAFE_BOTTOM = 'calc(18px + env(safe-area-inset-bottom, 0px))'

function FloatingStick({ frozen }) {
  const [stick, setStick] = useState({ kx: 0, ky: 0, active: false, springing: false })
  const drag = useRef(null)
  const zone = useRef()

  useEffect(() => {
    if (!frozen) return
    joystick.x = 0
    joystick.y = 0
    drag.current = null
    setStick({ kx: 0, ky: 0, active: false, springing: false })
  }, [frozen])

  const reset = () => {
    drag.current = null
    joystick.x = 0
    joystick.y = 0
    setStick((current) => ({ ...current, kx: 0, ky: 0, active: false, springing: true }))
    window.setTimeout(() => {
      setStick((current) => ({ ...current, springing: false }))
    }, 180)
  }

  const onDown = (e) => {
    if (frozen || drag.current) return
    e.preventDefault()
    const rect = zone.current.getBoundingClientRect()
    const ox = rect.left + rect.width / 2
    const oy = rect.top + rect.height / 2
    drag.current = { id: e.pointerId, ox, oy }
    try { zone.current.setPointerCapture(e.pointerId) } catch { /* pointer already gone */ }
    setStick({ kx: 0, ky: 0, active: true, springing: false })
    onMove(e, { id: e.pointerId, ox, oy })
  }

  const onMove = (e, override) => {
    const d = override || drag.current
    if (!d || e.pointerId !== d.id) return
    e.preventDefault()
    let dx = e.clientX - d.ox
    let dy = e.clientY - d.oy
    const len = Math.hypot(dx, dy)
    if (len > MAX_R) {
      dx = (dx / len) * MAX_R
      dy = (dy / len) * MAX_R
    }
    let jx = dx / MAX_R
    let jy = -dy / MAX_R
    if (Math.hypot(jx, jy) < DEAD) {
      jx = 0
      jy = 0
    }
    joystick.x = jx
    joystick.y = jy
    setStick({ kx: dx, ky: dy, active: true, springing: false })
  }

  const onUp = (e) => {
    const d = drag.current
    if (!d || e.pointerId !== d.id) return
    reset()
  }

  const moveByButton = (x, y) => {
    if (frozen) return
    joystick.x = x
    joystick.y = y
  }

  return (
    <div
      className="fixed left-3 z-[95] select-none"
      style={{ bottom: SAFE_BOTTOM }}
      aria-label="Movement controls"
    >
      <div className="mb-1 text-center text-[11px] font-extrabold uppercase tracking-wide text-white/90">Move</div>
      <div
        ref={zone}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="relative h-[132px] w-[132px] rounded-full border-2 border-white/35 bg-navy/55 shadow-xl backdrop-blur-sm"
        style={{
          touchAction: 'none',
          pointerEvents: frozen ? 'none' : 'auto',
          opacity: frozen ? 0.35 : 1,
        }}
      >
        <span className="absolute left-1/2 top-1 -translate-x-1/2 text-lg text-white/70" aria-hidden>▲</span>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-lg text-white/70" aria-hidden>▼</span>
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-lg text-white/70" aria-hidden>◀</span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-lg text-white/70" aria-hidden>▶</span>
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal shadow-lg"
          style={{
            transform: `translate(calc(-50% + ${stick.kx}px), calc(-50% + ${stick.ky}px))`,
            transition: stick.springing ? 'transform 0.18s cubic-bezier(0.22,1,0.36,1)' : 'none',
          }}
          aria-hidden
        />
      </div>

      {/* Screen-reader and switch-control fallback. These stay visually hidden but
          provide clear directional actions for users who cannot drag precisely. */}
      <div className="sr-only">
        <button type="button" onPointerDown={() => moveByButton(0, 1)} onPointerUp={reset} onPointerCancel={reset}>Move forward</button>
        <button type="button" onPointerDown={() => moveByButton(0, -1)} onPointerUp={reset} onPointerCancel={reset}>Move backward</button>
        <button type="button" onPointerDown={() => moveByButton(-1, 0)} onPointerUp={reset} onPointerCancel={reset}>Move left</button>
        <button type="button" onPointerDown={() => moveByButton(1, 0)} onPointerUp={reset} onPointerCancel={reset}>Move right</button>
      </div>
    </div>
  )
}

function ActionButton({ frozen }) {
  const near = useGame((s) => s.near)
  const active = !!near && !frozen

  const act = () => {
    if (active) window.dispatchEvent(new Event('tayu-interact'))
  }

  return (
    <div
      className="fixed z-[100] text-center"
      style={{
        right: 'calc(12px + env(safe-area-inset-right, 0px))',
        bottom: SAFE_BOTTOM,
        pointerEvents: 'none',
      }}
    >
      <div
        id="tayu-action-label"
        aria-live="polite"
        className="mb-2 max-w-[190px] rounded-2xl bg-navy/90 px-3 py-2 text-sm font-extrabold leading-tight text-white shadow-lg"
      >
        {active ? near.label : 'Move near a glowing person or place'}
      </div>
      <button
        type="button"
        aria-label={active ? near.label : 'No action available yet'}
        aria-describedby="tayu-action-label"
        disabled={!active}
        onClick={act}
        className={`inline-flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 text-base font-black shadow-xl transition active:scale-95 disabled:cursor-not-allowed ${active ? 'tayu-action-pulse border-sun bg-electric text-white' : 'border-white/30 bg-navy/70 text-white/60'}`}
        style={{
          pointerEvents: 'auto',
          touchAction: 'manipulation',
          opacity: frozen ? 0.25 : 1,
        }}
      >
        DO
      </button>
    </div>
  )
}

export function MobileControls() {
  const frozen = useGame(isFrozen)
  const [hint, setHint] = useState(() => !localStorage.getItem('tayu-pad-hint3'))

  useEffect(() => {
    if (!hint) return
    const t = window.setTimeout(() => {
      setHint(false)
      localStorage.setItem('tayu-pad-hint3', '1')
    }, 7000)
    return () => window.clearTimeout(t)
  }, [hint])

  return (
    <>
      <FloatingStick frozen={frozen} />
      <ActionButton frozen={frozen} />
      {hint && !frozen && (
        <div
          role="status"
          className="glass--navy fixed left-1/2 z-[96] w-[min(88vw,320px)] -translate-x-1/2 rounded-2xl px-4 py-3 text-center text-sm font-bold text-white shadow-xl"
          style={{ bottom: 'calc(166px + env(safe-area-inset-bottom, 0px))' }}
        >
          Drag the visible pad to walk. Tap <b className="text-sun">DO</b> when you reach a glowing person or place.
        </div>
      )}
    </>
  )
}
