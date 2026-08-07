import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, RoundedBox } from '@react-three/drei'
import { TAX_DISTRICT } from './config.js'
import { labelTexture } from './textures.js'
import { TAX_CASES, TOTAL_TAX_STEPS, filingStepFor, taxResultSummary } from '../scenarios/paycheckPlanet.js'
import { PAYCHECK_MODE_EVENT, isPaycheckWorldActive } from './paycheckMode.js'
import { useTaxLab } from './taxLabStore.js'

export const TAX_ENTRY = [TAX_DISTRICT[0], TAX_DISTRICT[1] + 3.3]
const STATION_Z = 3.9
const PATH_START_Z = 1.35

const money = (value) => `$${Math.max(0, Math.round(Number(value || 0))).toLocaleString('en-US')}`

function AnimatedStation({ x, label, sublabel, accent = '#ff8a3d', onActivate }) {
  const group = useRef()
  const time = useRef(Math.random() * 5)
  const [hovered, setHovered] = useState(false)

  useFrame((_, delta) => {
    time.current += delta
    if (!group.current) return
    group.current.position.y = 0.1 + Math.sin(time.current * 3) * 0.06
    group.current.rotation.y = Math.sin(time.current * 1.05) * 0.025
  })

  return (
    <group ref={group} position={[x, 0, STATION_Z]}>
      <RoundedBox
        args={[2.1, 0.34, 1.55]}
        radius={0.17}
        smoothness={3}
        position={[0, 0.2, 0]}
        onClick={(event) => { event?.stopPropagation?.(); onActivate?.() }}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = '' }}
      >
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={hovered ? 0.9 : 0.42} roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, 0.65, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.27, 0.27, 0.1, 18]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.45} metalness={0.25} />
      </mesh>
      <Billboard position={[0, 1.46, 0]}>
        <mesh>
          <planeGeometry args={[2.42, 0.68]} />
          <meshBasicMaterial map={labelTexture(label, { bg: '#071748', color: '#ffffff', accent })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>
      {sublabel && (
        <Billboard position={[0, 0.98, 0]}>
          <mesh>
            <planeGeometry args={[2.36, 0.55]} />
            <meshBasicMaterial map={labelTexture(sublabel, { bg: '#ffffff', color: '#071748', accent })} transparent toneMapped={false} depthTest={false} />
          </mesh>
        </Billboard>
      )}
    </group>
  )
}

function ChoicePath({ x }) {
  const dz = STATION_Z - PATH_START_Z
  const length = Math.hypot(x, dz)
  const angle = Math.atan2(x, dz)
  return (
    <mesh position={[x / 2, 0.052, (STATION_Z + PATH_START_Z) / 2]} rotation={[-Math.PI / 2, 0, -angle]} receiveShadow>
      <planeGeometry args={[0.42, length]} />
      <meshStandardMaterial color="#ff8a3d" emissive="#ff8a3d" emissiveIntensity={0.2} transparent opacity={0.72} />
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
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2
        const radius = 2 + (i % 4) * 0.27
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle * 2) * 0.7, Math.sin(angle) * radius]} rotation={[Math.PI / 2, angle, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.04, 14]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.75} metalness={0.35} />
          </mesh>
        )
      })}
    </group>
  )
}

