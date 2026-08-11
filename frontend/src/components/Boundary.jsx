// R10 v8 7.3: the kid-safe safety net. Any crash inside a page or the 3D
// canvas shows a warm oops-and-retry screen - never a stack trace, never a
// blank page. Errors are logged locally (last 20) so regressions get caught.
import { Component } from 'react'

export function logTayuError(kind, detail) {
  try {
    const log = JSON.parse(localStorage.getItem('tayu-errlog') || '[]')
    log.push({ t: new Date().toISOString(), kind, detail: String(detail).slice(0, 400) })
    localStorage.setItem('tayu-errlog', JSON.stringify(log.slice(-20)))
  } catch { /* storage unavailable */ }
  // eslint-disable-next-line no-console
  console.error('[tayu]', kind, detail)
}

export class Boundary extends Component {
  constructor(props) {
    super(props)
    this.state = { oops: false }
  }
  static getDerivedStateFromError() { return { oops: true } }
  componentDidCatch(err) {
    logTayuError('boundary:' + (this.props.name || 'app'), err?.message || err)

    // A WebGL/3D scene crash should never trap the player on the retry screen.
    // Recover once by switching this browser to the stable Accessible 2D world
    // and reloading the same route. Money/progress remain untouched.
    if (this.props.name === 'canvas' && this.props.hard && typeof window !== 'undefined') {
      try {
        const recoveryKey = 'tayu-canvas-recovery-attempted'
        if (sessionStorage.getItem(recoveryKey) !== '1') {
          sessionStorage.setItem(recoveryKey, '1')
          localStorage.setItem('tayu-world-mode', '2d')
          window.location.reload()
        }
      } catch { /* storage/reload recovery unavailable */ }
    }
  }
  render() {
    if (!this.state.oops) return this.props.children
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-navy p-6 text-center text-white">
        <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-20 w-20 rounded-2xl" />
        <h1 className="mt-4 font-display text-2xl font-extrabold text-teal">Oops! Something got tangled.</h1>
        <p className="mt-2 max-w-sm text-white/80">No worries - your money is saved. Let's hop back in.</p>
        <button
          className="btn-primary mt-5 min-h-[56px] px-8 text-lg"
          onClick={() => {
            this.setState({ oops: false })
            if (this.props.hard) {
              try { localStorage.setItem('tayu-world-mode', '2d') } catch { /* ignore */ }
              window.location.reload()
            }
          }}
        >
          Try again
        </button>
      </div>
    )
  }
}

// the branded wait: logo + progress ring, never a frozen white screen
export function LoadingScreen({ label = 'Loading the town...' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy text-white">
      <div className="relative grid place-items-center">
        <svg width="104" height="104" viewBox="0 0 104 104" aria-hidden className="tayu-spin-slow">
          <circle cx="52" cy="52" r="46" stroke="rgba(255,255,255,0.12)" strokeWidth="6" fill="none" />
          <circle cx="52" cy="52" r="46" stroke="#00DCA0" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="90 200" />
        </svg>
        <img src="/assets/tayu-logo.webp" alt="TAYU" className="absolute h-14 w-14 rounded-xl logo-breathe" />
      </div>
      <p className="mt-4 text-sm font-bold text-white/75">{label}</p>
    </div>
  )
}
