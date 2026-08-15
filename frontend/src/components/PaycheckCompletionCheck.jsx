import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { moduleCheckForBadge } from '../constants/moduleChecks.js'
import { addModuleCheckAttempt, moduleCheckProgress } from '../services/modulePractice.js'
import { recordLearningEvent } from '../services/usageAnalytics.js'
import { loadProfile, saveProfile } from '../services/walletStore.js'
import { isPaycheckWorldActive, PAYCHECK_MODE_EVENT } from '../world/paycheckMode.js'

const CHECK = moduleCheckForBadge('tax')

export function shouldShowPaycheckCompletionCheck({ profile, paycheckActive }) {
  return Boolean(
    paycheckActive &&
    profile?.taxLab?.completedAt &&
    (profile?.badges || []).includes('tax') &&
    !profile?.moduleChecks?.tax
  )
}

function shouldShowNow() {
  return shouldShowPaycheckCompletionCheck({
    profile: loadProfile() || {},
    paycheckActive: isPaycheckWorldActive(),
  })
}

function saveCheckAttempt(score) {
  const profile = loadProfile() || {}
  const previous = profile.moduleChecks?.tax || null
  const updated = addModuleCheckAttempt(previous, {
    score,
    total: CHECK.questions.length,
    completedAt: new Date().toISOString(),
  })

  saveProfile({
    moduleChecks: {
      ...(profile.moduleChecks || {}),
      tax: updated,
    },
  })

  recordLearningEvent({
    moduleName: 'tax',
    type: 'module_check',
    outcome: score === CHECK.questions.length ? 'mastered' : 'completed',
    detail: `${score}/${CHECK.questions.length}; attempt ${updated.attemptCount}; best ${updated.bestScore}`,
  }).catch(() => {})

  return updated
}

export function PaycheckCompletionCheck() {
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(shouldShowNow)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [result, setResult] = useState(null)
  const [stage, setStage] = useState('check')

  useEffect(() => {
    const sync = () => {
      if (shouldShowNow()) setVisible(true)
    }
    window.addEventListener('tayu-progress-saved', sync)
    window.addEventListener(PAYCHECK_MODE_EVENT, sync)
    return () => {
      window.removeEventListener('tayu-progress-saved', sync)
      window.removeEventListener(PAYCHECK_MODE_EVENT, sync)
    }
  }, [])

  const progress = useMemo(() => moduleCheckProgress(result), [result])

  if (pathname !== '/world' || !visible || !CHECK) return null

  const question = CHECK.questions[questionIndex]
  const correct = selected === question.answer

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
      <div className="pointer-events-auto fixed inset-0 z-[820] grid place-items-center bg-navy/80 p-4 backdrop-blur-sm">
        <section role="dialog" aria-modal="true" aria-labelledby="paycheck-check-recap-title" className="w-full max-w-lg rounded-3xl bg-white p-6 text-center text-navy shadow-2xl sm:p-7">
          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#FF8A3D]">Module 7 · tax filing check complete</div>
          <h2 id="paycheck-check-recap-title" className="mt-1 font-display text-3xl font-extrabold">Tax Filing Lab check complete</h2>
          <div className="mx-auto mt-5 max-w-xs rounded-2xl border-2 border-[#FF8A3D]/30 bg-[#FF8A3D]/10 p-4">
            <div className="text-xs font-extrabold uppercase tracking-wide text-[#C45B16]">Your score</div>
            <div className="mt-1 text-3xl font-extrabold">{progress.latestScore} / {CHECK.questions.length}</div>
          </div>
          <div className="mt-4 rounded-2xl bg-sun/25 p-4 text-left">
            <div className="text-xs font-extrabold uppercase tracking-wide text-navy/60">Remember this</div>
            <p className="mt-1 text-base font-extrabold leading-snug">Read the W-2, find taxable income, calculate the bracket tax, apply credits, then compare final tax with withholding to find a refund or amount due.</p>
          </div>
          <button type="button" className="btn-primary mt-5 min-h-[58px] w-full text-lg" onClick={() => setVisible(false)}>
            Continue to Finale →
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="pointer-events-auto fixed inset-0 z-[820] grid place-items-center bg-navy/80 p-4 backdrop-blur-sm">
      <section role="dialog" aria-modal="true" aria-labelledby="paycheck-check-title" className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 text-navy shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#FF8A3D]">Module 7 · After the Tax Filing Lab</div>
            <h2 id="paycheck-check-title" className="mt-1 font-display text-2xl font-extrabold">Show what you learned</h2>
          </div>
          <div className="rounded-full bg-navy/10 px-3 py-1 text-xs font-extrabold text-navy/65">{questionIndex + 1} of {CHECK.questions.length}</div>
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
                onClick={() => setSelected(index)}
                className={`min-h-[58px] rounded-2xl border-2 px-4 py-3 text-left font-extrabold transition active:scale-[0.99] ${revealCorrect ? 'border-teal bg-teal/20' : picked ? 'border-sun bg-sun/20' : 'border-navy/10 bg-navy/5 hover:border-[#FF8A3D]/50'} disabled:cursor-default`}
              >
                {choice}
              </button>
            )
          })}
        </div>

        {selected !== null && (
          <div aria-live="polite" className={`mt-4 rounded-2xl p-4 ${correct ? 'bg-teal/15' : 'bg-sun/20'}`}>
            <div className="font-display text-xl font-extrabold">{correct ? 'Exactly!' : 'Good try — here is the key.'}</div>
            <p className="mt-1 font-bold leading-relaxed text-navy/75">{question.trick}</p>
            <button type="button" className="btn-primary mt-4 min-h-[54px] w-full" onClick={advance}>
              {questionIndex === CHECK.questions.length - 1 ? 'Finish Module 7 Check' : 'Next question'}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
