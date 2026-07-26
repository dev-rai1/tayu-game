import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loadWallet, clearWallet } from '../services/walletStore.js'
import { currentUser } from '../services/auth.js'
import { TownBackground } from '../components/TownBackground.jsx'
import { MuteButton } from '../components/MuteButton.jsx'
import { startMusic } from '../services/audio.js'

// TAYU landing (Master Adjustment Part A). Zero explanatory text, zero emojis,
// zero "Module 1" - a living animated town, the bubble wordmark, one tagline,
// one big Play button, and a small About link. A child lands here and wants to
// press Play, not read.

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

  const onPlay = () => {
    startMusic('loading') // F2: music begins on the first user gesture
    // R14 P2: PLAY *is* the login. Signed-out players go straight to
    // login/sign-up; signed-in returning players continue their world.
    if (!currentUser()) { navigate('/login'); return }
    if (hasSave) setChoice(true) // G1: Continue vs Restart
    else navigate('/avatar')
  }
  const onContinue = () => navigate('/world')
  const onRestart = () => { clearWallet(); navigate('/avatar') }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <TownBackground theme="play" />

      {/* header: just the logo - no copy */}
      {/* z-30: the full-screen <main> below is also z-10 and paints AFTER the
          header - without this, clicks on the mute button hit the overlay */}
      <header className="absolute left-0 top-0 z-30 flex items-center gap-2 p-4">
        <img src={LOGO} alt="TAYU" className="h-12 w-12 rounded-2xl shadow-lg" />
        <MuteButton />
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

        {/* secondary link - just About Us; Play itself is the login (R14 P2) */}
        <Link to="/about" className="mt-3 rounded-xl bg-white/70 px-4 py-1.5 text-sm font-bold text-navy underline-offset-2 hover:underline">
          About Us
        </Link>
      </main>

      {/* G1 - Continue vs Restart (only when a save exists) */}
      {choice && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-navy/60 p-6 backdrop-blur-sm">
          <div className="glass--navy pop-in w-full max-w-sm p-7 text-center">
            <img src={LOGO} alt="" className="mx-auto h-14 w-14 rounded-2xl" />
            <h2 className="mt-3 font-display text-xl font-extrabold text-white">Welcome back!</h2>
            <p className="mt-1 text-sm text-white/70">You have a world in progress.</p>
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
