import { useMemo, useState } from 'react'
import { moduleCheckForBadge } from '../constants/moduleChecks.js'
import { addModuleCheckAttempt, moduleCheckProgress } from '../services/modulePractice.js'
import { loadProfile, saveProfile } from '../services/walletStore.js'
import { recordLearningEvent } from '../services/usageAnalytics.js'
import { useGame } from '../world/store.js'

const CHECK = moduleCheckForBadge('lemonade')

export function shouldShowLemonadeCompletionCheck({ week, weekComplete }) {
  return Number(week) === 2 && Boolean(weekComplete)
}

function saveCheckAttempt(score) {
  const profile = loadProfile() || {}
  const previous = profile.moduleChecks?.lemonade || null
  const updated = addModuleCheckAttempt(previous, {
    score,
    total: CHECK.questions.length,
    completedAt: new Date().toISOString(),
  })

  saveProfile({
    moduleChecks: {
      ...(profile.moduleChecks || {}),
      lemonade: updated,
    },
  })

  recordLearningEvent({
    moduleName: 'lemonade',
    type: 'module_check',
    outcome: score === CHECK.questions.length ? 'mastered' : 'completed',
    detail: `${score}/${CHECK.questions.length}; attempt ${updated.attemptCount}; best ${updated.bestScore}`,
  }).catch(() => {})

  return updated
}

export function LemonadeCompletionCheck({ onContinue }) {
  const week = useGame((state) => state.week)
  const weekComplete = useGame((state) => state.weekComplete)
  const cumulativeProfit = useGame((state) => state.lemCumProfit)

  const startingRecord = useMemo(() => (loadProfile() || {}).moduleChecks?.lemonade || null, [])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [result, setResult] = useState(startingRecord)
  const [stage, setStage] = useState(startingRecord ? 'recap' : 'check')

  if (!CHECK || !shouldShowLemonadeCompletionCheck({ week, weekComplete })) return null

  const question = CHECK.questions[questionIndex]
  const correct = selected === question?.answer
  const progress = moduleCheckProgress(result)

  const choose = (index) => {
    if (selected !== null) return
    setSelected(index)
  }

  const advance = () => {
    if (selected === null) return
    const nextAnswers = [...answers, { selected, correct }]

    if (questionIndex < CHECK.questions.length - 1) {
      setAnswers(nextAnswers)
      setQuestionIndex((value) => value + 1)
      setSelected(null)
      return
    }

    const score = nextAnswers.filter((answer) => answer.correct).length
    setAnswers(nextAnswers)
    setResult(saveCheckAttempt(score))
    setStage('recap')
  }

  if (stage === 'recap') {
    return (
      <div className="pointer-events-auto absolute inset-0 z-[410] flex items-center justify-center bg-navy/75 p-4 backdrop-blur-sm">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="lemonade-check-recap-title"
          className="pop-in max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 text-center text-navy shadow-2xl sm:p-7"
        >
          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal">Module 2 complete · Check 2 done</div>
          <h2 id="lemonade-check-recap-title" className="mt-1 font-display text-3xl font-extrabold">Your Lemonade Stand results</h2>
          <p className="mt-2 text-base font-bold text-navy/70">You finished the required after-Lemonade knowledge check.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-electric/15 bg-electric/5 p-4">
              <div className="text-xs font-extrabold uppercase tracking-wide text-electric">Check 2</div>
              <div className="mt-1 text-3xl font-extrabold">{progress.latestScore} / {CHECK.questions.length}</div>
              <div className="mt-1 text-sm font-bold text-navy/60">correct</div>
            </div>
            <div className="rounded-2xl border-2 border-teal/20 bg-teal/10 p-4">
              <div className="text-xs font-extrabold uppercase tracking-wide text-teal">After-tax profit</div>
              <div className="mt-1 text-3xl font-extrabold">${Number(cumulativeProfit || 0).toFixed(2)}</div>
              <div className="mt-1 text-sm font-bold text-navy/60">from your stand</div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-sun/25 p-4 text-left">
            <div className="text-xs font-extrabold uppercase tracking-wide text-navy/60">What you proved</div>
            <p className="mt-1 text-base font-extrabold leading-snug">Revenue is not the same as profit. Costs, wages, pricing, demand, and taxes all affect what a business actually keeps.</p>
          </div>

          <div className="mt-4 rounded-2xl border-2 border-sun/50 bg-sun/10 p-4">
            <div className="text-4xl" aria-hidden>🍋</div>
            <div className="mt-1 text-xs font-extrabold uppercase tracking-[0.16em] text-navy/60">Module reward</div>
            <div className="font-display text-xl font-extrabold">Lemonade Visor unlocked</div>
          </div>

          <button type="button" className="btn-primary mt-5 min-h-[60px] w-full text-lg" onClick={onContinue}>
            Continue to Module 3: Budget Town →
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-[410] flex items-center justify-center bg-navy/75 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="lemonade-check-title"
        className="pop-in max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 text-navy shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal">Check 2 · After Lemonade</div>
            <h2 id="lemonade-check-title" className="mt-1 font-display text-2xl font-extrabold">Show what you learned</h2>
          </div>
          <div className="rounded-full bg-electric/10 px-3 py-1 text-xs font-extrabold text-electric">
            {questionIndex + 1} of {CHECK.questions.length}
          </div>
        </div>

        <p className="mt-5 text-xl font-extrabold leading-relaxed">{question.prompt}</p>
        <div className="mt-4 grid gap-3">
          {question.choices.map((choice, index) => {
            const picked = selected === index
            const revealCorrect = selected !== null && index === question.answer
            return (
              <button
                key={choice}
                type="button"
                disabled={selected !== null}
                onClick={() => choose(index)}
                className={`min-h-[58px] rounded-2xl border-2 px-4 py-3 text-left font-extrabold transition active:scale-[0.99] ${revealCorrect ? 'border-teal bg-teal/20' : picked ? 'border-sun bg-sun/20' : 'border-navy/10 bg-navy/5 hover:border-electric/40'} disabled:cursor-default`}
              >
                {choice}
              </button>
            )
          })}
        </div>

        {selected !== null && (
          <div aria-live="polite" className={`mt-4 rounded-2xl p-4 ${correct ? 'bg-teal/15' : 'bg-sun/20'}`}>
            <div className={`font-display text-xl font-extrabold ${correct ? 'text-teal' : 'text-navy'}`}>
              {correct ? 'Exactly!' : 'Good try — here is the key.'}
            </div>
            <p className="mt-1 font-bold leading-relaxed text-navy/75">{question.trick}</p>
            <button type="button" className="btn-primary mt-4 min-h-[54px] w-full" onClick={advance}>
              {questionIndex === CHECK.questions.length - 1 ? 'Finish Check 2' : 'Next question'}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
