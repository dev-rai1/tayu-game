// R12 PART 3: THE ADMIN ANALYTICS DASHBOARD (role=admin only).
// Every account with its sign-up answers, game stats (players, accounts over
// time, module completions, certificates, drop-off), per-user progress, and
// CSV export. Normal users are bounced to /login.
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminData, currentUser, signOutUser, isCloud } from '../services/auth.js'
import { KNOWLEDGE_QUESTIONS, knowledgeChange } from '../constants/knowledgeQuiz.js'

const MODULES = ['jars', 'lemonade', 'budget', 'bank', 'garden']
const MODULE_LABEL = { jars: 'M1 Market & Jars', lemonade: 'M2 Lemonade', budget: 'M3 Budget Town', bank: 'M4 Bank', garden: 'M5 Money Garden' }

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <div className="text-3xl font-extrabold text-teal">{value}</div>
      <div className="mt-1 text-xs font-bold text-white/60">{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const nav = useNavigate()
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const u = currentUser()
    if (!u || u.role !== 'admin') { nav('/login'); return }
    adminData().then(setRows).catch((e) => setErr(e.message))
  }, [nav])

  const stats = useMemo(() => {
    if (!rows) return null
    const badges = (r) => r.progress?.profile?.badges || []
    const completions = Object.fromEntries(MODULES.map((m) => [m, rows.filter((r) => badges(r).includes(m)).length]))
    const byDay = {}
    rows.forEach((r) => { const d = (r.createdAt || '').slice(0, 10); if (d) byDay[d] = (byDay[d] || 0) + 1 })
    const days = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).slice(-14)
    const played = rows.filter((r) => r.progress?.wallet).length
    const assessed = rows.filter((r) => knowledgeChange(r.progress?.profile?.assessment) !== null)
    const averageChange = assessed.length
      ? (assessed.reduce((sum, r) => sum + knowledgeChange(r.progress.profile.assessment), 0) / assessed.length).toFixed(1)
      : '—'
    return {
      total: rows.length,
      teachers: rows.filter((r) => r.role === 'teacher').length,
      students: rows.filter((r) => r.role === 'student').length,
      played,
      certificates: rows.filter((r) => r.progress?.profile?.guru).length,
      completions,
      days,
      avgBadges: rows.length ? (rows.reduce((v, r) => v + badges(r).length, 0) / rows.length).toFixed(1) : 0,
      preQuizzes: rows.filter((r) => r.progress?.profile?.assessment?.pre).length,
      postQuizzes: assessed.length,
      averageChange,
      dropOff: MODULES.map((m, i) => ({ m, lost: i === 0 ? Math.max(0, played - completions[m]) : Math.max(0, completions[MODULES[i - 1]] - completions[m]) })),
    }
  }, [rows])

  const exportCsv = () => {
    const questionColumns = KNOWLEDGE_QUESTIONS.flatMap((_, i) => [`preQ${i + 1}`, `postQ${i + 1}`])
    const head = ['email', 'role', 'gradeLevels', 'foundVia', 'social', 'createdAt', 'currentModule', 'badges', 'certificate', 'preScore', 'postScore', 'knowledgeChange', ...questionColumns].join(',')
    const lines = rows.map((r) => {
      const w = r.progress?.wallet
      const badges = (r.progress?.profile?.badges || []).join('|')
      const assessment = r.progress?.profile?.assessment
      const answerCells = KNOWLEDGE_QUESTIONS.flatMap((question) => [
        Number.isInteger(assessment?.pre?.answers?.[question.id]) ? question.choices[assessment.pre.answers[question.id]] : '',
        Number.isInteger(assessment?.post?.answers?.[question.id]) ? question.choices[assessment.post.answers[question.id]] : '',
      ])
      return [r.email, r.role, r.gradeLevels, r.foundVia, r.social, r.createdAt, w?.week ?? '', badges, r.progress?.profile?.guru ? 'yes' : 'no', assessment?.pre?.score ?? '', assessment?.post?.score ?? '', knowledgeChange(assessment) ?? '', ...answerCells]
        .map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')
    })
    const blob = new Blob([[head, ...lines].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'tayu-accounts.csv'
    a.click()
  }

  if (err) return <main className="grid min-h-screen place-items-center text-red-300">{err}</main>
  if (!rows) return <main className="grid min-h-screen place-items-center text-white/60">Loading analytics...</main>

  const maxDay = Math.max(1, ...stats.days.map(([, n]) => n))
  const maxComp = Math.max(1, ...Object.values(stats.completions))

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-10 w-10 rounded-xl" />
          <h1 className="font-display text-2xl font-extrabold">TAYU Analytics</h1>
          <span className="rounded-full bg-teal/20 px-2 py-0.5 text-xs font-extrabold text-teal">{isCloud() ? 'CLOUD' : 'THIS DEVICE (demo)'}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="min-h-[44px] rounded-xl bg-white/10 px-4 text-sm font-extrabold">Export CSV</button>
          <Link to="/" className="grid min-h-[44px] place-items-center rounded-xl bg-white/10 px-4 text-sm font-extrabold">Home</Link>
          <button onClick={() => signOutUser().then(() => nav('/'))} className="min-h-[44px] rounded-xl bg-white/10 px-4 text-sm font-extrabold">Log out</button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <Stat label="Accounts" value={stats.total} />
        <Stat label="Played the game" value={stats.played} />
        <Stat label="Teachers / Students" value={`${stats.teachers} / ${stats.students}`} />
        <Stat label="Avg modules done" value={stats.avgBadges} />
        <Stat label="Certificates earned" value={stats.certificates} />
        <Stat label="Pre / post quizzes" value={`${stats.preQuizzes} / ${stats.postQuizzes}`} />
        <Stat label="Avg knowledge change" value={stats.averageChange === '—' ? '—' : `${Number(stats.averageChange) >= 0 ? '+' : ''}${stats.averageChange}`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white/5 p-5">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-teal">Accounts over time (last 14 days)</h2>
          <div className="mt-4 flex h-32 items-end gap-1.5">
            {stats.days.length === 0 && <p className="text-sm text-white/40">No sign-ups yet.</p>}
            {stats.days.map(([d, n]) => (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t bg-electric" style={{ height: `${(n / maxDay) * 100}%` }} title={`${d}: ${n}`} />
                <span className="text-[9px] text-white/40">{d.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white/5 p-5">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-teal">Module completions (drop-off view)</h2>
          <div className="mt-4 space-y-2">
            {MODULES.map((m) => (
              <div key={m} className="flex items-center gap-2">
                <span className="w-36 text-xs font-bold text-white/70">{MODULE_LABEL[m]}</span>
                <div className="h-4 flex-1 overflow-hidden rounded bg-white/10">
                  <div className="h-full rounded bg-teal" style={{ width: `${(stats.completions[m] / maxComp) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-xs font-extrabold">{stats.completions[m]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white/5 p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-teal">All accounts</h2>
        <table className="mt-3 w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-white/50">
              <th className="py-2 pr-3">Email</th><th className="pr-3">Role</th><th className="pr-3">Grades</th>
              <th className="pr-3">Found via</th><th className="pr-3">Signed up</th><th className="pr-3">Progress</th><th>Pre → Post</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const w = r.progress?.wallet
              const nBadges = (r.progress?.profile?.badges || []).length
              const assessment = r.progress?.profile?.assessment
              const change = knowledgeChange(assessment)
              return (
                <tr key={r.email} className="cursor-pointer border-t border-white/10 hover:bg-white/5" onClick={() => setSelected(selected === r.email ? null : r.email)}>
                  <td className="py-2 pr-3 font-bold">{r.email}{r.role === 'admin' && <span className="ml-1 rounded bg-sun/30 px-1 text-[10px] font-extrabold text-[#b8860b]">ADMIN</span>}</td>
                  <td className="pr-3">{r.role}</td>
                  <td className="pr-3">{r.gradeLevels || '-'}</td>
                  <td className="pr-3">{r.foundVia || '-'}</td>
                  <td className="pr-3">{(r.createdAt || '').slice(0, 10)}</td>
                  <td className="pr-3">{w ? `Module ${w.week} - ${nBadges}/5 done${r.progress?.profile?.guru ? ' - CERTIFIED' : ''}` : 'Not started'}</td>
                  <td className="font-extrabold">{assessment?.pre ? `${assessment.pre.score}/3 → ${assessment?.post ? `${assessment.post.score}/3 (${change >= 0 ? '+' : ''}${change})` : 'pending'}` : 'Not taken'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {selected && (() => {
          const r = rows.find((x) => x.email === selected)
          const badges = r?.progress?.profile?.badges || []
          const assessment = r?.progress?.profile?.assessment
          const change = knowledgeChange(assessment)
          return (
            <div className="mt-3 rounded-xl bg-white/5 p-4 text-sm">
              <div className="font-extrabold text-teal">{r.email}</div>
              <div className="mt-1 text-white/70">
                Current module: {r.progress?.wallet?.week ?? 'none'} · Completed: {badges.length ? badges.map((b) => MODULE_LABEL[b] || b).join(', ') : 'none yet'}
                {r.progress?.profile?.guru ? ' · Certificate earned' : ''}
                {r.progress?.savedAt ? ` · Last played ${r.progress.savedAt.slice(0, 16).replace('T', ' ')}` : ''}
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
