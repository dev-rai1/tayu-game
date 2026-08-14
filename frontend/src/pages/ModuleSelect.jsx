import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { loadProfile, loadWallet } from '../services/walletStore.js'
import { currentUser } from '../services/auth.js'
import { loadCurrentClassContext } from '../services/classroom.js'
import { setDefaultReadingBandForGrade } from '../services/readingPreferences.js'
import { MODULE_CATALOG } from '../constants/modules.js'
import { ModuleGlossary } from '../components/ModuleGlossary.jsx'
import { TownBackground } from '../components/TownBackground.jsx'
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
const DEFAULT_CONTEXT = { plain: true, settings: { enabledModules: [1, 2, 3, 4, 5, 6, 7], allowSkip: false } }
const PATH_TIME = {
  'early-elementary': 'About 15–22 minutes total',
  'upper-elementary': 'About 22–32 minutes total',
  'middle-school': 'About 60–85 minutes total',
  'high-school': 'About 60–85 minutes total',
}
const GRADE_ACCENT = {
  'early-elementary': '#1464F0',
  'upper-elementary': '#1464F0',
  'middle-school': '#7850F0',
  'high-school': '#00A77A',
}

function StatusPill({ done, inProgress = false, accessible = true, recommended = false }) {
  const label = done ? '✓ Completed' : inProgress ? '▶ In progress' : !accessible ? 'Locked' : recommended ? '★ Play next' : 'Ready'
  const styles = done
    ? 'bg-slate-100 text-slate-800'
    : inProgress
      ? 'bg-slate-900 text-white'
      : !accessible
        ? 'bg-slate-100 text-slate-400'
        : recommended
          ? 'bg-slate-950 text-white'
          : 'border border-slate-200 bg-white text-slate-700'
  return <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wide ${styles}`}>{label}</span>
}

function PageBackground() {
  return (
    <div className="fixed inset-0" aria-hidden="true">
      <TownBackground theme="play" scrim={0.72} />
    </div>
  )
}

function GradeCard({ path, onChoose }) {
  const accent = GRADE_ACCENT[path.id] || '#1464F0'
  return (
    <button
      type="button"
      onClick={() => onChoose(path.id)}
      className="group rounded-3xl border border-slate-200 bg-white p-5 text-left text-slate-950 shadow-md transition hover:-translate-y-1 hover:shadow-xl active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">{path.label}</div>
          <div className="mt-1 font-display text-2xl font-extrabold" style={{ color: accent }}>{path.title}</div>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-950 text-lg font-extrabold text-white transition group-hover:translate-x-0.5">→</span>
      </div>
      <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-700">{path.copy}</p>
      <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-extrabold text-slate-800">Modules {path.modules.join(' → ')}</div>
      <div className="mt-2 text-xs font-bold text-slate-500">{PATH_TIME[path.id]}</div>
    </button>
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
  const pathAccent = GRADE_ACCENT[gradePath?.id] || '#1464F0'

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
      if (gardenPart === 'A' && gardenPartAComplete) canResume = false
      if (gardenPart === 'B' && gardenPartBComplete) canResume = false
    } else {
      localStorage.removeItem('tayu-garden-entry-part')
    }

    const restart = !canResume || target.n === 6 || target.n === 7
    localStorage.setItem('tayu-module-entry-intent', JSON.stringify({
      moduleId: String(target.n),
      gardenEntryPart: gardenPart,
      resume: !restart,
    }))
    if (restart) localStorage.setItem('tayu-jump-module', String(target.n))
    else localStorage.removeItem('tayu-jump-module')
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
      <main className="grid min-h-screen place-items-center bg-[#eef8ff] text-slate-950">
        <div className="rounded-2xl bg-white px-6 py-4 font-extrabold shadow-lg">Loading your TAYU adventure…</div>
      </main>
    )
  }

  if (!teacherPreview && context.plain && !gradePath) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#eef8ff] px-4 py-7 text-slate-950 sm:px-6 sm:py-10">
        <PageBackground />
        <div className="relative mx-auto max-w-5xl">
          <div className="flex justify-end">
            <Link to="/" className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-2 text-sm font-extrabold text-slate-900 shadow-md backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-lg">← Back home</Link>
          </div>
          <section className="mt-4 rounded-[2rem] border border-white/80 bg-white/95 p-6 shadow-2xl backdrop-blur-md sm:p-9">
            <div className="flex flex-col items-center text-center">
              <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-16 w-16 rounded-2xl shadow-md" />
              <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">TAYU module menu</p>
              <h1 className="mt-2 font-display text-4xl font-extrabold text-slate-950 sm:text-5xl">Choose your grade level</h1>
              <p className="mt-3 max-w-2xl text-base font-semibold leading-relaxed text-slate-700">Pick the pathway that matches you. The screen stays simple, and the module names use your grade-level color.</p>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {GRADE_PATHS.map((path) => <GradeCard key={path.id} path={path} onChoose={chooseGradePath} />)}
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-[#eef8ff] px-4 py-5 text-slate-950 sm:px-6 sm:py-8">
        <PageBackground />
        <div className="relative mx-auto max-w-6xl">
          <header className="rounded-[2rem] border border-white/80 bg-white/95 p-5 shadow-2xl backdrop-blur-md sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="flex items-center gap-4">
                <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-14 w-14 rounded-2xl shadow-md sm:h-16 sm:w-16" />
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">TAYU module menu</div>
                  <h1 className="mt-1 font-display text-3xl font-extrabold text-slate-950 sm:text-4xl">{teacherPreview ? 'Classroom module preview' : 'Choose your next module'}</h1>
                  <p className="mt-1 max-w-2xl text-sm font-semibold text-slate-700">{context.plain ? `${gradePath?.label || 'Selected grade'} · ${PATH_TIME[gradePath?.id] || 'Play at your own pace'}` : `Class session from ${context.teacherEmail || 'your teacher'}`}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setGlossaryOpen(true)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-900 shadow-sm transition hover:bg-slate-50">Money word help</button>
                {teacherPreview && <Link to="/teacher-guide" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-900 shadow-sm">Teacher guide</Link>}
                {!teacherPreview && <Link to="/settings" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-900 shadow-sm">Reading settings</Link>}
                {context.plain && !teacherPreview && <button type="button" onClick={() => chooseGradePath('')} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-900 shadow-sm">Change grade</button>}
                <Link to={user?.role === 'teacher' ? '/teacher' : '/'} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-extrabold text-white shadow-sm">← Home</Link>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Recommended path</div>
                  <div className="mt-1 text-base font-extrabold text-slate-950 sm:text-lg">{required.map((n) => `Module ${n}`).join(' → ') || 'Teacher-selected modules'}</div>
                </div>
                <div className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-slate-900 shadow-sm">{completedRequired.length}/{required.length} complete</div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full transition-all" style={{ width: `${required.length ? Math.round((completedRequired.length / required.length) * 100) : 0}%`, backgroundColor: pathAccent }} />
              </div>
            </div>
          </header>

          {!teacherPreview && pathComplete && required.length < MODULE_CARDS.length && (
            <Link to="/path-complete" className="mt-5 block rounded-2xl border border-slate-200 bg-white/95 px-5 py-4 text-center font-display text-xl font-extrabold text-slate-950 shadow-lg backdrop-blur-md">Recommended path complete — view your certificate →</Link>
          )}

          <section className="mt-5 grid gap-4 lg:grid-cols-2">
            {MODULE_CARDS.map((module) => {
              const done = badges.includes(module.badge)
              const accessible = canPlay(module.n)
              const requiredForPath = required.includes(module.n)
              const olderOptional = Boolean(context.plain && gradePath && !requiredForPath)
              const isNext = accessible && !done && module.n === firstIncompleteRequired

              if (module.parts?.length) {
                return (
                  <article key={module.n} className="rounded-[2rem] border border-slate-200 bg-white p-5 text-slate-950 shadow-lg lg:col-span-2 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Module 5 · Investing</div>
                        <h2 className="mt-1 font-display text-2xl font-extrabold" style={{ color: pathAccent }}>Money Garden</h2>
                        <p className="mt-1 max-w-2xl text-sm font-semibold leading-relaxed text-slate-700">Two connected parts. Finish 5A, then 5B unlocks using the same portfolio.</p>
                      </div>
                      <StatusPill done={done} inProgress={gardenPartAInProgress || gardenPartBInProgress} accessible={accessible} recommended={isNext} />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {module.parts.map((part) => {
                        const partDone = part.id === 'A' ? gardenPartAComplete : gardenPartBComplete
                        const partInProgress = part.id === 'A' ? gardenPartAInProgress : gardenPartBInProgress
                        const partAccessible = accessible && (part.id === 'A' || gardenPartAComplete)
                        const action = !partAccessible ? 'Finish Module 5A first' : partDone ? `Replay ${part.label}` : partInProgress ? `Resume ${part.label}` : `Play ${part.label}`
                        return (
                          <button key={part.id} type="button" disabled={!partAccessible} onClick={() => playGardenPart(part.id)} className={`rounded-2xl border border-slate-200 p-4 text-left transition ${partAccessible ? 'bg-white hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]' : 'cursor-not-allowed bg-slate-50 opacity-60'}`}>
                            <div className="flex items-center justify-between gap-2"><span className="font-display text-lg font-extrabold text-slate-950">{part.label}</span><StatusPill done={partDone} inProgress={partInProgress} accessible={partAccessible} /></div>
                            <div className="mt-2 font-display text-xl font-extrabold text-slate-950">{part.title}</div>
                            <div className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{part.minutes}</div>
                            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-700">{part.desc}</p>
                            <div className={`mt-4 rounded-xl px-4 py-3 text-center text-sm font-extrabold ${partAccessible ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-500'}`}>{action} →</div>
                          </button>
                        )
                      })}
                    </div>
                  </article>
                )
              }

              const physicalDestination = Boolean(module.physicalDestination)
              const finalModule = module.n === 7
              const action = done
                ? `Replay Module ${module.n}`
                : module.n === 6
                  ? 'Start Module 6 · Bond Street'
                  : module.n === 7
                    ? 'Start Module 7 · Tax Office'
                    : isNext
                      ? `Play Module ${module.n} now`
                      : olderOptional
                        ? `Explore Module ${module.n}`
                        : `Play Module ${module.n}`
              return (
                <button key={module.n} type="button" disabled={!accessible} onClick={() => play(module.n)} className={`group rounded-[2rem] border bg-white p-5 text-left text-slate-950 shadow-lg transition sm:p-6 ${accessible ? 'hover:-translate-y-1 hover:shadow-xl active:scale-[0.99]' : 'cursor-not-allowed opacity-60'}`} style={{ borderColor: physicalDestination ? module.color : '#e2e8f0' }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl text-lg font-extrabold text-white" style={{ backgroundColor: physicalDestination ? module.color : '#020617' }}>{module.n}</div>
                    <StatusPill done={done} accessible={accessible} recommended={isNext} />
                  </div>
                  <div className="mt-4 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{physicalDestination ? `Module ${module.n} · Separate 3D destination` : `Module ${module.n}`}</div>
                  <h2 className="mt-1 font-display text-2xl font-extrabold" style={{ color: physicalDestination ? module.color : pathAccent }}>{module.title}</h2>
                  {physicalDestination && <div className="mt-2 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-extrabold text-orange-800">Walk-in world location · big building label</div>}
                  {finalModule && <div className="mt-2 ml-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">Final module · Tax Office</div>}
                  <div className="mt-2 text-xs font-bold text-slate-500">{module.grades} · {module.minutes}</div>
                  <p className="mt-3 min-h-[3rem] text-sm font-semibold leading-relaxed text-slate-700">{module.desc}</p>
                  <div className={`mt-5 rounded-xl px-4 py-3 text-center text-sm font-extrabold ${accessible ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-500'}`}>{accessible ? action : `Complete Module ${firstIncompleteRequired} first`} →</div>
                </button>
              )
            })}
          </section>

          <div className="mt-5 rounded-2xl border border-white/80 bg-white/95 p-4 text-center text-sm font-semibold text-slate-700 shadow-md backdrop-blur-md">
            <strong className="text-slate-950">Journey:</strong> Market → Lemonade Stand → Budget Town → Bank → Money Garden → Bond Street → Tax Office → Finale. Modules 6 and 7 are separate labeled 3D destinations.
          </div>
        </div>
      </main>

      {pendingCard && (
        <div className="fixed inset-0 z-[600] grid place-items-center bg-slate-950/70 p-5 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="older-module-title" className="w-full max-w-md rounded-3xl bg-white p-6 text-center text-slate-950 shadow-2xl">
            <h2 id="older-module-title" className="font-display text-2xl font-extrabold">You can still explore this module</h2>
            <p className="mt-3 font-semibold leading-relaxed text-slate-700"><span className="font-extrabold text-slate-950">{pendingPartCard ? `${pendingPartCard.label}: ${pendingPartCard.title}` : pendingCard.title}</span> is usually recommended for {pendingCard.grades.toLowerCase()}.</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => { setPendingModule(null); setPendingPart(null) }} className="min-h-[54px] rounded-2xl bg-slate-100 px-4 font-extrabold text-slate-900">Choose another</button>
              <button type="button" onClick={() => { const number = pendingModule; const part = pendingPart; setPendingModule(null); setPendingPart(null); launchModule(number, part) }} className="min-h-[54px] rounded-2xl bg-slate-950 px-4 font-extrabold text-white">Explore anyway →</button>
            </div>
          </section>
        </div>
      )}

      <ModuleGlossary open={glossaryOpen} onClose={() => setGlossaryOpen(false)} modules={context.plain && !teacherPreview ? MODULE_CARDS.map((module) => module.n) : required} />
    </>
  )
}
