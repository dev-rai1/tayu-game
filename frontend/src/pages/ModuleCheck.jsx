import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { moduleCheckForBadge } from '../constants/moduleChecks.js'
import { isLearningPathComplete, loadActiveLearningPath } from '../constants/learningPaths.js'
import { loadProfile, loadWallet, saveProfile } from '../services/walletStore.js'
import { recordLearningEvent } from '../services/usageAnalytics.js'

const fmt = (value) => Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })

function personalizedRecap(badge, profile, wallet) {
  const name = profile?.name || 'Friend'
  if (badge === 'jars') return `${name}, you gave every dollar a job: $${fmt(wallet?.spend)} to Spend, $${fmt(wallet?.save)} to Save, and $${fmt(wallet?.give)} to Give.`
  if (badge === 'lemonade') return `${name}, you built a business plan and kept $${fmt(wallet?.lemCum)} in cumulative after-tax profit.`
  if (badge === 'budget') {
    const split = wallet?.split || wallet?.bt?.split || {}
    return `${name}, your plan kept $${fmt(split.pocket)} ready, placed $${fmt(split.bank)} in steadier bank growth, and placed $${fmt(split.garden)} in the higher-risk Money Garden.`
  }
  if (badge === 'bank') {
    const bank = wallet?.bk || {}
    return `${name}, you built ${Math.min(6, Number(bank.trust || 0))} of 6 Trust segments while comparing accounts, debit, credit, debt help, and scam safety.`
  }
  const garden = wallet?.mg || {}
  const lastTotal = garden.weekLog?.length ? garden.weekLog[garden.weekLog.length - 1]?.total : garden.goal
  return `${name}, your Money Garden journey finished near $${fmt(lastTotal || garden.startTotal)} after you researched, diversified, handled risk, and rebalanced.`
}

function returnDestination(badge, profile) {
  const path = loadActiveLearningPath()
  const badges = profile?.badges || []
  if (badge !== 'garden' && path && path.modules.length < 5 && isLearningPathComplete(path.modules, badges)) return '/path-complete'
  return '/world'
}

export default function ModuleCheck() {
  const { badge } = useParams()
  const navigate = useNavigate()
  const check = moduleCheckForBadge(badge)
  const profile = loadProfile() || {}
  const wallet = loadWallet() || {}
  const previous = profile.moduleChecks?.[badge]
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [finished, setFinished] = useState(Boolean(previous))

  const recap = useMemo(() => personalizedRecap(badge, profile, wallet), [badge, profile, wallet])

  if (!check) return <Navigate to="/modules" replace />
  if (!(profile.badges || []).includes(badge)) return <Navigate to="/modules" replace />

  const question = check.questions[questionIndex]
  const correct = selected === question?.answer

  const choose = (index) => {
    if (selected !== null) return
    setSelected(index)
  }

  const advance = () => {
    const nextAnswers = [...answers, { selected, correct }]
    if (questionIndex < check.questions.length - 1) {
      setAnswers(nextAnswers)
      setQuestionIndex((value) => value + 1)
      setSelected(null)
      return
    }

    const score = nextAnswers.filter((answer) => answer.correct).length
    const moduleChecks = {
      ...(profile.moduleChecks || {}),
      [badge]: {
        score,
        total: check.questions.length,
        completedAt: new Date().toISOString(),
      },
    }
    saveProfile({ moduleChecks })
    recordLearningEvent({
      moduleName: badge,
      type: 'module_check',
      outcome: score === check.questions.length ? 'mastered' : 'completed',
      detail: `${score}/${check.questions.length}`,
    }).catch(() => {})
    setAnswers(nextAnswers)
    setFinished(true)
  }

  const leave = () => {
    const latest = loadProfile() || profile
    navigate(returnDestination(badge, latest), { replace: true })
  }

  if (finished) {
    const score = previous?.score ?? answers.filter((answer) => answer.correct).length
    return (
      <main className="mx-auto grid min-h-screen max-w-2xl place-items-center px-5 py-10">
        <section className="w-full rounded-3xl border-2 border-teal/50 bg-white/5 p-6 text-center shadow-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal">Module {check.moduleNumber} complete</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold">You showed what you know!</h1>
          <p className="mt-3 text-lg font-bold text-white/80">{score} of {check.questions.length} correct. The goal is learning, not a grade.</p>

          <div className="mt-5 rounded-2xl bg-navy/80 p-5 text-left">
            <p className="text-xs font-extrabold uppercase tracking-wide text-sun">Your personalized recap</p>
            <p className="mt-2 text-lg font-bold leading-relaxed">{recap}</p>
          </div>

          <div className="mt-5 rounded-2xl border-2 border-sun bg-sun/10 p-5">
            <div className="text-5xl" aria-hidden>{check.cosmetic.icon}</div>
            <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.18em] text-sun">New look unlocked</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold">{check.cosmetic.name}</h2>
            <p className="mt-2 font-semibold text-white/70">This module collectible now appears on your Money Guru finale shelf.</p>
          </div>

          <button className="btn-primary mt-6 min-h-[58px] w-full text-lg" onClick={leave}>Continue my journey</button>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-2xl place-items-center px-5 py-10">
      <section className="w-full rounded-3xl border-2 border-electric/40 bg-white/5 p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal">Quick check · {questionIndex + 1} of {check.questions.length}</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold">{check.title}</h1>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sun/15 text-2xl" aria-hidden>{check.cosmetic.icon}</div>
        </div>

        <p className="mt-5 text-xl font-extrabold leading-relaxed">{question.prompt}</p>
        <div className="mt-5 grid gap-3">
          {question.choices.map((choice, index) => {
            const picked = selected === index
            const revealCorrect = selected !== null && index === question.answer
            return (
              <button
                key={choice}
                type="button"
                disabled={selected !== null}
                onClick={() => choose(index)}
                className={`min-h-[60px] rounded-2xl border-2 px-4 py-3 text-left font-extrabold transition active:scale-[0.99] ${revealCorrect ? 'border-teal bg-teal text-navy' : picked ? 'border-sun bg-sun/15' : 'border-white/15 bg-black/20 hover:border-white/35'} disabled:cursor-default`}
              >
                {choice}
              </button>
            )
          })}
        </div>

        {selected !== null && (
          <div aria-live="polite" className={`mt-5 rounded-2xl p-4 ${correct ? 'bg-teal/15' : 'bg-sun/15'}`}>
            <p className={`font-display text-xl font-extrabold ${correct ? 'text-teal' : 'text-sun'}`}>{correct ? 'Exactly!' : 'Close — here is the trick.'}</p>
            <p className="mt-2 font-semibold leading-relaxed text-white/80">{question.trick}</p>
            <button className="btn-primary mt-4 min-h-[54px] w-full" onClick={advance}>{questionIndex === check.questions.length - 1 ? 'See my recap' : 'Next question'}</button>
          </div>
        )}
      </section>
    </main>
  )
}
