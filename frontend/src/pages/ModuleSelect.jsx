// R12 PART 4: THE MODULE-SELECT SCREEN. Returning players choose any module
// - the order is recommended, never forced. Each card shows the recommended
// grade band and the completion state; the certificate still requires ALL
// five. First-time players are guided in order as before.
import { Link, useNavigate } from 'react-router-dom'
import { loadProfile, loadWallet } from '../services/walletStore.js'
import { currentUser } from '../services/auth.js'
import { MODULE_CATALOG } from '../constants/modules.js'

export const MODULE_CARDS = MODULE_CATALOG

export default function ModuleSelect() {
  const nav = useNavigate()
  const prof = loadProfile()
  const wallet = loadWallet()
  const badges = prof?.badges || []
  const current = wallet?.week
  const user = currentUser()

  const play = (n) => {
    localStorage.setItem('tayu-jump-module', String(n))
    nav('/world')
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-12 w-12 rounded-xl" />
          <div>
            <h1 className="font-display text-2xl font-extrabold">Pick a module</h1>
            <p className="text-sm font-semibold text-white/75">{user ? user.email : prof?.name ? `Welcome back, ${prof.name}!` : 'The order is our favorite path - but you choose.'}</p>
          </div>
        </div>
        <Link to="/" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-extrabold">Home</Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {MODULE_CARDS.map((m) => {
          const done = badges.includes(m.badge)
          const inProgress = !done && current === m.n
          return (
            <button key={m.n} onClick={() => play(m.n)}
              className="rounded-3xl border-2 bg-white/5 p-5 text-left transition hover:bg-white/10 active:scale-[0.98]"
              style={{ borderColor: done ? m.color : 'rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-extrabold" style={{ color: m.color }}>{m.n}. {m.title}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${done ? 'bg-teal text-navy' : inProgress ? 'bg-sun text-navy' : 'bg-white/15 text-white/75'}`}>
                  {done ? 'DONE' : inProgress ? 'IN PROGRESS' : 'NOT STARTED'}
                </span>
              </div>
              <div className="mt-1 text-xs font-extrabold uppercase tracking-wide text-white/75">Best for {m.grades.toLowerCase()}</div>
              <p className="mt-2 text-sm font-semibold text-white/80">{m.desc}</p>
              <div className="mt-3 text-sm font-extrabold" style={{ color: m.color }}>{done ? 'Play again' : inProgress ? 'Continue' : 'Start here'} →</div>
            </button>
          )
        })}
      </div>

      <p className="mt-6 rounded-2xl bg-white/5 p-4 text-center text-sm font-bold text-white/70">
        Play in any order you like - the CERTIFICATE unlocks when all five modules are complete ({badges.length}/5 so far).
      </p>
    </main>
  )
}
