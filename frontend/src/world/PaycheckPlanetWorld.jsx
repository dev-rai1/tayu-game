import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, RoundedBox } from '@react-three/drei'
import { TAX_DISTRICT } from './config.js'
import { playerPos, useGame } from './store.js'
import { labelTexture } from './textures.js'
import { loadProfile, saveProfile } from '../services/walletStore.js'
import { recordLearningEvent } from '../services/usageAnalytics.js'
import {
  BUDGET_PLANS,
  CAREER_JOBS,
  START_JOBS,
  TOTAL_PAYCHECK_WEEKS,
  WEEK_SPECS,
  applyLifeChoice,
  budgetAmounts,
  lifeSummary,
  paycheckMath,
} from '../scenarios/paycheckPlanet.js'
import {
  PAYCHECK_MODE_EVENT,
  deactivatePaycheckWorld,
  isPaycheckWorldActive,
} from './paycheckMode.js'

// Module 5 launches directly here from the module menu. The player starts in
// the middle of the three choice lanes so every first decision is immediately
// visible and clickable.
export const TAX_ENTRY = [TAX_DISTRICT[0], TAX_DISTRICT[1] + 4.1]
const STATION_Z = 4.25
const STATION_RADIUS = 3.25

const roundMoney = (value) => Math.max(0, Math.round(Number(value || 0)))
const allJobs = [...START_JOBS, ...CAREER_JOBS]

function findJob(id) {
  return allJobs.find((item) => item.id === id) || null
}

function worldPoint(x, z, y = 1.1) {
  return { x: TAX_DISTRICT[0] + x, y, z: TAX_DISTRICT[1] + z }
}

function distanceTo(x, z) {
  return Math.hypot(playerPos.x - (TAX_DISTRICT[0] + x), playerPos.z - (TAX_DISTRICT[1] + z))
}

