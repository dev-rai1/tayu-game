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
const DEFAULT_CONTEXT = { plain: true, settings: { enabledModules: [1, 2, 3, 4, 5, 6, 7], allowSkip: false } }
const PATH_TIME = {
  'early-elementary': 'About 15–22 minutes total',
  'upper-elementary': 'About 22–32 minutes total',
  'middle-school': 'About 60–85 minutes total',
  'high-school': 'About 60–85 minutes total',
}

function StatusPill({ done, inProgress = false, accessible = true, recommended = false }) {
  const label = done ? '✓ COMPLETED' : inProgress ? '▶ IN PROGRESS' : !accessible ? '🔒 LOCKED' : recommended ? '★ PLAY NEXT' : 'READY'
  const styles = done
    ? 'bg-teal text-navy'
    : inProgress
      ? 'bg-sun text-navy'
      : !accessible
        ? 'bg-white/10 text-white/60'
        : recommended
          ? 'bg-sun text-navy'
          : 'bg-white text-navy'
  return <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wide ${styles}`}>{label}</span>
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

    // Record the selection itself separately from restart state. This lets World
    // show the teleport-first start gate for both fresh starts and saved resumes
    // without changing normal direct /world resume behavior.
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

  if (!context) return <main className="grid min-h-screen place-items-center bg-navy text-white"><div className="rounded-2xl bg-white/10 px-6 py-4 font-extrabold">Loading your TAYU adventure…</div></main>

  if (!teacherPreview && context.plain && !gradePath) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-navy px-5 py-10 text-white">
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 20% 10%, rgba(20,100,240,.55), transparent 36%), radial-gradient(circle at 85% 22%, rgba(0,220,160,.32), transparent 30%), linear-gradient(180deg,#123d83 0%,#081b42 48%,#06142f 100%)' }} />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 opacity-50" style={{ background: 'linear-gradient(165deg, transparent 0 35%, rgba(0,220,160,.22) 36% 53%, transparent 54%), linear-gradient(195deg, transparent 0 45%, rgba(255,215,0,.16) 46% 62%, transparent 63%)' }} />
        <section className="relative mx-auto max-w-5xl rounded-[2rem] border-2 border-white/25 bg-navy/80 p-6 text-center shadow-2xl backdrop-blur-md sm:p-9">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-white/25 bg-white/10 shadow-xl"><img src="/assets/tayu-logo.webp" alt="TAYU" className="h-16 w-16 rounded-2xl" /></div>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.24em] text-sun">Build your adventure</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">Choose your grade</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base font-bold text-white">We’ll show the right mission timeline for you. You can still explore any unlocked module.</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {GRADE_PATHS.map((path) => (
              <button key={path.id} type="button" onClick={() => chooseGradePath(path.id)} className="group rounded-3xl border-2 border-white/20 bg-white p-5 text-left text-navy shadow-xl transition hover:-translate-y-1 hover:border-sun hover:shadow-2xl active:scale-[0.98]">
                <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-electric px-3 py-1 text-xs font-extrabold text-white">{path.label}</span><span className="text-xl transition group-hover:translate-x-1">→</span></div>
                <div className="mt-3 font-display text-2xl font-extrabold">{path.title}</div>
                <p className="mt-2 text-sm font-bold text-navy/75">{path.copy}</p>
                <div className="mt-4 rounded-2xl bg-navy/5 p-3 text-sm font-extrabold">Mission timeline: Modules {path.modules.join(' → ')}</div>
                <div className="mt-2 text-xs font-extrabold uppercase tracking-wide text-electric">{PATH_TIME[path.id]}</div>
              </button>
            ))}
          </div>
        </section>
      </main>
    )
  }

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-navy px-4 py-6 text-white sm:px-6 sm:py-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem]" style={{ background: 'radial-gradient(circle at 12% 12%, rgba(20,100,240,.65), transparent 34%), radial-gradient(circle at 88% 10%, rgba(0,220,160,.35), transparent 30%), linear-gradient(180deg,#123d83 0%,rgba(8,27,66,.92) 72%,transparent 100%)' }} />
        <div className="relative mx-auto max-w-6xl">
          <header className="rounded-[2rem] border-2 border-white/20 bg-navy/75 p-5 shadow-2xl backdrop-blur-md sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="flex items-center gap-4">
                <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-16 w-16 rounded-2xl border-2 border-white/20 shadow-lg" />
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-sun">TAYU mission map</div>
                  <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">{teacherPreview ? 'Classroom Mission Preview' : 'Choose your next mission'}</h1>
                  <p className="mt-1 max-w-2xl text-sm font-bold text-white">{context.plain ? `${gradePath?.label || 'Selected grade'} pathway · ${PATH_TIME[gradePath?.id] || 'Play at your own pace'}` : `Class session from ${context.teacherEmail || 'your teacher'}`}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setGlossaryOpen(true)} className="rounded-xl bg-sun px-4 py-2 text-sm font-extrabold text-navy shadow">Money word help</button>
                {teacherPreview && <Link to="/teacher-guide" className="rounded-xl bg-teal px-4 py-2 text-sm font-extrabold text-navy">Teacher guide</Link>}
                {!teacherPreview && <Link to="/settings" className="rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">Reading settings</Link>}
                {context.plain && !teacherPreview && <button type="button" onClick={() => chooseGradePath('')} className="rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-extrabold">Change grade</button>}
                <Link to={user?.role === 'teacher' ? '/teacher' : '/'} className="rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-extrabold">Back</Link>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/20 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><div className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal">Your recommended timeline</div><div className="mt-1 text-lg font-extrabold">{required.map((n) => `Module ${n}`).join('  →  ') || 'Teacher-selected missions'}</div></div>
                <div className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-navy">{completedRequired.length}/{required.length} complete</div>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-teal transition-all" style={{ width: `${required.length ? Math.round((completedRequired.length / required.length) * 100) : 0}%` }} /></div>
              <p className="mt-2 text-xs font-bold text-white/80">Follow the highlighted “PLAY NEXT” mission for your grade, or choose another available mission.</p>
            </div>
          </header>

          {!teacherPreview && pathComplete && required.length < MODULE_CARDS.length && <Link to="/path-complete" className="mt-5 block rounded-2xl border-2 border-teal bg-teal px-5 py-4 text-center font-display text-xl font-extrabold text-navy shadow-lg">✓ Recommended path complete — view your certificate</Link>}

          <section className="mt-6 grid gap-4 lg:grid-cols-2">
            {MODULE_CARDS.map((module) => {
              const done = badges.includes(module.badge)
              const accessible = canPlay(module.n)
              const requiredForPath = required.includes(module.n)
              const olderOptional = Boolean(context.plain && gradePath && !requiredForPath)
              const isNext = accessible && !done && module.n === firstIncompleteRequired

              if (module.parts?.length) {
                return (
                  <article key={module.n} className="overflow-hidden rounded-[2rem] border-2 bg-white text-navy shadow-xl lg:col-span-2" style={{ borderColor: module.color }}>
                    <div className="p-5 sm:p-6" style={{ background: `linear-gradient(120deg, ${module.color}24, white 45%)` }}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div><div className="text-xs font-extrabold uppercase tracking-[0.18em] text-navy/55">Mission 5 · Investing world</div><h2 className="mt-1 font-display text-2xl font-extrabold">Money Garden</h2><p className="mt-1 max-w-2xl text-sm font-bold text-navy/70">Two connected missions. Finish 5A, then 5B unlocks using the same portfolio.</p></div>
                        <StatusPill done={done} inProgress={gardenPartAInProgress || gardenPartBInProgress} accessible={accessible} recommended={isNext} />
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {module.parts.map((part) => {
                          const partDone = part.id === 'A' ? gardenPartAComplete : gardenPartBComplete
                          const partInProgress = part.id === 'A' ? gardenPartAInProgress : gardenPartBInProgress
                          const partAccessible = accessible && (part.id === 'A' || gardenPartAComplete)
                          const action = !partAccessible ? 'Finish Module 5A first' : partDone ? `Replay ${part.label}` : partInProgress ? `Resume ${part.label}` : `Play ${part.label}`
                          return <button key={part.id} type="button" disabled={!partAccessible} onClick={() => playGardenPart(part.id)} className={`rounded-2xl border-2 p-4 text-left shadow-sm transition ${partAccessible ? 'bg-white hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]' : 'cursor-not-allowed bg-slate-100 opacity-55'}`} style={{ borderColor: partAccessible ? part.color : '#cbd5e1' }}><div className="flex items-center justify-between gap-2"><span className="font-display text-lg font-extrabold" style={{ color: part.color }}>{part.label}</span><StatusPill done={partDone} inProgress={partInProgress} accessible={partAccessible} /></div><div className="mt-2 font-display text-xl font-extrabold">{part.title}</div><div className="mt-1 text-xs font-extrabold uppercase tracking-wide text-navy/55">{part.minutes}</div><p className="mt-2 text-sm font-bold text-navy/70">{part.desc}</p><div className="mt-4 rounded-xl px-4 py-3 text-center text-sm font-extrabold text-white" style={{ background: partAccessible ? part.color : '#64748b' }}>{action} →</div></button>
                        })}
                      </div>
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
                <button key={module.n} type="button" disabled={!accessible} onClick={() => play(module.n)} className={`group overflow-hidden rounded-[2rem] border-2 bg-white text-left text-navy shadow-xl transition ${accessible ? 'hover:-translate-y-1 hover:shadow-2xl active:scale-[0.99]' : 'cursor-not-allowed opacity-55'}`} style={{ borderColor: done || isNext || physicalDestination ? module.color : '#dbe4f0' }}>
                  <div className="p-5 sm:p-6" style={{ background: `linear-gradient(135deg, ${module.color}26 0%, white 52%)` }}>
                    <div className="flex items-center justify-between gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-extrabold text-white shadow" style={{ background: module.color }}>{module.n}</div><StatusPill done={done} accessible={accessible} recommended={isNext} /></div>
                    <div className="mt-4 text-xs font-extrabold uppercase tracking-[0.16em] text-navy/55">{physicalDestination ? `Mission ${module.n} · Separate 3D destination` : `Mission ${module.n}`}</div>
                    <h2 className="mt-1 font-display text-2xl font-extrabold">{module.title}</h2>
                    {physicalDestination && <div className="mt-2 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-extrabold text-orange-800">📍 WALK-IN WORLD LOCATION · BIG BUILDING LABEL</div>}
                    {finalModule && <div className="mt-2 inline-flex rounded-full bg-teal/20 px-3 py-1 text-xs font-extrabold text-[#08785e]">FINAL MODULE · TAX OFFICE</div>}
                    <div className="mt-3 text-xs font-extrabold uppercase tracking-wide text-navy/55">{module.grades} · {module.minutes}</div>
                    <p className="mt-2 min-h-[3rem] text-sm font-bold leading-relaxed text-navy/75">{module.desc}</p>
                    <div className="mt-5 rounded-xl px-4 py-3 text-center text-sm font-extrabold text-white shadow" style={{ background: accessible ? module.color : '#64748b' }}>{accessible ? action : `Complete Module ${firstIncompleteRequired} first`} →</div>
                  </div>
                </button>
              )
            })}
          </section>

          <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 text-center text-sm font-bold text-white">Journey: <strong>Market → Lemonade Stand → Budget Town → Bank → Money Garden → Bond Street → Tax Office → Finale</strong>. Modules 6 and 7 are now separate labeled 3D destinations. Your money and municipal-bond choice still carry from Bond Street into the Tax Office.</div>
        </div>
      </main>

      {pendingCard && <div className="fixed inset-0 z-[600] grid place-items-center bg-navy/80 p-5 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="older-module-title" className="w-full max-w-md rounded-3xl border-4 border-sun bg-white p-6 text-center text-navy shadow-2xl"><div className="text-5xl" aria-hidden>🧠</div><h2 id="older-module-title" className="mt-3 font-display text-2xl font-extrabold">You can still explore this mission</h2><p className="mt-3 font-bold text-navy/80"><span className="font-extrabold">{pendingPartCard ? `${pendingPartCard.label}: ${pendingPartCard.title}` : pendingCard.title}</span> is usually recommended for {pendingCard.grades.toLowerCase()}.</p><div className="mt-5 grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => { setPendingModule(null); setPendingPart(null) }} className="min-h-[54px] rounded-2xl bg-navy/10 px-4 font-extrabold text-navy">Choose another</button><button type="button" onClick={() => { const number = pendingModule; const part = pendingPart; setPendingModule(null); setPendingPart(null); launchModule(number, part) }} className="min-h-[54px] rounded-2xl bg-electric px-4 font-extrabold text-white">Explore anyway →</button></div></section></div>}

      <ModuleGlossary open={glossaryOpen} onClose={() => setGlossaryOpen(false)} modules={context.plain && !teacherPreview ? MODULE_CARDS.map((module) => module.n) : required} />
    </>
  )
}
