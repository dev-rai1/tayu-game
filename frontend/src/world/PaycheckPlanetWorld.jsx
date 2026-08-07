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
  activatePaycheckWorld,
  deactivatePaycheckWorld,
  isPaycheckWorldActive,
} from './paycheckMode.js'

export const TAX_ENTRY = [TAX_DISTRICT[0], TAX_DISTRICT[1] + 3.4]
const ENTRY_RADIUS = 4.2
const STATION_RADIUS = 2.8
const STATION_Z = 4.2

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

function setToast(text) {
  try { useGame.getState().setToast(text) } catch { useGame.setState({ toast: text }) }
}

function showLesson(text, key = null) {
  try { useGame.getState().showLesson(text, key, true, 'tax') } catch { /* world stays playable */ }
}

function InteractiveStation({
  x,
  z = STATION_Z,
  label,
  sublabel,
  detail,
  near,
  accent = '#00dca0',
  actionLabel = 'PRESS E / TAP',
  onActivate,
}) {
  const group = useRef()
  const time = useRef(Math.random() * 4)

  useFrame((_, delta) => {
    time.current += delta
    if (!group.current) return
    group.current.position.y = 0.12 + Math.sin(time.current * 3) * 0.09
    group.current.rotation.y = Math.sin(time.current * 1.2) * 0.035
  })

  const activate = (event) => {
    event?.stopPropagation?.()
    if (distanceTo(x, z) > STATION_RADIUS + 0.8) {
      setToast('Walk a little closer to the glowing choice pad.')
      return
    }
    onActivate?.()
  }

  return (
    <group ref={group} position={[x, 0, z]}>
      <RoundedBox
        args={[2.25, 0.42, 1.9]}
        radius={0.18}
        smoothness={3}
        position={[0, 0.23, 0]}
        onClick={activate}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = '' }}
      >
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={near ? 0.95 : 0.4} roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, 0.75, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.34, 0.34, 0.12, 18]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.65} metalness={0.35} />
      </mesh>
      <Billboard position={[0, 1.72, 0]}>
        <mesh>
          <planeGeometry args={[2.95, 0.86]} />
          <meshBasicMaterial map={labelTexture(label, { bg: '#071748', color: '#ffffff', accent })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>
      {sublabel && (
        <Billboard position={[0, 1.12, 0]}>
          <mesh>
            <planeGeometry args={[2.9, 0.72]} />
            <meshBasicMaterial map={labelTexture(sublabel, { bg: '#ffffff', color: '#071748', accent })} transparent toneMapped={false} depthTest={false} />
          </mesh>
        </Billboard>
      )}
      {detail && (
        <Billboard position={[0, 0.64, 0]}>
          <mesh>
            <planeGeometry args={[2.72, 0.58]} />
            <meshBasicMaterial map={labelTexture(detail, { bg: '#fff8e8', color: '#071748', accent: '#ffd700' })} transparent toneMapped={false} depthTest={false} />
          </mesh>
        </Billboard>
      )}
      {near && (
        <Billboard position={[0, 2.3, 0]}>
          <mesh>
            <planeGeometry args={[2.6, 0.64]} />
            <meshBasicMaterial map={labelTexture(actionLabel, { bg: '#00dca0', color: '#071748', accent: '#ffd700' })} transparent toneMapped={false} depthTest={false} />
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
    group.current.rotation.y += delta * 0.7
    group.current.rotation.x = Math.sin(Date.now() / 850) * 0.08
  })
  if (!active) return null
  return (
    <group ref={group} position={[0, 4.7, 3.2]}>
      {Array.from({ length: 14 }, (_, i) => {
        const angle = (i / 14) * Math.PI * 2
        const radius = 2.1 + (i % 3) * 0.4
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle * 2) * 0.8, Math.sin(angle) * radius]} rotation={[Math.PI / 2, angle, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.045, 14]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.8} metalness={0.4} />
          </mesh>
        )
      })}
    </group>
  )
}

