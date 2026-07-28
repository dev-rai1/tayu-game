import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loadProfile, loadWallet, clearWallet } from '../services/walletStore.js'
import { signOutUser } from '../services/auth.js'
import { TownBackground } from '../components/TownBackground.jsx'
import { MuteButton } from '../components/MuteButton.jsx'
import { startMusic } from '../services/audio.js'
import { EDUCATOR_GRADE_BANDS } from '../constants/modules.js'

// TAYU landing: the first viewport stays playful and student-friendly, while
// the content directly below it gives educators and search engines a clear
// picture of the complete K-12 learning path.

const LOGO = '/assets/tayu-logo.webp'

// ---------- bubble wordmark (SVG: brand gradient + granite noise, bopping) ----------
function Wordmark() {
  return (
    <svg viewBox="0 0 560 190" className="w-[min(86vw,540px)]" role="img" aria-label="Tayu">
      <defs>
        <linearGradient id="tayuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1464F0" />
          <stop offset="55%" stopColor="#7850F0" />
          <stop offset="100%" stopColor="#00DCA0" />
        </linearGradient>
        <filter id="granite">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.14 0" result="grain" />
          <feComposite in="grain" in2="SourceGraphic" operator="in" result="grainIn" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="grainIn" />
          </feMerge>
        </filter>
      </defs>
      {['T', 'a', 'y', 'u'].map((ch, i) => (
        <g key={i} className="tayu-letter" style={{ animationDelay: `${i * 0.15}s` }}>
          <text
            x={90 + i * 128} y={138} textAnchor="middle"
            fontFamily="Montserrat, Poppins, system-ui, sans-serif" fontWeight="900" fontSize="150"
            fill="url(#tayuGrad)" filter="url(#granite)"
            stroke="#ffffff" strokeWidth="14" paintOrder="stroke" strokeLinejoin="round"
          >
            {ch}
          </text>
        </g>
      ))}
    </svg>
  )
}

// tiny CSS characters that peek beside the Play button and wave inward
function Peeker({ side, shirt, delay }) {
  return (
    <div className="peeker" style={{ [side]: '-34px', animationDelay: delay }} aria-hidden="true">
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#e8b486', margin: '0 auto' }} />
      <div style={{ width: 22, height: 20, borderRadius: 8, background: shirt, margin: '-2px auto 0' }} />
    </div>
  )
}

