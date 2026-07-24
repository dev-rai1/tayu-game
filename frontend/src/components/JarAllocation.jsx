import { useRef, useState } from 'react'
import { ALLOWANCE } from '../utils/financialCalculations.js'

const JARS = [
  { key: 'spend', label: 'SPEND', emoji: '🛒', help: 'Use it now', ring: 'ring-spend', text: 'text-spend' },
  { key: 'save', label: 'SAVE', emoji: '🐷', help: 'Keep for later', ring: 'ring-save', text: 'text-save' },
  { key: 'give', label: 'GIVE', emoji: '💝', help: 'Help others', ring: 'ring-give', text: 'text-give' },
]

// Drag a coin into a jar (pointer-based, works on touch + mouse).
// +/- buttons provide a precise, accessible fallback. Must total $20 to confirm.
export default function JarAllocation({ playerName, onConfirm }) {
  const [jars, setJars] = useState({ spend: 0, save: 0, give: 0 })
  const [drag, setDrag] = useState(null) // {x,y}
  const [pop, setPop] = useState(null) // jar key that just received a coin
  const jarRefs = { spend: useRef(null), save: useRef(null), give: useRef(null) }

  const total = jars.spend + jars.save + jars.give
  const remaining = ALLOWANCE - total
  const valid = remaining === 0

  const add = (key, n = 1) => {
    setJars((j) => {
      if (remaining - n < 0) return j
      return { ...j, [key]: j[key] + n }
    })
    setPop(key)
    setTimeout(() => setPop(null), 250)
  }
  const sub = (key, n = 1) => setJars((j) => ({ ...j, [key]: Math.max(0, j[key] - n) }))

  // pointer drag of a coin from the wallet
  const onPointerDown = (e) => {
    if (remaining <= 0) return
    setDrag({ x: e.clientX, y: e.clientY })
  }
  const onPointerMove = (e) => {
    if (!drag) return
    setDrag({ x: e.clientX, y: e.clientY })
  }
  const onPointerUp = (e) => {
    if (!drag) return
    for (const k of Object.keys(jarRefs)) {
      const el = jarRefs[k].current
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        add(k, 1)
        break
      }
    }
    setDrag(null)
  }

  return (
    <div
      className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-5 p-5"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ touchAction: 'none' }}
    >
      <h1 className="text-center font-display text-2xl font-bold">
        {playerName}'s Allocation - Week 2
      </h1>
      <p className="text-center text-white/70">Drag a coin into a jar, or use the + buttons. Use all <b className="text-teal">${ALLOWANCE}</b>!</p>

      {/* Wallet with draggable coin */}
      <div className="card flex items-center gap-4 !py-4">
        <span className="text-sm text-white/60">Money left</span>
        <span className="text-3xl font-extrabold text-teal">${remaining}</span>
        <button
          onPointerDown={onPointerDown}
          disabled={remaining <= 0}
          className="grid h-14 w-14 cursor-grab touch-none select-none place-items-center rounded-full bg-yellow-400 text-2xl shadow-lg active:cursor-grabbing disabled:opacity-30"
          title="Drag me into a jar"
          aria-label="Drag coin into a jar"
        >🪙</button>
      </div>

      {/* Jars */}
      <div className="grid w-full grid-cols-3 gap-3">
        {JARS.map((jar) => (
          <div
            key={jar.key}
            ref={jarRefs[jar.key]}
            className={`card flex flex-col items-center gap-2 !p-4 ring-2 transition ${jar.ring} ${
              pop === jar.key ? 'scale-105' : ''
            }`}
          >
            <div className="text-4xl">{jar.emoji}</div>
            <div className={`font-extrabold ${jar.text}`}>{jar.label}</div>
            <div className="text-xs text-white/50">{jar.help}</div>
            <div className="text-3xl font-extrabold">${jars[jar.key]}</div>
            <div className="flex gap-2">
              <button className="h-9 w-9 rounded-full bg-white/15 text-xl font-bold hover:bg-white/25" onClick={() => sub(jar.key)} aria-label={`remove from ${jar.label}`}>−</button>
              <button className="h-9 w-9 rounded-full bg-electric text-xl font-bold text-white hover:bg-teal hover:text-navy disabled:opacity-30" onClick={() => add(jar.key)} disabled={remaining <= 0} aria-label={`add to ${jar.label}`}>+</button>
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn-primary mt-2 text-xl disabled:opacity-40"
        disabled={!valid}
        onClick={() => onConfirm(jars)}
      >
        {valid ? 'Confirm Allocation →' : `Allocate $${remaining} more`}
      </button>

      {/* floating drag coin */}
      {drag && (
        <div
          className="pointer-events-none fixed z-50 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-yellow-400 text-2xl shadow-2xl"
          style={{ left: drag.x, top: drag.y }}
        >🪙</div>
      )}
    </div>
  )
}
