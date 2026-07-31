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
const DEFAULT_CONTEXT = { plain: true, settings: { enabledModules: [1, 2, 3, 4, 5], allowSkip: false } }

export default function ModuleSelect() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [context, setContext] = useState(null)
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const [gradePathId, setGradePathId] = useState(() => {
    const saved = loadActiveLearningPath()
    return getGradePath(saved?.id)?.id || ''
  })
  const prof = loadProfile()
  const wallet = loadWallet()
  const badges = prof?.badges || []
  const current = Number(wallet?.week || 1)
  const user = currentUser()
  const teacherPreview = user?.role === 'teacher' && params.get('teacherPreview') === '1'
  const gradePath = getGradePath(gradePathId)

  useEffect(() => {
    loadCurrentClassContext()
      .then((value) => setContext(value || DEFAULT_CONTEXT))
      .catch(() => setContext(DEFAULT_CONTEXT))
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
  const firstIncompleteRequired = required.find((moduleNumber) => !completedNumbers.includes(moduleNumber)) || required[0] || 1

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
    if (path) {
      saveActiveLearningPath(path)
      setDefaultReadingBandForGrade(path.id)
    } else clearActiveLearningPath()
    setGradePathId(path?.id || '')
  }

  const canPlay = (moduleNumber) => {
    if (teacherPreview) return teacherEnabled.includes(moduleNumber)
    if (context?.plain) return true
    if (!required.includes(moduleNumber)) return false
    if (context?.settings?.allowSkip) return true
    return moduleNumber === firstIncompleteRequired || completedNumbers.includes(moduleNumber)
  }

  const play = (moduleNumber) => {
    if (!canPlay(moduleNumber)) return
    const targetCard = MODULE_CARDS.find((module) => module.n === moduleNumber)
    const canResume = Boolean(wallet && moduleNumber === current && targetCard && !badges.includes(targetCard.badge))
    if (!canResume) localStorage.setItem('tayu-jump-module', String(moduleNumber))
    nav('/world')
  }

  if (!context) return <main className="grid min-h-screen place-items-center">Loading your session…</main>

  if (!teacherPreview && context.plain && !gradePath) {
    return (
      <main className="mx-auto grid min-h-screen max-w-4xl place-items-center px-6 py-10">
        <section className="w-full rounded-3xl border-2 border-teal/40 bg-white/5 p-6 text-center shadow-2xl">
          <img src="/assets/tayu-logo.webp" alt="TAYU" className="mx-auto h-16 w-16 rounded-2xl" />
          <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.18em] text-teal">Get a grade-based recommendation</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold">What grade are you in?</h1>
          <p className="mx-auto mt-2 max-w-2xl font-semibold text-white/70">We will recommend a starting path and reading pace for your grade. Every module will still be available, so you can choose what you want to learn.</p>
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
      <main className="mx-auto max-w-3xl px-6 py-10">
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

        {!teacherPreview && pathComplete && required.length < 5 && (
          <Link to="/path-complete" className="mt-6 block rounded-2xl border-2 border-teal bg-teal px-5 py-4 text-center font-display text-xl font-extrabold text-navy shadow-lg">Recommended path complete — view your certificate</Link>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">{MODULE_CARDS.map((module) => {
          const done = badges.includes(module.badge)
          const accessible = canPlay(module.n)
          const inRequiredPath = required.includes(module.n)
          const enabledByTeacher = teacherEnabled.includes(module.n)
          const canResume = Boolean(wallet && module.n === current && !done)
          return <button key={module.n} type="button" disabled={!accessible} onClick={() => play(module.n)} className={`rounded-3xl border-2 p-5 text-left transition ${accessible ? 'bg-white/5 hover:bg-white/10 active:scale-[0.98]' : 'cursor-not-allowed bg-black/25 opacity-70'}`} style={{ borderColor: done ? module.color : 'rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between gap-2"><span className="font-display text-lg font-extrabold" style={{ color: module.color }}>{module.n}. {module.title}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${done ? 'bg-teal text-navy' : accessible ? 'bg-sun text-navy' : 'bg-white/15 text-white/75'}`}>{done ? 'DONE' : accessible ? canResume ? 'RESUME' : context.plain && inRequiredPath ? 'RECOMMENDED' : 'AVAILABLE' : 'LOCKED'}</span></div>
            <div className="mt-1 text-xs font-extrabold uppercase tracking-wide text-white/75">{module.grades} · {module.minutes}</div>
            <p className="mt-2 text-sm font-semibold text-white/80">{module.desc}</p>
            <div className="mt-3 text-sm font-extrabold" style={{ color: accessible ? module.color : 'rgba(255,255,255,.55)' }}>{accessible ? done ? 'Play again →' : canResume ? 'Continue where I stopped →' : context.plain && !teacherPreview ? inRequiredPath ? 'Recommended for your grade →' : 'Optional — choose this module →' : 'Start →' : !enabledByTeacher ? 'Locked by teacher' : `Complete Module ${firstIncompleteRequired} first`}</div>
          </button>
        })}</div>

        <p className="mt-6 rounded-2xl bg-white/5 p-4 text-center text-sm font-bold text-white/70">
          {context.plain
            ? pathComplete && required.length < 5
              ? `You completed all ${required.length} recommended modules for your grade. Your certificate is ready, and you can still play any other module.`
              : `Complete the ${required.length} recommended module${required.length === 1 ? '' : 's'} for your grade to earn this path certificate (${completedRequired.length}/${required.length}). Other modules are always available.`
            : pathComplete && required.length < 5
              ? `You completed all ${required.length} modules in this classroom path. Your certificate is ready.`
              : `Your classroom path certificate unlocks after the ${required.length} module${required.length === 1 ? '' : 's'} assigned by your teacher are completed (${completedRequired.length}/${required.length}).`}
        </p>
      </main>
      <ModuleGlossary open={glossaryOpen} onClose={() => setGlossaryOpen(false)} modules={context.plain && !teacherPreview ? MODULE_CARDS.map((module) => module.n) : required} />
    </>
  )
}
