import { Link, useLocation } from 'react-router-dom'

export default function WorldUtilityDock() {
  const { pathname } = useLocation()
  if (pathname !== '/world') return null

  return (
    <nav
      aria-label="In-game navigation"
      className="fixed right-[calc(0.75rem+env(safe-area-inset-right,0px))] top-[calc(0.75rem+env(safe-area-inset-top,0px))] z-[1100]"
    >
      <Link
        to="/modules"
        aria-label="Back to module menu"
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/35 bg-navy/90 px-4 text-sm font-extrabold text-white shadow-xl backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-navy hover:shadow-2xl active:translate-y-0"
      >
        <span aria-hidden="true">☰</span>
        <span className="hidden sm:inline">Module Menu</span>
        <span className="sm:hidden">Menu</span>
      </Link>
    </nav>
  )
}
