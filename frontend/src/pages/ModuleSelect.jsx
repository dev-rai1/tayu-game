import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { loadProfile, loadWallet } from '../services/walletStore.js'
import { currentUser } from '../services/auth.js'
import { loadCurrentClassContext } from '../services/classroom.js'
import { MODULE_CATALOG } from '../constants/modules.js'

export const MODULE_CARDS = MODULE_CATALOG

export default function ModuleSelect() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [context, setContext] = useState(null)
  const prof = loadProfile()
  const wallet = loadWallet()
  const badges = prof?.badges || []
  const current = Number(wallet?.week || 1)
  const user = currentUser()
  const teacherPreview = user?.role === 'teacher' && params.get('teacherPreview') === '1'

  useEffect(() => { loadCurrentClassContext().then(setContext).catch(() => setContext({ plain: true, settings: { enabledModules: [1, 2, 3, 4, 5], allowSkip: false } })) }, [])

  const enabled = context?.settings?.enabledModules || [1, 2, 3, 4, 5]
  const completedNumbers = useMemo(() => MODULE_CARDS.filter((m) => badges.includes(m.badge)).map((m) => m.n), [badges])
  const firstIncompleteEnabled = enabled.find((n) => !completedNumbers.includes(n)) || enabled[0] || 1

  const canPlay = (n) => {
    if (teacherPreview) return enabled.includes(n)
    if (!enabled.includes(n)) return false
    if (context?.settings?.allowSkip) return true
    return n === firstIncompleteEnabled || completedNumbers.includes(n)
  }

  const play = (n) => {
    const target = canPlay(n) ? n : firstIncompleteEnabled
    localStorage.setItem('tayu-jump-module', String(target))
    nav('/world')
  }

  if (!context) return <main className="grid min-h-screen place-items-center">Loading your session…</main>

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><img src="/assets/tayu-logo.webp" alt="TAYU" className="h-12 w-12 rounded-xl" /><div><h1 className="font-display text-2xl font-extrabold">{teacherPreview ? 'Preview your classroom session' : 'Your learning path'}</h1><p className="text-sm font-semibold text-white/75">{context.plain ? 'Complete modules in order to earn your certificate.' : `Class session from ${context.teacherEmail || 'your teacher'}`}</p></div></div><Link to={user?.role === 'teacher' ? '/teacher' : '/'} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-extrabold">Back</Link></div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">{MODULE_CARDS.map((m) => {
        const done = badges.includes(m.badge)
        const accessible = canPlay(m.n)
        const enabledByTeacher = enabled.includes(m.n)
        return <button key={m.n} onClick={() => play(m.n)} className={`rounded-3xl border-2 p-5 text-left transition active:scale-[0.98] ${accessible ? 'bg-white/5 hover:bg-white/10' : 'bg-black/25 opacity-70'}`} style={{ borderColor: done ? m.color : 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center justify-between"><span className="font-display text-lg font-extrabold" style={{ color: m.color }}>{m.n}. {m.title}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${done ? 'bg-teal text-navy' : accessible ? 'bg-sun text-navy' : 'bg-white/15 text-white/75'}`}>{done ? 'DONE' : accessible ? 'AVAILABLE' : 'LOCKED'}</span></div>
          <div className="mt-1 text-xs font-extrabold uppercase tracking-wide text-white/75">{m.grades}</div><p className="mt-2 text-sm font-semibold text-white/80">{m.desc}</p>
          <div className="mt-3 text-sm font-extrabold" style={{ color: accessible ? m.color : 'rgba(255,255,255,.55)' }}>{accessible ? (done ? 'Play again →' : 'Start →') : enabledByTeacher ? `Complete Module ${firstIncompleteEnabled} first` : `Locked by teacher — opens Module ${firstIncompleteEnabled}`}</div>
        </button>
      })}</div>
      <p className="mt-6 rounded-2xl bg-white/5 p-4 text-center text-sm font-bold text-white/70">The certificate unlocks after all five modules are completed ({badges.length}/5).</p>
    </main>
  )
}
