import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { loadProfile, loadWallet } from '../services/walletStore.js'
import { currentUser } from '../services/auth.js'
import { loadCurrentClassContext } from '../services/classroom.js'
import { setDefaultReadingBandForGrade } from '../services/readingPreferences.js'
import { MODULE_CATALOG } from '../constants/modules.js'
import { ModuleGlossary } from '../components/ModuleGlossary.jsx'
import { TownBackground } from '../components/TownBackground.jsx'
import { MuteButton } from '../components/MuteButton.jsx'
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
const LOGO = '/assets/tayu-logo.webp'
const DEFAULT_CONTEXT = { plain: true, settings: { enabledModules: MODULE_CARDS.map((module) => module.n), allowSkip: false } }
const PATH_TIME = {
  'early-elementary': 'About 15–22 minutes total',
  'upper-elementary': 'About 22–32 minutes total',
  'middle-school': 'About 60–85 minutes total',
  'high-school': 'About 60–85 minutes total',
}

function StatusPill({ done, inProgress = false, accessible = true, recommended = false }) {
  const label = done ? '✓ COMPLETED' : inProgress ? '▶ IN PROGRESS' : !accessible ? '🔒 LOCKED' : recommended ? '★ PLAY NEXT' : 'READY'
  const styles = done
    ? 'bg-teal/20 text-navy ring-1 ring-teal/40'
    : inProgress
      ? 'bg-sun/40 text-navy ring-1 ring-sun/70'
      : !accessible
        ? 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
        : recommended
          ? 'bg-sun text-navy ring-1 ring-[#d3a800]'
          : 'bg-electric/10 text-electric ring-1 ring-electric/20'
  return <span className={`rounded-full px-3 py-1.5 text-xs font-extrabold tracking-wide ${styles}`}>{label}</span>
}

