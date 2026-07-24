import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameState } from '../hooks/useGameState.jsx'

// "Game Over!" - net worth journey, achievements earned, share + replay.
const STAGE_LABELS = { 1: 'Childhood', 2: 'Teen Hustle', 3: 'Young Adult' }

export default function FinalScreen() {
  const navigate = useNavigate()
  const { state, dispatch } = useGameState()
  const [copied, setCopied] = useState(false)

  const journey = [1, 2, 3].map((s) => ({ stage: s, ...(state.summaries[s] || {}) }))

  const playAgain = () => {
    dispatch({ type: 'RESET' })
    navigate('/')
  }

  const share = async () => {
    const badges = state.achievements.map((a) => `${a.emoji} ${a.badge}`).join(', ')
    const text = `I played Tayu and finished with a net worth of $${state.netWorth.toLocaleString()}! 🏆 ${badges}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="font-display text-4xl font-bold text-highlight">Game Over! 🎉</h1>

      <div className="card w-full">
        <p className="text-lg text-white/70">Final Net Worth</p>
        <p className="text-5xl font-extrabold text-save">${state.netWorth.toLocaleString()}</p>
        <span className="mt-2 inline-block text-sm text-white/50">
          {state.player.avatarIcon} {state.player.name || 'Player'}
        </span>
      </div>

      {/* Journey */}
      <div className="card w-full">
        <h2 className="mb-3 font-display text-lg font-bold">Your Money Journey</h2>
        <div className="flex items-end justify-around gap-2">
          {journey.map((j) => {
            const max = Math.max(...journey.map((x) => x.netWorth || 0), 1)
            const h = ((j.netWorth || 0) / max) * 100
            return (
              <div key={j.stage} className="flex flex-1 flex-col items-center">
                <span className="mb-1 text-xs text-highlight">${(j.netWorth || 0).toLocaleString()}</span>
                <div className="flex h-24 w-full items-end">
                  <div className="w-full rounded-t bg-give" style={{ height: `${h}%` }} />
                </div>
                <span className="mt-1 text-[11px] text-white/60">{STAGE_LABELS[j.stage]}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Achievements */}
      {state.achievements.length > 0 && (
        <div className="card w-full">
          <h2 className="mb-3 font-display text-lg font-bold">Badges Earned</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {state.achievements.map((a, i) => (
              <span key={i} className="rounded-2xl bg-highlight/20 px-4 py-2 text-sm font-bold">
                {a.emoji} {a.badge}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button className="btn-secondary" onClick={share}>{copied ? 'Copied! ✓' : '📋 Share result'}</button>
        <button className="btn-primary" onClick={playAgain}>Play Again 🔁</button>
      </div>
    </main>
  )
}
