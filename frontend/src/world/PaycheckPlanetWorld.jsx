import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, RoundedBox } from '@react-three/drei'
import { TAX_DISTRICT } from './config.js'
import { CharacterMesh } from './CharacterMesh.jsx'
import { labelTexture } from './textures.js'
import { TAX_CASES, TOTAL_TAX_STEPS, filingStepFor, taxResultSummary } from '../scenarios/paycheckPlanet.js'
import { PAYCHECK_MODE_EVENT, isPaycheckWorldActive } from './paycheckMode.js'
import { playerPos } from './store.js'
import { useTaxLab } from './taxLabStore.js'
import { TAX_CLIENTS, TAX_POINTS, TAX_STEP_STATIONS, taxStationForStep, toTaxLocal } from './taxDistrictLayout.js'

export const TAX_ENTRY = TAX_POINTS.guide
const INTERACT_RADIUS = 3.3

const money = (value) => `$${Math.max(0, Math.round(Number(value || 0))).toLocaleString('en-US')}`
const local = (point) => toTaxLocal(point)

function closeEnough(point) {
  return Math.hypot(point[0] - playerPos.x, point[1] - playerPos.z) <= INTERACT_RADIUS
}

function setTooFarNotice(label) {
  useTaxLab.getState().setFeedback(null)
  useTaxLab.setState({ worldNotice: `Walk closer to ${label} to interact.` })
}

function FloatingTag({ text, position = [0, 2.65, 0], accent = '#00dca0', width = 2.5 }) {
  return (
    <Billboard position={position}>
      <mesh>
        <planeGeometry args={[width, 0.62]} />
        <meshBasicMaterial map={labelTexture(text, { bg: '#071748', color: '#ffffff', accent })} transparent toneMapped={false} depthTest={false} />
      </mesh>
    </Billboard>
  )
}

function InteractiveTaxNpc({ name, point, avatar, accent = '#00dca0', active = true, selected = false, onActivate, bubble }) {
  const root = useRef()
  const mesh = useRef()
  const clock = useRef(Math.random() * 10)
  const [hovered, setHovered] = useState(false)
  const p = local(point)

  useFrame((_, delta) => {
    clock.current += delta
    if (!root.current) return
    root.current.position.y = Math.sin(clock.current * 2.2) * 0.035
    if (mesh.current) {
      mesh.current.rotation.y = Math.sin(clock.current * 0.55) * 0.18
      mesh.current.rotation.z = active ? Math.sin(clock.current * 2.7) * 0.018 : 0
    }
  })

  const activate = (event) => {
    event?.stopPropagation?.()
    if (!active) return
    if (!closeEnough(point)) {
      setTooFarNotice(name)
      return
    }
    onActivate?.()
  }

  return (
    <group
      ref={root}
      position={p}
      onClick={activate}
      onPointerOver={() => { if (active) { setHovered(true); document.body.style.cursor = 'pointer' } }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = '' }}
    >
      <group scale={selected ? 1.08 : hovered ? 1.04 : 1}>
        <CharacterMesh ref={mesh} avatar={avatar} />
      </group>
      <FloatingTag text={selected ? `${name} · YOUR CASE` : name} accent={selected ? '#ffd700' : accent} width={selected ? 3.2 : 2.15} />
      {active && (
        <mesh position={[0, 3.18, 0]}>
          <sphereGeometry args={[hovered ? 0.19 : 0.15, 16, 16]} />
          <meshStandardMaterial color={selected ? '#ffd700' : '#00dca0'} emissive={selected ? '#ffd700' : '#00dca0'} emissiveIntensity={0.75} />
        </mesh>
      )}
      {bubble && (
        <Billboard position={[0, 3.65, 0]}>
          <mesh>
            <planeGeometry args={[3.4, 0.7]} />
            <meshBasicMaterial map={labelTexture(bubble, { bg: '#ffffff', color: '#071748', accent })} transparent toneMapped={false} depthTest={false} />
          </mesh>
        </Billboard>
      )}
    </group>
  )
}

