import { useState, useMemo } from 'react'
import { useGameState } from '../hooks/useGameState.jsx'
import { ALLOWANCE, stage1NetWorth, round2 } from '../utils/financialCalculations.js'
import { jarsSumValid, clamp } from '../utils/validators.js'
import { STAGE1_EVENTS, drawEvents } from '../utils/eventGenerator.js'
import HelpTooltip from './HelpTooltip.jsx'
import EventCard from './EventCard.jsx'

// Stage 1 - Childhood Choices: split a $20 allowance across Spend/Save/Give,
// then live through 3 random event cards, then see a summary.
const JARS = [
  { key: 'spend', label: 'Spend Jar', emoji: '💰', accent: 'accent-spend', help: 'Money to use now.' },
  { key: 'save', label: 'Save Jar', emoji: '💚', accent: 'accent-save', help: 'Money to keep for later. It can even grow!' },
  { key: 'give', label: 'Give Jar', emoji: '💙', accent: 'accent-give', help: 'Money to donate or share with others.' },
]

export default function Stage1Childhood({ onComplete }) {
  const { dispatch } = useGameState()
  const [phase, setPhase] = useState('split') // split | events | summary
  const [jars, setJars] = useState({ spend: 6, save: 10, give: 4 })
  const [events] = useState(() => drawEvents(STAGE1_EVENTS, 3))
  const [eventIdx, setEventIdx] = useState(0)
  const [log, setLog] = useState([])
  const [startSaved] = useState(() => 10)

  const total = jars.spend + jars.save + jars.give
  const valid = jarsSumValid(jars, ALLOWANCE)
  const setJar = (key, value) => setJars((j) => ({ ...j, [key]: clamp(Number(value), 0, ALLOWANCE) }))

  const current = events[eventIdx]

  const applyEvent = (choice) => {
    const ev = current
    let next = { ...jars }
    let note = ev.text
    const accepted = !ev.prompt || choice === 'yes'

    if (accepted) {
      if (ev.percent) {
        const gain = round2(next[ev.jar] * ev.percent)
        next[ev.jar] = round2(next[ev.jar] + gain)
        note = `${ev.text} (+$${gain} to ${ev.jar})`
      } else if (ev.amount) {
        next[ev.jar] = round2(Math.max(0, next[ev.jar] + ev.amount))
        note = `${ev.text} (${ev.amount > 0 ? '+' : ''}$${ev.amount} ${ev.jar})`
      }
    } else {
      note = `${ev.text} - you skipped it.`
    }

    setJars(next)
    setLog((l) => [...l, note])

    if (eventIdx + 1 < events.length) {
      setEventIdx((i) => i + 1)
    } else {
      setPhase('summary')
    }
  }

  const netWorth = stage1NetWorth(jars)
  const saveShare = total > 0 ? jars.save / (jars.spend + jars.save + jars.give) : 0

  const finish = () => {
    const achievement =
      saveShare >= 0.3
        ? { badge: 'Saver Spotlight', emoji: '🌟' }
        : { badge: 'Budget Master', emoji: '🧮' }
    dispatch({
      type: 'COMPLETE_STAGE',
      stage: 1,
      results: jars,
      netWorth,
      summary: { saved: jars.save, spent: jars.spend, gave: jars.give, netWorth },
      achievement,
    })
    onComplete?.()
  }

  // ---- SPLIT ----
  if (phase === 'split') {
    return (
      <section className="card animate-fadein">
        <h2 className="font-display text-2xl font-bold">Stage 1: Childhood Choices</h2>
        <p className="mt-1 text-white/70">You got ${ALLOWANCE} allowance! How will you split it?</p>

        <div className="mt-5 flex flex-col gap-5">
          {JARS.map((jar) => {
            const pct = Math.round((jars[jar.key] / ALLOWANCE) * 100)
            return (
              <div key={jar.key}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-bold">
                    {jar.emoji} {jar.label} <HelpTooltip text={jar.help} />
                  </span>
                  <span className="text-lg">${jars[jar.key]} <span className="text-sm text-white/50">({pct}%)</span></span>
                </div>
                <input
                  type="range" min="0" max={ALLOWANCE} step="1"
                  value={jars[jar.key]}
                  onChange={(e) => setJar(jar.key, e.target.value)}
                  className={`mt-1 w-full ${jar.accent}`}
                  aria-label={jar.label}
                />
              </div>
            )
          })}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <span className={valid ? 'text-save font-bold' : 'text-spend'}>
            Total: ${total} {valid ? '✓' : `(must equal $${ALLOWANCE})`}
          </span>
          <button className="btn-primary disabled:opacity-40" disabled={!valid} onClick={() => setPhase('events')}>
            Confirm & Continue →
          </button>
        </div>
        {saveShare >= 0.3 && valid && <p className="mt-3 text-sm text-save">Nice - saving 30%+ is a great habit! 🌟</p>}
      </section>
    )
  }

  // ---- EVENTS ----
  if (phase === 'events') {
    return (
      <section className="animate-fadein">
        <p className="mb-3 text-center text-white/60">Event {eventIdx + 1} of {events.length}</p>
        <EventCard event={current} onChoose={applyEvent} />
        <div className="mx-auto mt-4 flex max-w-sm justify-around text-center text-sm">
          <span>💰 ${jars.spend}</span>
          <span>💚 ${jars.save}</span>
          <span>💙 ${jars.give}</span>
        </div>
      </section>
    )
  }

  // ---- SUMMARY ----
  return (
    <section className="card animate-fadein text-center">
      <h2 className="font-display text-2xl font-bold">Stage 1 Complete! 🎉</h2>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Saved" value={`$${jars.save}`} color="text-save" />
        <Stat label="Spent" value={`$${jars.spend}`} color="text-spend" />
        <Stat label="Gave" value={`$${jars.give}`} color="text-give" />
      </div>
      <p className="mt-4 text-lg">Ending net worth: <span className="font-bold text-highlight">${netWorth}</span></p>
      <p className="mt-1 text-3xl">{saveShare >= 0.3 ? '🌟 Saver Spotlight' : '🧮 Budget Master'}</p>

      {log.length > 0 && (
        <ul className="mt-4 text-left text-sm text-white/60">
          {log.map((l, i) => <li key={i}>• {l}</li>)}
        </ul>
      )}

      <button className="btn-primary mt-5" onClick={finish}>
        Become a teen entrepreneur →
      </button>
    </section>
  )
}

function Stat({ label, value, color }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-white/50">{label}</div>
    </div>
  )
}