function LifeSnapshot({ week, cash, savings, debt, comfort, freeTime, summary }) {
  return (
    <group>
      <Billboard position={[0, 4.08, 2.58]}>
        <mesh>
          <planeGeometry args={[6.2, 0.84]} />
          <meshBasicMaterial
            map={labelTexture(`WEEK ${week}/${TOTAL_PAYCHECK_WEEKS} · CASH $${cash} · SAVINGS $${savings} · DEBT $${debt}`, { bg: '#071748', color: '#ffffff', accent: '#00dca0' })}
            transparent
            toneMapped={false}
            depthTest={false}
          />
        </mesh>
      </Billboard>
      <Billboard position={[0, 3.57, 2.6]}>
        <mesh>
          <planeGeometry args={[5.8, 0.7]} />
          <meshBasicMaterial
            map={labelTexture(`LIFE SNAPSHOT · COMFORT ${comfort}/10 · FREE TIME ${freeTime}/10`, { bg: '#ffffff', color: '#071748', accent: '#7850f0' })}
            transparent
            toneMapped={false}
            depthTest={false}
          />
        </mesh>
      </Billboard>
      <Billboard position={[0, 3.14, 2.62]}>
        <mesh>
          <planeGeometry args={[5.35, 0.58]} />
          <meshBasicMaterial map={labelTexture(summary, { bg: '#fff0dc', color: '#071748', accent: '#ff8a3d' })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>
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
  const [nearEntrance, setNearEntrance] = useState(false)
  const [nearStation, setNearStation] = useState('')
  const nearEntranceRef = useRef(false)
  const nearStationRef = useRef('')
  const loadedSessionRef = useRef(false)

  const spec = WEEK_SPECS[week - 1] || WEEK_SPECS[0]
  const paycheck = useMemo(() => paycheckMath(job, grossBonus), [grossBonus, job])
  const summary = useMemo(() => lifeSummary({ savings, debt, comfort, freeTime }), [comfort, debt, freeTime, savings])

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
      setToast(`Module 5 resumed at Week ${saved.week} of ${TOTAL_PAYCHECK_WEEKS}.`)
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
    setToast('Paycheck Planet is a 6-week life simulation. Start by comparing all 3 jobs.')
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
    try { useGame.getState().adminClearUi() } catch { /* no-op */ }
    restoreOrStart()
    showLesson('PAYCHECK PLANET: You will live through 6 weeks. Each week you get paid, see taxes come out, make a budget, and make a life choice. Your cash, savings, debt, comfort, and free time will change based on what you choose.', 'tax-world-long-intro')
    recordLearningEvent({ moduleName: 'tax', type: 'module_start', outcome: 'started', detail: 'six_week_in_world_simulation' }).catch(() => {})
  }, [active, restoreOrStart])

  useEffect(() => {
    if (!active || !loadedSessionRef.current) return
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
    if (phase === 'job') return START_JOBS.map((item) => ({ id: `job:${item.id}`, x: item.x, z: STATION_Z }))
    if (phase === 'career') return CAREER_JOBS.map((item) => ({ id: `career:${item.id}`, x: item.x, z: STATION_Z }))
    if (phase === 'tax') return [{ id: 'tax', x: 0, z: STATION_Z }]
    if (phase === 'budget') return BUDGET_PLANS.map((item) => ({ id: `budget:${item.id}`, x: item.x, z: STATION_Z }))
    if (phase === 'life') return spec.choices.map((item) => ({ id: `life:${item.id}`, x: item.x, z: STATION_Z }))
    if (phase === 'recap') return [{ id: 'recap', x: 0, z: STATION_Z }]
    if (phase === 'complete') return [{ id: 'finish', x: 0, z: STATION_Z }]
    return []
  }, [active, phase, spec.choices])

  useFrame(() => {
    const entryDistance = Math.hypot(playerPos.x - TAX_ENTRY[0], playerPos.z - TAX_ENTRY[1])
    const entryNear = entryDistance <= ENTRY_RADIUS
    nearEntranceRef.current = entryNear
    setNearEntrance((current) => current === entryNear ? current : entryNear)

    let closest = ''
    let closestDistance = Infinity
    if (active) {
      stations.forEach((station) => {
        const d = distanceTo(station.x, station.z)
        if (d < closestDistance) {
          closestDistance = d
          closest = station.id
        }
      })
      if (closestDistance > STATION_RADIUS) closest = ''
    }
    nearStationRef.current = closest
    setNearStation((current) => current === closest ? current : closest)
  })

  const chooseJob = useCallback((selected) => {
    if (phase !== 'job' || !selected) return
    const math = paycheckMath(selected, grossBonus)
    setJob(selected)
    setFreeTime(selected.freeTime)
    setComfort(selected.comfort)
    setPhase('tax')
    pushCoins(worldPoint(selected.x, STATION_Z, 1.1), { x: playerPos.x, y: 1.1, z: playerPos.z }, 9, 'job-choice')
    setToast(`${selected.label}: $${math.gross} gross, about $${math.tax} withheld in this simulation, $${math.takeHome} take-home.`)
    showLesson(`JOB TRADEOFF: ${selected.label} gives $${math.takeHome} take-home pay in this practice week and starts you at ${selected.freeTime}/10 free time. Higher pay is useful, but time is part of the choice too.`)
    recordLearningEvent({ moduleName: 'tax', type: 'job_choice', outcome: selected.id, detail: `week=${week};gross=${math.gross};takeHome=${math.takeHome}` }).catch(() => {})
  }, [grossBonus, phase, week])

  const chooseCareer = useCallback((selected) => {
    if (phase !== 'career' || !selected) return
    const math = paycheckMath(selected, grossBonus)
    setJob(selected)
    setFreeTime(selected.freeTime)
    setPhase('tax')
    setToast(`New job chosen: ${selected.label}. Take-home this week will be about $${math.takeHome}.`)
    showLesson(`WEEK 4 JOB CHANGE: ${selected.label} changes both income and free time. Your budget should change when your income or schedule changes.`)
    recordLearningEvent({ moduleName: 'tax', type: 'career_choice', outcome: selected.id, detail: `week=${week};gross=${math.gross};freeTime=${selected.freeTime}` }).catch(() => {})
  }, [grossBonus, phase, week])

  const collectPaycheck = useCallback(() => {
    if (phase !== 'tax' || !job) return
    const math = paycheckMath(job, grossBonus)
    setCash((value) => roundMoney(value + math.takeHome))
    setBudgetPlan(null)
    setWeekBudget(null)
    setPhase('budget')
    pushCoins(worldPoint(0, STATION_Z, 1.4), { x: playerPos.x, y: 1.1, z: playerPos.z }, Math.max(6, Math.min(12, Math.round(math.takeHome / 20))), `paycheck-week-${week}`)
    setToast(`Week ${week}: $${math.gross} gross − $${math.tax} withheld = $${math.takeHome} take-home. Now budget that take-home pay.`)
    showLesson(`PAYCHECK MATH: Gross pay is $${math.gross}. This simulation withholds $${math.tax}, so $${math.takeHome} actually reaches you. Build the budget from $${math.takeHome}, not $${math.gross}.`)
    recordLearningEvent({ moduleName: 'tax', type: 'withholding', outcome: 'completed', detail: `week=${week};tax=${math.tax};takeHome=${math.takeHome}` }).catch(() => {})
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
    setToast(`${selected.label}: Needs $${amounts.needs}, wants $${amounts.wants}, savings $${amounts.save}. Now make this week’s life choice.`)
    showLesson(`BUDGET WEEK ${week}: From $${math.takeHome} take-home pay, you planned $${amounts.needs} for needs, $${amounts.wants} for wants, and $${amounts.save} for savings. Different plans change both today's flexibility and tomorrow's cushion.`)
    recordLearningEvent({ moduleName: 'tax', type: 'budget_choice', outcome: selected.id, detail: `week=${week};needs=${amounts.needs};wants=${amounts.wants};save=${amounts.save}` }).catch(() => {})
  }, [grossBonus, job, phase, week])

  const chooseLife = useCallback((selected) => {
    if (phase !== 'life' || !selected) return
    const next = applyLifeChoice({ cash, savings, debt, comfort, freeTime, grossBonus }, selected)
    setCash(roundMoney(next.cash))
    setSavings(roundMoney(next.savings))
    setDebt(roundMoney(next.debt))
    setComfort(next.comfort)
    setFreeTime(next.freeTime)
    setGrossBonus(roundMoney(next.grossBonus))
    setHistory((items) => [...items, {
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
    }])
    setPhase('recap')
    setToast(`${selected.label} changed your life snapshot. Check the board, then end Week ${week}.`)
    showLesson(`${selected.lesson} LOOK BACK: You now have $${roundMoney(next.cash)} cash, $${roundMoney(next.savings)} savings, $${roundMoney(next.debt)} debt, ${next.comfort}/10 comfort, and ${next.freeTime}/10 free time.`)
    recordLearningEvent({ moduleName: 'tax', type: 'life_choice', outcome: selected.id, detail: `week=${week};cash=${roundMoney(next.cash)};savings=${roundMoney(next.savings)};debt=${roundMoney(next.debt)}` }).catch(() => {})
  }, [budgetPlan?.label, cash, comfort, debt, freeTime, grossBonus, job?.label, phase, savings, spec.title, week])

  const finishWeek = useCallback(() => {
    if (phase !== 'recap') return
    const latest = history[history.length - 1]
    showLesson(`WEEK ${week} RECAP: ${latest?.job || job?.label || 'Your job'} funded the week. Your budget was ${latest?.budget || budgetPlan?.label || 'your plan'}, and your life choice was ${latest?.lifeChoice || 'completed'}. Repeated choices are what build the final result.`)
    recordLearningEvent({ moduleName: 'tax', type: 'week_complete', outcome: 'completed', detail: `week=${week};savings=${savings};debt=${debt}` }).catch(() => {})

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
      pushCoins(worldPoint(0, 0.2, 2.1), { x: playerPos.x, y: 1.1, z: playerPos.z }, 14, 'tax-complete')
      setToast(`Six weeks complete. Final life snapshot: ${finalSummary}.`)
      showLesson(`MODULE 5 COMPLETE: Over 6 weeks you saw how jobs, taxes, budgets, recurring costs, goals, work-life tradeoffs, emergencies, and wants interact. Your final snapshot is: ${finalSummary}.`)
      recordLearningEvent({ moduleName: 'tax', type: 'module_complete', outcome: 'completed', detail: `six_weeks;savings=${savings};debt=${debt};comfort=${comfort};freeTime=${freeTime}` }).catch(() => {})
      return
    }

    const nextWeek = week + 1
    setWeek(nextWeek)
    setBudgetPlan(null)
    setWeekBudget(null)
    setPhase(nextWeek === 4 ? 'career' : 'tax')
    const nextSpec = WEEK_SPECS[nextWeek - 1]
    setToast(`Week ${nextWeek} of ${TOTAL_PAYCHECK_WEEKS}: ${nextSpec.title}.`)
    showLesson(`NEXT WEEK — ${nextSpec.title}: ${nextSpec.intro}`)
  }, [budgetPlan?.id, budgetPlan?.label, cash, comfort, debt, freeTime, grossBonus, history, job, phase, savings, week, weekBudget])

  const finishModule = useCallback(() => {
    if (phase !== 'complete') return
    deactivatePaycheckWorld()
    setToast('Module 5 complete. No teleport — stay in the world and follow the route to Money Garden when you are ready.')
    showLesson('Module 5 is complete. You will NOT be teleported. Walk out of Paycheck Planet and follow the world guidance to Module 6: Money Garden.', 'paycheck-no-teleport-handoff')
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

  useEffect(() => {
    const interact = (event) => {
      if (event.type === 'keydown' && event.code !== 'KeyE' && event.code !== 'Enter') return
      if (!active) {
        if (nearEntranceRef.current) activatePaycheckWorld()
        return
      }
      runStation(nearStationRef.current)
    }
    window.addEventListener('keydown', interact)
    window.addEventListener('tayu-interact', interact)
    return () => {
      window.removeEventListener('keydown', interact)
      window.removeEventListener('tayu-interact', interact)
    }
  }, [active, runStation])

  const phaseHeadline = !active
    ? (nearEntrance ? 'PRESS E / TAP TO ENTER' : 'WALK UP TO PLAY')
    : phase === 'job' ? 'WEEK 1 · CHOOSE YOUR FIRST JOB'
      : phase === 'career' ? 'WEEK 4 · CHOOSE A NEW JOB'
        : phase === 'tax' ? `WEEK ${week} · COLLECT YOUR PAYCHECK`
          : phase === 'budget' ? `WEEK ${week} · BUILD YOUR BUDGET`
            : phase === 'life' ? `WEEK ${week} · ${spec.lifeTitle}`
              : phase === 'recap' ? `WEEK ${week} · LOOK BACK`
                : 'MODULE 5 · SIX WEEKS COMPLETE'

  const phaseInstruction = !active
    ? 'ENTER TO START THE 6-WEEK SIMULATION'
    : phase === 'job' || phase === 'career' ? 'COMPARE PAY · TAX · FREE TIME'
      : phase === 'tax' ? 'GROSS PAY − WITHHOLDING = TAKE-HOME PAY'
        : phase === 'budget' ? 'PLAN NEEDS · WANTS · SAVINGS FROM TAKE-HOME PAY'
          : phase === 'life' ? 'YOUR CHOICE CHANGES MONEY AND DAILY LIFE'
            : phase === 'recap' ? 'CHECK THE LIFE SNAPSHOT · THEN END THE WEEK'
              : 'FINISH HERE · THEN WALK TO MONEY GARDEN'

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
        <meshStandardMaterial color="#1464f0" emissive="#1464f0" emissiveIntensity={nearEntrance || active ? 0.45 : 0.12} />
      </RoundedBox>
      {[-2.05, 2.05].map((x) => (
        <mesh key={x} position={[x, 2.25, 1.03]}>
          <planeGeometry args={[1.35, 1.35]} />
          <meshStandardMaterial color="#d8f3ff" emissive="#9bdfff" emissiveIntensity={0.18} />
        </mesh>
      ))}

      <Billboard position={[0, 6.45, 0]}>
        <mesh>
          <planeGeometry args={[6.8, 2.12]} />
          <meshBasicMaterial map={labelTexture('PAYCHECK PLANET', { bg: '#071748', color: '#ffffff', accent: '#ff8a3d' })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>
      <Billboard position={[0, 5.15, 0.2]}>
        <mesh>
          <planeGeometry args={[5.7, 1.5]} />
          <meshBasicMaterial map={labelTexture('6-WEEK JOB · TAX · BUDGET · LIFE SIM', { bg: '#ff8a3d', color: '#071748', accent: '#ffffff' })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>

      {active && (
        <LifeSnapshot
          week={week}
          cash={roundMoney(cash)}
          savings={roundMoney(savings)}
          debt={roundMoney(debt)}
          comfort={comfort}
          freeTime={freeTime}
          summary={summary}
        />
      )}

      <Billboard position={[0, 2.56, 2.48]}>
        <mesh>
          <planeGeometry args={[6.0, 1.08]} />
          <meshBasicMaterial map={labelTexture(phaseHeadline, { bg: active ? '#00dca0' : '#071748', color: active ? '#071748' : '#ffffff', accent: '#ffd700' })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>
      <Billboard position={[0, 1.98, 2.5]}>
        <mesh>
          <planeGeometry args={[5.8, 0.76]} />
          <meshBasicMaterial map={labelTexture(phaseInstruction, { bg: '#ffffff', color: '#071748', accent: '#ff8a3d' })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>

      {!active && (
        <mesh
          position={[0, 1.5, 2.0]}
          onClick={(event) => {
            event.stopPropagation()
            if (distanceTo(0, 2.0) <= ENTRY_RADIUS + 1) activatePaycheckWorld()
            else setToast('Walk up to Paycheck Planet first.')
          }}
          onPointerOver={() => { document.body.style.cursor = 'pointer' }}
          onPointerOut={() => { document.body.style.cursor = '' }}
        >
          <boxGeometry args={[5.4, 3.4, 1.8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {active && phase === 'job' && START_JOBS.map((item) => {
        const math = paycheckMath(item, grossBonus)
        return (
          <InteractiveStation
            key={item.id}
            x={item.x}
            label={item.label}
            sublabel={`$${math.gross} GROSS · $${math.takeHome} TAKE-HOME`}
            detail={`${item.note} · FREE TIME ${item.freeTime}/10`}
            near={nearStation === `job:${item.id}`}
            accent="#ff8a3d"
            actionLabel="CHOOSE THIS JOB · E / TAP"
            onActivate={() => chooseJob(item)}
          />
        )
      })}

      {active && phase === 'career' && CAREER_JOBS.map((item) => {
        const math = paycheckMath(item, grossBonus)
        return (
          <InteractiveStation
            key={item.id}
            x={item.x}
            label={item.label}
            sublabel={`$${math.gross} GROSS · $${math.takeHome} TAKE-HOME`}
            detail={`${item.note} · FREE TIME ${item.freeTime}/10`}
            near={nearStation === `career:${item.id}`}
            accent="#ff8a3d"
            actionLabel="TAKE THIS JOB · E / TAP"
            onActivate={() => chooseCareer(item)}
          />
        )
      })}

      {active && phase === 'tax' && (
        <InteractiveStation
          x={0}
          label={`WEEK ${week} PAYCHECK`}
          sublabel={job ? `$${paycheck.gross} − $${paycheck.tax} = $${paycheck.takeHome}` : 'CHOOSE A JOB FIRST'}
          detail="GROSS − WITHHOLDING = TAKE-HOME"
          near={nearStation === 'tax'}
          accent="#1464f0"
          actionLabel="COLLECT PAYCHECK · E / TAP"
          onActivate={collectPaycheck}
        />
      )}

      {active && phase === 'budget' && BUDGET_PLANS.map((item) => {
        const amounts = budgetAmounts(paycheck.takeHome, item)
        return (
          <InteractiveStation
            key={item.id}
            x={item.x}
            label={item.label}
            sublabel={`NEEDS $${amounts.needs} · WANTS $${amounts.wants}`}
            detail={`SAVE $${amounts.save} · ${item.note}`}
            near={nearStation === `budget:${item.id}`}
            accent="#7850f0"
            actionLabel="USE THIS BUDGET · E / TAP"
            onActivate={() => chooseBudget(item)}
          />
        )
      })}

      {active && phase === 'life' && spec.choices.map((item) => (
        <InteractiveStation
          key={item.id}
          x={item.x}
          label={item.label}
          sublabel={item.sublabel}
          detail="THIS CHANGES YOUR LIFE SNAPSHOT"
          near={nearStation === `life:${item.id}`}
          accent={week === 5 ? '#ffd700' : '#00dca0'}
          actionLabel="MAKE THIS CHOICE · E / TAP"
          onActivate={() => chooseLife(item)}
        />
      ))}

      {active && phase === 'recap' && (
        <InteractiveStation
          x={0}
          label={`END WEEK ${week}`}
          sublabel={`CASH $${roundMoney(cash)} · SAVE $${roundMoney(savings)} · DEBT $${roundMoney(debt)}`}
          detail={`COMFORT ${comfort}/10 · FREE TIME ${freeTime}/10`}
          near={nearStation === 'recap'}
          accent="#ffd700"
          actionLabel={week === TOTAL_PAYCHECK_WEEKS ? 'SEE FINAL RESULT · E / TAP' : 'START NEXT WEEK · E / TAP'}
          onActivate={finishWeek}
        />
      )}

      {active && phase === 'complete' && (
        <InteractiveStation
          x={0}
          label="MODULE 5 COMPLETE"
          sublabel={`$${roundMoney(savings)} SAVED · $${roundMoney(debt)} DEBT`}
          detail="NO TELEPORT · WALK TO MODULE 6"
          near={nearStation === 'finish'}
          accent="#00dca0"
          actionLabel="FINISH MODULE 5 · E / TAP"
          onActivate={finishModule}
        />
      )}

      <CelebrationBurst active={active && phase === 'complete'} />
    </group>
  )
}
