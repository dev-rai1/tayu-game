import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MODULE_CATALOG } from '../constants/modules.js'
import { isLearningPathComplete, loadActiveLearningPath } from '../constants/learningPaths.js'
import { loadProfile, saveProfile } from '../services/walletStore.js'

export default function PathComplete() {
  const navigate = useNavigate()
  const profile = loadProfile() || {}
  const [answers, setAnswers] = useState({})
  const [capstonePassed, setCapstonePassed] = useState(Boolean(profile.capstone?.passed))
  const [capstoneError, setCapstoneError] = useState('')
  const path = loadActiveLearningPath()
  const completed = path && isLearningPathComplete(path.modules, profile.badges || [])
  const modules = MODULE_CATALOG.filter((module) => path?.modules?.includes(module.n))
  const completedAt = profile.pathCompletion?.pathId === path?.id
    ? profile.pathCompletion.completedAt
    : new Date().toISOString()
  const date = new Date(completedAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  useEffect(() => {
    if (!completed || !path) {
      navigate('/modules', { replace: true })
      return
    }
    if (profile.pathCompletion?.pathId !== path.id) {
      saveProfile({
        pathCompletion: {
          pathId: path.id,
          label: path.label,
          title: path.title,
          modules: path.modules,
          completedAt,
        },
      })
    }
  }, [completed, completedAt, navigate, path, profile.pathCompletion?.pathId])

  if (!completed || !path) return null

  const capstone = [
    { id: 'tradeoff', prompt: 'You move $20 from savings to a want. What is the opportunity cost?', options: ['The want itself', 'The progress that $20 would have made toward the savings goal'], answer: 1 },
    { id: 'emergency', prompt: 'A surprise bill arrives. Which plan is strongest?', options: ['Use emergency savings before borrowing at high interest', 'Ignore the bill and keep investing'], answer: 0 },
    { id: 'paycheck', prompt: 'Which amount belongs in a spending plan?', options: ['Gross pay before deductions', 'Net pay that reaches the account'], answer: 1 },
  ]
  const checkCapstone = () => {
    const passed = capstone.every((question) => Number(answers[question.id]) === question.answer)
    if (!passed) { setCapstoneError('Review the three choices and try again. The certificate is earned after all three are correct.'); return }
    saveProfile({ capstone: { passed: true, completedAt: new Date().toISOString() } })
    setCapstonePassed(true); setCapstoneError('')
  }

  return (
    <main className="min-h-screen bg-navy px-4 py-8 text-white print:bg-white print:text-navy">
      <section className="mx-auto max-w-4xl text-center">
        <div className="print:hidden">
          <img src="/assets/tayu-logo.webp" alt="TAYU" className="mx-auto h-20 w-20 rounded-2xl" />
          <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.2em] text-teal">Path complete</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-sun">Congratulations, {profile.name || 'Friend'}!</h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg font-semibold text-white/75">You completed every module assigned in the {path.title || path.label} pathway.</p>
        </div>

        {!capstonePassed && <section className="mx-auto mt-8 max-w-3xl rounded-3xl bg-white p-6 text-left text-navy shadow-2xl"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-electric">FCPS Unit 16 capstone</p><h2 className="mt-2 font-display text-3xl font-extrabold">Connect your whole money plan</h2><p className="mt-2 font-semibold text-navy/70">Complete these three integrative decisions before earning the certificate.</p><div className="mt-5 space-y-5">{capstone.map((question, index) => <fieldset key={question.id}><legend className="font-extrabold">{index + 1}. {question.prompt}</legend><div className="mt-2 grid gap-2">{question.options.map((option, optionIndex) => <label key={option} className="flex min-h-[48px] items-center gap-3 rounded-xl border border-slate-200 p-3 font-semibold"><input type="radio" name={question.id} value={optionIndex} checked={Number(answers[question.id]) === optionIndex} onChange={(event) => setAnswers({ ...answers, [question.id]: event.target.value })} />{option}</label>)}</div></fieldset>)}</div>{capstoneError && <p role="alert" className="mt-4 rounded-xl bg-red-100 p-3 font-bold text-red-800">{capstoneError}</p>}<button type="button" onClick={checkCapstone} className="mt-5 min-h-[52px] rounded-2xl bg-navy px-6 font-extrabold text-white">Check my capstone</button></section>}

        {capstonePassed && <div className="mx-auto mt-8 aspect-[11/8.5] w-full max-w-3xl bg-[#fffdf6] p-3 text-navy shadow-2xl print:mt-0 print:max-w-none print:shadow-none">
          <div className="relative flex h-full flex-col items-center justify-center border-[8px] border-navy px-8 py-6">
            <div className="absolute inset-3 border-2 border-electric" />
            <img src="/assets/tayu-logo.webp" alt="" className="relative h-16 w-16 rounded-2xl" />
            <div className="relative mt-4 font-display text-sm font-extrabold uppercase tracking-[0.22em] text-electric">Certificate of Path Completion</div>
            <div className="relative mt-4 text-sm font-semibold text-navy/60">Presented to</div>
            <div className="relative mt-2 font-display text-4xl font-extrabold text-electric sm:text-5xl">{profile.name || 'Friend'}</div>
            <div className="relative mt-4 font-display text-2xl font-extrabold text-[#b8860b]">{path.title || path.label}</div>
            <p className="relative mt-3 max-w-xl text-sm font-semibold leading-relaxed text-navy/70">For completing {modules.map((module) => module.title).join(', ')} and practicing financial decisions through choices, consequences, and reflection.</p>
            <div className="relative mt-7 flex w-full max-w-xl justify-between gap-8 text-xs font-bold text-navy/70"><span>{date}<br /><span className="font-normal">Date</span></span><span>The TAYU Team<br /><span className="font-normal">Signed</span></span></div>
          </div>
        </div>}

        {capstonePassed && <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
          <button type="button" onClick={() => window.print()} className="btn-primary">Print or Save PDF</button>
          <Link to="/modules" className="rounded-2xl bg-white/10 px-6 py-3 font-extrabold">Review my modules</Link>
          <Link to="/" className="rounded-2xl bg-white/10 px-6 py-3 font-extrabold">Home</Link>
        </div>}
      </section>
    </main>
  )
}
