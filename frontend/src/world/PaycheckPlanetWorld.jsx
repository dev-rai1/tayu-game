import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, RoundedBox } from '@react-three/drei'
import { INTERACT_RADIUS, TAX_DISTRICT } from './config.js'
import { CharacterMesh } from './CharacterMesh.jsx'
import { TAX_CASES } from '../scenarios/paycheckPlanet.js'
import { PAYCHECK_MODE_EVENT, isPaycheckWorldActive } from './paycheckMode.js'
import { playerPos } from './store.js'
import { TAX_WORLD_EVENT, useTaxLab } from './taxLabStore.js'
import { TAX_CLIENTS, TAX_POINTS, taxStationForStep, toTaxLocal } from './taxDistrictLayout.js'
import { labelTexture } from './textures.js'

export const TAX_ENTRY = TAX_POINTS.guide
const local = (point) => toTaxLocal(point)

function closeEnough(point) {
  return Math.hypot(point[0] - playerPos.x, point[1] - playerPos.z) <= INTERACT_RADIUS
}

function InteractionGlow({ active = true, selected = false }) {
  const glow = useRef()
  const clock = useRef(0)
  useFrame((_, delta) => {
    clock.current += delta
    if (!glow.current) return
    const pulse = 1 + Math.sin(clock.current * 4) * 0.16
    glow.current.scale.setScalar(pulse)
    glow.current.position.y = 2.8 + Math.sin(clock.current * 3) * 0.08
  })
  if (!active) return null
  return <mesh ref={glow} position={[0, 2.8, 0]}><sphereGeometry args={[selected ? 0.22 : 0.18, 16, 16]} /><meshStandardMaterial color={selected ? '#ffd700' : '#00dca0'} emissive={selected ? '#ffd700' : '#00dca0'} emissiveIntensity={0.9} /></mesh>
}

function InteractiveTaxNpc({ name, point, avatar, active = true, selected = false, reacting = false, onActivate }) {
  const root = useRef()
  const mesh = useRef()
  const clock = useRef(Math.random() * 10)
  const [hovered, setHovered] = useState(false)
  const p = local(point)
  useFrame((_, delta) => {
    clock.current += delta
    if (!root.current) return
    root.current.position.y = reacting ? Math.abs(Math.sin(clock.current * 7)) * 0.25 : Math.sin(clock.current * 2.2) * 0.035
    if (mesh.current) {
      mesh.current.rotation.y = reacting ? Math.sin(clock.current * 7.5) * 0.42 : Math.sin(clock.current * 0.55) * 0.18
      mesh.current.rotation.z = reacting ? Math.sin(clock.current * 9) * 0.07 : active ? Math.sin(clock.current * 2.7) * 0.018 : 0
    }
  })
  const activate = (event) => {
    event?.stopPropagation?.()
    if (!active || !closeEnough(point)) return
    onActivate?.()
  }
  return (
    <group ref={root} position={p} onClick={activate} onPointerOver={() => { if (!active) return; setHovered(true); document.body.style.cursor = 'pointer' }} onPointerOut={() => { setHovered(false); document.body.style.cursor = '' }} aria-label={name}>
      <group scale={selected ? 1.08 : hovered ? 1.04 : 1}><CharacterMesh ref={mesh} avatar={avatar} /></group>
      <InteractionGlow active={active} selected={selected} />
    </group>
  )
}

