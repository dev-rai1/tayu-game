import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { KNOWLEDGE_QUESTIONS, scoreKnowledgeQuiz } from '../constants/knowledgeQuiz.js'
import { currentUser, syncUp } from '../services/auth.js'
import { loadProfile, loadWallet, saveProfile } from '../services/walletStore.js'

export default function KnowledgeQuiz() {
  const { phase } = useParams()
  const navigate = useNavigate()
  const profile = loadProfile() || {}
  const existing = profile.assessment?.[phase]
  const [answers, setAnswers] = useState({})
  const [busy, setBusy] = useState(false)
  const isPost = phase === 'post'
  const validPhase = phase === 'pre' || isPost
  const complete = useMemo(
    () => KNOWLEDGE_QUESTIONS.every((question) => Number.isInteger(answers[question.id])),
    [answers],
  )

  if (!currentUser()) return <Navigate to="/login" replace />
  if (!validPhase) return <Navigate to="/" replace />
  if (isPost && !loadProfile()?.guru) return <Navigate to="/world" replace />
  if (existing) return <Navigate to={isPost ? '/guru' : (loadWallet() ? '/world' : '/avatar')} replace />

  const submit = async () => {
    if (!complete || busy) return
    setBusy(true)
    const result = {
      answers,
      score: scoreKnowledgeQuiz(answers),
      total: KNOWLEDGE_QUESTIONS.length,
      completedAt: new Date().toISOString(),
    }
    saveProfile({ assessment: { ...(loadProfile()?.assessment || {}), [phase]: result } })
    await syncUp().catch(() => {})
    navigate(isPost ? '/guru' : (loadWallet() ? '/world' : '/avatar'), { replace: true })
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-5 py-10">
      <div className="rounded-3xl bg-white/5 p-6 shadow-2xl sm:p-8">
        <div className="flex items-center gap-3">
          <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-12 w-12 rounded-xl" />
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal">{isPost ? 'After the game' : 'Before the game'}</div>
            <h1 className="font-display text-2xl font-extrabold">Money check-in</h1>
          </div>
        </div>
        <p className="mt-4 text-sm font-semibold text-white/70">
          Answer these same {KNOWLEDGE_QUESTIONS.length} questions {isPost ? 'one more time' : 'before you begin'}. This is not a grade—it helps us see what TAYU taught, including the new bond and tax concepts.
        </p>

        <div className="mt-6 space-y-6">
          {KNOWLEDGE_QUESTIONS.map((question, index) => (
            <fieldset key={question.id}>
              <legend className="font-display text-base font-extrabold">{index + 1}. {question.prompt}</legend>
              <div className="mt-2 grid gap-2">
                {question.choices.map((choice, choiceIndex) => {
                  const selected = answers[question.id] === choiceIndex
                  return (
                    <button
                      type="button"
                      key={choice}
                      aria-pressed={selected}
                      onClick={() => setAnswers((current) => ({ ...current, [question.id]: choiceIndex }))}
                      className={`min-h-[48px] rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${selected ? 'border-teal bg-teal text-navy' : 'border-white/15 bg-white/5 text-white hover:bg-white/10'}`}
                    >
                      {choice}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <button disabled={!complete || busy} onClick={submit} className="btn-primary mt-7 min-h-[56px] w-full disabled:cursor-not-allowed disabled:opacity-40">
          {busy ? 'Saving...' : isPost ? 'Finish and see my certificate' : 'Start my TAYU journey'}
        </button>
        <p className="mt-3 text-center text-xs font-semibold text-white/45">Your answers are saved with your account so an administrator can compare before and after results.</p>
      </div>
    </main>
  )
}
