import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { currentUser } from '../services/auth.js'
import { MODULE_CATALOG } from '../constants/modules.js'
import { KNOWLEDGE_QUESTIONS, scoreKnowledgeQuiz } from '../constants/knowledgeQuiz.js'
import { createOptimisticTeacherClass, createOrLoadTeacherClass, loadTeacherStudents, regenerateTeacherClassCode, saveTeacherClassSettings } from '../services/classroom.js'

const MODULES = ['jars', 'lemonade', 'budget', 'bank', 'tax', 'garden']
const MODULE_LABEL = {
  jars: 'Module 1: Market & Jars',
  lemonade: 'Module 2: Lemonade Stand',
  budget: 'Module 3: Budget Town',
  bank: 'Module 4: Bank',
  tax: 'Module 5: Paycheck Planet',
  garden: 'Module 6: Money Garden',
}
const EVENT_LABEL = { sign_up: 'Signed up', sign_in: 'Logged in', sign_out: 'Logged out' }

function timestamp(value, fallback = '—') {
  if (!value) return fallback
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

function duration(totalSeconds) {
  const seconds = Math.max(0, Math.round(Number(totalSeconds || 0)))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = seconds % 60
  if (hours) return `${hours}h ${minutes}m`
  if (minutes) return `${minutes}m ${remainder}s`
  return `${remainder}s`
}

function answerText(result, question) {
  const index = result?.answers?.[question.id]
  return Number.isInteger(index) && question.choices[index] ? question.choices[index] : 'Not answered'
}

function verifiedScore(result) {
  if (!result?.answers) return null
  return scoreKnowledgeQuiz(result.answers)
}

function moduleTotals(sessions = []) {
  return sessions.reduce((totals, session) => {
    Object.entries(session.moduleSeconds || {}).forEach(([moduleName, seconds]) => {
      totals[moduleName] = Number(totals[moduleName] || 0) + Number(seconds || 0)
    })
    return totals
  }, {})
}

function totalSessionSeconds(sessions = []) {
  return sessions.reduce((sum, session) => sum + Number(session.durationSeconds || 0), 0)
}

function Stat({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-2xl font-extrabold text-teal">{value}</div>
      <div className="mt-1 text-xs font-extrabold uppercase tracking-wide text-white/60">{label}</div>
      {detail && <div className="mt-1 text-xs text-white/45">{detail}</div>}
    </div>
  )
}

const withTimeout = (promise, milliseconds, message) => Promise.race([
  promise,
  new Promise((_, reject) => window.setTimeout(() => reject(new Error(message)), milliseconds)),
])

export default function TeacherDashboard() {
  const nav = useNavigate()
  const [classroom, setClassroom] = useState(() => createOptimisticTeacherClass())
  const [students, setStudents] = useState([])
  const [selectedUid, setSelectedUid] = useState('')
  const [error, setError] = useState('')
  const [studentError, setStudentError] = useState('')
  const [syncing, setSyncing] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadStudents = useCallback(async () => {
    setLoadingStudents(true)
    setStudentError('')
    try {
      const rows = await withTimeout(loadTeacherStudents(), 12000, 'Student analytics is temporarily unavailable. Try again later.')
      setStudents(rows)
    } catch (err) {
      setStudentError(err.message || String(err))
    } finally {
      setLoadingStudents(false)
    }
  }, [])

  const syncClassroom = useCallback(async () => {
    const user = currentUser()
    if (!user || user.role !== 'teacher') {
      nav('/login', { replace: true })
      return
    }
    setSyncing(true)
    setError('')
    try {
      const room = await createOrLoadTeacherClass()
      if (room) setClassroom(room)
    } catch {
      setError('Your classroom opened from this device, but cloud sync is unavailable right now. Your settings remain visible and you can try again.')
    } finally {
      setSyncing(false)
    }
  }, [nav])

  useEffect(() => {
    syncClassroom()
    loadStudents()
  }, [loadStudents, syncClassroom])

  const toggleModule = (n) => {
    setClassroom((current) => {
      const enabled = current?.settings?.enabledModules || []
      const next = enabled.includes(n) ? enabled.filter((value) => value !== n) : [...enabled, n].sort()
      return { ...current, settings: { ...current.settings, enabledModules: next } }
    })
  }

  const save = async () => {
    setSaving(true); setError('')
    try { setClassroom(await saveTeacherClassSettings(classroom.settings)) }
    catch (err) { setError(err.message || 'Could not save settings. Try again.') }
    finally { setSaving(false) }
  }

  const regenerate = async () => {
    setError('')
    try {
      const classCode = await regenerateTeacherClassCode()
      setClassroom((current) => ({ ...current, classCode }))
    } catch (err) {
      setError(err.message || 'Could not generate a new code.')
    }
  }

  const trySession = () => {
    const enabledModules = classroom?.settings?.enabledModules || []
    const firstEnabledModule = [...enabledModules].sort((a, b) => Number(a) - Number(b))[0] || 1
    try { localStorage.setItem('tayu-jump-module', String(firstEnabledModule)) } catch { /* storage can be unavailable */ }
    nav('/world')
  }

  const allSessions = useMemo(() => students.flatMap((student) => student.sessions || []), [students])
  const classActivity = useMemo(
    () => students.flatMap((student) => student.activity || []).sort((a, b) => String(b.occurredAt || '').localeCompare(String(a.occurredAt || ''))),
    [students],
  )
  const selected = students.find((student) => student.uid === selectedUid) || null
  const hasLimitedAnalytics = students.some((student) => student.analyticsLimited)

  const stats = useMemo(() => {
    const withPre = students.filter((student) => student.progress?.profile?.assessment?.pre)
    const withPost = students.filter((student) => student.progress?.profile?.assessment?.post)
    const changes = withPost.map((student) => {
      const assessment = student.progress?.profile?.assessment || {}
      const pre = verifiedScore(assessment.pre)
      const post = verifiedScore(assessment.post)
      return pre === null || post === null ? null : post - pre
    }).filter(Number.isFinite)
    return {
      students: students.length,
      logins: students.reduce((sum, student) => sum + Number(student.loginCount || 0), 0),
      sessions: allSessions.length,
      time: totalSessionSeconds(allSessions),
      pre: withPre.length,
      post: withPost.length,
      certificates: students.filter((student) => student.certificateEarned).length,
      avgChange: changes.length ? changes.reduce((sum, value) => sum + value, 0) / changes.length : null,
      moduleTime: moduleTotals(allSessions),
    }
  }, [allSessions, students])

  const exportCsv = () => {
    const headers = [
      'email', 'gradeLevels', 'createdAt', 'joinedClassAt', 'loginCount', 'lastLoginAt', 'lastLogoutAt', 'lastActiveAt',
      'sessionCount', 'totalSessionSeconds', ...MODULES.map((moduleName) => `${moduleName}Seconds`),
      'modulesCompleted', 'certificateEarned', 'currentModule', 'wrongAnswers', 'preScoreVerified', 'postScoreVerified', 'scoreChange',
      ...KNOWLEDGE_QUESTIONS.flatMap((_, index) => [`preQ${index + 1}`, `postQ${index + 1}`]),
    ]
    const lines = students.map((student) => {
      const assessment = student.progress?.profile?.assessment || {}
      const totals = moduleTotals(student.sessions)
      const pre = verifiedScore(assessment.pre)
      const post = verifiedScore(assessment.post)
      const values = [
        student.email, student.gradeLevels, student.createdAt, student.joinedClassAt, student.loginCount,
        student.lastLoginAt, student.lastLogoutAt, student.lastActiveAt, student.sessions.length,
        totalSessionSeconds(student.sessions), ...MODULES.map((moduleName) => totals[moduleName] || 0),
        student.completed, student.certificateEarned ? 'yes' : 'no', student.currentModule, student.wrongAnswers,
        pre ?? '', post ?? '', pre !== null && post !== null ? post - pre : '',
        ...KNOWLEDGE_QUESTIONS.flatMap((question) => [answerText(assessment.pre, question), answerText(assessment.post, question)]),
      ]
      return values.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')
    })
    const blob = new Blob([[headers.join(','), ...lines].join('\n')], { type: 'text/csv' })
    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(blob)
    anchor.download = 'tayu-class-detailed-analytics.csv'
    anchor.click()
    URL.revokeObjectURL(anchor.href)
  }

  if (!classroom) return <main className="grid min-h-screen place-items-center px-6 text-center"><div><p className="font-bold text-red-200">Teacher account information is missing.</p><Link to="/login" className="btn-primary mt-4 inline-block">Log in again</Link></div></main>

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3"><h1 className="font-display text-3xl font-extrabold">Teacher Classroom</h1><span className={`rounded-full px-3 py-1 text-xs font-extrabold ${syncing ? 'bg-sun/20 text-sun' : 'bg-teal/20 text-teal'}`}>{syncing ? 'Syncing…' : 'Ready'}</span></div>
          <p className="mt-1 max-w-3xl text-white/65">Customize the student session and review detailed analytics for students assigned to your class only.</p>
        </div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={trySession} className="btn-primary">Try my session</button><button type="button" onClick={loadStudents} disabled={loadingStudents} className="rounded-xl bg-white/10 px-4 py-3 font-extrabold disabled:opacity-50">{loadingStudents ? 'Refreshing…' : 'Refresh analytics'}</button><button type="button" onClick={exportCsv} disabled={!students.length} className="rounded-xl bg-white/10 px-4 py-3 font-extrabold disabled:opacity-40">Export detailed CSV</button><Link to="/" className="rounded-xl bg-white/10 px-4 py-3 font-extrabold">Home</Link></div>
      </header>

      {error && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-300/15 p-3 font-bold text-amber-100"><span>{error}</span><button type="button" onClick={syncClassroom} className="rounded-lg bg-white/10 px-3 py-2 text-sm">Sync again</button></div>}

      <section className="mt-6 rounded-3xl border border-teal/30 bg-white/5 p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="text-sm font-extrabold uppercase tracking-wide text-teal">Student class code</div><div className="mt-1 font-display text-4xl font-extrabold tracking-[0.2em]">{classroom.classCode}</div><p className="mt-2 text-xs font-semibold text-white/50">Only students who join with this class code appear in your analytics.</p></div><button onClick={regenerate} className="rounded-xl bg-white/10 px-4 py-3 font-extrabold">Generate new code</button></div></section>

      <section className="mt-6 rounded-3xl bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-2xl font-extrabold">Session settings</h2><p className="text-sm text-white/60">Students only see modules you enable. Paycheck Planet is Module 5, before Module 6: Money Garden.</p></div><button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save settings'}</button></div>
        <label className="mt-5 flex items-center gap-3 rounded-2xl bg-black/20 p-4"><input type="checkbox" checked={Boolean(classroom.settings?.allowSkip)} onChange={(event) => setClassroom({ ...classroom, settings: { ...classroom.settings, allowSkip: event.target.checked } })} /><span><b>Allow students to skip ahead</b><span className="block text-sm text-white/60">Off keeps enabled modules in sequence. On lets students choose any enabled module.</span></span></label>
        <div className="mt-5 grid gap-3 md:grid-cols-2">{MODULE_CATALOG.map((module) => <label key={module.n} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"><input type="checkbox" checked={(classroom.settings?.enabledModules || []).includes(module.n)} onChange={() => toggleModule(module.n)} /><span><b>{module.n}. {module.title}</b><span className="block text-xs font-extrabold uppercase text-teal">{module.grades}</span><span className="mt-1 block text-sm text-white/65">{module.desc}</span></span></label>)}</div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8"><Stat label="Students" value={stats.students} /><Stat label="Successful logins" value={stats.logins} /><Stat label="Recorded sessions" value={stats.sessions} /><Stat label="Total active time" value={duration(stats.time)} /><Stat label="Pre surveys" value={stats.pre} /><Stat label="Post surveys" value={stats.post} /><Stat label="Certificates" value={stats.certificates} /><Stat label="Avg verified change" value={stats.avgChange === null ? '—' : `${stats.avgChange >= 0 ? '+' : ''}${stats.avgChange.toFixed(2)}`} /></section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5"><h2 className="font-display text-xl font-extrabold">Class time spent by module</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{MODULES.map((moduleName) => <div key={moduleName} className="rounded-xl bg-black/20 p-4"><div className="text-sm font-extrabold text-teal">{MODULE_LABEL[moduleName]}</div><div className="mt-2 text-2xl font-extrabold">{duration(stats.moduleTime[moduleName] || 0)}</div></div>)}</div></section>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-xl font-extrabold">Student analytics</h2><p className="text-xs font-bold text-white/45">Select a student for exact sessions, login timestamps, module time, and survey answers.</p></div></div>
        {studentError && <p className="mt-4 rounded-xl bg-amber-300/15 p-3 text-sm font-bold text-amber-200">{studentError}</p>}
        {hasLimitedAnalytics && <p className="mt-4 rounded-xl bg-white/5 p-3 text-sm font-semibold text-white/65">One or more older accounts are missing part of their historical analytics. Available records remain visible and new activity will be recorded accurately.</p>}
        {loadingStudents && !students.length ? <p className="mt-4 text-white/55">Loading detailed analytics…</p> : (
          <table className="mt-4 w-full min-w-[1250px] text-left text-sm"><thead><tr className="text-xs uppercase text-white/45"><th className="py-2 pr-3">Student</th><th className="pr-3">Grade</th><th className="pr-3">Joined</th><th className="pr-3">Logins</th><th className="pr-3">Last login</th><th className="pr-3">Sessions</th><th className="pr-3">Active time</th><th className="pr-3">Modules</th><th className="pr-3">Certificate</th><th>Verified pre → post</th></tr></thead><tbody>{students.map((student) => { const assessment = student.progress?.profile?.assessment || {}; const pre = verifiedScore(assessment.pre); const post = verifiedScore(assessment.post); return <tr key={student.uid} onClick={() => setSelectedUid(selectedUid === student.uid ? '' : student.uid)} className="cursor-pointer border-t border-white/10 hover:bg-white/5"><td className="py-3 pr-3 font-extrabold">{student.email || 'No email'}</td><td className="pr-3">{student.gradeLevels || '—'}</td><td className="pr-3">{timestamp(student.joinedClassAt || student.createdAt)}</td><td className="pr-3 font-extrabold">{student.loginCount}</td><td className="pr-3">{timestamp(student.lastLoginAt, 'Not yet')}</td><td className="pr-3">{student.sessions.length}</td><td className="pr-3">{duration(totalSessionSeconds(student.sessions))}</td><td className="pr-3">{student.completed}/6</td><td className="pr-3">{student.certificateEarned ? 'Earned' : 'Not yet'}</td><td className="font-extrabold">{pre === null ? 'Not taken' : `${pre}/${KNOWLEDGE_QUESTIONS.length} → ${post === null ? 'pending' : `${post}/${KNOWLEDGE_QUESTIONS.length} (${post - pre >= 0 ? '+' : ''}${post - pre})`}`}</td></tr> })}</tbody></table>
        )}
        {!loadingStudents && !students.length && !studentError && <p className="mt-4 text-white/55">No students have joined this class code yet.</p>}
      </section>
      {selected && <StudentDetails student={selected} />}

      <section className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-5"><h2 className="font-display text-xl font-extrabold">Class login and logout timestamps</h2>{classActivity.length === 0 ? <p className="mt-3 text-sm text-white/55">No login history has been recorded yet.</p> : <table className="mt-4 w-full min-w-[760px] text-left text-sm"><thead><tr className="text-xs uppercase text-white/45"><th className="py-2 pr-3">Event</th><th className="pr-3">Student</th><th className="pr-3">Timestamp</th><th className="pr-3">Device</th><th>Page</th></tr></thead><tbody>{classActivity.slice(0, 250).map((event) => <tr key={event.id} className="border-t border-white/10"><td className="py-2 pr-3 font-extrabold text-teal">{EVENT_LABEL[event.type] || event.type}</td><td className="pr-3">{event.email || '—'}</td><td className="pr-3">{timestamp(event.occurredAt)}</td><td className="pr-3">{event.device || 'Unknown'}</td><td>{event.path || '—'}</td></tr>)}</tbody></table>}</section>
    </main>
  )
}

function StudentDetails({ student }) {
  const assessment = student.progress?.profile?.assessment || {}
  const preScore = verifiedScore(assessment.pre)
  const postScore = verifiedScore(assessment.post)
  const totals = moduleTotals(student.sessions)
  return (
    <section className="mt-6 rounded-2xl border-2 border-teal/40 bg-white/5 p-5">
      <h2 className="font-display text-2xl font-extrabold text-teal">{student.email}</h2>
      <p className="mt-1 text-sm font-semibold text-white/55">Grade: {student.gradeLevels || '—'} · Joined class: {timestamp(student.joinedClassAt || student.createdAt)} · Found TAYU through: {student.foundVia || '—'}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Successful logins" value={student.loginCount} /><Stat label="Recorded sessions" value={student.sessions.length} /><Stat label="Total active time" value={duration(totalSessionSeconds(student.sessions))} /><Stat label="Last activity" value={timestamp(student.lastActiveAt || student.sessions[0]?.lastSeenAt)} /></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-xl bg-black/20 p-3"><div className="text-xs font-extrabold uppercase text-white/50">Last login</div><div className="mt-1 font-bold">{timestamp(student.lastLoginAt, 'Not yet')}</div></div><div className="rounded-xl bg-black/20 p-3"><div className="text-xs font-extrabold uppercase text-white/50">Last logout</div><div className="mt-1 font-bold">{timestamp(student.lastLogoutAt, 'Not recorded')}</div></div><div className="rounded-xl bg-black/20 p-3"><div className="text-xs font-extrabold uppercase text-white/50">Current module</div><div className="mt-1 font-bold">Module {student.currentModule}</div></div><div className="rounded-xl bg-black/20 p-3"><div className="text-xs font-extrabold uppercase text-white/50">Progress</div><div className="mt-1 font-bold">{student.completed}/6 modules · {student.certificateEarned ? 'Certificate earned' : 'Certificate not yet earned'}</div></div></div>

      <h3 className="mt-6 text-lg font-extrabold">Exact time by module</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">{MODULES.map((moduleName) => <div key={moduleName} className="rounded-xl bg-black/20 p-3"><div className="text-xs font-extrabold text-teal">{MODULE_LABEL[moduleName]}</div><div className="mt-1 text-lg font-extrabold">{duration(totals[moduleName] || 0)}</div></div>)}</div>

      <h3 className="mt-6 text-lg font-extrabold">Each recorded session</h3>
      {student.sessions.length === 0 ? <p className="mt-2 text-sm text-white/55">No detailed sessions were recorded before session tracking was introduced. New sessions will appear accurately.</p> : <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead><tr className="text-xs uppercase text-white/45"><th className="py-2 pr-3">Started</th><th className="pr-3">Ended / last seen</th><th className="pr-3">Duration</th><th className="pr-3">Device</th><th className="pr-3">Last page</th><th>Module breakdown</th></tr></thead><tbody>{student.sessions.map((session) => <tr key={session.id} className="border-t border-white/10"><td className="py-2 pr-3">{timestamp(session.startedAt)}</td><td className="pr-3">{timestamp(session.endedAt || session.lastSeenAt)}</td><td className="pr-3 font-extrabold">{duration(session.durationSeconds)}</td><td className="pr-3">{session.device || 'Unknown'}</td><td className="pr-3">{session.path || '—'}</td><td>{MODULES.filter((moduleName) => session.moduleSeconds?.[moduleName]).map((moduleName) => `${MODULE_LABEL[moduleName]} ${duration(session.moduleSeconds[moduleName])}`).join(' · ') || 'No game module time'}</td></tr>)}</tbody></table></div>}

      <h3 className="mt-6 text-lg font-extrabold">Login and logout history</h3>
      {student.activity.length === 0 ? <p className="mt-2 text-sm text-white/55">No detailed login events are available for this account yet.</p> : <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="text-xs uppercase text-white/45"><th className="py-2 pr-3">Event</th><th className="pr-3">Timestamp</th><th className="pr-3">Device</th><th>Page</th></tr></thead><tbody>{student.activity.map((event) => <tr key={event.id} className="border-t border-white/10"><td className="py-2 pr-3 font-extrabold text-teal">{EVENT_LABEL[event.type] || event.type}</td><td className="pr-3">{timestamp(event.occurredAt)}</td><td className="pr-3">{event.device || 'Unknown'}</td><td>{event.path || '—'}</td></tr>)}</tbody></table></div>}

      <h3 className="mt-6 text-lg font-extrabold">Actual saved pre- and post-survey answers</h3>
      <p className="mt-1 text-sm text-white/55">Scores are recalculated directly from the saved choices: {preScore === null ? 'pre not taken' : `pre ${preScore}/${KNOWLEDGE_QUESTIONS.length}`} · {postScore === null ? 'post not taken' : `post ${postScore}/${KNOWLEDGE_QUESTIONS.length}`}.</p>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">{KNOWLEDGE_QUESTIONS.map((question, index) => <div key={question.id} className="rounded-xl bg-black/20 p-4"><div className="text-xs font-extrabold text-teal">Question {index + 1}</div><div className="mt-1 font-bold">{question.prompt}</div><div className="mt-3 text-sm"><span className="font-extrabold text-white/55">Before:</span> {answerText(assessment.pre, question)}</div><div className="mt-1 text-sm"><span className="font-extrabold text-white/55">After:</span> {answerText(assessment.post, question)}</div></div>)}</div>
    </section>
  )
}