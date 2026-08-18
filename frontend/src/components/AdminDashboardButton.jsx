import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { currentUser } from '../services/auth.js'

export default function AdminDashboardButton() {
  const [user, setUser] = useState(() => currentUser())
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const refresh = () => setUser(currentUser())
    window.addEventListener('tayu-auth-changed', refresh)
    return () => window.removeEventListener('tayu-auth-changed', refresh)
  }, [])

  if (!user || user.role !== 'admin' || pathname === '/dashboard') return null

  return (
    <div
      className="fixed right-3 z-[1600] flex flex-col items-end gap-2"
      style={{ bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
    >
      {open && (
        <section
          className="h-[min(68vh,620px)] w-[min(94vw,520px)] overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl"
          aria-label="Admin dashboard preview"
        >
          <div className="flex items-center justify-between border-b border-slate-200 bg-navy px-3 py-2 text-white">
            <span className="text-sm font-extrabold">Admin Dashboard</span>
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold transition hover:bg-white/20"
              >
                Open full screen
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-lg font-black transition hover:bg-white/20"
                aria-label="Close admin dashboard preview"
              >
                ×
              </button>
            </div>
          </div>
          <iframe
            title="Admin Dashboard"
            src="/dashboard?embedded=1"
            className="h-[calc(100%-49px)] w-full border-0 bg-white"
          />
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? 'Hide admin dashboard' : 'Show admin dashboard'}
        className="grid min-h-[44px] place-items-center rounded-xl bg-teal px-4 text-sm font-extrabold text-navy shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0"
      >
        Admin Dashboard
      </button>
    </div>
  )
}