function StationProp({ stationKey, active, reacting = false }) {
  const motion = useRef()
  const clock = useRef(0)
  useFrame((_, delta) => {
    clock.current += delta
    if (!motion.current) return
    const speed = reacting ? 1.9 : 1
    if (stationKey === 'w2') motion.current.position.y = 0.75 + Math.sin(clock.current * 3 * speed) * (reacting ? 0.28 : 0.1)
    if (stationKey === 'deduction') motion.current.position.y = 0.9 + Math.abs(Math.sin(clock.current * 2.5 * speed)) * (reacting ? 0.65 : 0.35)
    if (stationKey === 'brackets') motion.current.rotation.y += delta * (reacting ? 2.7 : 0.9)
    if (stationKey === 'credit') motion.current.rotation.z = clock.current * (reacting ? 2.1 : 0.7)
    if (stationKey === 'reconcile') motion.current.rotation.z = Math.sin(clock.current * 1.7 * speed) * (reacting ? 0.4 : 0.14)
    if (stationKey === 'filing') motion.current.position.z = Math.sin(clock.current * 2.1 * speed) * (reacting ? 0.55 : 0.22)
  })
  if (stationKey === 'w2') return <group ref={motion} position={[0, 0.75, 0]}><mesh><boxGeometry args={[0.9, 1.15, 0.05]} /><meshStandardMaterial color="#ffffff" emissive={active ? '#9bdfff' : '#000000'} emissiveIntensity={reacting ? 0.8 : active ? 0.28 : 0} /></mesh></group>
  if (stationKey === 'deduction') return <group ref={motion} position={[0, 0.9, 0]}><mesh><cylinderGeometry args={[0.22, 0.3, 0.5, 16]} /><meshStandardMaterial color="#ff8a3d" emissive={reacting ? '#ff8a3d' : '#000000'} emissiveIntensity={reacting ? 0.5 : 0} /></mesh></group>
  if (stationKey === 'brackets') return <group ref={motion} position={[0, 0.85, 0]}>{[0, 1, 2].map((i) => <mesh key={i} position={[Math.cos(i * 2.1) * 0.45, 0, Math.sin(i * 2.1) * 0.45]}><cylinderGeometry args={[0.18, 0.18, 0.05, 16]} /><meshStandardMaterial color="#ffd700" emissive={reacting ? '#ffd700' : '#000000'} emissiveIntensity={reacting ? 0.55 : 0} metalness={0.35} /></mesh>)}</group>
  if (stationKey === 'credit') return <group ref={motion} position={[0, 0.9, 0]}><mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.38, 0.1, 12, 24]} /><meshStandardMaterial color="#00dca0" emissive="#00dca0" emissiveIntensity={reacting ? 0.95 : active ? 0.5 : 0.1} /></mesh></group>
  if (stationKey === 'reconcile') return <group ref={motion} position={[0, 0.92, 0]}><mesh><boxGeometry args={[1.2, 0.08, 0.12]} /><meshStandardMaterial color="#ffd700" emissive={reacting ? '#ffd700' : '#000000'} emissiveIntensity={reacting ? 0.5 : 0} /></mesh><mesh position={[0, -0.45, 0]}><cylinderGeometry args={[0.08, 0.18, 0.8, 12]} /><meshStandardMaterial color="#071748" /></mesh></group>
  return <group ref={motion} position={[0, 0.88, 0]}><mesh><boxGeometry args={[0.95, 0.58, 0.08]} /><meshStandardMaterial color="#fff3c4" emissive={reacting ? '#ffd700' : active ? '#00dca0' : '#000000'} emissiveIntensity={reacting ? 0.75 : active ? 0.28 : 0} /></mesh></group>
}

function CurrentTaxStation({ step, station, reacting }) {
  const p = local(station.point)
  const [hovered, setHovered] = useState(false)
  const activate = (event) => {
    event?.stopPropagation?.()
    if (!isPaycheckWorldActive() || !closeEnough(station.point)) return
    useTaxLab.getState().openStation(step)
  }
  return (
    <group position={p} onClick={activate} onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer' }} onPointerOut={() => { setHovered(false); document.body.style.cursor = '' }}>
      <RoundedBox args={[2.15, 0.32, 1.55]} radius={0.17} smoothness={3} position={[0, 0.2, 0]}><meshStandardMaterial color="#1464f0" emissive="#1464f0" emissiveIntensity={reacting ? 0.95 : hovered ? 0.75 : 0.5} roughness={0.6} /></RoundedBox>
      <StationProp stationKey={station.key} active reacting={reacting} />
      <InteractionGlow active />
      <Billboard position={[0, 2.55, 0]}><mesh><planeGeometry args={[3.1, 0.74]} /><meshBasicMaterial map={labelTexture(station.label.toUpperCase(), { bg: '#ffffff', color: '#071748', accent: '#1464f0' })} transparent toneMapped={false} depthTest={false} /></mesh></Billboard>
    </group>
  )
}

