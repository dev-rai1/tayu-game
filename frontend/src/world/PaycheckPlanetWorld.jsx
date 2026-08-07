import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, RoundedBox } from '@react-three/drei'
import { TAX_DISTRICT } from './config.js'
import { playerPos, useGame } from './store.js'
import { labelTexture } from './textures.js'
import { loadProfile, saveProfile } from '../services/walletStore.js'
import { recordLearningEvent } from '../services/usageAnalytics.js'
import {
  PAYCHECK_MODE_EVENT,
  activatePaycheckWorld,
  deactivatePaycheckWorld,
  isPaycheckWorldActive,
} from './paycheckMode.js'

export const TAX_ENTRY = [TAX_DISTRICT[0], TAX_DISTRICT[1] + 3.4]
const ENTRY_RADIUS = 4.2
const STATION_RADIUS = 2.85
const REPAIR_COST = 32

const JOBS = [
  { id: 'library', label: 'LIBRARY HELPER', gross: 120, rate: 0.10, x: -3.1, z: 5.1 },
  { id: 'camp', label: 'CAMP ASSISTANT', gross: 160, rate: 0.15, x: 0, z: 5.1 },
  { id: 'design', label: 'DESIGN GIG', gross: 200, rate: 0.20, x: 3.1, z: 5.1 },
]

const PLANS = [
  { id: 'spend', label: 'SPEND MOST', spend: 0.70, save: 0.15, future: 0.15, x: -3.1, z: 8.6 },
  { id: 'balanced', label: 'BALANCED PLAN', spend: 0.40, save: 0.25, future: 0.35, x: 0, z: 8.6 },
  { id: 'future', label: 'PLAN AHEAD', spend: 0.25, save: 0.25, future: 0.50, x: 3.1, z: 8.6 },
]

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

function showLesson(text, key) {
  try { useGame.getState().showLesson(text, key, true, 'tax') } catch { /* world can still continue */ }
}

function InteractiveStation({ x, z, label, sublabel, active, near, accent = '#00dca0', onActivate }) {
  const group = useRef()
  const time = useRef(Math.random() * 4)

  useFrame((_, delta) => {
    time.current += delta
    if (!group.current) return
    group.current.position.y = active ? 0.12 + Math.sin(time.current * 3) * 0.09 : 0
    group.current.rotation.y = active ? Math.sin(time.current * 1.2) * 0.035 : 0
  })

  const activate = (event) => {
    event?.stopPropagation?.()
    if (!active) return
    if (distanceTo(x, z) > STATION_RADIUS + 0.8) {
      setToast('Walk a little closer to the glowing station.')
      return
    }
    onActivate?.()
  }

  return (
    <group ref={group} position={[x, 0, z]}>
      <RoundedBox
        args={[2.45, 0.42, 2.05]}
        radius={0.18}
        smoothness={3}
        position={[0, 0.23, 0]}
        onClick={activate}
        onPointerOver={() => { if (active) document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = '' }}
      >
        <meshStandardMaterial
          color={active ? accent : '#394567'}
          emissive={active ? accent : '#111936'}
          emissiveIntensity={active ? (near ? 0.9 : 0.38) : 0.05}
          roughness={0.55}
        />
      </RoundedBox>
      <mesh position={[0, 0.78, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.36, 0.36, 0.12, 18]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={active ? 0.6 : 0.08} metalness={0.35} />
      </mesh>
      <Billboard position={[0, 1.65, 0]}>
        <mesh>
          <planeGeometry args={[3.1, 0.96]} />
          <meshBasicMaterial map={labelTexture(label, { bg: active ? '#071748' : '#263252', color: '#ffffff', accent })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>
      {sublabel && (
        <Billboard position={[0, 1.03, 0]}>
          <mesh>
            <planeGeometry args={[2.55, 0.8]} />
            <meshBasicMaterial map={labelTexture(sublabel, { bg: '#ffffff', color: '#071748', accent })} transparent toneMapped={false} depthTest={false} />
          </mesh>
        </Billboard>
      )}
      {active && near && (
        <Billboard position={[0, 2.28, 0]}>
          <mesh>
            <planeGeometry args={[2.2, 0.68]} />
            <meshBasicMaterial map={labelTexture('PRESS E / TAP', { bg: '#00dca0', color: '#071748', accent: '#ffd700' })} transparent toneMapped={false} depthTest={false} />
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
    group.current.rotation.x = Math.sin(Date.now() / 850) * 0.08
  })
  if (!active) return null
  return (
    <group ref={group} position={[0, 4.8, 3.8]}>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2
        const r = 2.2 + (i % 3) * 0.45
        return (
          <mesh key={i} position={[Math.cos(a) * r, Math.sin(a * 2) * 0.8, Math.sin(a) * r]} rotation={[Math.PI / 2, a, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.045, 14]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.8} metalness={0.4} />
          </mesh>
        )
      })}
    </group>
  )
}

