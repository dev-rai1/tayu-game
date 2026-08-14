import { Link, useLocation } from 'react-router-dom'

export default function WorldUtilityDock() {
  const { pathname } = useLocation()
  if (pathname !== '/world') return null

  return (
    <nav
      aria-label="In-game navigation"
      className="fixed left-[calc(0.75rem+env(safe-area-inset-left,0px))] top-[calc(0.75rem+env(safe-area-inset-top,0px))] z-[1100]"
    >
      <Link
        to="/modules"
        aria-label="Back to module menu"
        className="inline-flex min-h-[46px] items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-4 text-sm font-extrabold text-slate-950 shadow-xl backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white hover:shadow-2xl active:translate-y-0"
      >
        <span aria-hidden="true">←</span>
        Module Menu
      </Link>
    </nav>
  )
}
