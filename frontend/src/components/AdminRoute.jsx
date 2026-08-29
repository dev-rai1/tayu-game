import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { currentUser } from '../services/auth.js'
import {
  ensureAdminAccess,
  isAdminEmail,
  isDashboardViewerEmail,
  openDashboardWithPassword,
} from '../services/adminAccess.js'

export default function AdminRoute({ children }) {
  const [status, setStatus] = useState('checking')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const checkAccess = async () => {
      const user = currentUser()
      if (!user) {
        if (active) setStatus('password')
        return
      }
      if (isDashboardViewerEmail(user.email) || isAdminEmail(user.email)) {
        const promoted = await ensureAdminAccess(user)
        if (active) setStatus(promoted?.role === 'admin' ? 'allowed' : 'password')
        return
      }
      if (active) setStatus('password')
    }
    checkAccess()
    return () => { active = false }
  }, [])

  const unlock = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await openDashboardWithPassword(password)
      setPassword('')
      setStatus('allowed')
    } catch {
      setPassword('')
      setError('Incorrect dashboard password.')
    } finally {
      setBusy(false)
    }
  }

  if (status === 'checking') return <main className="grid min-h-screen place-items-center text-white/60">Checking dashboard access...</main>

  if (status === 'password') {
    return (
      <main className="grid min-h-screen place-items-center px-6 py-10">
        <form onSubmit={unlock} className="w-full max-w-md rounded-3xl bg-white/5 p-6 shadow-2xl">
          <Link to="/" className="mb-5 flex items-center gap-3">
            <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-12 w-12 rounded-xl" />
            <span className="font-display text-2xl font-extrabold text-white">TAYU</span>
          </Link>
          <h1 className="font-display text-3xl font-extrabold">Admin Dashboard</h1>
          <p className="mt-2 text-sm font-semibold text-white/65">Enter the shared dashboard password to view real account sessions, survey answers, module activity, and learning analytics.</p>
          <label className="mt-6 block text-sm font-extrabold text-teal">
            Dashboard password
            <input type="password" required autoFocus autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none focus:border-teal" placeholder="Enter password" />
          </label>
          {error && <p role="alert" className="mt-3 rounded-xl bg-red-500/15 px-3 py-2 text-sm font-bold text-red-200">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary mt-5 min-h-[56px] w-full text-lg disabled:opacity-50">{busy ? 'Checking password...' : 'Open dashboard'}</button>
          <Link to="/" className="mt-4 block text-center text-sm font-bold text-white/65 hover:text-white">Back to TAYU</Link>
        </form>
      </main>
    )
  }

  return children
}