function TaxCenterBuilding({ active }) {
  return (
    <group>
      <RoundedBox args={[14.8, 0.18, 12.8]} radius={0.16} smoothness={3} position={[0, 0.08, 1.55]} receiveShadow><meshStandardMaterial color="#f8f1e8" roughness={0.94} /></RoundedBox>
      <RoundedBox args={[14.8, 4.9, 0.34]} radius={0.12} smoothness={3} position={[0, 2.45, -4.72]} castShadow receiveShadow><meshPhysicalMaterial color="#ffb36f" roughness={0.62} clearcoat={0.18} /></RoundedBox>
      <RoundedBox args={[0.34, 4.9, 12.8]} radius={0.12} smoothness={3} position={[-7.23, 2.45, 1.55]} castShadow receiveShadow><meshPhysicalMaterial color="#ffc58f" roughness={0.62} clearcoat={0.15} /></RoundedBox>
      <RoundedBox args={[0.34, 4.9, 12.8]} radius={0.12} smoothness={3} position={[7.23, 2.45, 1.55]} castShadow receiveShadow><meshPhysicalMaterial color="#ffc58f" roughness={0.62} clearcoat={0.15} /></RoundedBox>
      <RoundedBox args={[5.15, 4.9, 0.34]} radius={0.12} smoothness={3} position={[-4.83, 2.45, 7.82]} castShadow receiveShadow><meshPhysicalMaterial color="#ffb36f" roughness={0.6} clearcoat={0.18} /></RoundedBox>
      <RoundedBox args={[5.15, 4.9, 0.34]} radius={0.12} smoothness={3} position={[4.83, 2.45, 7.82]} castShadow receiveShadow><meshPhysicalMaterial color="#ffb36f" roughness={0.6} clearcoat={0.18} /></RoundedBox>
      <RoundedBox args={[4.5, 0.52, 0.46]} radius={0.16} smoothness={3} position={[0, 4.56, 7.78]} castShadow><meshStandardMaterial color="#071748" roughness={0.5} /></RoundedBox>
      <Billboard position={[0, 6.3, 7.95]}><mesh><planeGeometry args={[8.4, 2.05]} /><meshBasicMaterial map={labelTexture('TAYU TAX OFFICE · UNDER CONSTRUCTION', { bg: '#071748', color: '#ffffff', accent: '#ff9a52' })} transparent toneMapped={false} depthTest={false} /></mesh></Billboard>
      <RoundedBox args={[0.18, 3.6, 0.18]} radius={0.06} smoothness={2} position={[-2.16, 1.8, 7.58]} castShadow><meshStandardMaterial color="#1464f0" emissive="#1464f0" emissiveIntensity={active ? 0.22 : 0.06} /></RoundedBox>
      <RoundedBox args={[0.18, 3.6, 0.18]} radius={0.06} smoothness={2} position={[2.16, 1.8, 7.58]} castShadow><meshStandardMaterial color="#1464f0" emissive="#1464f0" emissiveIntensity={active ? 0.22 : 0.06} /></RoundedBox>
      <RoundedBox args={[3.5, 0.08, 1.15]} radius={0.08} smoothness={2} position={[0, 0.13, 7.15]} receiveShadow><meshStandardMaterial color="#1464f0" emissive="#1464f0" emissiveIntensity={active ? 0.16 : 0.04} /></RoundedBox>
      <RoundedBox args={[5.2, 1.05, 0.75]} radius={0.16} smoothness={3} position={[0, 0.55, 5.45]} castShadow receiveShadow><meshStandardMaterial color="#071748" roughness={0.7} /></RoundedBox>
      <RoundedBox args={[4.6, 0.12, 0.92]} radius={0.08} smoothness={2} position={[0, 1.09, 5.45]} castShadow><meshStandardMaterial color="#00dca0" emissive="#00dca0" emissiveIntensity={active ? 0.2 : 0.05} /></RoundedBox>
      {[-4.6, -2.3, 0, 2.3, 4.6].map((x) => <mesh key={x} position={[x, 0.185, 0.75]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.06, 7.6]} /><meshStandardMaterial color="#e5c7a7" transparent opacity={0.55} /></mesh>)}
    </group>
  )
}

function CelebrationBurst({ active, position = [0, 5.1, 1.6] }) {
  const group = useRef()
  useFrame((_, delta) => { if (group.current && active) group.current.rotation.y += delta * 0.9 })
  if (!active) return null
  return <group ref={group} position={position}>{Array.from({ length: 18 }, (_, i) => { const angle = (i / 18) * Math.PI * 2; const radius = 1.4 + (i % 4) * 0.25; return <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle * 2) * 0.7, Math.sin(angle) * radius]}><sphereGeometry args={[0.1, 8, 8]} /><meshStandardMaterial color={i % 2 ? '#ffd700' : '#00dca0'} emissive={i % 2 ? '#ffd700' : '#00dca0'} emissiveIntensity={0.7} /></mesh> })}</group>
}

