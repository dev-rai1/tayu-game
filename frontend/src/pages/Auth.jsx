import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { signUp, signIn } from '../services/auth.js'
import { requestPasswordReset } from '../services/passwordRecovery.js'
import { loadProfile, loadWallet } from '../services/walletStore.js'
import { createOrLoadTeacherClass, joinStudentToClass } from '../services/classroom.js'
import { setDefaultReadingBandForGrade } from '../services/readingPreferences.js'

const FIELD = 'mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none focus:border-teal'
const SELECT = 'mt-1 w-full rounded-xl border border-white/20 bg-white px-4 py-3 font-bold text-navy outline-none focus:border-teal'
const LABEL = 'mt-4 block text-sm font-extrabold text-teal'
const REQUIRED = <span className="text-white/55">(required)</span>

export default function Auth() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') || 'signin')
  const nav = useNavigate()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [ok, setOk] = useState(params.get('reset') === 'complete' ? 'Your password was changed. Log in with your new password.' : null)
  const [recovery, setRecovery] = useState(null)
  const [f, setF] = useState({ email: '', password: '', confirm: '', affiliation: '', role: '', gradeLevels: '', foundVia: '', organizationName: '', studentCode: '' })

  const set = (key) => (event) => {
    const value = event.target.value
    setF((current) => ({ ...current, [key]: value }))
    if (key === 'email') { setRecovery(null); setOk(null) }
  }

  const setAffiliation = (event) => {
    const affiliation = event.target.value
    setF((current) => ({ ...current, affiliation, role: affiliation === 'individual' ? 'other' : '', organizationName: '', studentCode: '' }))
  }

  const setOrganizationRole = (event) => {
    const role = event.target.value
    setF((current) => ({ ...current, role, studentCode: role === 'student' ? current.studentCode : '' }))
  }

  const changeMode = (nextMode) => { setMode(nextMode); setErr(null); setOk(null); setRecovery(null) }

  const activateOlderAccount = () => {
    const profile = recovery?.activationProfile || {}
    setF((current) => ({ ...current, ...profile, affiliation: profile.organizationName ? 'organization' : 'individual', email: recovery?.email || current.email, password: '', confirm: '', studentCode: profile.studentCode || '' }))
    setMode('signup'); setRecovery(null); setErr(null)
    setOk('This is an older device-only account. Create a new password below to activate it in Firebase and keep its saved progress.')
  }

  const submit = async (event) => {
    event?.preventDefault(); setErr(null); setOk(null); setBusy(true)
    try {
      if (mode === 'signup') {
        if (f.password.length < 6) throw new Error('Password must be at least 6 characters.')
        if (f.password !== f.confirm) throw new Error('The two passwords do not match.')
        if (!f.affiliation) throw new Error('Choose School or organization, or Playing on my own.')
        if (!f.gradeLevels) throw new Error('Please select a grade level.')
        if (!f.foundVia) throw new Error('Please tell us how you found TAYU.')
        if (f.affiliation === 'organization' && !f.organizationName.trim()) throw new Error('Enter your organization name.')
        if (f.affiliation === 'organization' && !['teacher', 'student'].includes(f.role)) throw new Error('Choose Teacher or Student.')
        if (f.role === 'student' && !f.studentCode.trim()) throw new Error('Students joining an organization need their teacher’s class code.')
        const user = await signUp(f)
        setDefaultReadingBandForGrade(f.gradeLevels)
        if (user.role === 'teacher') { await createOrLoadTeacherClass(); nav('/teacher'); return }
        if (user.role === 'student') await joinStudentToClass(f.studentCode)
        nav('/')
      } else if (mode === 'signin') {
        const user = await signIn(f.email, f.password)
        if (user.role === 'admin') nav('/dashboard')
        else if (user.role === 'teacher') nav('/teacher')
        else if (!loadProfile()?.assessment?.pre) nav('/assessment/pre')
        else nav(loadWallet() ? '/world' : '/modules')
      } else {
        const result = await requestPasswordReset(f.email); setRecovery(result); setOk(result.message)
      }
    } catch (error) { setRecovery(null); setErr(error.message || String(error)) }
    finally { setBusy(false) }
  }

  const gradeLabel = f.role === 'teacher' ? 'Grades you teach' : 'Your grade level'
  const passwordAutocomplete = mode === 'signup' ? 'new-password' : 'current-password'

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <Link to="/" className="mb-4 flex items-center gap-3"><img src="/assets/tayu-logo.webp" alt="TAYU" className="h-12 w-12 rounded-xl" /><span className="font-display text-2xl font-extrabold text-white">TAYU</span></Link>
      <form className="rounded-3xl bg-white/5 p-6" onSubmit={submit}>
        <h1 className="font-display text-2xl font-extrabold">{mode === 'signup' ? 'Create your TAYU account' : mode === 'reset' ? 'Reset your password' : 'Welcome back'}</h1>
        <p className="mt-1 text-sm font-semibold text-white/75">{mode === 'signup' ? 'Choose Playing on my own when you are testing independently. School students use their teacher’s class code.' : mode === 'reset' ? 'Enter your account email, then check Inbox, Spam, Junk, and Promotions.' : 'Log in to continue your money adventure.'}</p>
        <div className="mt-4 flex gap-1.5" role="tablist" aria-label="Account options">{[['signin', 'Log In'], ['signup', 'Sign Up'], ['reset', 'Forgot?']].map(([tabMode, label]) => <button id={`auth-tab-${tabMode}`} key={tabMode} type="button" role="tab" aria-selected={mode === tabMode} aria-controls="auth-panel" tabIndex={mode === tabMode ? 0 : -1} onClick={() => changeMode(tabMode)} className={`min-h-[44px] flex-1 rounded-xl text-sm font-extrabold ${mode === tabMode ? 'bg-teal text-navy' : 'bg-white/10 text-white'}`}>{label}</button>)}</div>

        <div id="auth-panel" role="tabpanel" aria-labelledby={`auth-tab-${mode}`}>
          <label className={LABEL}>Email {mode === 'signup' ? REQUIRED : null}<input className={FIELD} required type="email" inputMode="email" autoCapitalize="none" spellCheck="false" autoComplete="email" value={f.email} onChange={set('email')} /></label>
          {mode !== 'reset' && <label className={LABEL}>Password {mode === 'signup' ? REQUIRED : null}<input className={FIELD} required type="password" minLength={6} autoComplete={passwordAutocomplete} aria-describedby={mode === 'signup' ? 'password-requirements' : undefined} value={f.password} onChange={set('password')} /></label>}
          {mode === 'signup' && <p id="password-requirements" className="mt-1 text-xs font-semibold text-white/65">Use at least 6 characters. Your password is handled by Firebase Authentication and is not displayed in TAYU.</p>}

          {mode === 'signup' && <>
            <label className={LABEL}>Confirm password {REQUIRED}<input className={FIELD} required type="password" minLength={6} autoComplete="new-password" aria-describedby="password-requirements" value={f.confirm} onChange={set('confirm')} /></label>
            <label className={LABEL}>How are you using TAYU? {REQUIRED}<select className={SELECT} required value={f.affiliation} onChange={setAffiliation}><option value="">Choose one...</option><option value="individual">Playing on my own</option><option value="organization">School or organization</option></select></label>
            {f.affiliation === 'organization' && <>
              <label className={LABEL}>Organization name {REQUIRED}<input className={FIELD} required autoComplete="organization" value={f.organizationName} onChange={set('organizationName')} /></label>
              <label className={LABEL}>Role {REQUIRED}<select className={SELECT} required value={f.role} onChange={setOrganizationRole}><option value="">Choose one...</option><option value="teacher">Teacher</option><option value="student">Student</option></select></label>
            </>}
            {f.affiliation && <label className={LABEL}>{gradeLabel} {REQUIRED}<select className={SELECT} required value={f.gradeLevels} onChange={set('gradeLevels')}><option value="">Choose...</option><option value="K-2">K–2</option><option value="3-5">3–5</option><option value="6-8">6–8</option><option value="9-12">9–12</option><option value="mixed">Mixed / multiple grades</option></select></label>}
            {f.role === 'student' && <label className={LABEL}>Teacher’s class code {REQUIRED}<input className={FIELD} required autoComplete="off" value={f.studentCode} onChange={set('studentCode')} placeholder="Example: ABC234" /></label>}
            <label className={LABEL}>How did you find TAYU? {REQUIRED}<select className={SELECT} required value={f.foundVia} onChange={set('foundVia')}><option value="">Choose one...</option><option value="teacher">A teacher</option><option value="friend">Friend or family</option><option value="school">School or district</option><option value="social">Social media</option><option value="search">Web search</option><option value="event">Event</option><option value="other">Other</option></select></label>
          </>}
        </div>

        <div aria-live="polite" aria-atomic="true">{err && <p role="alert" className="mt-3 rounded-xl bg-red-500/15 px-3 py-2 text-sm font-bold text-red-200">{err}</p>}{ok && <p role="status" className="mt-3 rounded-xl bg-teal/15 px-3 py-2 text-sm font-bold text-teal">{ok}</p>}</div>
        {mode === 'reset' && recovery && <div className="mt-3 rounded-2xl bg-white/5 p-4 text-sm font-semibold text-white/75"><p>Use the newest reset email.</p><p className="mt-2 font-extrabold text-amber-200">Check Spam, Junk, or Promotions if it is not in your inbox.</p>{recovery.legacyActivationAvailable && <button type="button" onClick={activateOlderAccount} className="mt-3 min-h-[44px] w-full rounded-xl bg-amber-300 px-3 font-extrabold text-navy">Activate older account</button>}</div>}
        <button type="submit" disabled={busy} className="btn-primary mt-5 min-h-[56px] w-full text-lg disabled:opacity-50">{busy ? 'One moment...' : mode === 'signup' ? 'Create my account' : mode === 'signin' ? 'Log in' : recovery ? 'Send reset link again' : 'Send reset link'}</button>
        {mode === 'signin' && <button type="button" onClick={() => changeMode('reset')} className="mt-3 w-full text-sm font-bold text-white/75">Forgot password?</button>}
        {mode === 'reset' && <button type="button" onClick={() => changeMode('signin')} className="mt-3 w-full text-sm font-bold text-white/75">Back to login</button>}
      </form>
    </main>
  )
}
