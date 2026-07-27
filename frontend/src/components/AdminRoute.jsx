import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { currentUser } from '../services/auth.js'
import { ensureAdminAccess, isAdminEmail } from '../services/adminAccess.js'

export default function AdminRoute({ children }) {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let active = true
    const checkAccess = async () => {
      const user = currentUser()
      if (!user) {
        if (active) setStatus('signed-out')
        return
      }

      if (user.role === 'admin') {
        if (active) setStatus('allowed')
        return
      }

      if (!isAdminEmail(user.email)) {
        if (active) setStatus('denied')
        return
      }

      const promoted = await ensureAdminAccess(user)
      if (active) setStatus(promoted?.role === 'admin' ? 'allowed' : 'denied')
    }

    checkAccess()
    return () => { active = false }
  }, [])

  if (status === 'checking') {
    return <main className="grid min-h-screen place-items-center text-white/60">Checking admin access...</main>
  }
  if (status === 'signed-out') return <Navigate to="/login?mode=signin" replace />
  if (status === 'denied') return <Navigate to="/" replace />
  return children
}
