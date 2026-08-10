import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { loadProfile, loadWallet } from '../services/walletStore.js'
import { currentUser } from '../services/auth.js'
import { loadCurrentClassContext } from '../services/classroom.js'
import { setDefaultReadingBandForGrade } from '../services/readingPreferences.js'
import { MODULE_CATALOG } from '../constants/modules.js'
import { ModuleGlossary } from '../components/ModuleGlossary.jsx'
import {
  clearActiveLearningPath,
  completedRequiredModules,
  getGradePath,
  GRADE_PATHS,
  isLearningPathComplete,
  loadActiveLearningPath,
  requiredModules,
  saveActiveLearningPath,
} from '../constants/learningPaths.js'

export const MODULE_CARDS = MODULE_CATALOG
const DEFAULT_CONTEXT = { plain: true, settings: { enabledModules: [1, 2, 3, 4, 5, 6], allowSkip: false } }

export default function ModuleSelect() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [context, setContext] = useState(null)
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const [pendingModule, setPendingModule] = useState(null)
  const [pendingPart, setPendingPart] = useState(null)
  const [gradePathId, setGradePathId] = useState(() => getGradePath(loadActiveLearningPath()?.id)?.id || '')
  const profile = loadProfile()
  const wallet = loadWallet()
  const badges = profile?.badges || []
  const user = currentUser()
  const teacherPreview = user?.role === 'teacher' && params.get('teacherPreview') === '1'
  const gradePath = getGradePath(gradePathId)

  useEffect(() => {
    loadCurrentClassContext().then((value) => setContext(value || DEFAULT_CONTEXT)).catch(() => setContext(DEFAULT_CONTEXT))
  }, [])

  useEffect(() => {
    if (gradePathId) setDefaultReadingBandForGrade(gradePathId)
  }, [gradePathId])

  const teacherEnabled = context?.settings?.enabledModules || DEFAULT_CONTEXT.settings.enabledModules
  const required = useMemo(() => requiredModules({
    pathId: gradePathId,
    classroomModules: teacherEnabled,
    teacherPreview,
    plain: context?.plain !== false,
  }), [context?.plain, gradePathId, teacherEnabled, teacherPreview])
  const completedNumbers = useMemo(() => MODULE_CARDS.filter((module) => badges.includes(module.badge)).map((module) => module.n), [badges])
  const completedRequired = useMemo(() => completedRequiredModules(required, completedNumbers), [completedNumbers, required])
  const pathComplete = isLearningPathComplete(required, badges)
  const firstIncompleteRequired = required.find((number) => !completedNumbers.includes(number)) || required[0] || 1
  const pendingCard = MODULE_CARDS.find((module) => module.n === pendingModule)
  const pendingPartCard = pendingCard?.parts?.find((part) => part.id === pendingPart)

  const gardenSaved = Boolean(wallet && Number(wallet.week || 1) === 5 && wallet.mg)
  const gardenDecisionWeek = Number(wallet?.mg?.week || 1)
  const gardenDone = badges.includes('garden')
  const gardenPartAComplete = gardenDone || (gardenSaved && gardenDecisionWeek >= 6)
  const gardenPartBComplete = gardenDone
  const gardenPartAInProgress = gardenSaved && gardenDecisionWeek <= 5 && !gardenDone
  const gardenPartBInProgress = gardenSaved && gardenDecisionWeek >= 6 && !gardenDone

  useEffect(() => {
    if (!context || teacherPreview || !required.length) return
    const classPath = context.plain === false
    saveActiveLearningPath({
      id: classPath ? `classroom-${context.id || 'assigned'}` : gradePath?.id,
      label: classPath ? `Class session from ${context.teacherEmail || 'your teacher'}` : gradePath?.label,
      title: classPath ? 'Classroom Path' : gradePath?.title,
      modules: required,
    })
  }, [context, gradePath, required, teacherPreview])

  const chooseGradePath = (id) => {
    const path = getGradePath(id)
    if (path) saveActiveLearningPath(path)
    else clearActiveLearningPath()
    setPendingModule(null)
    setPendingPart(null)
    setGradePathId(path?.id || '')
  }

  const canPlay = (moduleNumber) => {
    if (teacherPreview) return teacherEnabled.includes(moduleNumber)
    if (context?.plain) return true
    if (!required.includes(moduleNumber)) return false
    if (context?.settings?.allowSkip) return true
    return moduleNumber === firstIncompleteRequired || completedNumbers.includes(moduleNumber)
  }

  const launchModule = (moduleNumber, gardenPart = null) => {
    const target = MODULE_CARDS.find((module) => module.n === moduleNumber)
    if (!target) return
    const internalWorldModule = target.worldModule || target.n
    let canResume = Boolean(wallet && internalWorldModule === Number(wallet.week || 1) && !badges.includes(target.badge))

    if (target.n === 5 && gardenPart) {
      localStorage.setItem('tayu-garden-entry-part', gardenPart)
      // If the learner intentionally chooses 5A after already reaching 5B,
      // restart 5A instead of silently dropping them back into the later part.
      if (gardenPart === 'A' && gardenPartAComplete) canResume = false
      // A completed 5B replay should begin at 5B, not the very start of 5A.
      if (gardenPart === 'B' && gardenPartBComplete) canResume = false
    }

    // World.jsx interprets this as PUBLIC module numbering. Module 5 maps to
    // the legacy Money Garden world week; Module 6 opens Paycheck Planet.
    if (!canResume || target.n === 6) localStorage.setItem('tayu-jump-module', String(target.n))
    nav('/world')
  }

  const play = (moduleNumber) => {
    if (!canPlay(moduleNumber)) return
    const olderOptional = Boolean(!teacherPreview && context?.plain && gradePath && !required.includes(moduleNumber))
    if (olderOptional) {
      setPendingPart(null)
      setPendingModule(moduleNumber)
    } else launchModule(moduleNumber)
  }

  const playGardenPart = (partId) => {
    if (!canPlay(5)) return
    if (partId === 'B' && !gardenPartAComplete) return
    const olderOptional = Boolean(!teacherPreview && context?.plain && gradePath && !required.includes(5))
    if (olderOptional) {
      setPendingPart(partId)
      setPendingModule(5)
    } else launchModule(5, partId)
  }

  if (!context) return <main className="grid min-h-screen place-items-center">Loading your session…</main>

  if (!teacherPreview && context.plain && !gradePath) {
    return (
      <main className="mx-auto grid min-h-screen max-w-4xl place-items-center px-6 py-10">
        <section className="w-full rounded-3xl border-2 border-teal/40 bg-white/5 p-6 text-center shadow-2xl">
          <img src="/assets/tayu-logo.webp" alt="TAYU" className="mx-auto h-16 w-16 rounded-2xl" />
          <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.18em] text-teal">Get a grade-based recommendation</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold">What grade are you in?</h1>
          <p className="mx-auto mt-2 max-w-2xl font-semibold text-white/70">We recommend a path and reading pace. Every module stays available.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {GRADE_PATHS.map((path) => (
              <button key={path.id} type="button" onClick={() => chooseGradePath(path.id)} className="rounded-2xl border-2 border-white/15 bg-black/20 p-5 text-left transition hover:border-teal hover:bg-white/10 active:scale-[0.98]">
                <div className="text-xs font-extrabold uppercase tracking-wide text-teal">{path.label}</div>
                <div className="mt-1 font-display text-xl font-extrabold">{path.title}</div>
                <p className="mt-2 text-sm font-semibold text-white/70">{path.copy}</p>
                <div className="mt-3 text-sm font-extrabold text-sun">Recommended: Modules {path.modules.join(', ')}</div>
              </button>
            ))}
          </div>
        </section>
      </main>
    )
  }

  return (
    <>
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-12 w-12 rounded-xl" />
            <div>
              <h1 className="font-display text-2xl font-extrabold">{teacherPreview ? 'Preview your classroom session' : context.plain ? 'Choose a module' : 'Your classroom path'}</h1>
              <p className="text-sm font-semibold text-white/75">{context.plain ? `${gradePath?.label || 'Selected grade'} · Modules ${required.join(', ')} are recommended, but you can choose any module.` : `Class session from ${context.teacherEmail || 'your teacher'}`}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setGlossaryOpen(true)} className="rounded-xl bg-sun px-4 py-2 text-sm font-extrabold text-navy">Money word help</button>
            {teacherPreview && <Link to="/teacher-guide" className="rounded-xl bg-teal px-4 py-2 text-sm font-extrabold text-navy">Teacher guide</Link>}
            {!teacherPreview && <Link to="/settings" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-extrabold">Reading settings</Link>}
            {context.plain && !teacherPreview && <button type="button" onClick={() => chooseGradePath('')} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-extrabold">Change grade</button>}
            <Link to={user?.role === 'teacher' ? '/teacher' : '/'} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-extrabold">Back</Link>
          </div>
        </div>

        {!teacherPreview && pathComplete && required.length < MODULE_CARDS.length && <Link to="/path-complete" className="mt-6 block rounded-2xl border-2 border-teal bg-teal px-5 py-4 text-center font-display text-xl font-extrabold text-navy shadow-lg">Recommended path complete — view your certificate</Link>}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {MODULE_CARDS.map((module) => {
            const done = badges.includes(module.badge)
            const accessible = canPlay(module.n)
            const requiredForPath = required.includes(module.n)
            const olderOptional = Boolean(context.plain && gradePath && !requiredForPath)

            if (module.parts?.length) {
              return (
                <section key={module.n} className="rounded-3xl border-2 border-white/15 bg-white/5 p-5 sm:col-span-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/55">Investing sequence</div>
                      <h2 className="mt-1 font-display text-xl font-extrabold text-white">Module 5 · Money Garden</h2>
                      <p className="mt-1 max-w-2xl text-sm font-semibold text-white/70">This is intentionally split into two separate modules. Finish 5A first, then 5B unlocks from the same saved portfolio.</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${done ? 'bg-teal text-navy' : olderOptional ? 'bg-sun text-navy' : accessible ? 'bg-white/15 text-white' : 'bg-white/10 text-white/55'}`}>{done ? 'BOTH COMPLETE' : !accessible ? 'LOCKED' : olderOptional ? 'OLDER TOPIC' : requiredForPath ? 'RECOMMENDED' : 'AVAILABLE'}</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {module.parts.map((part) => {
                      const partDone = part.id === 'A' ? gardenPartAComplete : gardenPartBComplete
                      const partInProgress = part.id === 'A' ? gardenPartAInProgress : gardenPartBInProgress
                      const partAccessible = accessible && (part.id === 'A' || gardenPartAComplete)
                      const action = !partAccessible
                        ? 'Finish Module 5A first'
                        : partDone
                          ? `Replay ${part.label} →`
                          : partInProgress
                            ? `Resume ${part.label} →`
                            : `Start ${part.label} →`
                      return (
                        <button
                          key={part.id}
                          type="button"
                          disabled={!partAccessible}
                          onClick={() => playGardenPart(part.id)}
                          className={`rounded-2xl border-2 p-4 text-left transition ${partAccessible ? 'bg-black/15 hover:bg-white/10 active:scale-[0.98]' : 'cursor-not-allowed bg-black/25 opacity-60'}`}
                          style={{ borderColor: partAccessible ? part.color : 'rgba(255,255,255,.12)' }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display text-lg font-extrabold" style={{ color: part.color }}>{part.label}</span>
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-extrabold" style={{ background: `${part.color}22`, color: partAccessible ? part.color : 'rgba(255,255,255,.55)' }}>{partDone ? 'DONE' : partInProgress ? 'IN PROGRESS' : partAccessible ? 'READY' : 'LOCKED'}</span>
                          </div>
                          <div className="mt-1 font-display text-base font-extrabold text-white">{part.title}</div>
                          <div className="mt-1 text-xs font-extrabold uppercase tracking-wide text-white/55">{part.minutes}</div>
                          <p className="mt-2 text-sm font-semibold text-white/75">{part.desc}</p>
                          <div className="mt-3 text-sm font-extrabold" style={{ color: partAccessible ? part.color : 'rgba(255,255,255,.45)' }}>{action}</div>
                        </button>
                      )
                    })}
                  </div>
                </section>
              )
            }

            const action = done
              ? 'Play again →'
              : olderOptional
                ? 'Optional — choose this module →'
                : requiredForPath
                  ? 'Start recommended module →'
                  : 'Start →'
            return (
              <button key={module.n} type="button" disabled={!accessible} onClick={() => play(module.n)} className={`relative rounded-3xl border-2 p-5 text-left transition ${accessible ? 'bg-white/5 hover:bg-white/10 active:scale-[0.98]' : 'cursor-not-allowed bg-black/25 opacity-70'}`} style={{ borderColor: done ? module.color : olderOptional ? '#FFD700' : 'rgba(255,255,255,0.1)' }}>
                <div className="flex items-center justify-between gap-2"><span className="font-display text-lg font-extrabold" style={{ color: module.color }}>{module.n}. {module.title}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${done ? 'bg-teal text-navy' : olderOptional ? 'bg-sun text-navy' : accessible ? 'bg-sun text-navy' : 'bg-white/15 text-white/75'}`}>{done ? 'DONE' : !accessible ? 'LOCKED' : olderOptional ? 'OLDER TOPIC' : requiredForPath ? 'RECOMMENDED' : 'AVAILABLE'}</span></div>
                <div className="mt-1 text-xs font-extrabold uppercase tracking-wide text-white/75">{module.grades} · {module.minutes}</div>
                <p className="mt-2 text-sm font-semibold text-white/80">{module.desc}</p>
                <div className="mt-3 text-sm font-extrabold" style={{ color: accessible ? module.color : 'rgba(255,255,255,.55)' }}>{accessible ? action : `Complete Module ${firstIncompleteRequired} first`}</div>
              </button>
            )
          })}
        </div>

        <p className="mt-6 rounded-2xl bg-white/5 p-4 text-center text-sm font-bold text-white/70">Complete the {required.length} recommended core module{required.length === 1 ? '' : 's'} for your path ({completedRequired.length}/{required.length}). The investing sequence is split clearly into Module 5A and Module 5B, followed by Paycheck Planet as Module 6 in the same TAYU world.</p>
      </main>

      {pendingCard && <div className="fixed inset-0 z-[600] grid place-items-center bg-navy/75 p-5 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="older-module-title" className="w-full max-w-md rounded-3xl border-4 border-sun bg-white p-6 text-center text-navy shadow-2xl"><div className="text-5xl" aria-hidden>🧠</div><h2 id="older-module-title" className="mt-3 font-display text-2xl font-extrabold">You can still continue</h2><p className="mt-3 font-bold text-navy/80"><span className="font-extrabold">{pendingPartCard ? `${pendingPartCard.label}: ${pendingPartCard.title}` : pendingCard.title}</span> is usually recommended for {pendingCard.grades.toLowerCase()}.</p><div className="mt-5 grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => { setPendingModule(null); setPendingPart(null) }} className="min-h-[54px] rounded-2xl bg-navy/10 px-4 font-extrabold text-navy">Choose another</button><button type="button" onClick={() => { const number = pendingModule; const part = pendingPart; setPendingModule(null); setPendingPart(null); launchModule(number, part) }} className="min-h-[54px] rounded-2xl bg-electric px-4 font-extrabold text-white">Continue anyway →</button></div></section></div>}

      <ModuleGlossary open={glossaryOpen} onClose={() => setGlossaryOpen(false)} modules={context.plain && !teacherPreview ? MODULE_CARDS.map((module) => module.n) : required} />
    </>
  )
}
