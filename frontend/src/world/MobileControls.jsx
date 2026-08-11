// Touch-first controls for phones and tablets.
// Keep the permanent controls compact on narrow phones so the game world stays
// visually dominant. First-time movement guidance is handled by the shared coach.
import { useEffect, useRef, useState } from 'react'
import { joystick, useGame } from './store.js'
import { isFrozen } from './Player.jsx'

const MAX_R = 42
const DEAD = 0.12
const SAFE_BOTTOM = 'calc(14px + env(safe-area-inset-bottom, 0px))'

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
      className="fixed left-2.5 z-[95] select-none sm:left-3"
      style={{ bottom: SAFE_BOTTOM }}
      aria-label="Movement controls"
    >
      <div className="mb-1 text-center text-[10px] font-extrabold uppercase tracking-wide text-white/85 sm:text-[11px]">Move</div>
      <div
        ref={zone}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="relative h-[112px] w-[112px] rounded-full border-2 border-white/35 bg-navy/55 shadow-lg backdrop-blur-sm sm:h-[132px] sm:w-[132px] sm:shadow-xl"
        style={{
          touchAction: 'none',
          pointerEvents: frozen ? 'none' : 'auto',
          opacity: frozen ? 0.35 : 1,
        }}
      >
        <span className="absolute left-1/2 top-0.5 -translate-x-1/2 text-base text-white/65 sm:top-1 sm:text-lg" aria-hidden>▲</span>
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-base text-white/65 sm:bottom-1 sm:text-lg" aria-hidden>▼</span>
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-base text-white/65 sm:left-2 sm:text-lg" aria-hidden>◀</span>
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-base text-white/65 sm:right-2 sm:text-lg" aria-hidden>▶</span>
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal shadow-lg sm:h-12 sm:w-12"
          style={{
            transform: `translate(calc(-50% + ${stick.kx}px), calc(-50% + ${stick.ky}px))`,
            transition: stick.springing ? 'transform 0.18s cubic-bezier(0.22,1,0.36,1)' : 'none',
          }}
          aria-hidden
        />
      </div>

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
        right: 'calc(10px + env(safe-area-inset-right, 0px))',
        bottom: SAFE_BOTTOM,
        pointerEvents: 'none',
      }}
    >
      {active && (
        <div
          id="tayu-action-label"
          aria-live="polite"
          className="mb-1.5 max-w-[150px] rounded-xl bg-navy/88 px-2.5 py-1.5 text-xs font-extrabold leading-tight text-white shadow-md sm:mb-2 sm:max-w-[190px] sm:rounded-2xl sm:px-3 sm:py-2 sm:text-sm sm:shadow-lg"
        >
          {near.label}
        </div>
      )}
      <button
        type="button"
        aria-label={active ? near.label : 'No action available yet'}
        aria-describedby={active ? 'tayu-action-label' : undefined}
        disabled={!active}
        onClick={act}
        className={`inline-flex h-16 w-16 items-center justify-center rounded-full border-[3px] text-sm font-black shadow-lg transition active:scale-95 disabled:cursor-not-allowed sm:h-[72px] sm:w-[72px] sm:border-4 sm:text-base sm:shadow-xl ${active ? 'tayu-action-pulse border-sun bg-electric text-white' : 'border-white/25 bg-navy/65 text-white/55'}`}
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

  return (
    <>
      <FloatingStick frozen={frozen} />
      <ActionButton frozen={frozen} />
    </>
  )
}