function pushCoins(from, to, count, prefix = 'paycheck') {
  const batch = {
    id: `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    from,
    to,
    count,
  }
  useGame.setState((state) => ({ coinBatches: [...state.coinBatches, batch] }))
}

// Paycheck Planet intentionally keeps ONE coach card at a time. The old flow
// fired a toast plus a lesson after almost every click, which built a large
// queue ("1 of 7") while the 3D labels were changing underneath it.
function showCoach(text, key = null) {
  try {
    const game = useGame.getState()
    game.adminClearUi()
    game.showLesson(text, key, true, 'tax')
  } catch {
    // The 3D module remains playable even if the coach layer is unavailable.
  }
}

function AnimatedStation({
  x,
  label,
  sublabel,
  accent = '#00dca0',
  selected = false,
  onActivate,
}) {
  const group = useRef()
  const time = useRef(Math.random() * 5)
  const [hovered, setHovered] = useState(false)

  useFrame((_, delta) => {
    time.current += delta
    if (!group.current) return
    group.current.position.y = 0.12 + Math.sin(time.current * 3.2) * 0.08
    group.current.rotation.y = Math.sin(time.current * 1.15) * 0.035
  })

  const activate = (event) => {
    event?.stopPropagation?.()
    onActivate?.()
  }

  const bright = hovered || selected || distanceTo(x, STATION_Z) <= STATION_RADIUS

  return (
    <group ref={group} position={[x, 0, STATION_Z]}>
      <RoundedBox
        args={[2.35, 0.38, 1.8]}
        radius={0.18}
        smoothness={3}
        position={[0, 0.22, 0]}
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
          emissiveIntensity={bright ? 0.9 : 0.38}
          roughness={0.55}
        />
      </RoundedBox>
      <mesh position={[0, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.31, 0.31, 0.11, 18]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={bright ? 0.75 : 0.35} metalness={0.25} />
      </mesh>
      <Billboard position={[0, 1.58, 0]}>
        <mesh>
          <planeGeometry args={[2.7, 0.74]} />
          <meshBasicMaterial
            map={labelTexture(label, { bg: '#071748', color: '#ffffff', accent })}
            transparent
            toneMapped={false}
            depthTest={false}
          />
        </mesh>
      </Billboard>
      {sublabel && (
        <Billboard position={[0, 1.07, 0]}>
          <mesh>
            <planeGeometry args={[2.62, 0.62]} />
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

function CelebrationBurst({ active }) {
  const group = useRef()

  useFrame((_, delta) => {
    if (!group.current || !active) return
    group.current.rotation.y += delta * 0.65
    group.current.rotation.x = Math.sin(Date.now() / 900) * 0.06
  })

  if (!active) return null

  return (
    <group ref={group} position={[0, 4.7, 2.2]}>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const radius = 2 + (i % 3) * 0.32
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * radius, Math.sin(angle * 2) * 0.7, Math.sin(angle) * radius]}
            rotation={[Math.PI / 2, angle, 0]}
          >
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
      <Billboard position={[0, 5.02, 0.75]}>
        <mesh>
          <planeGeometry args={[5.85, 0.95]} />
          <meshBasicMaterial
            map={labelTexture(headline, { bg: '#00dca0', color: '#071748', accent: '#ffd700' })}
            transparent
            toneMapped={false}
            depthTest={false}
          />
        </mesh>
      </Billboard>
      {line && (
        <Billboard position={[0, 4.48, 0.78]}>
          <mesh>
            <planeGeometry args={[5.65, 0.64]} />
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

export function PaycheckPlanetWorld() {
  const [active, setActive] = useState(() => isPaycheckWorldActive())
  const [week, setWeek] = useState(1)
  const [phase, setPhase] = useState('job')
  const [job, setJob] = useState(null)
  const [budgetPlan, setBudgetPlan] = useState(null)
  const [weekBudget, setWeekBudget] = useState(null)
  const [cash, setCash] = useState(0)
  const [savings, setSavings] = useState(0)
  const [debt, setDebt] = useState(0)
  const [comfort, setComfort] = useState(5)
  const [freeTime, setFreeTime] = useState(5)
  const [grossBonus, setGrossBonus] = useState(0)
  const [history, setHistory] = useState([])
  const [nearStation, setNearStation] = useState('')
  const nearStationRef = useRef('')
  const loadedSessionRef = useRef(false)

  const spec = WEEK_SPECS[week - 1] || WEEK_SPECS[0]
  const paycheck = useMemo(() => paycheckMath(job, grossBonus), [grossBonus, job])
  const summary = useMemo(
    () => lifeSummary({ savings, debt, comfort, freeTime }),
    [comfort, debt, freeTime, savings],
  )

  const restoreOrStart = useCallback(() => {
    const profile = loadProfile() || {}
    const saved = profile.taxLabProgress

    if (saved && !saved.completed && saved.week >= 1 && saved.week <= TOTAL_PAYCHECK_WEEKS) {
      setWeek(saved.week)
      setPhase(saved.phase || (saved.week === 1 ? 'job' : 'tax'))
      setJob(findJob(saved.jobId))
      setBudgetPlan(BUDGET_PLANS.find((item) => item.id === saved.budgetPlanId) || null)
      setWeekBudget(saved.weekBudget || null)
      setCash(roundMoney(saved.cash))
      setSavings(roundMoney(saved.savings))
      setDebt(roundMoney(saved.debt))
      setComfort(Math.max(0, Math.min(10, Number(saved.comfort ?? 5))))
      setFreeTime(Math.max(0, Math.min(10, Number(saved.freeTime ?? 5))))
      setGrossBonus(roundMoney(saved.grossBonus))
      setHistory(Array.isArray(saved.history) ? saved.history : [])
      showCoach(`Week ${saved.week} is ready. Continue with the glowing choice pads.`)
      return
    }

    setWeek(1)
    setPhase('job')
    setJob(null)
    setBudgetPlan(null)
    setWeekBudget(null)
    setCash(0)
    setSavings(0)
    setDebt(0)
    setComfort(5)
    setFreeTime(5)
    setGrossBonus(0)
    setHistory([])
    showCoach('Module 5 starts with a job choice. Compare take-home pay and free time, then click one glowing pad.')
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
      detail: 'six_week_in_world_simulation',
    }).catch(() => {})
  }, [active, restoreOrStart])

  // Never overwrite the completed checkpoint with completed:false after the
  // final render. That race could make a finished Module 5 look unfinished.
  useEffect(() => {
    if (!active || !loadedSessionRef.current || phase === 'complete') return
    saveProfile({
      taxLabProgress: {
        week,
        phase,
        jobId: job?.id || null,
        budgetPlanId: budgetPlan?.id || null,
        weekBudget,
        cash,
        savings,
        debt,
        comfort,
        freeTime,
        grossBonus,
        history,
        completed: false,
      },
    })
  }, [active, budgetPlan, cash, comfort, debt, freeTime, grossBonus, history, job, phase, savings, week, weekBudget])

  const stations = useMemo(() => {
    if (!active) return []
    if (phase === 'job') return START_JOBS.map((item) => ({ id: `job:${item.id}`, x: item.x }))
    if (phase === 'career') return CAREER_JOBS.map((item) => ({ id: `career:${item.id}`, x: item.x }))
    if (phase === 'tax') return [{ id: 'tax', x: 0 }]
    if (phase === 'budget') return BUDGET_PLANS.map((item) => ({ id: `budget:${item.id}`, x: item.x }))
    if (phase === 'life') return spec.choices.map((item) => ({ id: `life:${item.id}`, x: item.x }))
    if (phase === 'recap') return [{ id: 'recap', x: 0 }]
    if (phase === 'complete') return [{ id: 'finish', x: 0 }]
    return []
  }, [active, phase, spec.choices])

  useFrame(() => {
    if (!active) {
      nearStationRef.current = ''
      return
    }

    let closest = ''
    let closestDistance = Infinity
    stations.forEach((station) => {
      const d = distanceTo(station.x, STATION_Z)
      if (d < closestDistance) {
        closestDistance = d
        closest = station.id
      }
    })
    if (closestDistance > STATION_RADIUS) closest = ''
    nearStationRef.current = closest
    setNearStation((current) => (current === closest ? current : closest))
  })

  const chooseJob = useCallback((selected) => {
    if (phase !== 'job' || !selected) return
    const math = paycheckMath(selected, grossBonus)
    setJob(selected)
    setFreeTime(selected.freeTime)
    setComfort(selected.comfort)
    setPhase('tax')
    pushCoins(worldPoint(selected.x, STATION_Z), { x: playerPos.x, y: 1.1, z: playerPos.z }, 8, 'job-choice')
    showCoach(`${selected.label}: $${math.takeHome} take-home and ${selected.freeTime}/10 free time. Next, collect the paycheck.`)
    recordLearningEvent({
      moduleName: 'tax',
      type: 'job_choice',
      outcome: selected.id,
      detail: `week=${week};gross=${math.gross};takeHome=${math.takeHome}`,
    }).catch(() => {})
  }, [grossBonus, phase, week])

  const chooseCareer = useCallback((selected) => {
    if (phase !== 'career' || !selected) return
    const math = paycheckMath(selected, grossBonus)
    setJob(selected)
    setFreeTime(selected.freeTime)
    setComfort(selected.comfort)
    setPhase('tax')
    pushCoins(worldPoint(selected.x, STATION_Z), { x: playerPos.x, y: 1.1, z: playerPos.z }, 8, 'career-choice')
    showCoach(`${selected.label}: about $${math.takeHome} take-home with ${selected.freeTime}/10 free time. Next, collect the new paycheck.`)
    recordLearningEvent({
      moduleName: 'tax',
      type: 'career_choice',
      outcome: selected.id,
      detail: `week=${week};gross=${math.gross};freeTime=${selected.freeTime}`,
    }).catch(() => {})
  }, [grossBonus, phase, week])

  const collectPaycheck = useCallback(() => {
    if (phase !== 'tax' || !job) return
    const math = paycheckMath(job, grossBonus)
    setCash((value) => roundMoney(value + math.takeHome))
    setBudgetPlan(null)
    setWeekBudget(null)
    setPhase('budget')
    pushCoins(worldPoint(0, STATION_Z, 1.35), { x: playerPos.x, y: 1.1, z: playerPos.z }, 10, `paycheck-week-${week}`)
    showCoach(`Paycheck: $${math.gross} gross − $${math.tax} withheld = $${math.takeHome} take-home. Now choose a budget.`)
    recordLearningEvent({
      moduleName: 'tax',
      type: 'withholding',
      outcome: 'completed',
      detail: `week=${week};tax=${math.tax};takeHome=${math.takeHome}`,
    }).catch(() => {})
  }, [grossBonus, job, phase, week])

  const chooseBudget = useCallback((selected) => {
    if (phase !== 'budget' || !job || !selected) return
    const math = paycheckMath(job, grossBonus)
    const amounts = budgetAmounts(math.takeHome, selected)
    setBudgetPlan(selected)
    setWeekBudget(amounts)
    setCash((value) => roundMoney(Math.max(0, value - amounts.needs - amounts.save)))
    setSavings((value) => roundMoney(value + amounts.save))
    setComfort((value) => Math.max(0, Math.min(10, value + selected.comfort)))
    setPhase('life')
    pushCoins(worldPoint(selected.x, STATION_Z), worldPoint(0, 0.7, 1.1), 7, `budget-week-${week}`)
    showCoach(`${selected.label}: needs $${amounts.needs}, wants $${amounts.wants}, savings $${amounts.save}. Next, make this week’s life choice.`)
    recordLearningEvent({
      moduleName: 'tax',
      type: 'budget_choice',
      outcome: selected.id,
      detail: `week=${week};needs=${amounts.needs};wants=${amounts.wants};save=${amounts.save}`,
    }).catch(() => {})
  }, [grossBonus, job, phase, week])

  const chooseLife = useCallback((selected) => {
    if (phase !== 'life' || !selected) return
    const next = applyLifeChoice({ cash, savings, debt, comfort, freeTime, grossBonus }, selected)
    const snapshot = {
      week,
      title: spec.title,
      job: job?.label || '',
      budget: budgetPlan?.label || '',
      lifeChoice: selected.label,
      cash: roundMoney(next.cash),
      savings: roundMoney(next.savings),
      debt: roundMoney(next.debt),
      comfort: next.comfort,
      freeTime: next.freeTime,
    }

    setCash(snapshot.cash)
    setSavings(snapshot.savings)
    setDebt(snapshot.debt)
    setComfort(snapshot.comfort)
    setFreeTime(snapshot.freeTime)
    setGrossBonus(roundMoney(next.grossBonus))
    setHistory((items) => [...items, snapshot])
    setPhase('recap')
    pushCoins(worldPoint(selected.x, STATION_Z), { x: playerPos.x, y: 1.1, z: playerPos.z }, 6, `life-week-${week}`)
    showCoach(`${selected.lesson} Week ${week}: cash $${snapshot.cash}, savings $${snapshot.savings}, debt $${snapshot.debt}.`)
    recordLearningEvent({
      moduleName: 'tax',
      type: 'life_choice',
      outcome: selected.id,
      detail: `week=${week};cash=${snapshot.cash};savings=${snapshot.savings};debt=${snapshot.debt}`,
    }).catch(() => {})
  }, [budgetPlan?.label, cash, comfort, debt, freeTime, grossBonus, job?.label, phase, savings, spec.title, week])

  const finishWeek = useCallback(() => {
    if (phase !== 'recap') return

    recordLearningEvent({
      moduleName: 'tax',
      type: 'week_complete',
      outcome: 'completed',
      detail: `week=${week};savings=${savings};debt=${debt}`,
    }).catch(() => {})

    if (week >= TOTAL_PAYCHECK_WEEKS) {
      const profile = loadProfile() || {}
      const finalSummary = lifeSummary({ savings, debt, comfort, freeTime })
      saveProfile({
        badges: [...new Set([...(profile.badges || []), 'tax'])],
        taxLab: {
          weeksCompleted: TOTAL_PAYCHECK_WEEKS,
          finalJob: job?.id || null,
          gross: paycheckMath(job, grossBonus).gross,
          tax: paycheckMath(job, grossBonus).tax,
          takeHome: paycheckMath(job, grossBonus).takeHome,
          cash,
          savings,
          debt,
          comfort,
          freeTime,
          summary: finalSummary,
          history,
          completedAt: new Date().toISOString(),
        },
        taxLabProgress: {
          week: TOTAL_PAYCHECK_WEEKS,
          phase: 'complete',
          jobId: job?.id || null,
          budgetPlanId: budgetPlan?.id || null,
          weekBudget,
          cash,
          savings,
          debt,
          comfort,
          freeTime,
          grossBonus,
          history,
          completed: true,
        },
      })
      setPhase('complete')
      pushCoins(worldPoint(0, STATION_Z, 1.8), { x: playerPos.x, y: 1.1, z: playerPos.z }, 14, 'tax-complete')
      showCoach(`Module 5 complete. Your final result: ${finalSummary}. Play Again is available from the module menu after completion.`)
      recordLearningEvent({
        moduleName: 'tax',
        type: 'module_complete',
        outcome: 'completed',
        detail: `six_weeks;savings=${savings};debt=${debt};comfort=${comfort};freeTime=${freeTime}`,
      }).catch(() => {})
      return
    }

    const nextWeek = week + 1
    const nextSpec = WEEK_SPECS[nextWeek - 1]
    setWeek(nextWeek)
    setBudgetPlan(null)
    setWeekBudget(null)
    setPhase(nextWeek === 4 ? 'career' : 'tax')
    showCoach(`Week ${nextWeek}: ${nextSpec.title}. ${nextSpec.intro}`)
  }, [budgetPlan?.id, cash, comfort, debt, freeTime, grossBonus, history, job, phase, savings, week, weekBudget])

  const finishModule = useCallback(() => {
    if (phase !== 'complete') return
    try { useGame.getState().adminClearUi() } catch { /* no-op */ }
    deactivatePaycheckWorld()
  }, [phase])

  const runStation = useCallback((id) => {
    if (!id) return
    if (id.startsWith('job:')) chooseJob(START_JOBS.find((item) => item.id === id.slice(4)))
    else if (id.startsWith('career:')) chooseCareer(CAREER_JOBS.find((item) => item.id === id.slice(7)))
    else if (id === 'tax') collectPaycheck()
    else if (id.startsWith('budget:')) chooseBudget(BUDGET_PLANS.find((item) => item.id === id.slice(7)))
    else if (id.startsWith('life:')) chooseLife(spec.choices.find((item) => item.id === id.slice(5)))
    else if (id === 'recap') finishWeek()
    else if (id === 'finish') finishModule()
  }, [chooseBudget, chooseCareer, chooseJob, chooseLife, collectPaycheck, finishModule, finishWeek, spec.choices])

  // Keep the existing interaction key working for players who already use it,
  // but do not advertise or render any "Press E" bubble in Module 5. Clicking
  // or tapping the glowing pads is the primary interaction.
  useEffect(() => {
    const interact = (event) => {
      if (!active) return
      if (event.type === 'keydown' && event.code !== 'KeyE' && event.code !== 'Enter') return
      runStation(nearStationRef.current)
    }
    window.addEventListener('keydown', interact)
    window.addEventListener('tayu-interact', interact)
    return () => {
      window.removeEventListener('keydown', interact)
      window.removeEventListener('tayu-interact', interact)
    }
  }, [active, runStation])

  const boardHeadline = !active
    ? 'PAYCHECK PLANET'
    : phase === 'job' ? 'WEEK 1 · CHOOSE A JOB'
      : phase === 'career' ? 'WEEK 4 · CHOOSE A NEW JOB'
        : phase === 'tax' ? `WEEK ${week} · COLLECT PAYCHECK`
          : phase === 'budget' ? `WEEK ${week} · CHOOSE A BUDGET`
            : phase === 'life' ? `WEEK ${week} · ${spec.lifeTitle}`
              : phase === 'recap' ? `WEEK ${week} COMPLETE`
                : 'MODULE 5 COMPLETE'

  const boardLine = !active
    ? 'MODULE 5 · JOBS · TAXES · BUDGETS · LIFE CHOICES'
    : phase === 'job' || phase === 'career'
      ? 'Compare take-home pay and free time'
      : phase === 'tax'
        ? (job ? `$${paycheck.gross} gross − $${paycheck.tax} tax = $${paycheck.takeHome} take-home` : 'Choose a job first')
        : phase === 'budget'
          ? 'Choose how much goes to needs, wants, and savings'
          : phase === 'life'
            ? 'Your choice changes money, comfort, and free time'
            : phase === 'recap'
              ? `Cash $${roundMoney(cash)} · Savings $${roundMoney(savings)} · Debt $${roundMoney(debt)}`
              : `${summary} · Savings $${roundMoney(savings)} · Debt $${roundMoney(debt)}`

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
          <planeGeometry args={[6.5, 1.55]} />
          <meshBasicMaterial
            map={labelTexture('PAYCHECK PLANET', { bg: '#071748', color: '#ffffff', accent: '#ff8a3d' })}
            transparent
            toneMapped={false}
            depthTest={false}
          />
        </mesh>
      </Billboard>

      <ModuleBoard headline={boardHeadline} line={boardLine} />

      {active && phase === 'job' && START_JOBS.map((item) => {
        const math = paycheckMath(item, grossBonus)
        return (
          <AnimatedStation
            key={item.id}
            x={item.x}
            label={item.label}
            sublabel={`$${math.takeHome} TAKE-HOME · FREE TIME ${item.freeTime}/10`}
            accent="#ff8a3d"
            selected={nearStation === `job:${item.id}`}
            onActivate={() => chooseJob(item)}
          />
        )
      })}

      {active && phase === 'career' && CAREER_JOBS.map((item) => {
        const math = paycheckMath(item, grossBonus)
        return (
          <AnimatedStation
            key={item.id}
            x={item.x}
            label={item.label}
            sublabel={`$${math.takeHome} TAKE-HOME · FREE TIME ${item.freeTime}/10`}
            accent="#ff8a3d"
            selected={nearStation === `career:${item.id}`}
            onActivate={() => chooseCareer(item)}
          />
        )
      })}

      {active && phase === 'tax' && (
        <AnimatedStation
          x={0}
          label="COLLECT PAYCHECK"
          sublabel={job ? `$${paycheck.gross} − $${paycheck.tax} = $${paycheck.takeHome}` : 'CHOOSE A JOB FIRST'}
          accent="#1464f0"
          selected={nearStation === 'tax'}
          onActivate={collectPaycheck}
        />
      )}

      {active && phase === 'budget' && BUDGET_PLANS.map((item) => {
        const amounts = budgetAmounts(paycheck.takeHome, item)
        return (
          <AnimatedStation
            key={item.id}
            x={item.x}
            label={item.label}
            sublabel={`NEEDS $${amounts.needs} · WANTS $${amounts.wants} · SAVE $${amounts.save}`}
            accent="#7850f0"
            selected={nearStation === `budget:${item.id}`}
            onActivate={() => chooseBudget(item)}
          />
        )
      })}

      {active && phase === 'life' && spec.choices.map((item) => (
        <AnimatedStation
          key={item.id}
          x={item.x}
          label={item.label}
          sublabel={item.sublabel}
          accent={week === 5 ? '#ffd700' : '#00dca0'}
          selected={nearStation === `life:${item.id}`}
          onActivate={() => chooseLife(item)}
        />
      ))}

      {active && phase === 'recap' && (
        <AnimatedStation
          x={0}
          label={week === TOTAL_PAYCHECK_WEEKS ? 'SEE FINAL RESULT' : `CONTINUE TO WEEK ${week + 1}`}
          sublabel={`COMFORT ${comfort}/10 · FREE TIME ${freeTime}/10`}
          accent="#ffd700"
          selected={nearStation === 'recap'}
          onActivate={finishWeek}
        />
      )}

      {active && phase === 'complete' && (
        <AnimatedStation
          x={0}
          label="FINISH MODULE 5"
          sublabel={`$${roundMoney(savings)} SAVED · $${roundMoney(debt)} DEBT`}
          accent="#00dca0"
          selected={nearStation === 'finish'}
          onActivate={finishModule}
        />
      )}

      <CelebrationBurst active={active && phase === 'complete'} />
    </group>
  )
}
