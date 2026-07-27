// Login / sign-up / forgot-password page. Email is the account username.
import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { signUp, signIn, resetPassword } from '../services/auth.js'
import { ensureAdminAccess } from '../services/adminAccess.js'
import { loadProfile, loadWallet } from '../services/walletStore.js'
import GuestModeButton from '../components/GuestModeButton.jsx'

const FIELD = 'mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none focus:border-teal'
const LABEL = 'mt-4 block text-sm font-extrabold text-teal'

export default function Auth() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') || 'signin')
  const nav = useNavigate()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [ok, setOk] = useState(null)
  const [f, setF] = useState({ email: '', password: '', confirm: '', role: 'teacher', gradeLevels: '', foundVia: '', organizationName: '' })
  const set = (key) => (event) => setF({ ...f, [key]: event.target.value })

  const changeMode = (nextMode) => {
    setMode(nextMode)
    setErr(null)
    setOk(null)
  }

  const submit = async (event) => {
    event?.preventDefault()
    setErr(null); setOk(null); setBusy(true)
    try {
      if (mode === 'signup') {
        if (f.password !== f.confirm) throw new Error('The two passwords do not match.')
        const user = await signUp(f)
        const admin = await ensureAdminAccess(user)
        nav(admin ? '/dashboard' : '/about?welcome=1')
      } else if (mode === 'signin') {
        const user = await signIn(f.email, f.password)
        const admin = await ensureAdminAccess(user)
        if (admin || user.role === 'admin') nav('/dashboard')
        else if (!loadProfile()?.assessment?.pre) nav('/assessment/pre')
        else nav(loadWallet() ? '/world' : '/modules')
      } else {
        setOk(await resetPassword(f.email))
      }
    } catch (error) {
      setErr(error.message || String(error))
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
      <form className="rounded-3xl bg-white/5 p-6" onSubmit={submit}>
        <h1 className="font-display text-2xl font-extrabold">
          {mode === 'signup' ? 'Create your TAYU account' : mode === 'reset' ? 'Reset your password' : 'Welcome back'}
        </h1>
        <p className="mt-1 text-sm font-semibold text-white/75">
          {mode === 'signup'
            ? 'Sign up, then choose a money adventure.'
            : mode === 'reset'
              ? 'Enter your account email and Firebase will send a secure reset link.'
              : 'Log in to continue your money adventure.'}
        </p>
        <GuestModeButton />
        <div className="mt-4 flex gap-1.5" role="tablist" aria-label="Account options">
          {[['signin', 'Log In'], ['signup', 'Sign Up'], ['reset', 'Forgot?']].map(([tabMode, label]) => (
            <button key={tabMode} type="button" role="tab" aria-selected={mode === tabMode} onClick={() => changeMode(tabMode)}
              className={`min-h-[44px] flex-1 rounded-xl text-sm font-extrabold transition active:scale-95 ${mode === tabMode ? 'bg-teal text-navy' : 'bg-white/10 text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        <label className={LABEL}>Email {mode === 'signup' && <span className="text-white/50">(this is your username)</span>}
          <input className={FIELD} required type="email" autoComplete="email" value={f.email} onChange={set('email')} placeholder="you@school.org" />
        </label>

        {mode !== 'reset' && (
          <label className={LABEL}>Password
            <input className={FIELD} required type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={6} value={f.password} onChange={set('password')} placeholder="At least 6 characters" />
          </label>
        )}

        {mode === 'signup' && (
          <>
            <label className={LABEL}>Confirm password
              <input className={FIELD} required type="password" autoComplete="new-password" minLength={6} value={f.confirm} onChange={set('confirm')} />
            </label>
            <label className={LABEL}>Which best describes you?
              <select className={FIELD} value={f.role} onChange={set('role')}>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="other">Other</option>
              </select>
            </label>
            {(f.role === 'teacher' || f.role === 'student') && (
              <label className={LABEL}>School / high school / organization name <span className="text-white/50">(required)</span>
                <input className={FIELD} required value={f.organizationName} onChange={set('organizationName')} placeholder="e.g. Lincoln Elementary School" />
              </label>
            )}
            {(f.role === 'teacher' || f.role === 'student') && (
              <label className={LABEL}>{f.role === 'teacher' ? 'What grade level(s) do you teach?' : 'What grade level(s) are you in?'}
                <select className={FIELD} value={f.gradeLevels} onChange={set('gradeLevels')}>
                  <option value="">Choose a grade range...</option>
                  <option value="K-2">Elementary (K–2)</option>
                  <option value="3-5">Elementary (3–5)</option>
                  <option value="6-8">Middle school (6–8)</option>
                  <option value="9-12">High school (9–12)</option>
                  <option value="mixed">Mixed / multiple grades</option>
                </select>
              </label>
            )}
            <label className={LABEL}>How did you find TAYU?
              <select className={FIELD} value={f.foundVia} onChange={set('foundVia')}>
                <option value="">Choose one...</option>
                <option value="teacher">A teacher</option>
                <option value="friend">A friend or family</option>
                <option value="school">My school or district</option>
                <option value="social">Social media</option>
                <option value="search">A web search</option>
                <option value="event">An event or conference</option>
                <option value="other">Somewhere else</option>
              </select>
            </label>
          </>
        )}

        <div aria-live="polite" aria-atomic="true">
          {err && <p role="alert" className="mt-3 rounded-xl bg-red-500/15 px-3 py-2 text-sm font-bold text-red-200">{err}</p>}
          {ok && <p className="mt-3 rounded-xl bg-teal/15 px-3 py-2 text-sm font-bold text-teal">{ok}</p>}
        </div>

        <button type="submit" disabled={busy} className="btn-primary mt-5 min-h-[56px] w-full text-lg disabled:opacity-50">
          {busy ? 'One moment...' : mode === 'signup' ? 'Create my account' : mode === 'signin' ? 'Log in' : 'Send reset link'}
        </button>

        {mode === 'signin' && (
          <button type="button" onClick={() => changeMode('reset')} className="mt-3 w-full text-center text-sm font-bold text-white/75 hover:text-white">
            Forgot password?
          </button>
        )}
      </form>
      <Link to="/" className="mt-4 text-center text-sm font-bold text-white/75 hover:text-white">Back to the home page</Link>
    </main>
  )
}