function RovingTaxWorker({ route, avatar, name = 'Leo · Tax Lab', paperColor = '#fff7dc' }) {
  const root = useRef()
  const person = useRef()
  const paper = useRef()
  const progress = useRef(0)
  const index = useRef(0)
  const wait = useRef(0)
  const worldRoute = useMemo(() => route.map((point) => local(point)), [route])

  useFrame((_, delta) => {
    const node = root.current
    if (!node || worldRoute.length < 2) return
    if (wait.current > 0) {
      wait.current -= delta
      if (person.current) person.current.rotation.z = Math.sin(Date.now() / 180) * 0.02
      return
    }
    const a = worldRoute[index.current]
    const b = worldRoute[(index.current + 1) % worldRoute.length]
    progress.current += delta * 0.18
    const t = Math.min(1, progress.current)
    const x = a[0] + (b[0] - a[0]) * t
    const z = a[2] + (b[2] - a[2]) * t
    node.position.set(x, Math.abs(Math.sin(t * Math.PI * 10)) * 0.035, z)
    node.rotation.y = Math.atan2(b[0] - a[0], b[2] - a[2])
    if (paper.current) paper.current.rotation.z = Math.sin(Date.now() / 250) * 0.08
    if (t >= 1) {
      index.current = (index.current + 1) % worldRoute.length
      progress.current = 0
      wait.current = 0.8 + (index.current % 2) * 0.55
    }
  })

  return (
    <group ref={root} position={worldRoute[0]}>
      <CharacterMesh ref={person} avatar={avatar} />
      <group ref={paper} position={[0.38, 1.18, 0.25]} rotation={[0.15, 0.1, -0.2]}>
        <mesh><boxGeometry args={[0.36, 0.48, 0.035]} /><meshStandardMaterial color={paperColor} /></mesh>
        <mesh position={[0, 0.1, 0.021]}><boxGeometry args={[0.22, 0.025, 0.01]} /><meshStandardMaterial color="#1464f0" /></mesh>
        <mesh position={[0, 0.02, 0.021]}><boxGeometry args={[0.18, 0.02, 0.01]} /><meshStandardMaterial color="#00b37f" /></mesh>
      </group>
      <FloatingTag text={name} accent="#ff8a3d" width={2.8} />
    </group>
  )
}

function DeskWorker({ point, avatar, label }) {
  const root = useRef()
  const stamp = useRef()
  const clock = useRef(Math.random() * 6)
  const p = local(point)
  useFrame((_, delta) => {
    clock.current += delta
    if (root.current) root.current.rotation.y = Math.sin(clock.current * 0.42) * 0.16
    if (stamp.current) stamp.current.position.y = 1.15 + Math.abs(Math.sin(clock.current * 2.8)) * 0.28
  })
  return (
    <group ref={root} position={[p[0] + 0.9, 0, p[2] - 0.65]}>
      <CharacterMesh avatar={avatar} />
      <group ref={stamp} position={[-0.38, 1.15, 0.3]}>
        <mesh><cylinderGeometry args={[0.1, 0.13, 0.25, 12]} /><meshStandardMaterial color="#ff8a3d" /></mesh>
      </group>
      <FloatingTag text={label} accent="#7850f0" width={2.45} />
    </group>
  )
}

