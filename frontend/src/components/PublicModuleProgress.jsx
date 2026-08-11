import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useGame } from '../world/store.js'
import { isPaycheckWorldActive, PAYCHECK_MODE_EVENT } from '../world/paycheckMode.js'

const TITLES = {
  1: 'The Market & Jars',
  2: 'The Lemonade Stand',
  3: 'Budget Town',
  4: 'The Bank of TAYU',
}

export function PublicModuleProgress() {
  const { pathname } = useLocation()
  const week = useGame((state) => state.week)
  const [paycheckActive, setPaycheckActive] = useState(() => isPaycheckWorldActive())

  useEffect(() => {
    const sync = (event) => setPaycheckActive(event?.detail?.active ?? isPaycheckWorldActive())
    window.addEventListener(PAYCHECK_MODE_EVENT, sync)
    return () => window.removeEventListener(PAYCHECK_MODE_EVENT, sync)
  }, [])

  // World.jsx already owns the richer Module 5 and Module 6A/6B banners.
  if (pathname !== '/world' || paycheckActive || Number(week) >= 5 || !TITLES[week]) return null

  return (
    <div className="pointer-events-none fixed left-1/2 top-2 z-[215] w-auto max-w-[calc(100vw-7.5rem)] -translate-x-1/2 rounded-xl border border-white/20 bg-navy/90 px-3 py-1.5 text-center text-white shadow-lg backdrop-blur-sm sm:top-3 sm:w-[min(82vw,30rem)] sm:max-w-none sm:rounded-2xl sm:px-4 sm:py-2 sm:shadow-xl">
      <div className="flex items-center justify-center gap-1.5 whitespace-nowrap text-[11px] font-extrabold sm:block sm:text-[10px] sm:uppercase sm:tracking-[0.18em] sm:text-sun">
        <span className="text-sun sm:hidden">{week}/6</span>
        <span className="hidden sm:inline">Module {week} of 6</span>
        <span className="text-white sm:mt-0.5 sm:block sm:text-sm sm:normal-case sm:tracking-normal sm:text-white md:text-base">{TITLES[week]}</span>
      </div>
    </div>
  )
}
