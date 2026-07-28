import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { currentUser } from '../services/auth.js'
import { MODULE_CATALOG } from '../constants/modules.js'
import { createOrLoadTeacherClass, loadTeacherStudents, regenerateTeacherClassCode, saveTeacherClassSettings } from '../services/classroom.js'

const duration = (seconds) => {
  const value = Math.max(0, Math.round(Number(seconds || 0)))
  const minutes = Math.floor(value / 60)
  return minutes ? `${minutes}m ${value % 60}s` : `${value}s`
}

const withTimeout = (promise, milliseconds, message) => Promise.race([
  promise,
  new Promise((_, reject) => window.setTimeout(() => reject(new Error(message)), milliseconds)),
])

export default function TeacherDashboard() {
  const nav = useNavigate()
  const [classroom, setClassroom] = useState(null)
  const [students, setStudents] = useState([])
  const [error, setError] = useState('')
  const [studentError, setStudentError] = useState('')
  const [loadingClassroom, setLoadingClassroom] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadStudents = useCallback(async () => {
    setLoadingStudents(true)
    setStudentError('')
    try {
      const rows = await withTimeout(
        loadTeacherStudents(),
        10000,
        'Student analytics took too long to load. Your classroom is still available; try refreshing the analytics.',
      )
      setStudents(rows)
    } catch (err) {
      setStudentError(err.message || String(err))
    } finally {
      setLoadingStudents(false)
    }
  }, [])

  const load = useCallback(async () => {
    setLoadingClassroom(true)
    setError('')
    try {
      const user = currentUser()
      if (!user || user.role !== 'teacher') {
        nav('/login', { replace: true })
        return
      }

      // Load the classroom first so slow student analytics can never block the page.
      const room = await withTimeout(
        createOrLoadTeacherClass(),
        8000,
        'The classroom service took too long to respond. Check your connection and try again.',
      )
      setClassroom(room)
      loadStudents()
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoadingClassroom(false)
    }
  }, [loadStudents, nav])

  useEffect(() => { load() }, [load])

  const toggleModule = (n) => {
    setClassroom((current) => {
      const enabled = current.settings?.enabledModules || []
      const next = enabled.includes(n) ? enabled.filter((value) => value !== n) : [...enabled, n].sort()
      return { ...current, settings: { ...current.settings, enabledModules: next } }
    })
  }

  const save = async () => {
    setSaving(true); setError('')
    try { setClassroom(await saveTeacherClassSettings(classroom.settings)) }
    catch (err) { setError(err.message || String(err)) }
    finally { setSaving(false) }
  }

  if (loadingClassroom) {
    return <main className="grid min-h-screen place-items-center px-6 text-center"><div><div className="text-xl font-extrabold">Loading teacher classroom…</div><p className="mt-2 text-sm text-white/55">This should only take a few seconds.</p></div></main>
  }

  if (!classroom) {
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center">
        <div className="max-w-md rounded-3xl bg-white/5 p-6">
          <h1 className="font-display text-2xl font-extrabold">Could not load your classroom</h1>
          <p className="mt-3 rounded-xl bg-red-500/15 p-3 text-sm font-bold text-red-200">{error || 'The classroom service did not respond.'}</p>
          <button type="button" onClick={load} className="btn-primary mt-5 min-h-[48px] w-full">Try again</button>
          <Link to="/" className="mt-3 block text-sm font-bold text-white/70">Back home</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="font-display text-3xl font-extrabold">Teacher Classroom</h1><p className="mt-1 text-white/65">Customize the student session, share your code, test it, and review analytics.</p></div>
        <div className="flex gap-2"><Link to="/modules?teacherPreview=1" className="btn-primary">Try my session</Link><Link to="/" className="rounded-xl bg-white/10 px-4 py-3 font-extrabold">Home</Link></div>
      </header>

      {error && <p className="mt-4 rounded-xl bg-red-500/15 p-3 font-bold text-red-200">{error}</p>}

      <section className="mt-6 rounded-3xl border border-teal/30 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><div className="text-sm font-extrabold uppercase tracking-wide text-teal">Student class code</div><div className="mt-1 font-display text-4xl font-extrabold tracking-[0.2em]">{classroom.classCode}</div></div>
          <button onClick={async () => setClassroom({ ...classroom, classCode: await regenerateTeacherClassCode() })} className="rounded-xl bg-white/10 px-4 py-3 font-extrabold">Generate new code</button>
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-white/5 p-6">
        <div className="flex items-center justify-between"><div><h2 className="font-display text-2xl font-extrabold">Session settings</h2><p className="text-sm text-white/60">Students only see modules you enable. Locked choices redirect to the first enabled module.</p></div><button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save settings'}</button></div>
        <label className="mt-5 flex items-center gap-3 rounded-2xl bg-black/20 p-4"><input type="checkbox" checked={Boolean(classroom.settings?.allowSkip)} onChange={(e) => setClassroom({ ...classroom, settings: { ...classroom.settings, allowSkip: e.target.checked } })} /><span><b>Allow students to skip ahead</b><span className="block text-sm text-white/60">Off keeps enabled modules in sequence. On lets students choose any enabled module.</span></span></label>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {MODULE_CATALOG.map((module) => <label key={module.n} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"><input type="checkbox" checked={(classroom.settings?.enabledModules || []).includes(module.n)} onChange={() => toggleModule(module.n)} /><span><b>{module.n}. {module.title}</b><span className="block text-xs font-extrabold uppercase text-teal">{module.grades}</span><span className="mt-1 block text-sm text-white/65">{module.desc}</span></span></label>)}
        </div>
      </section>

      <section className="mt-6 overflow-x-auto rounded-3xl bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-extrabold">Student analytics</h2>
          <button type="button" onClick={loadStudents} disabled={loadingStudents} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-extrabold disabled:opacity-50">{loadingStudents ? 'Loading…' : 'Refresh analytics'}</button>
        </div>
        {studentError && <p className="mt-4 rounded-xl bg-amber-300/15 p-3 text-sm font-bold text-amber-200">{studentError}</p>}
        {loadingStudents && !students.length ? <p className="mt-4 text-white/55">Loading student analytics…</p> : <table className="mt-4 w-full min-w-[950px] text-left text-sm"><thead><tr className="text-xs uppercase text-white/45"><th className="py-2 pr-3">Student</th><th className="pr-3">Modules completed</th><th className="pr-3">Completion state</th><th className="pr-3">Amount done</th><th className="pr-3">Wrong answers</th><th className="pr-3">Time spent</th><th>Current progress</th></tr></thead><tbody>{students.map((student) => <tr key={student.uid} className="border-t border-white/10"><td className="py-3 pr-3 font-bold">{student.email}</td><td className="pr-3">{student.completed}</td><td className="pr-3">{student.completionState}</td><td className="pr-3">{student.amountDone}</td><td className="pr-3">{student.wrongAnswers}</td><td className="pr-3">{duration(student.timeSpent)}</td><td>Module {student.currentModule}</td></tr>)}</tbody></table>}
        {!loadingStudents && !students.length && !studentError && <p className="mt-4 text-white/55">No students have joined this class code yet.</p>}
      </section>
    </main>
  )
}