function StationProp({ stationKey, active }) {
  const motion = useRef()
  const clock = useRef(0)
  useFrame((_, delta) => {
    clock.current += delta
    if (!motion.current) return
    if (stationKey === 'w2') motion.current.position.y = 0.75 + Math.sin(clock.current * 3) * 0.1
    if (stationKey === 'deduction') motion.current.position.y = 0.9 + Math.abs(Math.sin(clock.current * 2.5)) * 0.35
    if (stationKey === 'brackets') motion.current.rotation.y += delta * 0.9
    if (stationKey === 'credit') motion.current.rotation.z = clock.current * 0.7
    if (stationKey === 'reconcile') motion.current.rotation.z = Math.sin(clock.current * 1.7) * 0.14
    if (stationKey === 'filing') motion.current.position.z = Math.sin(clock.current * 2.1) * 0.22
  })

  if (stationKey === 'w2') {
    return <group ref={motion} position={[0, 0.75, 0]}><mesh><boxGeometry args={[0.9, 1.15, 0.05]} /><meshStandardMaterial color="#ffffff" emissive={active ? '#9bdfff' : '#000000'} emissiveIntensity={active ? 0.18 : 0} /></mesh></group>
  }
  if (stationKey === 'deduction') {
    return <group ref={motion} position={[0, 0.9, 0]}><mesh><cylinderGeometry args={[0.22, 0.3, 0.5, 16]} /><meshStandardMaterial color="#ff8a3d" /></mesh></group>
  }
  if (stationKey === 'brackets') {
    return <group ref={motion} position={[0, 0.85, 0]}>{[0, 1, 2].map((i) => <mesh key={i} position={[Math.cos(i * 2.1) * 0.45, 0, Math.sin(i * 2.1) * 0.45]}><cylinderGeometry args={[0.18, 0.18, 0.05, 16]} /><meshStandardMaterial color="#ffd700" metalness={0.35} /></mesh>)}</group>
  }
  if (stationKey === 'credit') {
    return <group ref={motion} position={[0, 0.9, 0]}><mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.38, 0.1, 12, 24]} /><meshStandardMaterial color="#00dca0" emissive="#00dca0" emissiveIntensity={active ? 0.4 : 0.1} /></mesh></group>
  }
  if (stationKey === 'reconcile') {
    return <group ref={motion} position={[0, 0.92, 0]}><mesh><boxGeometry args={[1.2, 0.08, 0.12]} /><meshStandardMaterial color="#ffd700" /></mesh><mesh position={[0, -0.45, 0]}><cylinderGeometry args={[0.08, 0.18, 0.8, 12]} /><meshStandardMaterial color="#071748" /></mesh></group>
  }
  return <group ref={motion} position={[0, 0.88, 0]}><mesh><boxGeometry args={[0.95, 0.58, 0.08]} /><meshStandardMaterial color="#fff3c4" emissive={active ? '#00dca0' : '#000000'} emissiveIntensity={active ? 0.18 : 0} /></mesh></group>
}

function TaxStation({ step, station, currentStep, phase }) {
  const p = local(station.point)
  const [hovered, setHovered] = useState(false)
  const isCurrent = phase === 'steps' && step === currentStep
  const complete = phase === 'complete' || (phase === 'steps' && step < currentStep)

  const activate = (event) => {
    event?.stopPropagation?.()
    if (!isPaycheckWorldActive()) return
    if (!closeEnough(station.point)) {
      setTooFarNotice(station.label)
      return
    }
    useTaxLab.getState().openStation(step)
  }

  return (
    <group
      position={p}
      onClick={activate}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = '' }}
    >
      <RoundedBox args={[2.15, 0.32, 1.55]} radius={0.17} smoothness={3} position={[0, 0.2, 0]}>
        <meshStandardMaterial
          color={complete ? '#00b37f' : isCurrent ? '#1464f0' : '#d7deea'}
          emissive={isCurrent || hovered ? (isCurrent ? '#1464f0' : '#8492a6') : '#000000'}
          emissiveIntensity={isCurrent ? 0.55 : hovered ? 0.2 : 0}
          roughness={0.6}
        />
      </RoundedBox>
      <StationProp stationKey={station.key} active={isCurrent} />
      <FloatingTag text={`${step}. ${station.label}`} position={[0, 1.72, 0]} accent={complete ? '#00dca0' : isCurrent ? '#ffd700' : '#9aa6b6'} width={2.7} />
      {isCurrent && <FloatingTag text="NEXT · WALK HERE" position={[0, 2.3, 0]} accent="#ffd700" width={2.6} />}
      {complete && <mesh position={[0.82, 0.58, 0.48]}><sphereGeometry args={[0.16, 16, 16]} /><meshStandardMaterial color="#00dca0" emissive="#00dca0" emissiveIntensity={0.7} /></mesh>}
    </group>
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
    <group ref={group} position={[0, 5.1, 1.6]}>
      {Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * Math.PI * 2
        const radius = 2.2 + (i % 4) * 0.3
        return <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle * 2) * 0.8, Math.sin(angle) * radius]}><sphereGeometry args={[0.1, 8, 8]} /><meshStandardMaterial color={i % 2 ? '#ffd700' : '#00dca0'} emissive={i % 2 ? '#ffd700' : '#00dca0'} emissiveIntensity={0.7} /></mesh>
      })}
    </group>
  )
}

