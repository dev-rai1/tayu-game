import { useEffect, useState } from 'react'
import { useGame } from '../world/store.js'
import { isPaycheckWorldActive, PAYCHECK_MODE_EVENT } from '../world/paycheckMode.js'

const TITLES = {
  1: 'The Market & Jars',
  2: 'The Lemonade Stand',
  3: 'Budget Town',
  4: 'The Bank of TAYU',
}

export function PublicModuleProgress() {
  const week = useGame((state) => state.week)
  const [paycheckActive, setPaycheckActive] = useState(() => isPaycheckWorldActive())

  useEffect(() => {
    const sync = (event) => setPaycheckActive(event?.detail?.active ?? isPaycheckWorldActive())
    window.addEventListener(PAYCHECK_MODE_EVENT, sync)
    return () => window.removeEventListener(PAYCHECK_MODE_EVENT, sync)
  }, [])

  // World.jsx already owns the richer Module 5 and Module 6A/6B banners.
  if (paycheckActive || Number(week) >= 5 || !TITLES[week]) return null

  return (
    <div className="pointer-events-none fixed left-1/2 top-3 z-[215] w-[min(82vw,30rem)] -translate-x-1/2 rounded-2xl border border-white/25 bg-navy/92 px-4 py-2 text-center text-white shadow-xl backdrop-blur-sm">
      <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-sun">Module {week} of 6</div>
      <div className="text-sm font-extrabold sm:text-base">{TITLES[week]}</div>
    </div>
  )
}
