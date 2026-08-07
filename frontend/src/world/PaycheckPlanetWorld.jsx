import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Html, RoundedBox } from '@react-three/drei'
import { TAX_DISTRICT } from './config.js'
import { playerPos, useGame } from './store.js'
import { labelTexture } from './textures.js'
import { loadProfile, saveProfile } from '../services/walletStore.js'
import { recordLearningEvent } from '../services/usageAnalytics.js'
import {
  TAX_CASES,
  TAX_INTRO_STEPS,
  TOTAL_TAX_STEPS,
  filingStepFor,
  taxResultSummary,
  taxReturnMath,
} from '../scenarios/paycheckPlanet.js'
import {
  PAYCHECK_MODE_EVENT,
  deactivatePaycheckWorld,
  isPaycheckWorldActive,
} from './paycheckMode.js'

// Keep Module 5 in the world, but start close enough that the tax lab is the
// obvious destination. The choices themselves now happen in a readable popup,
// so the HUD/map can never cover the right-hand option.
export const TAX_ENTRY = [TAX_DISTRICT[0], TAX_DISTRICT[1] + 3.3]
const STATION_Z = 3.9
const PATH_START_Z = 1.35

const money = (value) => `$${Math.max(0, Math.round(Number(value || 0))).toLocaleString('en-US')}`

function worldPoint(x, z, y = 1.1) {
  return { x: TAX_DISTRICT[0] + x, y, z: TAX_DISTRICT[1] + z }
}

