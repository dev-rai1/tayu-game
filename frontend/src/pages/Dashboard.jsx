// Admin analytics dashboard (role=admin only).
// Shows accounts, game outcomes, sign-up/login/logout activity, and CSV export.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminData, currentUser, signOutUser, isCloud } from '../services/auth.js'
import { KNOWLEDGE_QUESTIONS, knowledgeChange } from '../constants/knowledgeQuiz.js'

const MODULES = ['jars', 'lemonade', 'budget', 'bank', 'garden']
const MODULE_LABEL = { jars: 'M1 Market & Jars', lemonade: 'M2 Lemonade', budget: 'M3 Budget Town', bank: 'M4 Bank', garden: 'M5 Money Garden' }
const EVENT_LABEL = { sign_up: 'Signed up', sign_in: 'Logged in', sign_out: 'Logged out' }

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <div className="text-3xl font-extrabold text-teal">{value}</div>
      <div className="mt-1 text-xs font-bold text-white/60">{label}</div>
    </div>
  )
}

function timestamp(value, fallback = '—') {
  if (!value) return fallback
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

function latestActivity(row) {
  return row.lastActiveAt || row.progress?.savedAt || row.lastLoginAt || row.createdAt || ''
}

export default function Dashboard() {
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  const [selected, setSelected] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    setRefreshing(true)
    setErr(null)
    try {
      setData(await adminData())
    } catch (error) {
      setErr(error.message || String(error))
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const user = currentUser()
    if (!user || user.role !== 'admin') {
      nav('/login')
      return
    }
    loadData()
  }, [loadData, nav])

  const rows = data?.accounts || []
  const activity = data?.activity || []

  const stats = useMemo(() => {
    if (!data) return null
    const badges = (row) => row.progress?.profile?.badges || []
    const completions = Object.fromEntries(MODULES.map((module) => [module, rows.filter((row) => badges(row).includes(module)).length]))
    const byDay = {}
    rows.forEach((row) => {
      const day = (row.createdAt || '').slice(0, 10)
      if (day) byDay[day] = (byDay[day] || 0) + 1
    })
    const days = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).slice(-14)
    const played = rows.filter((row) => row.progress?.wallet).length
    const assessed = rows.filter((row) => knowledgeChange(row.progress?.profile?.assessment) !== null)
    const averageChange = assessed.length
      ? (assessed.reduce((sum, row) => sum + knowledgeChange(row.progress.profile.assessment), 0) / assessed.length).toFixed(1)
      : '—'
    const activeCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
    const activeSevenDays = rows.filter((row) => {
      const value = new Date(latestActivity(row)).getTime()
      return Number.isFinite(value) && value >= activeCutoff
    }).length
    return {
      total: rows.length,
      teachers: rows.filter((row) => row.role === 'teacher').length,
      students: rows.filter((row) => row.role === 'student').length,
      played,
      totalLogins: rows.reduce((sum, row) => sum + Number(row.loginCount || 0), 0),
      activeSevenDays,
      certificates: rows.filter((row) => row.progress?.profile?.guru).length,
      completions,
      days,
      avgBadges: rows.length ? (rows.reduce((value, row) => value + badges(row).length, 0) / rows.length).toFixed(1) : 0,
      preQuizzes: rows.filter((row) => row.progress?.profile?.assessment?.pre).length,
      postQuizzes: assessed.length,
      averageChange,
    }
  }, [data, rows])

  const exportCsv = () => {
    const questionColumns = KNOWLEDGE_QUESTIONS.flatMap((_, index) => [`preQ${index + 1}`, `postQ${index + 1}`])
    const head = [
      'email', 'role', 'gradeLevels', 'foundVia', 'social', 'createdAt', 'lastLoginAt',
      'lastLogoutAt', 'lastActiveAt', 'loginCount', 'currentModule', 'badges',
      'certificate', 'preScore', 'postScore', 'knowledgeChange', ...questionColumns,
    ].join(',')
    const lines = rows.map((row) => {
      const wallet = row.progress?.wallet
      const badges = (row.progress?.profile?.badges || []).join('|')
      const assessment = row.progress?.profile?.assessment
      const answerCells = KNOWLEDGE_QUESTIONS.flatMap((question) => [
        Number.isInteger(assessment?.pre?.answers?.[question.id]) ? question.choices[assessment.pre.answers[question.id]] : '',
        Number.isInteger(assessment?.post?.answers?.[question.id]) ? question.choices[assessment.post.answers[question.id]] : '',
      ])
      return [
        row.email, row.role, row.gradeLevels, row.foundVia, row.social, row.createdAt,
        row.lastLoginAt, row.lastLogoutAt, row.lastActiveAt, row.loginCount,
        wallet?.week ?? '', badges, row.progress?.profile?.guru ? 'yes' : 'no',
        assessment?.pre?.score ?? '', assessment?.post?.score ?? '',
        knowledgeChange(assessment) ?? '', ...answerCells,
      ].map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')
    })
    const blob = new Blob([[head, ...lines].join('\n')], { type: 'text/csv' })
    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(blob)
    anchor.download = 'tayu-accounts.csv'
    anchor.click()
    URL.revokeObjectURL(anchor.href)
  }

  if (err) {
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <p className="text-red-300">{err}</p>
          <button type="button" onClick={loadData} className="mt-4 min-h-[44px] rounded-xl bg-white/10 px-4 text-sm font-extrabold">
            Try again
          </button>
        </div>
      </main>
    )
  }
  if (!data) return <main className="grid min-h-screen place-items-center text-white/60">Loading analytics...</main>

  const maxDay = Math.max(1, ...stats.days.map(([, count]) => count))
  const maxComp = Math.max(1, ...Object.values(stats.completions))

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-10 w-10 rounded-xl" />
          <h1 className="font-display text-2xl font-extrabold">TAYU Analytics</h1>
          <span className="rounded-full bg-teal/20 px-2 py-0.5 text-xs font-extrabold text-teal">{isCloud() ? 'CLOUD' : 'THIS DEVICE (demo)'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={loadData} disabled={refreshing} className="min-h-[44px] rounded-xl bg-teal px-4 text-sm font-extrabold text-navy disabled:opacity-60">
            {refreshing ? 'Refreshing…' : 'Refresh data'}
          </button>
          <button type="button" onClick={exportCsv} className="min-h-[44px] rounded-xl bg-white/10 px-4 text-sm font-extrabold">Export CSV</button>
          <Link to="/" className="grid min-h-[44px] place-items-center rounded-xl bg-white/10 px-4 text-sm font-extrabold">Home</Link>
          <button type="button" onClick={() => signOutUser().then(() => nav('/'))} className="min-h-[44px] rounded-xl bg-white/10 px-4 text-sm font-extrabold">Log out</button>
        </div>
      </div>

      <p className="mt-3 text-sm font-semibold text-white/55">
        Successful account events are recorded here. Passwords and failed-login details are never stored in this dashboard.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-9">
        <Stat label="Accounts" value={stats.total} />
        <Stat label="Successful logins" value={stats.totalLogins} />
        <Stat label="Active in last 7 days" value={stats.activeSevenDays} />
        <Stat label="Played the game" value={stats.played} />
        <Stat label="Teachers / Students" value={`${stats.teachers} / ${stats.students}`} />
        <Stat label="Avg modules done" value={stats.avgBadges} />
        <Stat label="Certificates earned" value={stats.certificates} />
        <Stat label="Pre / post quizzes" value={`${stats.preQuizzes} / ${stats.postQuizzes}`} />
        <Stat label="Avg knowledge change" value={stats.averageChange === '—' ? '—' : `${Number(stats.averageChange) >= 0 ? '+' : ''}${stats.averageChange}`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white/5 p-5">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-teal">Accounts over time (last 14 sign-up days)</h2>
          <div className="mt-4 flex h-32 items-end gap-1.5">
            {stats.days.length === 0 && <p className="text-sm text-white/40">No sign-ups yet.</p>}
            {stats.days.map(([day, count]) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t bg-electric" style={{ height: `${(count / maxDay) * 100}%` }} title={`${day}: ${count}`} />
                <span className="text-[9px] text-white/40">{day.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white/5 p-5">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-teal">Module completions (drop-off view)</h2>
          <div className="mt-4 space-y-2">
            {MODULES.map((module) => (
              <div key={module} className="flex items-center gap-2">
                <span className="w-36 text-xs font-bold text-white/70">{MODULE_LABEL[module]}</span>
                <div className="h-4 flex-1 overflow-hidden rounded bg-white/10">
                  <div className="h-full rounded bg-teal" style={{ width: `${(stats.completions[module] / maxComp) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-xs font-extrabold">{stats.completions[module]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-teal">Recent account activity</h2>
          <span className="text-xs font-bold text-white/45">Latest {Math.min(activity.length, 100)} successful events</span>
        </div>
        {activity.length === 0 ? (
          <p className="mt-3 text-sm text-white/45">No account activity has been recorded yet. New sign-ups, logins, and logouts will appear here.</p>
        ) : (
          <table className="mt-3 w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-white/50">
                <th className="py-2 pr-3">Event</th>
                <th className="pr-3">Email</th>
                <th className="pr-3">Time</th>
                <th className="pr-3">Device</th>
                <th>Page</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((event) => (
                <tr key={event.id} className="border-t border-white/10">
                  <td className="py-2 pr-3 font-extrabold text-teal">{EVENT_LABEL[event.type] || event.type}</td>
                  <td className="pr-3">{event.email || '—'}</td>
                  <td className="pr-3">{timestamp(event.occurredAt)}</td>
                  <td className="pr-3">{event.device || 'Unknown'}</td>
                  <td>{event.path || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white/5 p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-teal">All accounts</h2>
        <table className="mt-3 w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-white/50">
              <th className="py-2 pr-3">Email</th>
              <th className="pr-3">Role</th>
              <th className="pr-3">Grades</th>
              <th className="pr-3">Found via</th>
              <th className="pr-3">Signed up</th>
              <th className="pr-3">Last login</th>
              <th className="pr-3">Logins</th>
              <th className="pr-3">Progress</th>
              <th>Pre → Post</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const wallet = row.progress?.wallet
              const badgeCount = (row.progress?.profile?.badges || []).length
              const assessment = row.progress?.profile?.assessment
              const change = knowledgeChange(assessment)
              return (
                <tr key={row.email} className="cursor-pointer border-t border-white/10 hover:bg-white/5" onClick={() => setSelected(selected === row.email ? null : row.email)}>
                  <td className="py-2 pr-3 font-bold">{row.email}{row.role === 'admin' && <span className="ml-1 rounded bg-sun/30 px-1 text-[10px] font-extrabold text-[#b8860b]">ADMIN</span>}</td>
                  <td className="pr-3">{row.role}</td>
                  <td className="pr-3">{row.gradeLevels || '-'}</td>
                  <td className="pr-3">{row.foundVia || '-'}</td>
                  <td className="pr-3">{(row.createdAt || '').slice(0, 10)}</td>
                  <td className="pr-3">{timestamp(row.lastLoginAt, 'Not yet')}</td>
                  <td className="pr-3 font-extrabold">{row.loginCount || 0}</td>
                  <td className="pr-3">{wallet ? `Module ${wallet.week} - ${badgeCount}/5 done${row.progress?.profile?.guru ? ' - CERTIFIED' : ''}` : 'Not started'}</td>
                  <td className="font-extrabold">{assessment?.pre ? `${assessment.pre.score}/3 → ${assessment?.post ? `${assessment.post.score}/3 (${change >= 0 ? '+' : ''}${change})` : 'pending'}` : 'Not taken'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {selected && (() => {
          const row = rows.find((item) => item.email === selected)
          if (!row) return null
          const badges = row.progress?.profile?.badges || []
          const assessment = row.progress?.profile?.assessment
          const change = knowledgeChange(assessment)
          return (
            <div className="mt-3 rounded-xl bg-white/5 p-4 text-sm">
              <div className="font-extrabold text-teal">{row.email}</div>
              <div className="mt-1 text-white/70">
                Signed up: {timestamp(row.createdAt)} · Successful logins: {row.loginCount || 0} · Last login: {timestamp(row.lastLoginAt, 'Not yet')} · Last logout: {timestamp(row.lastLogoutAt, 'Not yet')}
              </div>
              <div className="mt-1 text-white/70">
                Current module: {row.progress?.wallet?.week ?? 'none'} · Completed: {badges.length ? badges.map((badge) => MODULE_LABEL[badge] || badge).join(', ') : 'none yet'}
                {row.progress?.profile?.guru ? ' · Certificate earned' : ''}
                {row.progress?.savedAt ? ` · Last played ${timestamp(row.progress.savedAt)}` : ''}
              </div>
              <div className="mt-4 font-extrabold text-white">Knowledge quiz</div>
              {!assessment?.pre && <div className="mt-1 text-white/60">Pre-game quiz not taken.</div>}
              {assessment?.pre && (
                <>
                  <div className="mt-1 text-white/70">Before: {assessment.pre.score}/3 · After: {assessment.post ? `${assessment.post.score}/3` : 'not taken'}{change !== null ? ` · Change: ${change >= 0 ? '+' : ''}${change}` : ''}</div>
                  <div className="mt-3 grid gap-2">
                    {KNOWLEDGE_QUESTIONS.map((question, index) => {
                      const pre = assessment.pre.answers?.[question.id]
                      const post = assessment.post?.answers?.[question.id]
                      return (
                        <div key={question.id} className="rounded-lg bg-black/20 p-3">
                          <div className="text-xs font-extrabold text-teal">Q{index + 1}. {question.prompt}</div>
                          <div className="mt-1 text-xs text-white/70">Before: {Number.isInteger(pre) ? question.choices[pre] : '—'}</div>
                          <div className="text-xs text-white/70">After: {Number.isInteger(post) ? question.choices[post] : '—'}</div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )
        })()}
      </div>
    </main>
  )
}
