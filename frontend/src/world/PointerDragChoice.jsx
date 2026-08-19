import { useEffect, useRef, useState } from 'react'

export function PointerDragChoice({ step, onPick }) {
  const basketRef = useRef(null)
  const dragRef = useRef(null)
  const [drag, setDrag] = useState(null)
  const [over, setOver] = useState(false)

  const insideBasket = (x, y) => {
    const r = basketRef.current?.getBoundingClientRect()
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
  }

  useEffect(() => {
    if (!drag) return undefined

    const move = (e) => {
      const current = dragRef.current
      if (!current || e.pointerId !== current.pointerId) return
      e.preventDefault?.()
      const next = { ...current, x: e.clientX, y: e.clientY }
      dragRef.current = next
      setDrag(next)
      setOver(insideBasket(e.clientX, e.clientY))
    }

    const finish = (e) => {
      const current = dragRef.current
      if (!current || e.pointerId !== current.pointerId) return
      const hit = insideBasket(e.clientX, e.clientY)
      dragRef.current = null
      setDrag(null)
      setOver(false)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      if (hit) onPick(current.i)
    }

    const cancel = (e) => {
      const current = dragRef.current
      if (!current || (e.pointerId != null && e.pointerId !== current.pointerId)) return
      dragRef.current = null
      setDrag(null)
      setOver(false)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }

    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', cancel)
    window.addEventListener('blur', cancel)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', cancel)
      window.removeEventListener('blur', cancel)
    }
  }, [drag?.pointerId, onPick])

  const start = (e, i, label) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const r = e.currentTarget.getBoundingClientRect()
    const next = {
      i,
      label,
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      offsetX: e.clientX - r.left,
      offsetY: e.clientY - r.top,
      width: r.width,
    }
    dragRef.current = next
    setDrag(next)
    setOver(insideBasket(e.clientX, e.clientY))
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  return (
    <div className="mt-5 grid gap-4 md:grid-cols-[1fr_.8fr]" style={{ touchAction: 'none' }}>
      <div className="grid gap-2">
        {step.choices.map((c, i) => {
          const active = drag?.i === i
          return (
            <button
              type="button"
              key={c.label}
              aria-label={`Drag ${c.label} to the answer basket`}
              onPointerDown={(e) => start(e, i, c.label)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onPick(i)
                }
              }}
              className={`touch-none rounded-2xl border-2 px-4 py-3 text-left font-bold text-navy shadow-sm transition ${active ? 'border-[#f4b942] bg-[#fff8df] opacity-45' : 'cursor-grab border-navy/10 bg-[#fffaf0] hover:-translate-y-0.5 hover:shadow-md active:scale-[.99]'}`}
            >
              <span className="mr-2 inline-block text-navy/35">⠿</span>{c.label}
            </button>
          )
        })}
      </div>

      <div
        ref={basketRef}
        className={`grid min-h-[168px] place-items-center rounded-[26px] border-[3px] border-dashed p-5 text-center transition duration-150 ${over ? 'scale-[1.04] border-[#f4b942] bg-[#fff0bd] shadow-[0_0_0_8px_rgba(244,185,66,.18)]' : 'border-navy/20 bg-white/55'}`}
      >
        <div>
          <div className={`text-4xl transition ${over ? 'scale-125' : ''}`}>🧺</div>
          <div className="mt-2 font-black text-navy">{over ? 'Release to choose' : 'Drag your answer here'}</div>
          <div className="text-xs font-bold text-navy/45">The answer card should physically follow your mouse or finger.</div>
        </div>
      </div>

      {drag && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[9999] rounded-2xl border-2 border-[#f4b942] bg-white px-4 py-3 font-bold text-navy shadow-[0_22px_60px_rgba(0,0,0,.35)] ring-4 ring-[#f4b942]/20"
          style={{
            left: drag.x - drag.offsetX,
            top: drag.y - drag.offsetY,
            width: drag.width,
            transform: `rotate(${Math.max(-4, Math.min(4, (drag.x - window.innerWidth / 2) / 100))}deg) scale(1.035)`,
            willChange: 'left, top, transform',
          }}
        >
          <span className="mr-2 inline-block text-navy/35">⠿</span>{drag.label}
        </div>
      )}
    </div>
  )
}