function pushCoins(from, to, count, prefix = 'tax') {
  const batch = {
    id: `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    from,
    to,
    count,
  }
  useGame.setState((state) => ({ coinBatches: [...state.coinBatches, batch] }))
}

function sendHint(text) {
  if (!text) return
  try {
    useGame.setState({ guide: { line: text } })
  } catch {
    // The filing activity remains usable even if the world coach is unavailable.
  }
}

function AnimatedStation({ x, label, sublabel, accent = '#1464f0', onActivate }) {
  const group = useRef()
  const time = useRef(Math.random() * 5)
  const [hovered, setHovered] = useState(false)

  useFrame((_, delta) => {
    time.current += delta
    if (!group.current) return
    group.current.position.y = 0.1 + Math.sin(time.current * 3) * 0.06
    group.current.rotation.y = Math.sin(time.current * 1.05) * 0.025
  })

  const activate = (event) => {
    event?.stopPropagation?.()
    onActivate?.()
  }

  return (
    <group ref={group} position={[x, 0, STATION_Z]}>
      <RoundedBox
        args={[2.1, 0.34, 1.55]}
        radius={0.17}
        smoothness={3}
        position={[0, 0.2, 0]}
        onClick={activate}
        onPointerOver={() => {
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = ''
        }}
      >
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={hovered ? 0.9 : 0.42}
          roughness={0.55}
        />
      </RoundedBox>
      <mesh position={[0, 0.65, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.27, 0.27, 0.1, 18]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.45} metalness={0.25} />
      </mesh>
      <Billboard position={[0, 1.46, 0]}>
        <mesh>
          <planeGeometry args={[2.42, 0.68]} />
          <meshBasicMaterial
            map={labelTexture(label, { bg: '#071748', color: '#ffffff', accent })}
            transparent
            toneMapped={false}
            depthTest={false}
          />
        </mesh>
      </Billboard>
      {sublabel && (
        <Billboard position={[0, 0.98, 0]}>
          <mesh>
            <planeGeometry args={[2.36, 0.55]} />
            <meshBasicMaterial
              map={labelTexture(sublabel, { bg: '#ffffff', color: '#071748', accent })}
              transparent
              toneMapped={false}
              depthTest={false}
            />
          </mesh>
        </Billboard>
      )}
    </group>
  )
}

// Three separate paths make it obvious that left, middle, AND right are valid
// choices. This also fixes the old visual impression that only the middle pad
// was the intended destination.
function ChoicePath({ x, accent = '#1464f0' }) {
  const dz = STATION_Z - PATH_START_Z
  const length = Math.hypot(x, dz)
  const angle = Math.atan2(x, dz)
  return (
    <mesh
      position={[x / 2, 0.052, (STATION_Z + PATH_START_Z) / 2]}
      rotation={[-Math.PI / 2, 0, -angle]}
      receiveShadow
    >
      <planeGeometry args={[0.42, length]} />
      <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.2} transparent opacity={0.72} />
    </mesh>
  )
}

function CelebrationBurst({ active }) {
  const group = useRef()
  useFrame((_, delta) => {
    if (!group.current || !active) return
    group.current.rotation.y += delta * 0.65
  })
  if (!active) return null
  return (
    <group ref={group} position={[0, 4.7, 2.2]}>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const radius = 2 + (i % 3) * 0.3
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle * 2) * 0.65, Math.sin(angle) * radius]} rotation={[Math.PI / 2, angle, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.04, 14]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.75} metalness={0.35} />
          </mesh>
        )
      })}
    </group>
  )
}

function ModuleBoard({ headline, line }) {
  return (
    <group>
      <Billboard position={[0, 5.05, 0.72]}>
        <mesh>
          <planeGeometry args={[6.1, 0.95]} />
          <meshBasicMaterial
            map={labelTexture(headline, { bg: '#00dca0', color: '#071748', accent: '#ffd700' })}
            transparent
            toneMapped={false}
            depthTest={false}
          />
        </mesh>
      </Billboard>
      {line && (
        <Billboard position={[0, 4.48, 0.76]}>
          <mesh>
            <planeGeometry args={[5.95, 0.66]} />
            <meshBasicMaterial
              map={labelTexture(line, { bg: '#ffffff', color: '#071748', accent: '#ff8a3d' })}
              transparent
              toneMapped={false}
              depthTest={false}
            />
          </mesh>
        </Billboard>
      )}
    </group>
  )
}

function TaxFilingPanel({ phase, taxCase, stepNumber, feedback, onStart, onChooseCase, onAnswer, onNext, onHint, onFinish }) {
  const math = taxReturnMath(taxCase)
  const step = taxCase ? filingStepFor(taxCase, stepNumber) : null
  const isIntro = phase === 'intro'
  const isComplete = phase === 'complete'

  return (
    <Html fullscreen zIndexRange={[760, 500]} style={{ pointerEvents: 'none' }}>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-3 sm:p-5">
        <section
          role="dialog"
          aria-modal={isIntro || isComplete ? 'true' : 'false'}
          aria-label={isIntro ? 'Module 5 tax filing introduction' : isComplete ? 'Module 5 complete' : 'Tax filing activity'}
          className={`pointer-events-auto max-h-[86vh] overflow-y-auto rounded-3xl border-2 border-white/30 bg-white text-navy shadow-2xl ${isIntro ? 'w-[min(94vw,46rem)] p-5 sm:p-7' : 'w-[min(94vw,38rem)] p-4 sm:p-5'}`}
        >
          {isIntro && (
            <>
              <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-electric">Module 5 · Tax Filing Lab</div>
              <h2 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">File a practice tax return</h2>
              <p className="mt-3 text-base font-semibold leading-relaxed text-navy/75 sm:text-lg">
                This module is about <strong>how a tax return works</strong>, not just watching money leave a paycheck. You will use a pretend W-2 and do the math one small step at a time.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {TAX_INTRO_STEPS.map((line, index) => (
                  <div key={line} className="flex gap-3 rounded-2xl bg-[#eef8ff] p-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-electric font-extrabold text-white">{index + 1}</span>
                    <span className="font-semibold leading-snug">{line}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-sun/40 bg-sun/15 p-3 text-sm font-semibold leading-relaxed">
                The numbers and tax brackets are simplified for practice. Real tax rules change and can be more complicated.
              </div>
              <button type="button" onClick={onStart} className="mt-5 min-h-[54px] w-full rounded-2xl bg-electric px-5 text-lg font-extrabold text-white active:scale-[0.99]">
                Start the tax return
              </button>
            </>
          )}

          {phase === 'case' && (
            <>
              <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-electric">Choose your practice W-2</div>
              <h2 className="mt-1 font-display text-2xl font-extrabold">Pick any income case</h2>
              <p className="mt-2 font-semibold text-navy/70">All three paths are valid. The popup is the main control, so no choice can be blocked by the map.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {TAX_CASES.map((item) => (
                  <button key={item.id} type="button" onClick={() => onChooseCase(item)} className="rounded-2xl border-2 border-electric/20 bg-[#eef8ff] p-4 text-left transition hover:border-electric active:scale-[0.98]">
                    <span className="block text-xs font-extrabold uppercase tracking-wide text-electric">{item.label}</span>
                    <span className="mt-2 block text-lg font-extrabold">Wages {money(item.wages)}</span>
                    <span className="block text-sm font-bold text-navy/65">Withheld {money(item.withheld)}</span>
                    <span className="mt-2 block text-xs font-semibold text-navy/55">{item.note}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {phase === 'steps' && step && (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-electric">{step.eyebrow}</div>
                  <h2 className="mt-1 font-display text-2xl font-extrabold">{step.title}</h2>
                </div>
                <div className="shrink-0 rounded-xl bg-navy px-3 py-2 text-center text-white">
                  <div className="text-[10px] font-extrabold uppercase tracking-wide text-white/65">Progress</div>
                  <div className="text-lg font-extrabold">{stepNumber}/{TOTAL_TAX_STEPS}</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-[#fff7e8] p-3 text-sm sm:grid-cols-4">
                <div><div className="text-[10px] font-extrabold uppercase text-navy/45">W-2 wages</div><div className="font-extrabold">{money(math.wages)}</div></div>
                <div><div className="text-[10px] font-extrabold uppercase text-navy/45">Withheld</div><div className="font-extrabold">{money(math.withheld)}</div></div>
                <div><div className="text-[10px] font-extrabold uppercase text-navy/45">Deduction</div><div className="font-extrabold">{money(math.deduction)}</div></div>
                <div><div className="text-[10px] font-extrabold uppercase text-navy/45">Credit</div><div className="font-extrabold">{money(math.credit)}</div></div>
              </div>

              <div className="mt-4 rounded-2xl border-2 border-electric/15 bg-[#eef8ff] p-4">
                <div className="text-lg font-extrabold leading-snug">{step.prompt}</div>
              </div>

              <div className="mt-3 grid gap-2">
                {step.choices.map((choice, index) => (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={feedback?.correct}
                    onClick={() => onAnswer(choice)}
                    className="min-h-[54px] rounded-2xl border-2 border-navy/10 bg-white px-4 py-3 text-left font-extrabold shadow-sm transition hover:border-electric disabled:opacity-60 active:scale-[0.99]"
                  >
                    <span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-full bg-navy/10 text-xs">{String.fromCharCode(65 + index)}</span>
                    {choice.label}
                  </button>
                ))}
              </div>

              {!feedback && (
                <button type="button" onClick={() => onHint(step.hint)} className="mt-3 min-h-[44px] w-full rounded-xl border-2 border-electric/20 bg-electric/5 px-4 text-sm font-extrabold text-electric active:scale-[0.99]">
                  Show a hint on the side
                </button>
              )}

              {feedback && (
                <div className={`mt-4 rounded-2xl border-2 p-4 ${feedback.correct ? 'border-teal/40 bg-teal/10' : 'border-[#ff6b6b]/40 bg-[#fff1f1]'}`}>
                  <div className={`font-display text-xl font-extrabold ${feedback.correct ? 'text-[#008a67]' : 'text-[#bd2f2f]'}`}>
                    {feedback.correct ? 'Correct — you did the tax math.' : 'Try that step again.'}
                  </div>
                  <p className="mt-1 font-semibold leading-relaxed text-navy/75">{feedback.correct ? step.explanation : step.hint}</p>
                  {feedback.correct && (
                    <button type="button" onClick={onNext} className="mt-3 min-h-[50px] w-full rounded-xl bg-teal px-4 font-extrabold text-navy active:scale-[0.99]">
                      {stepNumber === TOTAL_TAX_STEPS ? 'File this practice return' : 'Next tax step'}
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {isComplete && taxCase && (
            <>
              <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal">Module 5 complete</div>
              <h2 className="mt-1 font-display text-3xl font-extrabold">Practice return filed</h2>
              <div className="mt-4 rounded-2xl bg-[#eef8ff] p-4">
                <div className="font-extrabold">{taxResultSummary(taxCase)}</div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                  <div><span className="block text-navy/50">Wages</span><strong>{money(math.wages)}</strong></div>
                  <div><span className="block text-navy/50">Taxable</span><strong>{money(math.taxableIncome)}</strong></div>
                  <div><span className="block text-navy/50">Final tax</span><strong>{money(math.finalTax)}</strong></div>
                  <div><span className="block text-navy/50">Withheld</span><strong>{money(math.withheld)}</strong></div>
                  <div><span className="block text-navy/50">Refund</span><strong>{money(math.refund)}</strong></div>
                  <div><span className="block text-navy/50">Amount due</span><strong>{money(math.amountDue)}</strong></div>
                </div>
              </div>
              <p className="mt-4 font-semibold leading-relaxed text-navy/70">
                You practiced the filing flow: read the W-2, found taxable income, used brackets, applied a credit, and reconciled withholding.
              </p>
              <button type="button" onClick={onFinish} className="mt-5 min-h-[54px] w-full rounded-2xl bg-electric px-5 text-lg font-extrabold text-white active:scale-[0.99]">
                Finish Module 5
              </button>
            </>
          )}
        </section>
      </div>
    </Html>
  )
}

export function PaycheckPlanetWorld() {
  const [active, setActive] = useState(() => isPaycheckWorldActive())
  const [phase, setPhase] = useState('intro')
  const [taxCase, setTaxCase] = useState(null)
  const [stepNumber, setStepNumber] = useState(1)
  const [feedback, setFeedback] = useState(null)
  const loadedSessionRef = useRef(false)

  const currentStep = useMemo(
    () => (taxCase ? filingStepFor(taxCase, stepNumber) : null),
    [stepNumber, taxCase],
  )
  const math = useMemo(() => taxReturnMath(taxCase), [taxCase])

  const restoreOrStart = useCallback(() => {
    const profile = loadProfile() || {}
    const saved = profile.taxLabProgress
    const savedCase = TAX_CASES.find((item) => item.id === saved?.caseId) || null

    if (saved && !saved.completed && savedCase) {
      setTaxCase(savedCase)
      setStepNumber(Math.max(1, Math.min(TOTAL_TAX_STEPS, Number(saved.stepNumber || 1))))
      setPhase(saved.phase === 'steps' ? 'steps' : 'case')
      setFeedback(null)
      sendHint(`Resume Module 5 at tax step ${saved.stepNumber || 1}. Your W-2 is still selected.`)
      return
    }

    setPhase('intro')
    setTaxCase(null)
    setStepNumber(1)
    setFeedback(null)
  }, [])

  useEffect(() => {
    const sync = (event) => setActive(event?.detail?.active ?? isPaycheckWorldActive())
    sync()
    window.addEventListener(PAYCHECK_MODE_EVENT, sync)
    return () => window.removeEventListener(PAYCHECK_MODE_EVENT, sync)
  }, [])

  useEffect(() => {
    if (!active) {
      loadedSessionRef.current = false
      return
    }
    if (loadedSessionRef.current) return
    loadedSessionRef.current = true
    restoreOrStart()
    recordLearningEvent({
      moduleName: 'tax',
      type: 'module_start',
      outcome: 'started',
      detail: 'six_step_tax_filing_practice',
    }).catch(() => {})
  }, [active, restoreOrStart])

  useEffect(() => {
    if (!active || !loadedSessionRef.current || phase === 'complete') return
    saveProfile({
      taxLabProgress: {
        phase,
        caseId: taxCase?.id || null,
        stepNumber,
        completed: false,
      },
    })
  }, [active, phase, stepNumber, taxCase?.id])

  const startReturn = useCallback(() => {
    setPhase('case')
    setFeedback(null)
    sendHint('Pick any W-2 case. The three glowing paths are all valid; use the popup buttons to choose.')
  }, [])

  const chooseCase = useCallback((selected) => {
    if (!selected) return
    setTaxCase(selected)
    setStepNumber(1)
    setFeedback(null)
    setPhase('steps')
    pushCoins(worldPoint(selected.x, STATION_Z), { x: playerPos.x, y: 1.1, z: playerPos.z }, 8, 'w2-choice')
    recordLearningEvent({
      moduleName: 'tax',
      type: 'w2_case_choice',
      outcome: selected.id,
      detail: `wages=${selected.wages};withheld=${selected.withheld}`,
    }).catch(() => {})
  }, [])

  const answerChoice = useCallback((choice) => {
    if (!taxCase || !currentStep || !choice || feedback?.correct) return
    const correct = Boolean(choice.correct)
    setFeedback({ correct, choiceId: choice.id })
    recordLearningEvent({
      moduleName: 'tax',
      type: correct ? 'tax_step_correct' : 'tax_step_retry',
      outcome: choice.id,
      detail: `step=${stepNumber};case=${taxCase.id}`,
    }).catch(() => {})
    if (correct) {
      pushCoins(worldPoint(0, STATION_Z, 1.25), { x: playerPos.x, y: 1.1, z: playerPos.z }, 5, `tax-step-${stepNumber}`)
    }
  }, [currentStep, feedback?.correct, stepNumber, taxCase])

  const finishReturn = useCallback(() => {
    if (!taxCase) return
    const profile = loadProfile() || {}
    const result = taxReturnMath(taxCase)
    saveProfile({
      badges: [...new Set([...(profile.badges || []), 'tax'])],
      taxLab: {
        caseId: taxCase.id,
        wages: result.wages,
        withheld: result.withheld,
        deduction: result.deduction,
        taxableIncome: result.taxableIncome,
        taxBeforeCredits: result.taxBeforeCredits,
        credit: result.credit,
        finalTax: result.finalTax,
        refund: result.refund,
        amountDue: result.amountDue,
        stepsCompleted: TOTAL_TAX_STEPS,
        completedAt: new Date().toISOString(),
      },
      taxLabProgress: {
        phase: 'complete',
        caseId: taxCase.id,
        stepNumber: TOTAL_TAX_STEPS,
        completed: true,
      },
    })
    setPhase('complete')
    setFeedback(null)
    pushCoins(worldPoint(0, STATION_Z, 1.7), { x: playerPos.x, y: 1.1, z: playerPos.z }, 14, 'tax-complete')
    recordLearningEvent({
      moduleName: 'tax',
      type: 'module_complete',
      outcome: 'completed',
      detail: `tax_filing;case=${taxCase.id};finalTax=${result.finalTax};refund=${result.refund};due=${result.amountDue}`,
    }).catch(() => {})
  }, [taxCase])

  const nextStep = useCallback(() => {
    if (!feedback?.correct) return
    if (stepNumber >= TOTAL_TAX_STEPS) {
      finishReturn()
      return
    }
    setStepNumber((value) => value + 1)
    setFeedback(null)
  }, [feedback?.correct, finishReturn, stepNumber])

  const finishModule = useCallback(() => {
    try { useGame.getState().adminClearUi() } catch { /* no-op */ }
    deactivatePaycheckWorld()
  }, [])

  const stations = phase === 'case'
    ? TAX_CASES.map((item) => ({ id: item.id, x: item.x, label: item.label, sublabel: `${money(item.wages)} WAGES`, action: () => chooseCase(item) }))
    : phase === 'steps' && currentStep
      ? currentStep.choices.map((choice, index) => ({
          id: choice.id,
          x: [-2.6, 0, 2.6][index],
          label: `ANSWER ${String.fromCharCode(65 + index)}`,
          sublabel: String(choice.label).slice(0, 25).toUpperCase(),
          action: () => answerChoice(choice),
        }))
      : []

  const boardHeadline = !active
    ? 'PAYCHECK PLANET · TAX FILING LAB'
    : phase === 'intro' ? 'MODULE 5 · LEARN TO FILE TAXES'
      : phase === 'case' ? 'CHOOSE A PRACTICE W-2'
        : phase === 'steps' ? `TAX STEP ${stepNumber} OF ${TOTAL_TAX_STEPS}`
          : 'PRACTICE RETURN FILED'

  const boardLine = !active
    ? 'W-2 · TAXABLE INCOME · BRACKETS · CREDITS · REFUND / AMOUNT DUE'
    : phase === 'intro' ? 'Start with the large instruction card in front of you'
      : phase === 'case' ? 'Three paths · three valid cases · choose in the popup'
        : phase === 'steps' && currentStep ? currentStep.title.toUpperCase()
          : taxResultSummary(taxCase)

  return (
    <group position={[TAX_DISTRICT[0], 0, TAX_DISTRICT[1]]}>
      <mesh position={[0, 0.025, 0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.4, 32]} />
        <meshStandardMaterial color="#fff0dc" roughness={1} />
      </mesh>
      <mesh position={[0, 0.032, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.4, 5.9, 32]} />
        <meshStandardMaterial color="#ff8a3d" roughness={1} />
      </mesh>

      <RoundedBox args={[6.2, 4.2, 3.6]} radius={0.28} smoothness={4} position={[0, 2.1, -0.8]} castShadow>
        <meshPhysicalMaterial color="#ffb36f" roughness={0.5} clearcoat={0.35} />
      </RoundedBox>
      <RoundedBox args={[6.7, 0.7, 4.1]} radius={0.22} smoothness={4} position={[0, 4.35, -0.8]} castShadow>
        <meshStandardMaterial color="#071748" roughness={0.55} />
      </RoundedBox>
      <RoundedBox args={[1.55, 2.55, 0.18]} radius={0.12} smoothness={3} position={[0, 1.35, 1.04]} castShadow>
        <meshStandardMaterial color="#1464f0" emissive="#1464f0" emissiveIntensity={active ? 0.42 : 0.12} />
      </RoundedBox>
      {[-2.05, 2.05].map((x) => (
        <mesh key={x} position={[x, 2.25, 1.03]}>
          <planeGeometry args={[1.35, 1.35]} />
          <meshStandardMaterial color="#d8f3ff" emissive="#9bdfff" emissiveIntensity={0.18} />
        </mesh>
      ))}

      <Billboard position={[0, 6.15, 0]}>
        <mesh>
          <planeGeometry args={[6.8, 1.55]} />
          <meshBasicMaterial
            map={labelTexture('PAYCHECK PLANET · TAX LAB', { bg: '#071748', color: '#ffffff', accent: '#ff8a3d' })}
            transparent
            toneMapped={false}
            depthTest={false}
          />
        </mesh>
      </Billboard>

      <ModuleBoard headline={boardHeadline} line={boardLine} />

      {active && stations.map((station, index) => (
        <ChoicePath key={`path-${station.id}-${index}`} x={station.x} accent={phase === 'case' ? '#ff8a3d' : '#1464f0'} />
      ))}
      {active && stations.map((station) => (
        <AnimatedStation
          key={station.id}
          x={station.x}
          label={station.label}
          sublabel={station.sublabel}
          accent={phase === 'case' ? '#ff8a3d' : '#1464f0'}
          onActivate={station.action}
        />
      ))}

      {active && (
        <TaxFilingPanel
          phase={phase}
          taxCase={taxCase}
          stepNumber={stepNumber}
          feedback={feedback}
          onStart={startReturn}
          onChooseCase={chooseCase}
          onAnswer={answerChoice}
          onNext={nextStep}
          onHint={sendHint}
          onFinish={finishModule}
        />
      )}

      <CelebrationBurst active={active && phase === 'complete'} />
    </group>
  )
}
