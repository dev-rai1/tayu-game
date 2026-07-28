import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { currentUser, signOutUser } from '../services/auth.js'
import { adminAnalyticsData } from '../services/adminAnalytics.js'
import { KNOWLEDGE_QUESTIONS, scoreKnowledgeQuiz } from '../constants/knowledgeQuiz.js'

const MODULES = ['jars', 'lemonade', 'budget', 'bank', 'garden']
const MODULE_LABEL = {
  jars: 'Module 1: Market & Jars',
  lemonade: 'Module 2: Lemonade Stand',
  budget: 'Module 3: Budget Town',
  bank: 'Module 4: Bank',
  garden: 'Module 5: Money Garden',
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

export default function Dashboard() {
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedUid, setSelectedUid] = useState('')

  const load = useCallback(async () => {
    setRefreshing(true)
    setError('')
    try {
      setData(await adminAnalyticsData())
    } catch (err) {
      setError(err?.message || 'Could not load analytics.')
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const user = currentUser()
    if (!user || user.role !== 'admin') {
      nav('/dashboard', { replace: true })
      return
    }
    load()
  }, [load, nav])

  const accounts = useMemo(
    () => (data?.accounts || []).filter((row) => row.accountType !== 'dashboard_viewer' && !row.email.startsWith('dashboard.viewer.')),
    [data],
  )
  const activity = data?.activity || []
  const sessions = data?.sessions || []
  const selected = accounts.find((row) => row.uid === selectedUid) || null

  const stats = useMemo(() => {
    const withPre = accounts.filter((row) => row.progress?.profile?.assessment?.pre)
    const withPost = accounts.filter((row) => row.progress?.profile?.assessment?.post)
    const changes = withPost.map((row) => {
      const assessment = row.progress.profile.assessment
      return verifiedScore(assessment.post) - verifiedScore(assessment.pre)
    }).filter(Number.isFinite)
    const moduleTime = moduleTotals(sessions)
    return {
      accounts: accounts.length,
      students: accounts.filter((row) => row.role === 'student').length,
      teachers: accounts.filter((row) => row.role === 'teacher').length,
      logins: accounts.reduce((sum, row) => sum + Number(row.loginCount || 0), 0),
      sessions: sessions.length,
      time: totalSessionSeconds(sessions),
      pre: withPre.length,
      post: withPost.length,
      avgChange: changes.length ? changes.reduce((sum, value) => sum + value, 0) / changes.length : null,
      moduleTime,
    }
  }, [accounts, sessions])

  const exportCsv = () => {
    const headers = [
      'email', 'role', 'organization', 'gradeLevels', 'createdAt', 'loginCount', 'lastLoginAt',
      'sessionCount', 'totalSessionSeconds', ...MODULES.map((moduleName) => `${moduleName}Seconds`),
      'preScoreVerified', 'postScoreVerified', 'scoreChange',
      ...KNOWLEDGE_QUESTIONS.flatMap((_, index) => [`preQ${index + 1}`, `postQ${index + 1}`]),
    ]
    const lines = accounts.map((row) => {
      const assessment = row.progress?.profile?.assessment || {}
      const totals = moduleTotals(row.sessions)
      const pre = verifiedScore(assessment.pre)
      const post = verifiedScore(assessment.post)
      const values = [
        row.email, row.role, row.organizationName, row.gradeLevels, row.createdAt, row.loginCount,
        row.lastLoginAt, row.sessions.length, totalSessionSeconds(row.sessions),
        ...MODULES.map((moduleName) => totals[moduleName] || 0),
        pre ?? '', post ?? '', pre !== null && post !== null ? post - pre : '',
        ...KNOWLEDGE_QUESTIONS.flatMap((question) => [answerText(assessment.pre, question), answerText(assessment.post, question)]),
      ]
      return values.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')
    })
    const blob = new Blob([[headers.join(','), ...lines].join('\n')], { type: 'text/csv' })
    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(blob)
    anchor.download = 'tayu-detailed-analytics.csv'
    anchor.click()
    URL.revokeObjectURL(anchor.href)
  }

  if (error) {
    return <main className="grid min-h-screen place-items-center px-6 text-center"><div><p className="font-bold text-red-300">{error}</p><button onClick={load} className="btn-primary mt-4">Try again</button></div></main>
  }
  if (!data) return <main className="grid min-h-screen place-items-center text-white/60">Loading accurate analytics…</main>

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-11 w-11 rounded-xl" />
            <h1 className="font-display text-3xl font-extrabold">TAYU Admin Analytics</h1>
          </div>
          <p className="mt-2 max-w-3xl text-sm font-semibold text-white/60">Survey results below are recalculated from each account’s saved answers. Session and module time come from real activity heartbeats; no random or estimated survey data is generated.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={load} disabled={refreshing} className="min-h-[44px] rounded-xl bg-teal px-4 font-extrabold text-navy disabled:opacity-50">{refreshing ? 'Refreshing…' : 'Refresh'}</button>
          <button onClick={exportCsv} className="min-h-[44px] rounded-xl bg-white/10 px-4 font-extrabold">Export detailed CSV</button>
          <Link to="/" className="grid min-h-[44px] place-items-center rounded-xl bg-white/10 px-4 font-extrabold">Home</Link>
          <button onClick={() => signOutUser().then(() => nav('/'))} className="min-h-[44px] rounded-xl bg-white/10 px-4 font-extrabold">Log out</button>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Stat label="Accounts" value={stats.accounts} />
        <Stat label="Students" value={stats.students} />
        <Stat label="Teachers" value={stats.teachers} />
        <Stat label="Successful logins" value={stats.logins} />
        <Stat label="Recorded sessions" value={stats.sessions} />
        <Stat label="Total active time" value={duration(stats.time)} />
        <Stat label="Pre / post surveys" value={`${stats.pre} / ${stats.post}`} />
        <Stat label="Avg verified change" value={stats.avgChange === null ? '—' : `${stats.avgChange >= 0 ? '+' : ''}${stats.avgChange.toFixed(2)}`} detail="post score minus pre score" />
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="font-display text-xl font-extrabold">Time spent by module</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {MODULES.map((moduleName) => (
            <div key={moduleName} className="rounded-xl bg-black/20 p-4">
              <div className="text-sm font-extrabold text-teal">{MODULE_LABEL[moduleName]}</div>
              <div className="mt-2 text-2xl font-extrabold">{duration(stats.moduleTime[moduleName] || 0)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold">Accounts</h2>
          <span className="text-xs font-bold text-white/45">Select an account for exact sessions, module time, and survey answers</span>
        </div>
        <table className="mt-4 w-full min-w-[1100px] text-left text-sm">
          <thead><tr className="text-xs uppercase text-white/45"><th className="py-2 pr-3">Email</th><th className="pr-3">Role</th><th className="pr-3">Organization</th><th className="pr-3">Created</th><th className="pr-3">Logins</th><th className="pr-3">Last login</th><th className="pr-3">Sessions</th><th className="pr-3">Active time</th><th>Verified pre → post</th></tr></thead>
          <tbody>
            {accounts.map((row) => {
              const assessment = row.progress?.profile?.assessment || {}
              const pre = verifiedScore(assessment.pre)
              const post = verifiedScore(assessment.post)
              return (
                <tr key={row.uid} onClick={() => setSelectedUid(selectedUid === row.uid ? '' : row.uid)} className="cursor-pointer border-t border-white/10 hover:bg-white/5">
                  <td className="py-3 pr-3 font-extrabold">{row.email || 'No email'}</td>
                  <td className="pr-3">{row.role}</td>
                  <td className="pr-3">{row.organizationName || '—'}</td>
                  <td className="pr-3">{timestamp(row.createdAt)}</td>
                  <td className="pr-3 font-extrabold">{row.loginCount}</td>
                  <td className="pr-3">{timestamp(row.lastLoginAt, 'Not yet')}</td>
                  <td className="pr-3">{row.sessions.length}</td>
                  <td className="pr-3">{duration(totalSessionSeconds(row.sessions))}</td>
                  <td className="font-extrabold">{pre === null ? 'Not taken' : `${pre}/${KNOWLEDGE_QUESTIONS.length} → ${post === null ? 'pending' : `${post}/${KNOWLEDGE_QUESTIONS.length} (${post - pre >= 0 ? '+' : ''}${post - pre})`}`}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      {selected && <AccountDetails account={selected} />}

      <section className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="font-display text-xl font-extrabold">Login and logout timestamps</h2>
        <table className="mt-4 w-full min-w-[760px] text-left text-sm">
          <thead><tr className="text-xs uppercase text-white/45"><th className="py-2 pr-3">Event</th><th className="pr-3">Email</th><th className="pr-3">Timestamp</th><th className="pr-3">Device</th><th>Page</th></tr></thead>
          <tbody>{activity.slice(0, 250).map((event) => <tr key={event.id} className="border-t border-white/10"><td className="py-2 pr-3 font-extrabold text-teal">{EVENT_LABEL[event.type] || event.type}</td><td className="pr-3">{event.email}</td><td className="pr-3">{timestamp(event.occurredAt)}</td><td className="pr-3">{event.device || 'Unknown'}</td><td>{event.path || '—'}</td></tr>)}</tbody>
        </table>
      </section>
    </main>
  )
}

function AccountDetails({ account }) {
  const assessment = account.progress?.profile?.assessment || {}
  const preScore = verifiedScore(assessment.pre)
  const postScore = verifiedScore(assessment.post)
  const totals = moduleTotals(account.sessions)
  return (
    <section className="mt-6 rounded-2xl border-2 border-teal/40 bg-white/5 p-5">
      <h2 className="font-display text-2xl font-extrabold text-teal">{account.email}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Successful logins" value={account.loginCount} />
        <Stat label="Recorded sessions" value={account.sessions.length} />
        <Stat label="Total active time" value={duration(totalSessionSeconds(account.sessions))} />
        <Stat label="Last activity" value={timestamp(account.lastActiveAt || account.sessions[0]?.lastSeenAt)} />
      </div>

      <h3 className="mt-6 text-lg font-extrabold">Exact time by module</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{MODULES.map((moduleName) => <div key={moduleName} className="rounded-xl bg-black/20 p-3"><div className="text-xs font-extrabold text-teal">{MODULE_LABEL[moduleName]}</div><div className="mt-1 text-lg font-extrabold">{duration(totals[moduleName] || 0)}</div></div>)}</div>

      <h3 className="mt-6 text-lg font-extrabold">Each login session</h3>
      {account.sessions.length === 0 ? <p className="mt-2 text-sm text-white/55">No detailed sessions were recorded before this analytics update. New sessions will appear accurately after deployment.</p> : (
        <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead><tr className="text-xs uppercase text-white/45"><th className="py-2 pr-3">Started</th><th className="pr-3">Ended / last seen</th><th className="pr-3">Duration</th><th className="pr-3">Device</th><th className="pr-3">Last page</th><th>Module breakdown</th></tr></thead><tbody>{account.sessions.map((session) => <tr key={session.id} className="border-t border-white/10"><td className="py-2 pr-3">{timestamp(session.startedAt)}</td><td className="pr-3">{timestamp(session.endedAt || session.lastSeenAt)}</td><td className="pr-3 font-extrabold">{duration(session.durationSeconds)}</td><td className="pr-3">{session.device || 'Unknown'}</td><td className="pr-3">{session.path || '—'}</td><td>{MODULES.filter((moduleName) => session.moduleSeconds?.[moduleName]).map((moduleName) => `${MODULE_LABEL[moduleName]} ${duration(session.moduleSeconds[moduleName])}`).join(' · ') || 'No game module time'}</td></tr>)}</tbody></table></div>
      )}

      <h3 className="mt-6 text-lg font-extrabold">Actual saved pre- and post-survey answers</h3>
      <p className="mt-1 text-sm text-white/55">Verified scores are recalculated directly from the saved answer choices: {preScore === null ? 'pre not taken' : `pre ${preScore}/${KNOWLEDGE_QUESTIONS.length}`} · {postScore === null ? 'post not taken' : `post ${postScore}/${KNOWLEDGE_QUESTIONS.length}`}.</p>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {KNOWLEDGE_QUESTIONS.map((question, index) => (
          <div key={question.id} className="rounded-xl bg-black/20 p-4">
            <div className="text-xs font-extrabold text-teal">Question {index + 1}</div>
            <div className="mt-1 font-bold">{question.prompt}</div>
            <div className="mt-3 text-sm"><span className="font-extrabold text-white/55">Before:</span> {answerText(assessment.pre, question)}</div>
            <div className="mt-1 text-sm"><span className="font-extrabold text-white/55">After:</span> {answerText(assessment.post, question)}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
