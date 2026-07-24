// R12 PART 2: LOGIN / SIGN UP / FORGOT PASSWORD - one page, three modes.
// Email IS the username (capturing it is the whole point of sign-up).
// Manual accounts only - no Google button by design.
import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { signUp, signIn, resetPassword, isCloud } from '../services/auth.js'
import { loadWallet } from '../services/walletStore.js'

const FIELD = 'mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none focus:border-teal'
const LABEL = 'mt-4 block text-sm font-extrabold text-teal'

export default function Auth() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') || 'signin') // signin | signup | reset
  const nav = useNavigate()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [ok, setOk] = useState(null)
  const [f, setF] = useState({ email: '', password: '', confirm: '', role: 'student', gradeLevels: '', foundVia: '', social: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async () => {
    setErr(null); setOk(null); setBusy(true)
    try {
      if (mode === 'signup') {
        if (f.password !== f.confirm) throw new Error('The two passwords do not match.')
        await signUp(f)
        // 2.4: brand-new accounts meet TAYU on About Us FIRST, then play
        nav('/about?welcome=1')
      } else if (mode === 'signin') {
        const u = await signIn(f.email, f.password)
        if (u.role === 'admin') nav('/dashboard')
        else nav(loadWallet() ? '/world' : '/modules')
      } else {
        setOk(await resetPassword(f.email))
      }
    } catch (e) {
      setErr(e.message || String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <Link to="/" className="mb-4 flex items-center gap-3">
        <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-12 w-12 rounded-xl" />
        <span className="font-display text-2xl font-extrabold text-white">TAYU</span>
      </Link>
      <div className="rounded-3xl bg-white/5 p-6">
        <div className="flex gap-1.5">
          {[['signin', 'Log In'], ['signup', 'Sign Up'], ['reset', 'Forgot?']].map(([m, l]) => (
            <button key={m} onClick={() => { setMode(m); setErr(null); setOk(null) }}
              className={`min-h-[44px] flex-1 rounded-xl text-sm font-extrabold transition active:scale-95 ${mode === m ? 'bg-teal text-navy' : 'bg-white/10 text-white'}`}>
              {l}
            </button>
          ))}
        </div>

        <label className={LABEL}>Email {mode === 'signup' && <span className="text-white/50">(this is your username)</span>}
          <input className={FIELD} type="email" autoComplete="email" value={f.email} onChange={set('email')} placeholder="you@school.org" />
        </label>

        {mode !== 'reset' && (
          <label className={LABEL}>Password
            <input className={FIELD} type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={f.password} onChange={set('password')} placeholder="At least 6 characters" onKeyDown={(e) => e.key === 'Enter' && mode === 'signin' && submit()} />
          </label>
        )}

        {mode === 'signup' && (
          <>
            <label className={LABEL}>Confirm password
              <input className={FIELD} type="password" autoComplete="new-password" value={f.confirm} onChange={set('confirm')} />
            </label>
            <label className={LABEL}>Are you a teacher or a student?
              <select className={FIELD} value={f.role} onChange={set('role')}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent / other</option>
              </select>
            </label>
            {f.role === 'teacher' && (
              <label className={LABEL}>What grade level(s) do you teach?
                <input className={FIELD} value={f.gradeLevels} onChange={set('gradeLevels')} placeholder="e.g. 3rd and 4th grade" />
              </label>
            )}
            <label className={LABEL}>How did you find TAYU?
              <input className={FIELD} value={f.foundVia} onChange={set('foundVia')} placeholder="A teacher, a friend, social media..." />
            </label>
            <label className={LABEL}>Social media handle <span className="text-white/50">(optional)</span>
              <input className={FIELD} value={f.social} onChange={set('social')} placeholder="@yourhandle" />
            </label>
          </>
        )}

        {err && <p className="mt-3 rounded-xl bg-red-500/15 px-3 py-2 text-sm font-bold text-red-300">{err}</p>}
        {ok && <p className="mt-3 rounded-xl bg-teal/15 px-3 py-2 text-sm font-bold text-teal">{ok}</p>}

        <button disabled={busy} onClick={submit} className="btn-primary mt-5 min-h-[56px] w-full text-lg disabled:opacity-50">
          {busy ? 'One moment...' : mode === 'signup' ? 'Create my account' : mode === 'signin' ? 'Log in' : 'Send reset link'}
        </button>

        {mode === 'signin' && (
          <button onClick={() => setMode('reset')} className="mt-3 w-full text-center text-sm font-bold text-white/60 hover:text-white">
            Forgot password?
          </button>
        )}
        {!isCloud() && (
          <p className="mt-4 text-center text-xs text-white/40">
            Demo mode: accounts live on this device only. Add the Supabase keys on Vercel for real cloud accounts and reset emails (see AUTH_README).
          </p>
        )}
      </div>
      <Link to="/" className="mt-4 text-center text-sm font-bold text-white/60 hover:text-white">Back to the home page</Link>
    </main>
  )
}
