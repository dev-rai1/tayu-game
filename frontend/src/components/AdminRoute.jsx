import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { currentUser } from '../services/auth.js'
import { verifyAdminAccess } from '../services/adminAccess.js'

export default function AdminRoute({ children }) {
  const user = currentUser()
  const [status, setStatus] = useState(user ? 'checking' : 'signed-out')

  useEffect(() => {
    let active = true
    if (!user) return () => { active = false }
    verifyAdminAccess(user).then((verified) => {
      if (active) setStatus(verified ? 'allowed' : 'denied')
    })
    return () => { active = false }
  }, [user?.id])

  if (status === 'signed-out') return <Navigate to="/login" replace />
  if (status === 'checking') return <main className="grid min-h-screen place-items-center text-white/70" role="status">Checking administrator access...</main>
  if (status === 'allowed') return children

  return (
    <main className="grid min-h-screen place-items-center px-6 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white/5 p-7 text-center shadow-2xl" aria-labelledby="admin-denied-title">
        <img src="/assets/tayu-logo.webp" alt="TAYU" className="mx-auto h-12 w-12 rounded-xl" />
        <h1 id="admin-denied-title" className="mt-4 font-display text-2xl font-extrabold">Administrator access required</h1>
        <p className="mt-2 text-sm font-semibold text-white/70">This area is available only to accounts whose administrator role is authorized in TAYU&apos;s protected account data.</p>
        <Link to="/" className="btn-primary mt-5 inline-flex min-h-[48px] items-center justify-center px-5">Back to TAYU</Link>
      </section>
    </main>
  )
}
