import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { moduleCheckForBadge } from '../constants/moduleChecks.js'
import { MODULE_CATALOG } from '../constants/modules.js'
import { isLearningPathComplete, loadActiveLearningPath } from '../constants/learningPaths.js'
import { addModuleCheckAttempt, moduleCheckProgress } from '../services/modulePractice.js'
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

function recordPathCompletion(profile) {
  const path = loadActiveLearningPath()
  const badges = profile?.badges || []
  if (!path || !isLearningPathComplete(path.modules, badges)) return false

  if (profile.pathCompletion?.pathId !== path.id) {
    saveProfile({
      pathCompletion: {
        pathId: path.id,
        label: path.label,
        title: path.title,
        modules: path.modules,
        completedAt: new Date().toISOString(),
      },
    })
  }
  return true
}

export default function ModuleCheck() {
  const { badge } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const check = moduleCheckForBadge(badge)
  const profile = loadProfile() || {}
  const wallet = loadWallet() || {}
  const [startingRecord] = useState(() => (loadProfile() || {}).moduleChecks?.[badge] || null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [result, setResult] = useState(startingRecord)
  const [finished, setFinished] = useState(Boolean(startingRecord) && searchParams.get('retake') !== '1')

  const recap = useMemo(() => personalizedRecap(badge, profile, wallet), [badge, profile, wallet])

  if (!check) return <Navigate to="/modules" replace />
  if (!(profile.badges || []).includes(badge)) return <Navigate to="/modules" replace />

  const question = check.questions[questionIndex]
  const correct = selected === question?.answer
  const nextModule = MODULE_CATALOG.find((module) => module.n === check.moduleNumber + 1)
  const activePath = loadActiveLearningPath()
  const certificateReady = Boolean(
    activePath
    && activePath.modules.length < MODULE_CATALOG.length
    && isLearningPathComplete(activePath.modules, profile.badges || []),
  )

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
    const latestProfile = loadProfile() || profile
    const previousRecord = latestProfile.moduleChecks?.[badge] || startingRecord
    const updatedRecord = addModuleCheckAttempt(previousRecord, {
      score,
      total: check.questions.length,
      completedAt: new Date().toISOString(),
    })
    const moduleChecks = {
      ...(latestProfile.moduleChecks || {}),
      [badge]: updatedRecord,
    }
    saveProfile({ moduleChecks })
    recordLearningEvent({
      moduleName: badge,
      type: 'module_check',
      outcome: score === check.questions.length ? 'mastered' : 'completed',
      detail: `${score}/${check.questions.length}; attempt ${updatedRecord.attemptCount}; best ${updatedRecord.bestScore}`,
    }).catch(() => {})
    setAnswers(nextAnswers)
    setResult(updatedRecord)
    setFinished(true)
  }

  const beginRetake = () => {
    setQuestionIndex(0)
    setSelected(null)
    setAnswers([])
    setFinished(false)
    navigate(`/module-check/${badge}?retake=1`, { replace: true })
  }

  const practiceModule = () => {
    localStorage.setItem('tayu-jump-module', String(check.moduleNumber))
    navigate('/world')
  }

  const continueForward = () => {
    const latest = loadProfile() || profile
    recordPathCompletion(latest)
    if (nextModule) localStorage.setItem('tayu-jump-module', String(nextModule.n))
    navigate('/world', { replace: true })
  }

  const viewCertificate = () => {
    const latest = loadProfile() || profile
    recordPathCompletion(latest)
    navigate('/path-complete')
  }

  if (finished) {
    const progress = moduleCheckProgress(result)
    const startingProgress = moduleCheckProgress(startingRecord)
    const score = progress.latestScore
    const improved = startingProgress.attempts > 0 && score > startingProgress.bestScore
    const firstAttempt = progress.attempts === 1
    return (
      <main className="mx-auto grid min-h-screen max-w-2xl place-items-center px-5 py-10">
        <section className="w-full rounded-3xl border-2 border-teal/50 bg-white/5 p-6 text-center shadow-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal">Module {check.moduleNumber} complete</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold">You showed what you know!</h1>
          <p className="mt-3 text-lg font-bold text-white/80">Latest check: {score} of {check.questions.length} correct. The goal is learning, not a grade.</p>

          <div className="mt-5 rounded-2xl bg-navy/80 p-5 text-left">
            <p className="text-xs font-extrabold uppercase tracking-wide text-sun">Your personalized recap</p>
            <p className="mt-2 text-lg font-bold leading-relaxed">{recap}</p>
          </div>

          <div className="mt-5 rounded-2xl border-2 border-teal/50 bg-teal/10 p-5 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-teal">Practice progress</p>
                <h2 className="mt-1 font-display text-2xl font-extrabold">Personal best: {progress.bestScore} of {progress.total}</h2>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-extrabold">{progress.attempts} check attempt{progress.attempts === 1 ? '' : 's'}</span>
            </div>
            <p className="mt-2 font-semibold text-white/75">
              {improved
                ? 'New personal best! Your practice paid off.'
                : firstAttempt
                  ? 'This is your starting score. Practice and return to try again.'
                  : score === progress.bestScore
                    ? 'You matched your personal best.'
                    : 'Your best score is saved. Review the module and try again when you are ready.'}
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={practiceModule} className="min-h-[54px] rounded-2xl bg-white px-4 font-extrabold text-navy active:scale-95">Practice this module again</button>
              <button type="button" onClick={beginRetake} className="min-h-[54px] rounded-2xl bg-electric px-4 font-extrabold text-white active:scale-95">Retake the quick check</button>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border-2 border-sun bg-sun/10 p-5">
            <div className="text-5xl" aria-hidden>{check.cosmetic.icon}</div>
            <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.18em] text-sun">{startingProgress.attempts > 0 ? 'Module reward' : 'New look unlocked'}</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold">{check.cosmetic.name}</h2>
            <p className="mt-2 font-semibold text-white/70">This module collectible appears on your Money Guru finale shelf and can be worn from the character creator.</p>
          </div>

          <button className="btn-primary mt-6 min-h-[62px] w-full text-lg" onClick={continueForward}>
            {nextModule ? `Continue to Module ${nextModule.n}: ${nextModule.title} →` : 'Continue to the Money Guru finale →'}
          </button>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => navigate('/modules')} className="min-h-[50px] rounded-2xl bg-white/10 px-4 font-extrabold text-white active:scale-95">Choose another module</button>
            {certificateReady ? (
              <button type="button" onClick={viewCertificate} className="min-h-[50px] rounded-2xl bg-sun/15 px-4 font-extrabold text-sun active:scale-95">View path certificate</button>
            ) : (
              <button type="button" onClick={() => navigate('/')} className="min-h-[50px] rounded-2xl bg-white/10 px-4 font-extrabold text-white active:scale-95">Exit to home</button>
            )}
          </div>
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
