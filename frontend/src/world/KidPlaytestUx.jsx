import { useEffect, useMemo, useRef, useState } from 'react'
import { MODULE_CHECKS } from '../constants/moduleChecks.js'
import { say } from '../services/speech.js'
import { loadProfile, saveProfile } from '../services/walletStore.js'
import { checkAllocation } from '../scenarios/jarScenario.js'
import {
  captionDwellMs,
  copyForBand,
  inferReadingBand,
  isInstructionalCaption,
  normalizeLemonadeFocus,
  normalizeReadingBand,
  titleCaseObjective,
} from '../utils/kidUx.js'
import { AVATAR_UNLOCKS } from './AvatarBadgeAura.jsx'
import { usesTouchControls } from './controlMode.js'
import { getGuidance } from './guidance.js'
import { useGame } from './store.js'

let kidGuideTimer = null
let kidActorTimer = null
let kidToastTimer = null

const BADGE_MODULE = { jars: 1, lemonade: 2, budget: 3, bank: 4, garden: 5 }

function currentReadingBand() {
  const profile = loadProfile() || {}
  return normalizeReadingBand(profile.readingBand || inferReadingBand(profile.gradeLevels))
}

function installKidUxRuntime() {
  const current = useGame.getState()
  if (current.kidUxInstalled) return

  const profile = loadProfile() || {}
  const readingBand = currentReadingBand()
  const tutorialDone = !!profile.tutorialDone
  const originalEvaluateJars = current.evaluateJars
  const originalAllocate = current.allocate
  const originalLemNext = current.lemNext
  const originalChooseBundle = current.chooseBundle
  const originalSetPrice = current.setLemPrice
  const originalSetHours = current.setLemHours
  const originalSetQuality = current.setLemQuality
  const originalSetSign = current.setLemSign
  const originalAwardBadge = current.awardBadge

  const clearLemonadeFocus = (kind) => {
    const st = useGame.getState()
    if (st.kidUxLemFocus === kind) useGame.setState({ kidUxLemFocus: null, kidUxRetryFocus: null })
  }

  useGame.setState({
    kidUxInstalled: true,
    kidUxReadingBand: readingBand,
    kidUxTutorialStep: tutorialDone ? 2 : 0,
    kidUxRetryFocus: null,
    kidUxLemFocus: null,
    kidUxBadgeCount: (profile.badges || []).length,
    kidUxUnlock: null,
    kidUxPendingCheck: null,

    kidUxSetReadingBand: (value) => {
      const band = normalizeReadingBand(value)
      saveProfile({ readingBand: band })
      useGame.setState({ kidUxReadingBand: band })
    },

    kidUxDismissGuide: () => {
      clearTimeout(kidGuideTimer)
      useGame.setState({ guide: null })
    },

    kidUxDismissActor: () => {
      clearTimeout(kidActorTimer)
      useGame.setState({ actorCaption: null })
    },

    sayGuide: (line, requestedMs = 0) => {
      clearTimeout(kidGuideTimer)
      const sticky = isInstructionalCaption(line)
      useGame.setState({ guide: { line, sticky } })
      if (!sticky) {
        const dwell = captionDwellMs(line, useGame.getState().kidUxReadingBand, requestedMs)
        kidGuideTimer = setTimeout(() => useGame.setState((st) => (st.guide?.line === line ? { guide: null } : {})), dwell)
      }
    },

    sayActor: (actor, line, requestedMs = 0) => {
      clearTimeout(kidActorTimer)
      useGame.setState({ actorCaption: { actor, line } })
      const dwell = captionDwellMs(line, useGame.getState().kidUxReadingBand, requestedMs)
      kidActorTimer = setTimeout(() => useGame.setState((st) => (st.actorCaption?.line === line ? { actorCaption: null } : {})), dwell)
    },

    setToast: (text) => {
      clearTimeout(kidToastTimer)
      useGame.setState({ toast: text })
      const dwell = captionDwellMs(text, useGame.getState().kidUxReadingBand)
      kidToastTimer = setTimeout(() => useGame.setState((st) => (st.toast === text ? { toast: null } : {})), dwell)
    },

    evaluateJars: (...args) => {
      const st = useGame.getState()
      if (st.scenarioState === 'ALLOCATING' && st.wallet === 0 && st.scenario) {
        const result = checkAllocation(st.allocations, st.scenario)
        if (!result.ok) {
          useGame.setState({
            kidUxRetryFocus: { kind: 'jar', id: result.targetJar, text: result.hint },
          })
        } else {
          useGame.setState({ kidUxRetryFocus: null })
        }
      }
      return originalEvaluateJars(...args)
    },

    allocate: (jar, ...args) => {
      const st = useGame.getState()
      if (st.kidUxRetryFocus?.kind === 'jar' && st.kidUxRetryFocus.id === jar) {
        useGame.setState({ kidUxRetryFocus: null })
      }
      return originalAllocate(jar, ...args)
    },

    lemNext: (...args) => {
      const phase = useGame.getState().lemPhase
      const result = originalLemNext(...args)
      if (phase === 'goalCard') {
        const after = useGame.getState()
        const lever = after.lemTipHistory?.[after.lemTipHistory.length - 1]?.lever
        const focus = normalizeLemonadeFocus(lever)
        if (focus) {
          useGame.setState({
            kidUxLemFocus: focus,
            kidUxRetryFocus: { kind: 'lemonade', id: focus, text: after.lemTip },
          })
        } else {
          useGame.setState({ kidUxLemFocus: null, kidUxRetryFocus: null })
        }
      }
      return result
    },

    chooseBundle: (...args) => {
      clearLemonadeFocus('supplies')
      return originalChooseBundle(...args)
    },
    setLemPrice: (...args) => {
      clearLemonadeFocus('price')
      return originalSetPrice(...args)
    },
    setLemHours: (...args) => {
      clearLemonadeFocus('hours')
      return originalSetHours(...args)
    },
    setLemQuality: (...args) => {
      clearLemonadeFocus('quality')
      return originalSetQuality(...args)
    },
    setLemSign: (...args) => {
      clearLemonadeFocus('sign')
      return originalSetSign(...args)
    },

    awardBadge: (id, label, ...args) => {
      const before = (loadProfile()?.badges || []).length
      const result = originalAwardBadge(id, label, ...args)
      const after = (loadProfile()?.badges || []).length
      if (after > before) {
        const module = BADGE_MODULE[id] || Math.min(5, after)
        useGame.setState({
          kidUxBadgeCount: after,
          kidUxUnlock: { key: Date.now(), label: AVATAR_UNLOCKS[Math.min(after, AVATAR_UNLOCKS.length) - 1] },
          kidUxPendingCheck: { key: Date.now() + 1, module },
        })
      }
      return result
    },
  })
}