function TaxMachineAnimation({ active, stepNumber, complete }) {
  const scanner = useRef()
  const paper = useRef()
  const stamp = useRef()
  const scale = useRef()
  const envelope = useRef()
  const clock = useRef(0)

  useFrame((_, delta) => {
    if (!active) return
    clock.current += delta
    const t = clock.current
    if (scanner.current) scanner.current.rotation.y = t * 1.4
    if (paper.current) {
      paper.current.position.z = 1.6 + Math.sin(t * 2.2) * 0.45
      paper.current.position.y = 1.45 + Math.sin(t * 3.4) * 0.08
    }
    if (stamp.current) stamp.current.position.y = 2.25 + Math.abs(Math.sin(t * 2.8)) * 0.42
    if (scale.current) scale.current.rotation.z = Math.sin(t * 1.8) * 0.08
    if (envelope.current) {
      envelope.current.position.y = 2.2 + Math.sin(t * 2.4) * 0.12
      envelope.current.rotation.y = Math.sin(t * 1.5) * 0.18
    }
  })

  return (
    <group position={[0, 0, 2.7]}>
      <RoundedBox args={[5.6, 0.42, 2]} radius={0.18} smoothness={3} position={[0, 0.35, 0]}>
        <meshStandardMaterial color="#0d245f" roughness={0.65} />
      </RoundedBox>
      <group ref={scanner} visible={stepNumber <= 2 && !complete} position={[-1.55, 1.15, 0]}>
        <RoundedBox args={[1.6, 1.15, 1.15]} radius={0.15} smoothness={3}>
          <meshStandardMaterial color="#1464f0" emissive="#1464f0" emissiveIntensity={0.25} />
        </RoundedBox>
      </group>
      <group ref={paper} visible={stepNumber <= 3 && !complete} position={[0, 1.45, 1.6]} rotation={[-0.25, 0, 0]}>
        <mesh><boxGeometry args={[1.35, 1.72, 0.08]} /><meshStandardMaterial color="#ffffff" /></mesh>
        <mesh position={[0, 0.45, 0.05]}><boxGeometry args={[0.9, 0.09, 0.02]} /><meshStandardMaterial color="#1464f0" /></mesh>
        <mesh position={[0, 0.12, 0.05]}><boxGeometry args={[0.72, 0.07, 0.02]} /><meshStandardMaterial color="#00b37f" /></mesh>
      </group>
      <group ref={stamp} visible={(stepNumber === 2 || stepNumber === 4) && !complete} position={[1.55, 2.25, 0]}>
        <mesh><cylinderGeometry args={[0.32, 0.4, 0.58, 18]} /><meshStandardMaterial color="#ff8a3d" emissive="#ff8a3d" emissiveIntensity={0.2} /></mesh>
      </group>
      <group ref={scale} visible={stepNumber === 5 && !complete} position={[0, 1.7, 0]}>
        <mesh><boxGeometry args={[3.2, 0.14, 0.16]} /><meshStandardMaterial color="#ffd700" metalness={0.35} /></mesh>
        <mesh position={[0, -0.8, 0]}><cylinderGeometry args={[0.15, 0.32, 1.55, 16]} /><meshStandardMaterial color="#071748" /></mesh>
      </group>
      <group ref={envelope} visible={(stepNumber === 6 || complete)} position={[0, 2.2, 0]}>
        <mesh rotation={[0, 0, -0.08]}><boxGeometry args={[1.9, 1.1, 0.12]} /><meshStandardMaterial color={complete ? '#00dca0' : '#fff3c4'} emissive={complete ? '#00dca0' : '#000000'} emissiveIntensity={complete ? 0.25 : 0} /></mesh>
      </group>
    </group>
  )
}

function ModuleBoard({ headline, line }) {
  return (
    <group>
      <Billboard position={[0, 5.05, 0.72]}>
        <mesh><planeGeometry args={[6.1, 0.95]} /><meshBasicMaterial map={labelTexture(headline, { bg: '#00dca0', color: '#071748', accent: '#ffd700' })} transparent toneMapped={false} depthTest={false} /></mesh>
      </Billboard>
      {line && <Billboard position={[0, 4.48, 0.76]}><mesh><planeGeometry args={[5.95, 0.66]} /><meshBasicMaterial map={labelTexture(line, { bg: '#ffffff', color: '#071748', accent: '#ff8a3d' })} transparent toneMapped={false} depthTest={false} /></mesh></Billboard>}
    </group>
  )
}