export function PaycheckPlanetWorld() {
  const [active, setActive] = useState(() => isPaycheckWorldActive())
  const [reaction, setReaction] = useState(null)
  const phase = useTaxLab((s) => s.phase)
  const taxCase = useTaxLab((s) => s.taxCase)
  const stepNumber = useTaxLab((s) => s.stepNumber)

  useEffect(() => {
    const sync = (event) => setActive(event?.detail?.active ?? isPaycheckWorldActive())
    sync()
    window.addEventListener(PAYCHECK_MODE_EVENT, sync)
    return () => window.removeEventListener(PAYCHECK_MODE_EVENT, sync)
  }, [])

  useEffect(() => {
    let timer = null
    const react = (event) => {
      setReaction(event?.detail || { kind: 'decision' })
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => setReaction(null), event?.detail?.kind === 'filed' ? 2600 : 1700)
    }
    window.addEventListener(TAX_WORLD_EVENT, react)
    return () => { window.removeEventListener(TAX_WORLD_EVENT, react); if (timer) window.clearTimeout(timer) }
  }, [])

  const selectedClient = TAX_CLIENTS.find((client) => client.caseId === taxCase?.id)
  const currentStation = taxStationForStep(stepNumber)
  const reactingStep = Number(reaction?.stepNumber || stepNumber)
  const reactingStation = taxStationForStep(reactingStep)
  const rexAvatar = { gender: 'male', bodyType: 'average', skinTone: 'warm_beige', hairStyle: 'short', hairColor: 'brown', shirtColor: 'teal', pantsColor: 'blue', topStyle: 'hoodie', bottomStyle: 'pants' }
  const guideInteractive = active && (phase === 'intro' || phase === 'complete')
  const rexReacting = Boolean(reaction)

  return (
    <group position={[TAX_DISTRICT[0], 0, TAX_DISTRICT[1]]}>
      <TaxCenterBuilding active={active} />
      <InteractiveTaxNpc name="Rex · Tax Guide" point={TAX_POINTS.guide} avatar={rexAvatar} active={guideInteractive} reacting={rexReacting} onActivate={() => useTaxLab.getState().openGuide()} />
      {active && (phase === 'case' || phase === 'steps') && TAX_CLIENTS.map((client, index) => {
        const caseInfo = TAX_CASES.find((item) => item.id === client.caseId)
        const isSelected = selectedClient?.caseId === client.caseId
        const reacting = (reaction?.kind === 'client-selected' && reaction?.caseId === client.caseId) || (phase === 'steps' && isSelected && Boolean(reaction))
        const clientAvatar = { gender: index === 1 ? 'male' : index === 2 ? 'female' : 'neutral', bodyType: index === 1 ? 'athletic' : 'average', skinTone: index === 0 ? 'light_tan' : index === 1 ? 'medium_brown' : 'cream', hairStyle: index === 0 ? 'curly' : index === 1 ? 'short' : 'long', hairColor: index === 2 ? 'brown' : 'black', shirtColor: index === 0 ? 'green' : index === 1 ? 'blue' : 'purple', pantsColor: index === 0 ? 'denim' : index === 1 ? 'gray' : 'black', topStyle: index === 1 ? 'hoodie' : 'tee', bottomStyle: 'pants' }
        return <InteractiveTaxNpc key={client.caseId} name={client.name} point={client.point} avatar={clientAvatar} selected={isSelected} reacting={reacting} active={phase === 'case'} onActivate={() => caseInfo && useTaxLab.getState().previewClient(caseInfo)} />
      })}
      {active && phase === 'steps' && currentStation && <CurrentTaxStation step={stepNumber} station={currentStation} reacting={Boolean(reaction) && reactingStep === stepNumber} />}
      {reaction && reactingStation && <CelebrationBurst active position={[...local(reactingStation.point), 2.1]} />}
      <CelebrationBurst active={active && phase === 'complete'} />
    </group>
  )
}