function AnimatedPage({ children, className = '' }) {
  return (
    <main className={`relative min-h-screen overflow-hidden bg-[#eef8ff] text-navy ${className}`}>
      <div className="fixed inset-0">
        <TownBackground theme="play" scrim={0.82} />
      </div>
      <div className="relative z-10">{children}</div>
    </main>
  )
}

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
  const firstTimePlayer = completedNumbers.length === 0 && Number(wallet?.week || 1) <= 1
  const showFirstTimeStart = Boolean(!teacherPreview && context?.plain && firstTimePlayer && MODULE_CARDS.some((module) => module.n === 1))

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
      if (gardenPart === 'A' && gardenPartAComplete) canResume = false
      if (gardenPart === 'B' && gardenPartBComplete) canResume = false
    }

    // Later public modules may share a continuous end-of-world sequence. Keep
    // the requested public module number so World can route to the right stop.
    if (!canResume || target.n >= 6) localStorage.setItem('tayu-jump-module', String(target.n))
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

  if (!context) {
    return (
      <AnimatedPage>
        <div className="grid min-h-screen place-items-center px-6">
          <div className="rounded-3xl border border-navy/10 bg-white/95 px-7 py-5 font-display text-lg font-extrabold text-navy shadow-xl backdrop-blur-md">
            Loading your TAYU adventure…
          </div>
        </div>
      </AnimatedPage>
    )
  }

  if (!teacherPreview && context.plain && !gradePath) {
    return (
      <AnimatedPage>
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-12">
          <header className="mb-6 flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-3 rounded-2xl bg-white/90 px-3 py-2 shadow-md backdrop-blur-sm">
              <img src={LOGO} alt="TAYU" className="h-12 w-12 rounded-2xl shadow" />
              <span className="font-display text-2xl font-extrabold text-navy">TAYU</span>
            </Link>
            <MuteButton showLabel />
          </header>

          <section className="rounded-[2rem] border-2 border-white/90 bg-white/92 p-6 text-center shadow-2xl backdrop-blur-md sm:p-9">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-electric">Build your adventure</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold text-navy sm:text-5xl">Choose your grade</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-relaxed text-navy/75 sm:text-lg">
              We’ll show you the best module path for your grade. You can still explore other available modules anytime.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {GRADE_PATHS.map((path) => (
                <button
                  key={path.id}
                  type="button"
                  onClick={() => chooseGradePath(path.id)}
                  className="group min-h-[190px] rounded-3xl border-2 border-navy/10 bg-white p-5 text-left text-navy shadow-md transition hover:-translate-y-1 hover:border-electric/35 hover:shadow-xl active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-electric/10 px-3 py-1.5 text-sm font-extrabold text-electric">{path.label}</span>
                    <span className="text-2xl font-extrabold text-electric transition group-hover:translate-x-1">→</span>
                  </div>
                  <div className="mt-4 font-display text-2xl font-extrabold">{path.title}</div>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-navy/70 sm:text-base">{path.copy}</p>
                  <div className="mt-4 rounded-2xl bg-navy/5 p-3 text-sm font-extrabold text-navy">Modules {path.modules.join(' → ')}</div>
                  <div className="mt-2 text-xs font-extrabold uppercase tracking-wide text-electric">{PATH_TIME[path.id]}</div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </AnimatedPage>
    )
  }

  return (
    <>
      <AnimatedPage>
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-9">
          <header className="rounded-[2rem] border-2 border-white/90 bg-white/92 p-5 text-navy shadow-2xl backdrop-blur-md sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <img src={LOGO} alt="TAYU" className="h-14 w-14 shrink-0 rounded-2xl shadow-lg sm:h-16 sm:w-16" />
                <div className="min-w-0">
                  <div className="text-sm font-extrabold uppercase tracking-[0.18em] text-electric">TAYU module selection</div>
                  <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight text-navy sm:text-4xl lg:text-5xl">
                    {teacherPreview ? 'Classroom Module Preview' : 'Choose your next module'}
                  </h1>
                  <p className="mt-2 max-w-2xl text-base font-semibold leading-relaxed text-navy/70">
                    {context.plain
                      ? `${gradePath?.label || 'Selected grade'} pathway · ${PATH_TIME[gradePath?.id] || 'Play at your own pace'}`
                      : `Class session from ${context.teacherEmail || 'your teacher'}`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <MuteButton showLabel />
                <button type="button" onClick={() => setGlossaryOpen(true)} className="min-h-[44px] rounded-xl bg-sun px-4 py-2 text-sm font-extrabold text-navy shadow-sm hover:brightness-105">Money word help</button>
                {teacherPreview && <Link to="/teacher-guide" className="grid min-h-[44px] place-items-center rounded-xl bg-teal px-4 py-2 text-sm font-extrabold text-navy">Teacher guide</Link>}
                {!teacherPreview && <Link to="/settings" className="grid min-h-[44px] place-items-center rounded-xl border border-navy/15 bg-white px-4 py-2 text-sm font-extrabold text-navy shadow-sm">Reading settings</Link>}
                {context.plain && !teacherPreview && <button type="button" onClick={() => chooseGradePath('')} className="min-h-[44px] rounded-xl border border-navy/15 bg-white px-4 py-2 text-sm font-extrabold text-navy shadow-sm">Change grade</button>}
                <Link to={user?.role === 'teacher' ? '/teacher' : '/'} className="grid min-h-[44px] place-items-center rounded-xl bg-navy px-4 py-2 text-sm font-extrabold text-white shadow-sm">Back</Link>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-electric/15 bg-[#eef8ff]/95 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-electric">Your recommended path</div>
                  <div className="mt-1 text-base font-extrabold leading-relaxed text-navy sm:text-lg">{required.map((n) => `Module ${n}`).join('  →  ') || 'Teacher-selected modules'}</div>
                </div>
                <div className="w-fit rounded-full bg-white px-4 py-2 text-sm font-extrabold text-navy shadow-sm">{completedRequired.length}/{required.length} complete</div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-navy/10">
                <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${required.length ? Math.round((completedRequired.length / required.length) * 100) : 0}%` }} />
              </div>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-navy/65">Follow the highlighted next module, or choose another available module to explore.</p>
            </div>
          </header>

          {showFirstTimeStart && canPlay(1) && (
            <button
              type="button"
              onClick={() => play(1)}
              className="group mt-5 w-full rounded-[2rem] border-2 border-electric bg-white/95 p-5 text-left text-navy shadow-xl backdrop-blur-md transition hover:-translate-y-1 hover:shadow-2xl active:scale-[0.995] sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="inline-flex rounded-full bg-electric px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white">Start here · Module 1 · First time</div>
                  <h2 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">New to TAYU? Begin with Module 1.</h2>
                  <p className="mt-2 max-w-3xl text-base font-semibold leading-relaxed text-navy/70">Start at the beginning, learn the core money choices, and then move through your recommended path in order.</p>
                </div>
                <span className="shrink-0 rounded-2xl bg-electric px-5 py-3 font-display text-lg font-extrabold text-white shadow-md transition group-hover:translate-x-1">Start Module 1 →</span>
              </div>
            </button>
          )}

          {!teacherPreview && pathComplete && required.length < MODULE_CARDS.length && (
            <Link to="/path-complete" className="mt-5 block rounded-2xl border-2 border-teal bg-white/95 px-5 py-4 text-center font-display text-xl font-extrabold text-navy shadow-lg backdrop-blur-sm">✓ Recommended path complete — view your certificate</Link>
          )}

          <section className="mt-6 grid gap-5 lg:grid-cols-2">
            {MODULE_CARDS.map((module) => {
              const done = badges.includes(module.badge)
              const accessible = canPlay(module.n)
              const requiredForPath = required.includes(module.n)
              const olderOptional = Boolean(context.plain && gradePath && !requiredForPath)
              const isNext = accessible && !done && module.n === firstIncompleteRequired
              const firstTimeStart = Boolean(showFirstTimeStart && module.n === 1 && !done)

              if (module.parts?.length) {
                return (
                  <article key={module.n} className="overflow-hidden rounded-[2rem] border-2 bg-white/95 text-navy shadow-xl backdrop-blur-sm lg:col-span-2" style={{ borderColor: module.color }}>
                    <div className="p-5 sm:p-6" style={{ background: `linear-gradient(120deg, ${module.color}18, rgba(255,255,255,.98) 46%)` }}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-sm font-extrabold uppercase tracking-[0.14em] text-navy/55">Module {module.n} · Investing world</div>
                          <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">{module.title}</h2>
                          <p className="mt-2 max-w-3xl text-base font-semibold leading-relaxed text-navy/70">Two connected parts. Finish 5A, then 5B unlocks using the same portfolio.</p>
                        </div>
                        <StatusPill done={done} inProgress={gardenPartAInProgress || gardenPartBInProgress} accessible={accessible} recommended={isNext} />
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        {module.parts.map((part) => {
                          const partDone = part.id === 'A' ? gardenPartAComplete : gardenPartBComplete
                          const partInProgress = part.id === 'A' ? gardenPartAInProgress : gardenPartBInProgress
                          const partAccessible = accessible && (part.id === 'A' || gardenPartAComplete)
                          const action = !partAccessible ? 'Finish Module 5A first' : partDone ? `Replay ${part.label}` : partInProgress ? `Resume ${part.label}` : `Start ${part.label}`
                          return (
                            <button
                              key={part.id}
                              type="button"
                              disabled={!partAccessible}
                              onClick={() => playGardenPart(part.id)}
                              className={`rounded-3xl border-2 p-5 text-left shadow-sm transition ${partAccessible ? 'bg-white hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]' : 'cursor-not-allowed bg-slate-50 opacity-60'}`}
                              style={{ borderColor: partAccessible ? part.color : '#cbd5e1' }}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-display text-lg font-extrabold" style={{ color: part.color }}>{part.label}</span>
                                <StatusPill done={partDone} inProgress={partInProgress} accessible={partAccessible} />
                              </div>
                              <div className="mt-3 font-display text-xl font-extrabold sm:text-2xl">{part.title}</div>
                              <div className="mt-2 text-sm font-extrabold uppercase tracking-wide text-navy/50">{part.minutes}</div>
                              <p className="mt-3 text-base font-semibold leading-relaxed text-navy/70">{part.desc}</p>
                              <div className="mt-5 grid min-h-[50px] place-items-center rounded-xl px-4 py-3 text-center text-sm font-extrabold text-white shadow-sm" style={{ background: partAccessible ? part.color : '#64748b' }}>{action} →</div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </article>
                )
              }

              const action = done
                ? `Replay Module ${module.n}`
                : firstTimeStart
                  ? 'Start here — Module 1'
                  : isNext
                    ? `Continue with Module ${module.n}`
                    : olderOptional
                      ? `Explore Module ${module.n}`
                      : `Start Module ${module.n}`

              return (
                <button
                  key={module.n}
                  type="button"
                  disabled={!accessible}
                  onClick={() => play(module.n)}
                  className={`group overflow-hidden rounded-[2rem] border-2 bg-white/95 text-left text-navy shadow-xl backdrop-blur-sm transition ${accessible ? 'hover:-translate-y-1 hover:shadow-2xl active:scale-[0.99]' : 'cursor-not-allowed opacity-65'}`}
                  style={{ borderColor: done || isNext || firstTimeStart ? module.color : 'rgba(7,23,72,.12)' }}
                >
                  <div className="p-5 sm:p-6" style={{ background: `linear-gradient(135deg, ${module.color}16 0%, rgba(255,255,255,.98) 52%)` }}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-extrabold text-white shadow" style={{ background: module.color }}>{module.n}</div>
                      <StatusPill done={done} accessible={accessible} recommended={isNext || firstTimeStart} />
                    </div>

                    {firstTimeStart && <div className="mt-4 inline-flex rounded-full bg-electric px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white">Start here · first time</div>}
                    <div className="mt-4 text-sm font-extrabold uppercase tracking-[0.14em] text-navy/50">Module {module.n}</div>
                    <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">{module.title}</h2>
                    <div className="mt-3 text-sm font-extrabold text-navy/55">{module.grades} · {module.minutes}</div>
                    <p className="mt-3 text-base font-semibold leading-relaxed text-navy/72">{module.desc}</p>
                    <div className="mt-5 grid min-h-[52px] place-items-center rounded-xl px-4 py-3 text-center text-base font-extrabold text-white shadow-md transition group-hover:brightness-105" style={{ background: accessible ? module.color : '#64748b' }}>
                      {accessible ? action : `Complete Module ${firstIncompleteRequired} first`} →
                    </div>
                  </div>
                </button>
              )
            })}
          </section>

          <div className="mt-6 rounded-3xl border border-navy/10 bg-white/92 p-5 text-center text-sm font-semibold leading-relaxed text-navy/70 shadow-md backdrop-blur-md">
            <strong className="font-extrabold text-navy">Your TAYU journey:</strong> {MODULE_CARDS.map((module) => `Module ${module.n}`).join(' → ')}. Your progress stays saved, so you can return and continue anytime.
          </div>
        </div>
      </AnimatedPage>

      {pendingCard && (
        <div className="fixed inset-0 z-[600] grid place-items-center bg-navy/70 p-5 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="older-module-title" className="w-full max-w-md rounded-3xl border-2 border-sun bg-white p-6 text-center text-navy shadow-2xl">
            <div className="text-5xl" aria-hidden>🧠</div>
            <h2 id="older-module-title" className="mt-3 font-display text-2xl font-extrabold">You can still explore this module</h2>
            <p className="mt-3 text-base font-semibold leading-relaxed text-navy/75"><span className="font-extrabold">{pendingPartCard ? `${pendingPartCard.label}: ${pendingPartCard.title}` : pendingCard.title}</span> is usually recommended for {pendingCard.grades.toLowerCase()}.</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => { setPendingModule(null); setPendingPart(null) }} className="min-h-[54px] rounded-2xl bg-navy/10 px-4 font-extrabold text-navy">Choose another</button>
              <button type="button" onClick={() => { const number = pendingModule; const part = pendingPart; setPendingModule(null); setPendingPart(null); launchModule(number, part) }} className="min-h-[54px] rounded-2xl bg-electric px-4 font-extrabold text-white">Explore anyway →</button>
            </div>
          </section>
        </div>
      )}

      <ModuleGlossary open={glossaryOpen} onClose={() => setGlossaryOpen(false)} modules={context.plain && !teacherPreview ? MODULE_CARDS.map((module) => module.n) : required} />
    </>
  )
}
