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
      className="fixed right-3 z-[1000] grid min-h-[44px] place-items-center rounded-xl bg-teal px-4 text-sm font-extrabold text-navy shadow-xl"
      style={{ bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
    >
      Admin Dashboard
    </Link>
  )
}