function ObjectiveChip() {
  const game = useGame()
  const step = game.kidUxTutorialStep ?? 2
  const guidance = useMemo(() => getGuidance(game, usesTouchControls), [game])
  if (step < 2 || game.weekComplete) return null
  const line = titleCaseObjective(guidance.title)
  const replay = () => {
    say(line)
    window.dispatchEvent(new Event('tayu-flash-arrow'))
  }
  return (
    <button
      type="button"
      onClick={replay}
      aria-label={`Current objective: ${line}. Tap to hear it again.`}
      className="pointer-events-auto fixed left-1/2 top-3 z-[205] flex max-w-[min(72vw,34rem)] -translate-x-1/2 items-center gap-2 rounded-2xl px-4 py-2 text-left text-sm font-extrabold text-white shadow-xl active:scale-[0.98]"
      style={{ background: '#071748', border: '2px solid rgba(0,220,160,.45)' }}
    >
      <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full" style={{ background: '#00DCA0' }} />
      <span className="truncate">{line}</span>
      <span aria-hidden="true" className="ml-auto text-base">🔊</span>
    </button>
  )
}

function ReadingOptions() {
  const band = useGame((s) => s.kidUxReadingBand || 'older')
  const setBand = useGame((s) => s.kidUxSetReadingBand)
  const step = useGame((s) => s.kidUxTutorialStep ?? 2)
  const [open, setOpen] = useState(false)
  if (step < 2 || !setBand) return null
  return (
    <div className="pointer-events-auto fixed right-4 top-16 z-[208] text-right">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="min-h-[42px] rounded-xl bg-navy/90 px-3 text-xs font-extrabold text-white shadow-lg"
        aria-expanded={open}
      >
        Reading: {band === 'younger' ? 'Younger' : 'Older'}
      </button>
      {open && (
        <div className="mt-2 w-56 rounded-2xl bg-white p-3 text-left shadow-2xl">
          <div className="text-xs font-extrabold uppercase tracking-wide text-electric">Reading level</div>
          <p className="mt-1 text-xs font-semibold text-navy/65">This changes sentence length and how long captions stay.</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {['younger', 'older'].map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => { setBand(value); setOpen(false) }}
                className={`min-h-[44px] rounded-xl text-sm font-extrabold ${band === value ? 'bg-teal text-navy' : 'bg-navy/10 text-navy'}`}
              >
                {value === 'younger' ? 'Younger' : 'Older'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const ACTOR_NAMES = {
  player: 'You', penny: 'Penny', theo: 'Theo', mia: 'Mia', bea: 'Banker Bea',
  teller: 'Teller Tom', clerk: 'Clerk Cleo', mailer: 'Postal Pat', scammer: 'Sneaky Sam',
  helper: 'Helper Hana', bram: 'Mr. Bram', sprout: 'Mr. Sprout', keeper: 'The Budget Keeper',
}

function CaptionReplay({ text, onDone, sticky = false }) {
  return (
    <div className="mt-2 flex justify-center gap-2">
      <button type="button" onClick={() => say(text)} className="min-h-[40px] rounded-xl bg-navy/10 px-3 text-xs font-extrabold text-navy active:scale-95">
        🔊 Hear again
      </button>
      {sticky && (
        <button type="button" onClick={onDone} className="min-h-[40px] rounded-xl bg-electric px-4 text-xs font-extrabold text-white active:scale-95">
          Continue
        </button>
      )}
    </div>
  )
}

function EnhancedCaptions() {
  const guide = useGame((s) => s.guide)
  const actor = useGame((s) => s.actorCaption)
  const dismissGuide = useGame((s) => s.kidUxDismissGuide)
  if (guide) {
    return (
      <div className="pointer-events-auto fixed inset-x-0 top-24 z-[230] flex justify-center px-4">
        <div className="pop-in w-full max-w-lg rounded-2xl border-2 border-teal bg-white px-5 py-3 text-center shadow-2xl">
          <div className="text-xs font-extrabold uppercase tracking-wide text-teal">Penny helps</div>
          <p className="mt-1 text-lg font-bold leading-snug text-navy">{guide.line}</p>
          <CaptionReplay text={guide.line} onDone={dismissGuide} sticky={guide.sticky} />
        </div>
      </div>
    )
  }
  if (actor) {
    const name = ACTOR_NAMES[actor.actor] || actor.actor
    return (
      <div className="pointer-events-auto fixed inset-x-0 bottom-24 z-[230] flex justify-center px-4 sm:bottom-20">
        <div className="pop-in w-full max-w-lg rounded-2xl border-2 border-electric bg-white px-5 py-3 text-center shadow-2xl">
          <div className="text-xs font-extrabold uppercase tracking-wide text-electric">{name}</div>
          <p className="mt-1 text-lg font-bold leading-snug text-navy">{actor.line}</p>
          <CaptionReplay text={actor.line} />
        </div>
      </div>
    )
  }
  return null
}

function MovementTutorial() {
  const step = useGame((s) => s.kidUxTutorialStep ?? 2)
  const band = useGame((s) => s.kidUxReadingBand || 'older')

  useEffect(() => {
    if (step >= 2) return undefined
    localStorage.setItem('tayu-3d-controls-seen', '1')
    const reachedCoin = () => {
      useGame.setState({ kidUxTutorialStep: 1 })
      say(copyForBand(band, 'Great walking. Tap the blue button.', 'Great walking. Now use the blue action button.'))
    }
    const finish = () => {
      saveProfile({ tutorialDone: true })
      useGame.setState({ kidUxTutorialStep: 2 })
      say('You are ready. Follow your objective.')
      window.dispatchEvent(new Event('tayu-flash-arrow'))
    }
    window.addEventListener('tayu-tutorial-step-one', reachedCoin)
    window.addEventListener('tayu-tutorial-action', finish)
    return () => {
      window.removeEventListener('tayu-tutorial-step-one', reachedCoin)
      window.removeEventListener('tayu-tutorial-action', finish)
    }
  }, [band, step])

  if (step >= 2) return null
  const walkText = usesTouchControls ? 'Hold and drag.' : 'Use W, A, S, D to walk.'
  return (
    <div className="pointer-events-none fixed inset-0 z-[215]">
      <div className="absolute left-1/2 top-5 w-[min(90vw,27rem)] -translate-x-1/2 rounded-3xl bg-navy/95 p-4 text-center text-white shadow-2xl">
        <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal">Quick practice</div>
        <div className="mt-1 text-2xl font-extrabold">{step === 0 ? walkText : 'Tap the blue button.'}</div>
        <p className="mt-1 text-sm font-semibold text-white/75">
          {step === 0 ? 'Reach the glowing coin.' : 'Say hi to your TAYU helper.'}
        </p>
      </div>
      {step === 0 && usesTouchControls && (
        <div className="absolute bottom-8 left-7 h-28 w-28 rounded-full border-4 border-teal bg-navy/30 shadow-[0_0_28px_rgba(0,220,160,.75)]">
          <div className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 animate-bounce rounded-full bg-teal" />
          <div className="absolute -right-5 -top-6 text-4xl">👆</div>
        </div>
      )}
      {step === 0 && !usesTouchControls && (
        <div className="absolute bottom-8 left-8 grid grid-cols-3 gap-1 text-center font-extrabold text-white">
          <span />
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal text-navy shadow-lg">W</span>
          <span />
          {['A', 'S', 'D'].map((key) => <span key={key} className="grid h-12 w-12 place-items-center rounded-xl bg-navy/90 shadow-lg">{key}</span>)}
        </div>
      )}
      {step === 1 && !usesTouchControls && (
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('tayu-tutorial-action'))}
          className="pointer-events-auto absolute bottom-8 right-8 grid h-20 w-20 animate-pulse place-items-center rounded-full bg-electric text-center text-sm font-extrabold text-white shadow-[0_0_30px_rgba(20,100,240,.85)] active:scale-95"
        >
          ACT
        </button>
      )}
    </div>
  )
}

function findTextElement(text) {
  return Array.from(document.querySelectorAll('button, span, h2, div')).find((element) => (
    element.children.length === 0 && element.textContent.trim().toLowerCase().includes(text.toLowerCase())
  ))
}

function FocusHighlighter() {
  const focus = useGame((s) => s.kidUxRetryFocus)
  useEffect(() => {
    let timer = null
    const apply = () => {
      document.querySelectorAll('[data-tayu-focus="true"]').forEach((element) => element.removeAttribute('data-tayu-focus'))
      if (!focus) return
      let target = null
      if (focus.kind === 'jar') {
        target = document.querySelector(`button[aria-label^="Choose ${String(focus.id).toUpperCase()} jar"]`)
      } else if (focus.id === 'hours') {
        target = findTextElement('Open hours')?.closest('div.mt-2')
      } else if (focus.id === 'price') {
        target = findTextElement('MY PRICE PER CUP')?.closest('.rounded-2xl')
      } else if (focus.id === 'quality') {
        target = findTextElement('Recipe')?.closest('div.mt-2')
      } else if (focus.id === 'sign') {
        target = findTextElement('Sign')?.closest('div.mt-2')
      } else if (focus.id === 'supplies') {
        target = findTextElement('Buy Supplies')?.closest('.glass--navy')
      }
      if (target) target.setAttribute('data-tayu-focus', 'true')
    }
    apply()
    timer = setInterval(apply, 300)
    return () => {
      clearInterval(timer)
      document.querySelectorAll('[data-tayu-focus="true"]').forEach((element) => element.removeAttribute('data-tayu-focus'))
    }
  }, [focus])
  if (!focus) return null
  return (
    <div className="pointer-events-none fixed left-1/2 top-[76px] z-[204] w-[min(88vw,32rem)] -translate-x-1/2 rounded-2xl border-2 border-teal bg-white px-4 py-2 text-center text-sm font-extrabold text-navy shadow-xl">
      Fix this one thing: {focus.text}
    </div>
  )
}

function personalizedRecap(module, game) {
  if (module === 1) {
    const entries = Object.entries(game.allocations || {})
    const [jar, amount] = entries.sort((a, b) => b[1] - a[1])[0] || ['save', 0]
    return `You put the most in ${jar.toUpperCase()}: $${amount}. That choice shaped your plan.`
  }
  if (module === 2) {
    return `You kept $${Math.max(0, game.lemCumProfit || 0).toFixed(2)} in lemonade profit after town tax.`
  }
  if (module === 3) {
    const pocket = game.split?.pocket ?? game.bt?.split?.pocket ?? 0
    return `You kept $${pocket} in pocket cash for surprise costs.`
  }
  if (module === 4) {
    const bank = game.bk || {}
    const accounts = [['checking', bank.checking || 0], ['savings', bank.savings || 0], ['CD', bank.cd || 0]]
    const [name, amount] = accounts.sort((a, b) => b[1] - a[1])[0]
    return `Your biggest bank balance was ${name}: $${amount}.`
  }
  const companies = game.mg?.companies || {}
  const planted = Object.values(companies).reduce((sum, company) => sum + (company.owned || 0), 0)
  return `You finished with ${planted} planted seed${planted === 1 ? '' : 's'} across your Money Garden.`
}

function ModuleMasteryCheck() {
  const pending = useGame((s) => s.kidUxPendingCheck)
  const game = useGame()
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [finished, setFinished] = useState(false)
  const keyRef = useRef(null)

  useEffect(() => {
    if (!pending || keyRef.current === pending.key) return
    keyRef.current = pending.key
    setIndex(0)
    setSelected(null)
    setAnswers([])
    setFinished(false)
  }, [pending])

  if (!pending) return null
  const spec = MODULE_CHECKS[pending.module]
  if (!spec) return null
  const question = spec.questions[index]
  const correct = selected === question.answer

  const next = () => {
    const nextAnswers = [...answers, selected]
    if (index < spec.questions.length - 1) {
      setAnswers(nextAnswers)
      setIndex((value) => value + 1)
      setSelected(null)
      return
    }
    const score = nextAnswers.reduce((total, answer, questionIndex) => total + (answer === spec.questions[questionIndex].answer ? 1 : 0), 0)
    const profile = loadProfile() || {}
    saveProfile({
      moduleChecks: {
        ...(profile.moduleChecks || {}),
        [pending.module]: { answers: nextAnswers, score, total: spec.questions.length, completedAt: new Date().toISOString() },
      },
      mastery: { ...(profile.mastery || {}), [pending.module]: spec.mastery },
    })
    setAnswers(nextAnswers)
    setFinished(true)
  }

  const close = () => useGame.setState({ kidUxPendingCheck: null })

  return (
    <div className="pointer-events-auto fixed inset-0 z-[420] flex items-center justify-center bg-navy/75 p-4 backdrop-blur-sm">
      <div className="pop-in w-full max-w-lg rounded-3xl bg-white p-6 text-navy shadow-2xl">
        {!finished ? (
          <>
            <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-teal">Show what you know</div>
            <h2 className="mt-1 font-display text-2xl font-extrabold">Question {index + 1} of 2</h2>
            <p className="mt-3 text-xl font-bold leading-snug">{question.prompt}</p>
            <div className="mt-4 grid gap-2">
              {question.choices.map((choice, choiceIndex) => (
                <button
                  type="button"
                  key={choice}
                  disabled={selected !== null}
                  onClick={() => setSelected(choiceIndex)}
                  className={`min-h-[56px] rounded-2xl border-2 px-4 text-left text-base font-extrabold transition active:scale-[0.98] ${selected === choiceIndex ? 'border-teal bg-teal/20' : 'border-navy/10 bg-navy/5'}`}
                >
                  {choice}
                </button>
              ))}
            </div>
            {selected !== null && (
              <div className="mt-4 rounded-2xl bg-electric/10 p-4">
                <p className="font-bold">{correct ? question.success : question.close}</p>
                <button type="button" onClick={next} className="btn-primary mt-3 min-h-[52px] w-full">
                  {index === 1 ? 'See my recap' : 'Next question'}
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-teal">Your recap</div>
            <h2 className="mt-1 font-display text-2xl font-extrabold">Module {pending.module} complete</h2>
            <p className="mt-4 rounded-2xl bg-sun/20 p-4 text-lg font-bold">{personalizedRecap(pending.module, game)}</p>
            <div className="mt-3 rounded-2xl bg-teal/15 p-4">
              <div className="text-xs font-extrabold uppercase tracking-wide text-teal">I can</div>
              <p className="mt-1 font-bold">{spec.mastery.replace(/^I can\s+/i, '')}</p>
            </div>
            <button type="button" onClick={close} className="btn-primary mt-5 min-h-[56px] w-full">See my badge</button>
          </>
        )}
      </div>
    </div>
  )
}

function UnlockToast() {
  const unlock = useGame((s) => s.kidUxUnlock)
  useEffect(() => {
    if (!unlock) return undefined
    const timer = setTimeout(() => useGame.setState((st) => (st.kidUxUnlock?.key === unlock.key ? { kidUxUnlock: null } : {})), 1300)
    return () => clearTimeout(timer)
  }, [unlock])
  if (!unlock) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 top-28 z-[410] flex justify-center px-4">
      <div className="pop-in rounded-2xl bg-navy px-5 py-3 text-center text-white shadow-2xl">
        <div className="text-xs font-extrabold uppercase tracking-wide text-teal">New look unlocked</div>
        <div className="text-xl font-extrabold">{unlock.label}</div>
      </div>
    </div>
  )
}

export function KidPlaytestUx() {
  useEffect(() => { installKidUxRuntime() }, [])
  return (
    <>
      <style>{`
        .tayu-kid-ux-active [aria-live="polite"].glass { display: none !important; }
        .tayu-kid-ux-active div[class~="top-32"][class~="pointer-events-none"][class~="inset-x-0"] { display: none !important; }
        .tayu-kid-ux-active div[class~="bottom-24"][class~="pointer-events-none"][class~="inset-x-0"] { display: none !important; }
        .tayu-kid-ux-active div[class~="left-1/2"][class~="top-4"][class~="sm:block"] { display: none !important; }
        [data-tayu-focus="true"] { animation: tayuFocusPulse .7s ease-in-out infinite alternate !important; outline: 4px solid #00DCA0 !important; outline-offset: 3px !important; }
        @keyframes tayuFocusPulse { from { box-shadow: 0 0 0 rgba(0,220,160,0); } to { box-shadow: 0 0 24px rgba(0,220,160,.95); } }
      `}</style>
      <ObjectiveChip />
      <ReadingOptions />
      <MovementTutorial />
      <EnhancedCaptions />
      <FocusHighlighter />
      <ModuleMasteryCheck />
      <UnlockToast />
    </>
  )
}
