import { useLocation } from 'react-router-dom'

export const JUMPSTART_URL = 'https://jumpstartclearinghouse.org/resource/tayu-financial-literacy-app/'

const GAME_PATHS = new Set([
  '/avatar',
  '/world',
  '/modules',
  '/guru',
  '/path-complete',
  '/missions',
])

export default function JumpstartRecognition() {
  const { pathname } = useLocation()
  const show = GAME_PATHS.has(pathname) || pathname.startsWith('/assessment/')

  if (!show) return null

  return (
    <a
      href={JUMPSTART_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="TAYU is featured in the Jump$tart Clearinghouse. View the official listing."
      className="fixed left-1/2 top-2 z-[650] -translate-x-1/2 rounded-full border border-teal/40 bg-navy/90 px-3 py-1.5 text-center text-[10px] font-extrabold uppercase tracking-wide text-white shadow-lg backdrop-blur-md transition hover:bg-navy sm:text-xs"
    >
      Featured in Jump$tart Clearinghouse
    </a>
  )
}
