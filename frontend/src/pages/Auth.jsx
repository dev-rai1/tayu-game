// Login / sign-up / forgot-password page. Email is the account username.
import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { signUp, signIn } from '../services/auth.js'
import { requestPasswordReset } from '../services/passwordRecovery.js'
import { ensureAdminAccess } from '../services/adminAccess.js'
import { loadProfile, loadWallet } from '../services/walletStore.js'
import GuestModeButton from '../components/GuestModeButton.jsx'

const FIELD = 'mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none focus:border-teal'
const SELECT = 'mt-1 w-full rounded-xl border border-white/20 bg-white px-4 py-3 font-bold text-navy outline-none focus:border-teal'
const LABEL = 'mt-4 block text-sm font-extrabold text-teal'

export default function Auth() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') || 'signin')
  const nav = useNavigate()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [ok, setOk] = useState(
    params.get('reset') === 'complete'
      ? 'Your password was changed. Log in with your new password.'
      : null,
  )
  const [recovery, setRecovery] = useState(null)
  const [f, setF] = useState({
    email: '',
    password: '',
    confirm: '',
    affiliation: '',
    role: '',
    gradeLevels: '',
    foundVia: '',
    organizationName: '',
    studentCode: '',
  })

  const set = (key) => (event) => {
    const value = event.target.value
    setF((current) => ({ ...current, [key]: value }))
    if (key === 'email') {
      setRecovery(null)
      setOk(null)
    }
  }

  const setAffiliation = (event) => {
    const affiliation = event.target.value
    setF((current) => ({
      ...current,
      affiliation,
      role: affiliation === 'individual' ? 'other' : '',
      organizationName: '',
      gradeLevels: '',
      studentCode: '',
    }))
  }

  const setOrganizationRole = (event) => {
    const role = event.target.value
    setF((current) => ({
      ...current,
      role,
      gradeLevels: '',
      studentCode: role === 'student' ? current.studentCode : '',
    }))
  }

  const changeMode = (nextMode) => {
    setMode(nextMode)
    setErr(null)
    setOk(null)
    setRecovery(null)
  }

  const activateOlderAccount = () => {
    const profile = recovery?.activationProfile || {}
    setF((current) => ({
      ...current,
      ...profile,
      affiliation: profile.organizationName ? 'organization' : 'individual',
      email: recovery?.email || current.email,
      password: '',
      confirm: '',
      studentCode: profile.studentCode || '',
    }))
    setMode('signup')
    setRecovery(null)
    setErr(null)
    setOk('This is an older device-only account. Create a new password below to activate it in Firebase and keep its saved progress.')
  }

  const submit = async (event) => {
    event?.preventDefault()
    setErr(null); setOk(null); setBusy(true)
    try {
      if (mode === 'signup') {
        if (f.password !== f.confirm) throw new Error('The two passwords do not match.')
        if (!f.affiliation) throw new Error('Please choose whether you are with an organization or signing up as an individual.')
        if (f.affiliation === 'organization' && !f.organizationName.trim()) throw new Error('Please enter your organization name.')
        if (f.affiliation === 'organization' && !['teacher', 'student'].includes(f.role)) throw new Error('Please choose Teacher or Student.')
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
        const result = await requestPasswordReset(f.email)
        setRecovery(result)
        setOk(result.message)
      }
    } catch (error) {
      setRecovery(null)
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
              ? 'Enter the exact email used for your account. After requesting the link, check your inbox and your Spam or Junk folder.'
              : 'Log in to continue your money adventure.'}
        </p>
        <GuestModeButton />
        <div className="mt-4 flex gap-1.5" role="tablist" aria-label="Account options">
          {[["signin", 'Log In'], ['signup', 'Sign Up'], ['reset', 'Forgot?']].map(([tabMode, label]) => (
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

            <label className={LABEL}>Are you with an organization or signing up individually?
              <select className={SELECT} required value={f.affiliation} onChange={setAffiliation}>
                <option value="">Choose one...</option>
                <option value="organization">Organization (teacher/student)</option>
                <option value="individual">Individual</option>
              </select>
            </label>

            {f.affiliation === 'organization' && (
              <>
                <label className={LABEL}>What organization are you with? <span className="text-white/50">(required)</span>
                  <input className={FIELD} required value={f.organizationName} onChange={set('organizationName')} placeholder="School, nonprofit, community group, etc." />
                </label>

                <label className={LABEL}>Are you a teacher or student?
                  <select className={SELECT} required value={f.role} onChange={setOrganizationRole}>
                    <option value="">Choose one...</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </select>
                </label>
              </>
            )}

            {f.affiliation === 'organization' && (f.role === 'teacher' || f.role === 'student') && (
              <label className={LABEL}>{f.role === 'teacher' ? 'What grade level(s) do you teach?' : 'What grade level(s) are you in?'}
                <select className={SELECT} value={f.gradeLevels} onChange={set('gradeLevels')}>
                  <option value="">Choose a grade range...</option>
                  <option value="K-2">Elementary (K–2)</option>
                  <option value="3-5">Elementary (3–5)</option>
                  <option value="6-8">Middle school (6–8)</option>
                  <option value="9-12">High school (9–12)</option>
                  <option value="mixed">Mixed / multiple grades</option>
                </select>
              </label>
            )}

            {f.affiliation === 'organization' && f.role === 'student' && (
              <label className={LABEL}>Have an organization or class code? <span className="text-white/50">(optional)</span>
                <input className={FIELD} value={f.studentCode} onChange={set('studentCode')} placeholder="Enter code if you have one" />
              </label>
            )}

            <label className={LABEL}>How did you find TAYU?
              <select className={SELECT} value={f.foundVia} onChange={set('foundVia')}>
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

        {mode === 'reset' && recovery && (
          <div className="mt-3 rounded-2xl bg-white/5 p-4 text-sm font-semibold text-white/75">
            <p>Use the newest reset email. Older reset links stop working after a newer one is requested.</p>
            <p className="mt-2 font-extrabold text-amber-200">Important: The reset email may go to Spam, Junk, or Promotions. Check those folders if it does not appear in your inbox within a few minutes.</p>
            {recovery.legacyActivationAvailable && (
              <button type="button" onClick={activateOlderAccount} className="mt-3 min-h-[44px] w-full rounded-xl bg-amber-300 px-3 font-extrabold text-navy">
                Activate older account and set a new password
              </button>
            )}
          </div>
        )}

        <button type="submit" disabled={busy} className="btn-primary mt-5 min-h-[56px] w-full text-lg disabled:opacity-50">
          {busy ? 'One moment...' : mode === 'signup' ? 'Create my account' : mode === 'signin' ? 'Log in' : recovery ? 'Send reset link again' : 'Send reset link'}
        </button>

        {mode === 'signin' && (
          <button type="button" onClick={() => changeMode('reset')} className="mt-3 w-full text-center text-sm font-bold text-white/75 hover:text-white">
            Forgot password?
          </button>
        )}
        {mode === 'reset' && (
          <button type="button" onClick={() => changeMode('signin')} className="mt-3 w-full text-center text-sm font-bold text-white/75 hover:text-white">
            Back to login
          </button>
        )}
      </form>
      <Link to="/" className="mt-4 text-center text-sm font-bold text-white/75 hover:text-white">Back to the home page</Link>
    </main>
  )
}