export function PaycheckPlanetWorld() {
  const [active, setActive] = useState(() => isPaycheckWorldActive())
  const [phase, setPhase] = useState('job')
  const [job, setJob] = useState(null)
  const [plan, setPlan] = useState(null)
  const [nearEntrance, setNearEntrance] = useState(false)
  const [nearStation, setNearStation] = useState('')
  const nearEntranceRef = useRef(false)
  const nearStationRef = useRef('')

  const tax = job ? Math.round(job.gross * job.rate) : 0
  const takeHome = job ? job.gross - tax : 0
  const futureFund = plan && takeHome ? Math.round(takeHome * plan.future) : 0

  const stations = useMemo(() => {
    if (!active) return []
    if (phase === 'job') return JOBS.map((item) => ({ id: `job:${item.id}`, x: item.x, z: item.z }))
    if (phase === 'tax') return [{ id: 'withhold', x: 0, z: 5.1 }]
    if (phase === 'plan') return PLANS.map((item) => ({ id: `plan:${item.id}`, x: item.x, z: item.z }))
    if (phase === 'event') return [{ id: 'repair', x: 0, z: 11.4 }]
    if (phase === 'complete') return [{ id: 'continue', x: 0, z: 11.4 }]
    return []
  }, [active, phase])

  useEffect(() => {
    const sync = (event) => setActive(event?.detail?.active ?? isPaycheckWorldActive())
    sync()
    window.addEventListener(PAYCHECK_MODE_EVENT, sync)
    return () => window.removeEventListener(PAYCHECK_MODE_EVENT, sync)
  }, [])

  useEffect(() => {
    if (!active) return
    setPhase('job')
    setJob(null)
    setPlan(null)
    try { useGame.getState().adminClearUi() } catch { /* no-op */ }
    setToast('Paycheck Planet is live in the world. Walk to a glowing job station.')
    showLesson('Welcome to Paycheck Planet! Pick a job, watch taxes come out of the paycheck, plan the take-home pay, then handle a real surprise expense. Everything happens right here in the world.', 'tax-world-intro')
    recordLearningEvent({ moduleName: 'tax', type: 'module_start', outcome: 'started', detail: 'in_world_3d' }).catch(() => {})
  }, [active])

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
    if (phase !== 'job') return
    const withheld = Math.round(selected.gross * selected.rate)
    const net = selected.gross - withheld
    setJob(selected)
    setPhase('tax')
    pushCoins(worldPoint(selected.x, selected.z, 1.1), { x: playerPos.x, y: 1.1, z: playerPos.z }, 9, 'gross-pay')
    setToast(`${selected.label}: $${selected.gross} gross pay. Next, visit WITHHOLD TAX.`)
    showLesson(`Gross pay is the full $${selected.gross}. At this job, ${Math.round(selected.rate * 100)}% ($${withheld}) is withheld for taxes, leaving $${net} of take-home pay.`, `tax-job-${selected.id}`)
    recordLearningEvent({ moduleName: 'tax', type: 'job_choice', outcome: selected.id, detail: `gross=${selected.gross};rate=${selected.rate}` }).catch(() => {})
  }, [phase])

  const withholdTax = useCallback(() => {
    if (phase !== 'tax' || !job) return
    pushCoins({ x: playerPos.x, y: 1.1, z: playerPos.z }, worldPoint(0, -0.5, 1.8), Math.max(3, Math.round(tax / 8)), 'tax-withheld')
    setPhase('plan')
    setToast(`$${tax} withheld. You actually take home $${takeHome}. Choose a plan for that money.`)
    showLesson(`PAYCHECK MATH: $${job.gross} gross − $${tax} taxes = $${takeHome} take-home pay. Plan the money you actually receive, not the larger gross number.`, `tax-math-${job.id}`)
    recordLearningEvent({ moduleName: 'tax', type: 'withholding', outcome: 'completed', detail: `tax=${tax};takeHome=${takeHome}` }).catch(() => {})
  }, [job, phase, takeHome, tax])

  const choosePlan = useCallback((selected) => {
    if (phase !== 'plan' || !job) return
    setPlan(selected)
    setPhase('event')
    const future = Math.round(takeHome * selected.future)
    setToast(`${selected.label}: $${future} set aside for a future expense. A surprise is waiting ahead.`)
    recordLearningEvent({ moduleName: 'tax', type: 'allocation_choice', outcome: selected.id, detail: `futureFund=${future};takeHome=${takeHome}` }).catch(() => {})
  }, [job, phase, takeHome])

  const handleRepair = useCallback(() => {
    if (phase !== 'event' || !plan) return
    if (futureFund < REPAIR_COST) {
      setToast(`Bike repair costs $${REPAIR_COST}, but this plan left only $${futureFund} for the future. Replan and try again.`)
      showLesson(`The surprise costs $${REPAIR_COST}. Your future fund had $${futureFund}, so this plan could not cover it. Walk back and choose a plan that leaves a bigger cushion.`, `tax-retry-${plan.id}-${job?.id || 'job'}`)
      recordLearningEvent({ moduleName: 'tax', type: 'future_expense', outcome: 'retry', detail: `needed=${REPAIR_COST};available=${futureFund}` }).catch(() => {})
      setPlan(null)
      setPhase('plan')
      return
    }

    const remaining = futureFund - REPAIR_COST
    pushCoins({ x: playerPos.x, y: 1.1, z: playerPos.z }, worldPoint(0, 11.4, 0.7), 6, 'future-expense')
    setPhase('complete')
    const profile = loadProfile() || {}
    const badges = [...new Set([...(profile.badges || []), 'tax'])]
    saveProfile({
      badges,
      taxLab: {
        job: job?.id,
        gross: job?.gross,
        taxRate: job?.rate,
        tax,
        takeHome,
        plan: plan.id,
        futureFund,
        repairCost: REPAIR_COST,
        remaining,
        completedAt: new Date().toISOString(),
      },
    })
    pushCoins(worldPoint(0, -0.5, 2.1), { x: playerPos.x, y: 1.1, z: playerPos.z }, 12, 'tax-complete')
    setToast(`Paycheck Planet complete! You covered the $${REPAIR_COST} surprise and still have $${remaining} in the future fund.`)
    showLesson(`You did it: gross pay became take-home pay after taxes, then your plan handled a $${REPAIR_COST} surprise. That cushion is why planning ahead matters.`, `tax-complete-${job?.id || 'job'}`)
    recordLearningEvent({ moduleName: 'tax', type: 'future_expense', outcome: 'covered', detail: `needed=${REPAIR_COST};available=${futureFund};remaining=${remaining}` }).catch(() => {})
    recordLearningEvent({ moduleName: 'tax', type: 'module_complete', outcome: 'completed', detail: 'in_world_3d' }).catch(() => {})
  }, [futureFund, job, phase, plan, takeHome, tax])

  const continueToGarden = useCallback(() => {
    if (phase !== 'complete') return
    deactivatePaycheckWorld()
    const game = useGame.getState()
    try { game.adminJumpModule(5) } catch { /* fall through to normal world */ }
    setTimeout(() => {
      try { useGame.getState().showLesson('Module 5 complete. Now head into Module 6: Money Garden and use the money you planned to think about investing for longer-term goals.', 'paycheck-to-garden-world', true, 'garden') } catch { /* no-op */ }
    }, 250)
  }, [phase])

  const runStation = useCallback((id) => {
    if (!id) return
    if (id.startsWith('job:')) chooseJob(JOBS.find((item) => item.id === id.slice(4)))
    else if (id === 'withhold') withholdTax()
    else if (id.startsWith('plan:')) choosePlan(PLANS.find((item) => item.id === id.slice(5)))
    else if (id === 'repair') handleRepair()
    else if (id === 'continue') continueToGarden()
  }, [chooseJob, choosePlan, continueToGarden, handleRepair, withholdTax])

  useEffect(() => {
    const interact = (event) => {
      if (event.type === 'keydown' && event.code !== 'KeyE' && event.code !== 'Enter') return
      if (!active) {
        if (!nearEntranceRef.current) return
        activatePaycheckWorld()
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
    : phase === 'job' ? '1 · CHOOSE A JOB'
      : phase === 'tax' ? '2 · WATCH TAXES COME OUT'
        : phase === 'plan' ? '3 · PLAN YOUR TAKE-HOME PAY'
          : phase === 'event' ? `4 · SURPRISE: BIKE REPAIR $${REPAIR_COST}`
            : 'MODULE 5 COMPLETE!'

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
          <planeGeometry args={[4.8, 1.5]} />
          <meshBasicMaterial map={labelTexture('JOBS · TAXES · TAKE-HOME PAY', { bg: '#ff8a3d', color: '#071748', accent: '#ffffff' })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>
      <Billboard position={[0, 3.0, 2.55]}>
        <mesh>
          <planeGeometry args={[5.2, 1.34]} />
          <meshBasicMaterial map={labelTexture(phaseHeadline, { bg: active ? '#00dca0' : '#071748', color: active ? '#071748' : '#ffffff', accent: '#ffd700' })} transparent toneMapped={false} depthTest={false} />
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

      {JOBS.map((item) => (
        <InteractiveStation
          key={item.id}
          x={item.x}
          z={item.z}
          label={item.label}
          sublabel={`$${item.gross} GROSS · ${Math.round(item.rate * 100)}% TAX`}
          active={active && phase === 'job'}
          near={nearStation === `job:${item.id}`}
          accent="#ff8a3d"
          onActivate={() => chooseJob(item)}
        />
      ))}

      <InteractiveStation
        x={0}
        z={5.1}
        label="WITHHOLD TAX"
        sublabel={job ? `$${job.gross} − $${tax} = $${takeHome}` : 'GROSS − TAX = TAKE-HOME'}
        active={active && phase === 'tax'}
        near={nearStation === 'withhold'}
        accent="#1464f0"
        onActivate={withholdTax}
      />

      {PLANS.map((item) => (
        <InteractiveStation
          key={item.id}
          x={item.x}
          z={item.z}
          label={item.label}
          sublabel={takeHome ? `$${Math.round(takeHome * item.future)} FOR FUTURE` : `${Math.round(item.future * 100)}% FOR FUTURE`}
          active={active && phase === 'plan'}
          near={nearStation === `plan:${item.id}`}
          accent="#7850f0"
          onActivate={() => choosePlan(item)}
        />
      ))}

      <InteractiveStation
        x={0}
        z={11.4}
        label={phase === 'complete' ? 'CONTINUE TO MONEY GARDEN' : `BIKE REPAIR · $${REPAIR_COST}`}
        sublabel={phase === 'complete' ? 'MODULE 6 →' : plan ? `YOU SET ASIDE $${futureFund}` : 'CAN YOUR PLAN COVER IT?'}
        active={active && (phase === 'event' || phase === 'complete')}
        near={nearStation === (phase === 'complete' ? 'continue' : 'repair')}
        accent={phase === 'complete' ? '#00dca0' : '#ffd700'}
        onActivate={phase === 'complete' ? continueToGarden : handleRepair}
      />

      <CelebrationBurst active={active && phase === 'complete'} />
    </group>
  )
}
