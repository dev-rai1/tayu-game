import { useMemo, useState } from 'react'
import { marketMathChallengeForGrade, normalizeChallengeGrade } from '../constants/marketMathChallenges.js'

export default function BonusMathChallenge({ grade }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const normalizedGrade = normalizeChallengeGrade(grade)
  const challenge = useMemo(() => marketMathChallengeForGrade(normalizedGrade), [normalizedGrade])
  const correct = selected === challenge.answer

  const close = () => {
    setOpen(false)
    setSelected(null)
  }

  if (!open) {
    return (
      <div className="mt-5 rounded-2xl border border-electric/35 bg-electric/10 p-4 text-left">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-electric">Optional · {normalizedGrade} math</p>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-extrabold text-white">Want a harder question?</h2>
            <p className="mt-1 text-sm font-semibold text-white/70">Practice money math without changing your badge or score.</p>
          </div>
          <button type="button" onClick={() => setOpen(true)} className="min-h-[50px] shrink-0 rounded-2xl bg-electric px-5 font-extrabold text-white active:scale-95">
            Try bonus math
          </button>
        </div>
      </div>
    )
  }

  return (
    <section className="mt-5 rounded-2xl border-2 border-electric bg-navy/80 p-5 text-left" aria-labelledby="bonus-math-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-teal">Bonus math · {normalizedGrade}</p>
          <h2 id="bonus-math-title" className="mt-1 font-display text-xl font-extrabold">{challenge.label}</h2>
        </div>
        <button type="button" onClick={close} className="min-h-[40px] rounded-xl bg-white/10 px-3 text-xs font-extrabold text-white">Close</button>
      </div>

      <p className="mt-4 text-lg font-extrabold leading-relaxed">{challenge.prompt}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {challenge.choices.map((choice, index) => {
          const picked = selected === index
          const revealCorrect = selected !== null && index === challenge.answer
          return (
            <button
              key={choice}
              type="button"
              disabled={selected !== null}
              onClick={() => setSelected(index)}
              className={`min-h-[52px] rounded-xl border-2 px-3 font-extrabold transition active:scale-[0.98] ${revealCorrect ? 'border-teal bg-teal text-navy' : picked ? 'border-sun bg-sun/15 text-white' : 'border-white/15 bg-white/5 text-white hover:border-white/40'} disabled:cursor-default`}
            >
              {choice}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <div aria-live="polite" className={`mt-4 rounded-xl p-4 ${correct ? 'bg-teal/15' : 'bg-sun/15'}`}>
          <p className={`font-display text-lg font-extrabold ${correct ? 'text-teal' : 'text-sun'}`}>{correct ? 'Exactly!' : 'Good try. Work through each step.'}</p>
          <p className="mt-1 font-semibold text-white/80">{challenge.explanation}</p>
          <button type="button" onClick={close} className="mt-3 min-h-[46px] rounded-xl bg-white/10 px-5 font-extrabold text-white active:scale-95">Back to my recap</button>
        </div>
      )}
    </section>
  )
}
