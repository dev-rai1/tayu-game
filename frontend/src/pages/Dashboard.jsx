// R12 PART 3: THE ADMIN ANALYTICS DASHBOARD (role=admin only).
// Every account with its sign-up answers, game stats (players, accounts over
// time, module completions, certificates, drop-off), per-user progress, and
// CSV export. Normal users are bounced to /login.
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminData, currentUser, signOutUser, isCloud } from '../services/auth.js'

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
    return {
      total: rows.length,
      teachers: rows.filter((r) => r.role === 'teacher').length,
      students: rows.filter((r) => r.role === 'student').length,
      played,
      certificates: rows.filter((r) => r.progress?.profile?.guru).length,
      completions,
      days,
      avgBadges: rows.length ? (rows.reduce((v, r) => v + badges(r).length, 0) / rows.length).toFixed(1) : 0,
      dropOff: MODULES.map((m, i) => ({ m, lost: i === 0 ? Math.max(0, played - completions[m]) : Math.max(0, completions[MODULES[i - 1]] - completions[m]) })),
    }
  }, [rows])

  const exportCsv = () => {
    const head = 'email,role,gradeLevels,foundVia,social,createdAt,currentModule,currentWeek,badges,certificate'
    const lines = rows.map((r) => {
      const w = r.progress?.wallet
      const badges = (r.progress?.profile?.badges || []).join('|')
      return [r.email, r.role, r.gradeLevels, r.foundVia, r.social, r.createdAt, w?.week ?? '', '', badges, r.progress?.profile?.guru ? 'yes' : 'no']
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

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Accounts" value={stats.total} />
        <Stat label="Played the game" value={stats.played} />
        <Stat label="Teachers / Students" value={`${stats.teachers} / ${stats.students}`} />
        <Stat label="Avg modules done" value={stats.avgBadges} />
        <Stat label="Certificates earned" value={stats.certificates} />
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
              <th className="pr-3">Found via</th><th className="pr-3">Social</th><th className="pr-3">Signed up</th><th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const w = r.progress?.wallet
              const nBadges = (r.progress?.profile?.badges || []).length
              return (
                <tr key={r.email} className="cursor-pointer border-t border-white/10 hover:bg-white/5" onClick={() => setSelected(selected === r.email ? null : r.email)}>
                  <td className="py-2 pr-3 font-bold">{r.email}{r.role === 'admin' && <span className="ml-1 rounded bg-sun/30 px-1 text-[10px] font-extrabold text-[#b8860b]">ADMIN</span>}</td>
                  <td className="pr-3">{r.role}</td>
                  <td className="pr-3">{r.gradeLevels || '-'}</td>
                  <td className="pr-3">{r.foundVia || '-'}</td>
                  <td className="pr-3">{r.social || '-'}</td>
                  <td className="pr-3">{(r.createdAt || '').slice(0, 10)}</td>
                  <td>{w ? `Module ${w.week} - ${nBadges}/5 done${r.progress?.profile?.guru ? ' - CERTIFIED' : ''}` : 'Not started'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {selected && (() => {
          const r = rows.find((x) => x.email === selected)
          const badges = r?.progress?.profile?.badges || []
          return (
            <div className="mt-3 rounded-xl bg-white/5 p-4 text-sm">
              <div className="font-extrabold text-teal">{r.email}</div>
              <div className="mt-1 text-white/70">
                Current module: {r.progress?.wallet?.week ?? 'none'} · Completed: {badges.length ? badges.map((b) => MODULE_LABEL[b] || b).join(', ') : 'none yet'}
                {r.progress?.profile?.guru ? ' · Certificate earned' : ''}
                {r.progress?.savedAt ? ` · Last played ${r.progress.savedAt.slice(0, 16).replace('T', ' ')}` : ''}
              </div>
            </div>
          )
        })()}
      </div>
    </main>
  )
}
