import { useState } from 'react'

// "?" icon present on every major control. Tap/hover to reveal context help.
export default function HelpTooltip({ text, label = 'Help' }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-block">
      <button
        aria-label={label}
        className="grid h-6 w-6 place-items-center rounded-full bg-white/20 text-xs font-bold"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
      >
        ?
      </button>
      {open && (
        <span className="absolute z-10 mt-2 w-56 -translate-x-1/2 rounded-xl bg-black/90 p-3 text-sm text-white shadow-xl">
          {text}
        </span>
      )}
    </span>
  )
}
