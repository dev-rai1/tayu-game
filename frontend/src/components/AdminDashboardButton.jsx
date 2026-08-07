import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { currentUser } from '../services/auth.js'
import { isAdminEmail } from '../services/adminAccess.js'

export default function AdminDashboardButton() {
  const [user, setUser] = useState(() => currentUser())

  useEffect(() => {
    const refresh = () => setUser(currentUser())
    window.addEventListener('tayu-auth-changed', refresh)
    return () => window.removeEventListener('tayu-auth-changed', refresh)
  }, [])

  if (!user || (user.role !== 'admin' && !isAdminEmail(user.email))) return null

  return (
    <Link
      to="/dashboard"
      aria-label="Open admin dashboard"
      className="fixed z-[1000] grid min-h-[46px] max-w-[calc(100vw-1.5rem)] place-items-center whitespace-normal rounded-xl border-2 border-white/80 bg-teal px-4 py-2 text-center text-sm font-extrabold leading-tight text-navy shadow-2xl"
      style={{
        right: 'max(12px, env(safe-area-inset-right, 0px))',
        bottom: 'calc(66px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      Admin Dashboard
    </Link>
  )
}