export default function Welcome() {
  const navigate = useNavigate()
  const [choice, setChoice] = useState(false)
  const hasSave = !!loadWallet()

  const onPlay = async () => {
    startMusic('loading') // F2: music begins on the first user gesture
    // Require fresh authentication every time a player starts from the landing page.
    // Progress remains saved, but the previous account session is cleared first.
    try {
      await signOutUser()
    } finally {
      navigate('/login')
    }
  }
  const onContinue = () => navigate('/world')
  const onRestart = () => { clearWallet(); navigate('/avatar') }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#eef8ff] text-navy">
      <div className="fixed inset-0">
        <TownBackground theme="play" />
      </div>

      {/* Keep the music control explicit here so first-time players know they
          can silence the soundtrack before entering the game. */}
      {/* z-30: the full-screen <main> below is also z-10 and paints AFTER the
          header - without this, clicks on the mute button hit the overlay */}
      <header className="absolute left-0 top-0 z-30 flex items-center gap-2 p-4">
        <img src={LOGO} alt="TAYU" className="h-12 w-12 rounded-2xl shadow-lg" />
        <MuteButton showLabel />
      </header>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-5 px-6 pb-16">
        <Wordmark />

        {/* one short tagline - a few words, nothing else */}
        <p className="font-display text-xl font-bold tracking-wide text-navy sm:text-2xl" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.8)' }}>
          Learn money by playing it.
        </p>

        {/* the single call to action */}
        <div className="relative mt-2">
          <Peeker side="left" shirt="#00DCA0" delay="0s" />
          <Peeker side="right" shirt="#7850F0" delay="0.6s" />
          <button onClick={onPlay} className="play-btn relative rounded-3xl px-14 py-5 font-display text-3xl font-extrabold text-white shadow-2xl">
            Play Now
          </button>
        </div>

        <nav aria-label="Visitor paths" className="mt-3 flex flex-wrap justify-center gap-2">
          <a href="#educators" className="rounded-xl bg-white/90 px-5 py-2 text-sm font-extrabold text-navy shadow hover:bg-white">
            For Educators
          </a>
          <Link to="/about" className="rounded-xl bg-white/70 px-5 py-2 text-sm font-bold text-navy underline-offset-2 hover:underline">
            About Us
          </Link>
        </nav>

        <a href="#grade-bands" className="absolute bottom-5 text-sm font-bold text-navy/70 hover:text-electric">
          Explore the K-12 learning path <span aria-hidden="true">↓</span>
        </a>
      </main>

      <div className="relative z-10 bg-white/95 shadow-[0_-12px_40px_rgba(7,23,72,0.12)] backdrop-blur">
        <section id="grade-bands" className="mx-auto max-w-5xl scroll-mt-6 px-6 py-16">
          <div className="text-center">
            <p className="font-display text-sm font-extrabold uppercase tracking-[0.18em] text-electric">Financial literacy that grows with students</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">One world. Three grade bands.</h1>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-navy/70">Start with everyday money choices, then build toward the real financial decisions students will make as adults.</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {EDUCATOR_GRADE_BANDS.map((band) => (
              <article key={band.title} className="rounded-3xl border-2 border-navy/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="font-display text-sm font-extrabold" style={{ color: band.color }}>{band.grades}</div>
                <h2 className="mt-1 font-display text-2xl font-extrabold">{band.title}</h2>
                <p className="mt-3 leading-relaxed text-navy/70">{band.copy}</p>
                <div className="mt-4 border-t border-navy/10 pt-4">
                  <div className="text-xs font-extrabold uppercase tracking-wide text-navy/50">
                    {band.currentModules.length ? 'Playable now' : 'Coming next'}
                  </div>
                  {band.currentModules.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {band.currentModules.map((module) => (
                        <li key={module.n} className="text-sm font-bold text-navy/80">
                          Module {module.n}: {module.title} <span className="text-navy/50">({module.grades})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {band.plannedModules.length > 0 && (
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-navy/65">
                      <span className="font-extrabold">{band.currentModules.length ? 'In development: ' : ''}</span>
                      {band.plannedModules.join(' • ')}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="educators" className="scroll-mt-6 bg-navy px-6 py-14 text-white">
          <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-[1.3fr_1fr]">
            <div>
              <div className="inline-flex rounded-full bg-teal/15 px-4 py-2 text-sm font-extrabold text-teal">Built for classrooms • Free to play</div>
              <h2 className="mt-4 font-display text-3xl font-extrabold">Bring TAYU to your school</h2>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-white/75">Explore short, playable modules, classroom-ready guidance, read-aloud support, and automatic progress saving. We also offer free live or virtual demos for schools and community programs.</p>
              <p className="mt-4 font-bold text-white">Designed around the CEE/Jump$tart National Standards for Personal Financial Education.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="https://calendly.com/tayu-finance/30min" target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-teal px-6 py-3 font-extrabold text-navy hover:bg-white">Book a Free Demo</a>
                <Link to="/about" className="rounded-2xl border-2 border-white/30 px-6 py-3 font-extrabold text-white hover:bg-white/10">Educator Overview</Link>
              </div>
            </div>
            <div className="rounded-3xl bg-white/10 p-6">
              <p className="font-display text-sm font-extrabold uppercase tracking-wider text-teal">Elementary companion book</p>
              <h3 className="mt-2 font-display text-2xl font-extrabold">The Seed That Grew</h3>
              <p className="mt-2 text-white/70">Pair TAYU with our children&rsquo;s story about patience, investing, and helping a small seed grow.</p>
              <a href="https://www.amazon.com/Seed-That-Grew-Story-Investing/dp/B0FZ9CNLJV/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block font-extrabold text-teal underline underline-offset-4">Explore the companion book</a>
            </div>
          </div>
        </section>
      </div>

      {/* G1 - Continue vs Restart (only when a save exists) */}
      {choice && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-navy/60 p-6 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="continue-title" aria-describedby="continue-description" className="glass--navy pop-in w-full max-w-sm p-7 text-center">
            <img src={LOGO} alt="" className="mx-auto h-14 w-14 rounded-2xl" />
            <h2 id="continue-title" className="mt-3 font-display text-xl font-extrabold text-white">Welcome back!</h2>
            <p id="continue-description" className="mt-1 text-sm font-semibold text-white/80">You have a world in progress.</p>
            <div className="mt-5 flex flex-col gap-2">
              <button className="btn-primary" onClick={onContinue}>Continue my world</button>
              <button className="btn-ghost" onClick={onRestart}>Restart from the beginning</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