export function PaycheckPlanetWorld() {
  const [active, setActive] = useState(() => isPaycheckWorldActive())
  const phase = useTaxLab((s) => s.phase)
  const taxCase = useTaxLab((s) => s.taxCase)
  const stepNumber = useTaxLab((s) => s.stepNumber)

  useEffect(() => {
    const sync = (event) => setActive(event?.detail?.active ?? isPaycheckWorldActive())
    sync()
    window.addEventListener(PAYCHECK_MODE_EVENT, sync)
    return () => window.removeEventListener(PAYCHECK_MODE_EVENT, sync)
  }, [])

  const stations = phase === 'case'
    ? TAX_CASES.map((item) => ({ id: item.id, x: item.x, label: item.label, sublabel: `${money(item.wages)} WAGES`, action: () => useTaxLab.getState().chooseCase(item) }))
    : []

  const currentStep = taxCase ? filingStepFor(taxCase, stepNumber) : null
  const boardHeadline = !active
    ? 'PAYCHECK PLANET · TAX FILING LAB'
    : phase === 'intro' ? 'MODULE 5 · INTERACTIVE TAX WORKBENCH'
      : phase === 'case' ? 'OPEN A PRACTICE W-2 FOLDER'
        : phase === 'steps' ? `FILING STEP ${stepNumber} OF ${TOTAL_TAX_STEPS}`
          : 'PRACTICE RETURN FILED'
  const boardLine = !active
    ? 'SCAN · CALCULATE · APPLY · COMPARE · FILE'
    : phase === 'intro' ? 'Hands-on filing simulation'
      : phase === 'case' ? 'Three folders · three different tax outcomes'
        : phase === 'steps' && currentStep ? currentStep.title.toUpperCase()
          : taxResultSummary(taxCase)

  return (
    <group position={[TAX_DISTRICT[0], 0, TAX_DISTRICT[1]]}>
      <mesh position={[0, 0.025, 0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[5.4, 32]} /><meshStandardMaterial color="#fff0dc" roughness={1} /></mesh>
      <mesh position={[0, 0.032, 0.4]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[5.4, 5.9, 32]} /><meshStandardMaterial color="#ff8a3d" roughness={1} /></mesh>
      <RoundedBox args={[6.2, 4.2, 3.6]} radius={0.28} smoothness={4} position={[0, 2.1, -0.8]} castShadow><meshPhysicalMaterial color="#ffb36f" roughness={0.5} clearcoat={0.35} /></RoundedBox>
      <RoundedBox args={[6.7, 0.7, 4.1]} radius={0.22} smoothness={4} position={[0, 4.35, -0.8]} castShadow><meshStandardMaterial color="#071748" roughness={0.55} /></RoundedBox>
      <RoundedBox args={[1.55, 2.55, 0.18]} radius={0.12} smoothness={3} position={[0, 1.35, 1.04]} castShadow><meshStandardMaterial color="#1464f0" emissive="#1464f0" emissiveIntensity={active ? 0.42 : 0.12} /></RoundedBox>
      {[-2.05, 2.05].map((x) => <mesh key={x} position={[x, 2.25, 1.03]}><planeGeometry args={[1.35, 1.35]} /><meshStandardMaterial color="#d8f3ff" emissive="#9bdfff" emissiveIntensity={0.18} /></mesh>)}
      <Billboard position={[0, 6.15, 0]}><mesh><planeGeometry args={[6.8, 1.55]} /><meshBasicMaterial map={labelTexture('PAYCHECK PLANET · TAX LAB', { bg: '#071748', color: '#ffffff', accent: '#ff8a3d' })} transparent toneMapped={false} depthTest={false} /></mesh></Billboard>
      <ModuleBoard headline={boardHeadline} line={boardLine} />
      <TaxMachineAnimation active={active} stepNumber={stepNumber} complete={phase === 'complete'} />
      {active && stations.map((station, index) => <ChoicePath key={`path-${station.id}-${index}`} x={station.x} />)}
      {active && stations.map((station) => <AnimatedStation key={station.id} x={station.x} label={station.label} sublabel={station.sublabel} onActivate={station.action} />)}
      <CelebrationBurst active={active && phase === 'complete'} />
    </group>
  )
}