function ModuleBoard({ headline, line }) {
  return (
    <group>
      <Billboard position={[0, 6.25, 0.2]}>
        <mesh><planeGeometry args={[7.2, 1.05]} /><meshBasicMaterial map={labelTexture(headline, { bg: '#071748', color: '#ffffff', accent: '#ffd700' })} transparent toneMapped={false} depthTest={false} /></mesh>
      </Billboard>
      {line && <Billboard position={[0, 5.62, 0.22]}><mesh><planeGeometry args={[6.7, 0.68]} /><meshBasicMaterial map={labelTexture(line, { bg: '#ffffff', color: '#071748', accent: '#00dca0' })} transparent toneMapped={false} depthTest={false} /></mesh></Billboard>}
    </group>
  )
}

export function PaycheckPlanetWorld() {
  const [active, setActive] = useState(() => isPaycheckWorldActive())
  const phase = useTaxLab((s) => s.phase)
  const taxCase = useTaxLab((s) => s.taxCase)
  const stepNumber = useTaxLab((s) => s.stepNumber)
  const worldNotice = useTaxLab((s) => s.worldNotice)

  useEffect(() => {
    const sync = (event) => setActive(event?.detail?.active ?? isPaycheckWorldActive())
    sync()
    window.addEventListener(PAYCHECK_MODE_EVENT, sync)
    return () => window.removeEventListener(PAYCHECK_MODE_EVENT, sync)
  }, [])

  const currentStep = taxCase ? filingStepFor(taxCase, stepNumber) : null
  const selectedClient = TAX_CLIENTS.find((client) => client.caseId === taxCase?.id)
  const boardHeadline = !active
    ? 'PAYCHECK PLANET · TAX FILING LAB'
    : phase === 'intro' ? 'TALK TO MAYA TO START'
      : phase === 'case' ? 'MEET A TAXPAYER · PICK A CASE'
        : phase === 'steps' ? `IN-WORLD FILING · STEP ${stepNumber} OF ${TOTAL_TAX_STEPS}`
          : 'PRACTICE RETURN FILED'
  const boardLine = !active
    ? 'WALK IN · HELP A CLIENT · MAKE THE FILING DECISIONS'
    : phase === 'intro' ? 'No teleport · this Tax Lab stays inside TAYU town'
      : phase === 'case' ? 'Talk to Ari, Sam, or Jordan before you know the outcome'
        : phase === 'steps' && currentStep ? `${currentStep.title} · then walk to the next station`
          : taxResultSummary(taxCase)

  const guideAvatar = { gender: 'female', bodyType: 'average', skinTone: 'warm_beige', hairStyle: 'long', hairColor: 'brown', shirtColor: 'teal', pantsColor: 'blue', topStyle: 'tee', bottomStyle: 'pants' }
  const clerkAvatar = { gender: 'male', bodyType: 'athletic', skinTone: 'medium_brown', hairStyle: 'short', hairColor: 'black', shirtColor: 'orange', pantsColor: 'blue', topStyle: 'tee', bottomStyle: 'pants' }
  const deskAvatar = { gender: 'neutral', bodyType: 'average', skinTone: 'deep_brown', hairStyle: 'curly', hairColor: 'black', shirtColor: 'purple', pantsColor: 'gray', topStyle: 'hoodie', bottomStyle: 'pants' }

  return (
    <group position={[TAX_DISTRICT[0], 0, TAX_DISTRICT[1]]}>
      <mesh position={[0, 0.02, 0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[7.35, 40]} /><meshStandardMaterial color="#fff0dc" roughness={1} /></mesh>
      <mesh position={[0, 0.03, 0.6]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[7.35, 7.75, 40]} /><meshStandardMaterial color="#ff8a3d" roughness={1} /></mesh>
      <RoundedBox args={[5.4, 3.35, 3]} radius={0.28} smoothness={4} position={[0, 1.72, 0.25]} castShadow><meshPhysicalMaterial color="#ffb36f" roughness={0.52} clearcoat={0.28} /></RoundedBox>
      <RoundedBox args={[5.85, 0.6, 3.4]} radius={0.22} smoothness={4} position={[0, 3.65, 0.25]} castShadow><meshStandardMaterial color="#071748" roughness={0.55} /></RoundedBox>
      <RoundedBox args={[1.45, 2.2, 0.16]} radius={0.12} smoothness={3} position={[0, 1.22, 1.78]} castShadow><meshStandardMaterial color="#1464f0" emissive="#1464f0" emissiveIntensity={active ? 0.28 : 0.08} /></RoundedBox>
      <Billboard position={[0, 4.72, 0.4]}><mesh><planeGeometry args={[5.9, 1.25]} /><meshBasicMaterial map={labelTexture('PAYCHECK PLANET · TAX LAB', { bg: '#071748', color: '#ffffff', accent: '#ff8a3d' })} transparent toneMapped={false} depthTest={false} /></mesh></Billboard>
      <ModuleBoard headline={boardHeadline} line={boardLine} />

      {Object.entries(TAX_STEP_STATIONS).map(([step, station]) => (
        <TaxStation key={station.key} step={Number(step)} station={station} currentStep={stepNumber} phase={phase} />
      ))}

      <InteractiveTaxNpc
        name="Maya · Tax Guide"
        point={TAX_POINTS.guide}
        avatar={guideAvatar}
        accent="#00dca0"
        active={active}
        bubble={active && phase === 'intro' ? 'START HERE · TALK TO ME' : active && phase === 'complete' ? 'NICE WORK!' : null}
        onActivate={() => useTaxLab.getState().openGuide()}
      />

      {TAX_CLIENTS.map((client, index) => {
        const caseInfo = TAX_CASES.find((item) => item.id === client.caseId)
        const isSelected = selectedClient?.caseId === client.caseId
        const clientAvatar = {
          gender: index === 1 ? 'male' : index === 2 ? 'female' : 'neutral',
          bodyType: index === 1 ? 'athletic' : 'average',
          skinTone: index === 0 ? 'light_tan' : index === 1 ? 'medium_brown' : 'cream',
          hairStyle: index === 0 ? 'curly' : index === 1 ? 'short' : 'long',
          hairColor: index === 2 ? 'brown' : 'black',
          shirtColor: index === 0 ? 'green' : index === 1 ? 'blue' : 'purple',
          pantsColor: index === 0 ? 'denim' : index === 1 ? 'gray' : 'black',
          topStyle: index === 1 ? 'hoodie' : 'tee',
          bottomStyle: 'pants',
        }
        return (
          <InteractiveTaxNpc
            key={client.caseId}
            name={client.name}
            point={client.point}
            avatar={clientAvatar}
            accent={isSelected ? '#ffd700' : '#7850f0'}
            selected={isSelected}
            active={active && phase === 'case'}
            bubble={active && phase === 'case' ? `${money(caseInfo?.wages)} W-2` : null}
            onActivate={() => caseInfo && useTaxLab.getState().previewClient(caseInfo)}
          />
        )
      })}

      {active && (
        <>
          <RovingTaxWorker
            name="Leo · carrying returns"
            route={[TAX_POINTS.w2, TAX_POINTS.deduction, TAX_POINTS.brackets, TAX_POINTS.credit, TAX_POINTS.reconcile, TAX_POINTS.filing]}
            avatar={clerkAvatar}
          />
          <DeskWorker point={TAX_POINTS.brackets} avatar={deskAvatar} label="Nia · checking math" />
          <RovingTaxWorker
            name="Rae · delivering W-2s"
            route={[TAX_POINTS.clientLeft, TAX_POINTS.clientMiddle, TAX_POINTS.clientRight, TAX_POINTS.guide]}
            avatar={{ ...guideAvatar, shirtColor: 'yellow', hairStyle: 'short', hairColor: 'black' }}
            paperColor="#e8f6ff"
          />
        </>
      )}

      {active && worldNotice && (
        <Billboard position={[0, 7.05, 0.1]}>
          <mesh><planeGeometry args={[7.4, 0.72]} /><meshBasicMaterial map={labelTexture(worldNotice, { bg: '#1464f0', color: '#ffffff', accent: '#ffd700' })} transparent toneMapped={false} depthTest={false} /></mesh>
        </Billboard>
      )}

      <CelebrationBurst active={active && phase === 'complete'} />
    </group>
  )
}
