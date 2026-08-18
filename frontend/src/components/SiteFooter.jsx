import { Link, useLocation } from 'react-router-dom'
import AdminDashboardButton from './AdminDashboardButton.jsx'

const PUBLIC_PATHS = new Set(['/', '/about', '/privacy', '/cookies', '/accessibility'])

export default function SiteFooter() {
  const { pathname } = useLocation()
  const showFooter = PUBLIC_PATHS.has(pathname)

  return (
    <>
      <AdminDashboardButton />
      {showFooter && (
        <footer className="relative z-[60] border-t border-navy/10 bg-white px-5 py-5 text-navy">
          <nav aria-label="Legal and support" className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-bold">
            <Link to="/privacy" className="underline-offset-4 hover:underline">Privacy</Link>
            <Link to="/cookies" className="underline-offset-4 hover:underline">Cookies & storage</Link>
            <Link to="/accessibility" className="underline-offset-4 hover:underline">Accessibility</Link>
            <a href="mailto:tayu.finance@gmail.com" className="underline-offset-4 hover:underline">Contact</a>
          </nav>
        </footer>
      )}
    </>
  )
}
