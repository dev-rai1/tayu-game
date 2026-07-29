import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MODULE_CATALOG } from '../constants/modules.js'
import { isLearningPathComplete, loadActiveLearningPath } from '../constants/learningPaths.js'
import { loadProfile } from '../services/walletStore.js'

export default function PathComplete() {
  const navigate = useNavigate()
  const profile = loadProfile() || {}
  const path = loadActiveLearningPath()
  const completed = path && isLearningPathComplete(path.modules, profile.badges || [])
  const modules = MODULE_CATALOG.filter((module) => path?.modules?.includes(module.n))
  const date = new Date(profile.pathCompletion?.completedAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  useEffect(() => {
    if (!completed) navigate('/modules', { replace: true })
  }, [completed, navigate])

  if (!completed || !path) return null

  return (
    <main className="min-h-screen bg-navy px-4 py-8 text-white print:bg-white print:text-navy">
      <section className="mx-auto max-w-4xl text-center">
        <div className="print:hidden">
          <img src="/assets/tayu-logo.webp" alt="TAYU" className="mx-auto h-20 w-20 rounded-2xl" />
          <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.2em] text-teal">Path complete</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-sun">Congratulations, {profile.name || 'Friend'}!</h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg font-semibold text-white/75">You completed every module assigned in the {path.title || path.label} pathway.</p>
        </div>

        <div className="mx-auto mt-8 aspect-[11/8.5] w-full max-w-3xl bg-[#fffdf6] p-3 text-navy shadow-2xl print:mt-0 print:max-w-none print:shadow-none">
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
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
          <button type="button" onClick={() => window.print()} className="btn-primary">Print or Save PDF</button>
          <Link to="/modules" className="rounded-2xl bg-white/10 px-6 py-3 font-extrabold">Review my modules</Link>
          <Link to="/" className="rounded-2xl bg-white/10 px-6 py-3 font-extrabold">Home</Link>
        </div>
      </section>
    </main>
  )
}
