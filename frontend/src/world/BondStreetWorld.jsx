import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, RoundedBox } from '@react-three/drei'
import { INTERACT_RADIUS, TAX_DISTRICT } from './config.js'
import { CharacterMesh } from './CharacterMesh.jsx'
import { labelTexture } from './textures.js'
import { joystick, moveTarget, playerPos } from './store.js'

// Bond Street now sits on the outer side of the story route instead of in the
// middle of the town. It is clearly before the Tax Office, with a landscaped
// buffer between the two destinations.
export const BOND_DISTRICT = [TAX_DISTRICT[0] - 8.9, TAX_DISTRICT[1] - 8.0]
// Module 6 starts OUTSIDE the building, directly in front of the open west
// entrance, matching the arrival pattern used by the other town destinations.
export const BOND_ENTRY = [BOND_DISTRICT[0] - 9.35, BOND_DISTRICT[1]]
export const BOND_WORLD_EVENT = 'tayu-bond-world-action'
export const BOND_INTERACT_EVENT = 'tayu-bond-interact'
const BOND_ONLY_KEY = 'tayu-bond-only-entry'

const absolutePoint = (x, z) => [BOND_DISTRICT[0] + x, BOND_DISTRICT[1] + z]
export const BOND_POINTS = {
  guide: absolutePoint(-5.55, 0),
  treasury: absolutePoint(-2.8, -3.25),
  muni: absolutePoint(2.1, -3.25),
  corporate: absolutePoint(-0.35, 3.0),
  interest: absolutePoint(1.35, 1.25),
  rate: absolutePoint(4.9, 4.35),
}

export function placeAtBondStreetEntrance() {
  playerPos.x = BOND_ENTRY[0]
  playerPos.y = 1
  playerPos.z = BOND_ENTRY[1]
  joystick.x = 0
  joystick.y = 0
  moveTarget.x = null
  moveTarget.z = null
}

function closeEnough(point) {
  return Math.hypot(point[0] - playerPos.x, point[1] - playerPos.z) <= INTERACT_RADIUS + 0.8
}

function emitInteraction(kind, detail = {}) {
  try {
    window.dispatchEvent(new CustomEvent(BOND_INTERACT_EVENT, { detail: { kind, ...detail } }))
  } catch { /* browser-only interaction */ }
}

function InteractionGlow({ active = true, accent = '#ffd700' }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.y = 2.9 + Math.sin(state.clock.elapsedTime * 3.2) * 0.12
    const pulse = 0.86 + Math.sin(state.clock.elapsedTime * 4.4) * 0.12
    ref.current.scale.setScalar(pulse)
  })
  if (!active) return null
  return (
    <mesh ref={ref} position={[0, 2.9, 0]}>
      <sphereGeometry args={[0.18, 14, 14]} />
      <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} />
    </mesh>
  )
}

function BondGuide({ active }) {
  const [hovered, setHovered] = useState(false)
  const point = BOND_POINTS.guide
  const avatar = { gender: 'male', bodyType: 'average', skinTone: 'warm_beige', hairStyle: 'short', hairColor: 'brown', shirtColor: 'green', pantsColor: 'navy', topStyle: 'tee', bottomStyle: 'pants' }
  return (
    <group
      position={[-5.55, 0, 0]}
      onClick={(event) => {
        event.stopPropagation()
        if (closeEnough(point)) emitInteraction('guide')
      }}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = '' }}
    >
      <group scale={hovered ? 1.06 : 1}><CharacterMesh avatar={avatar} /></group>
      <InteractionGlow active={active} accent="#ffd700" />
      <Billboard position={[0, 3.65, 0]}>
        <mesh>
          <planeGeometry args={[2.6, 0.72]} />
          <meshBasicMaterial map={labelTexture('BEAU · BOND GUIDE', { bg: '#ffffff', color: '#071748', accent: '#6fa44a' })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>
    </group>
  )
}

function BorrowerBooth({ id, x, z, title, accent, active, completed }) {
  const glow = useRef()
  const point = BOND_POINTS[id]
  const [hovered, setHovered] = useState(false)
  useFrame((state) => {
    if (!glow.current) return
    const pulse = active ? 0.38 + Math.sin(state.clock.elapsedTime * 6 + x) * 0.22 : 0.08
    glow.current.emissiveIntensity = Math.max(0.05, pulse)
  })

  return (
    <group
      position={[x, 0, z]}
      onClick={(event) => {
        event.stopPropagation()
        if (closeEnough(point)) emitInteraction('booth', { bondId: id })
      }}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = '' }}
    >
      <RoundedBox args={[3.7, 2.35, 2.2]} radius={0.22} smoothness={3} position={[0, 1.18, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={hovered ? '#ffffff' : '#fffaf0'} roughness={0.72} />
      </RoundedBox>
      <RoundedBox args={[3.25, 0.26, 0.34]} radius={0.08} smoothness={2} position={[0, 2.18, -1.02]}>
        <meshStandardMaterial ref={glow} color={accent} emissive={accent} emissiveIntensity={0.08} />
      </RoundedBox>
      <Billboard position={[0, 2.95, -0.05]}>
        <mesh>
          <planeGeometry args={[3.2, 0.92]} />
          <meshBasicMaterial map={labelTexture(`${completed ? '✓ ' : ''}${title}`, { bg: '#ffffff', color: '#071748', accent })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>
      <mesh position={[0, 0.38, -1.22]}>
        <cylinderGeometry args={[0.38, 0.38, 0.12, 24]} />
        <meshStandardMaterial color={accent} metalness={0.35} roughness={0.35} />
      </mesh>
      <InteractionGlow active={active} accent={accent} />
    </group>
  )
}

function InterestAnimation({ active, interactive }) {
  const root = useRef()
  const point = BOND_POINTS.interest
  useFrame((state, delta) => {
    if (!root.current) return
    root.current.rotation.y += delta * (active ? 1.5 : 0.25)
    root.current.position.y = 0.15 + (active ? Math.abs(Math.sin(state.clock.elapsedTime * 4)) * 1.15 : Math.sin(state.clock.elapsedTime * 1.6) * 0.08)
  })

  return (
    <group
      ref={root}
      position={[0, 0.15, 0]}
      onClick={(event) => {
        event.stopPropagation()
        if (interactive && closeEnough(point)) emitInteraction('interest')
      }}
    >
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(angle) * 2.4, 1.1 + (i % 2) * 0.55, Math.sin(angle) * 2.4]} rotation={[Math.PI / 2, 0, angle]}>
            <cylinderGeometry args={[0.22, 0.22, 0.07, 18]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={active ? 0.65 : 0.12} metalness={0.65} roughness={0.28} />
          </mesh>
        )
      })}
      <InteractionGlow active={interactive} accent="#ffd700" />
    </group>
  )
}

function RateSeesaw({ active, interactive }) {
  const beam = useRef()
  const point = BOND_POINTS.rate
  useFrame((state) => {
    if (!beam.current) return
    beam.current.rotation.z = active ? Math.sin(state.clock.elapsedTime * 3.8) * 0.35 : Math.sin(state.clock.elapsedTime * 1.1) * 0.06
  })
  return (
    <group
      position={[4.9, 0.15, 4.35]}
      onClick={(event) => {
        event.stopPropagation()
        if (interactive && closeEnough(point)) emitInteraction('rate')
      }}
    >
      <mesh position={[0, 0.75, 0]}><cylinderGeometry args={[0.16, 0.32, 1.35, 12]} /><meshStandardMaterial color="#071748" /></mesh>
      <group ref={beam} position={[0, 1.42, 0]}>
        <RoundedBox args={[3.3, 0.18, 0.32]} radius={0.06} smoothness={2}><meshStandardMaterial color="#1464f0" emissive="#1464f0" emissiveIntensity={active ? 0.45 : 0.1} /></RoundedBox>
        <mesh position={[-1.32, 0.32, 0]}><boxGeometry args={[0.55, 0.55, 0.22]} /><meshStandardMaterial color="#00dca0" /></mesh>
        <mesh position={[1.32, 0.32, 0]}><boxGeometry args={[0.55, 0.55, 0.22]} /><meshStandardMaterial color="#ff8a3d" /></mesh>
      </group>
      <InteractionGlow active={interactive} accent="#1464f0" />
    </group>
  )
}

function BondApproachAndLandscaping() {
  const planters = [
    [8.8, 2.7, 0.78],
    [9.6, 4.8, 0.68],
    [8.2, 6.7, 0.72],
    [10.8, 6.1, 0.62],
  ]
  return (
    <group>
      {/* Wide front approach: this visually connects the main route to the door
          instead of letting the Bond building read like an object dropped in grass. */}
      <RoundedBox args={[5.2, 0.08, 3.7]} radius={0.18} smoothness={3} position={[-9.1, 0.05, 0]} receiveShadow>
        <meshStandardMaterial color="#e7d4ad" roughness={0.96} />
      </RoundedBox>
      <RoundedBox args={[2.0, 0.09, 3.0]} radius={0.16} smoothness={3} position={[-6.95, 0.08, 0]} receiveShadow>
        <meshStandardMaterial color="#f1dfb8" roughness={0.94} />
      </RoundedBox>

      {/* Green buffer toward the Tax Office so the two large destinations read
          as separate stops along one path rather than one crowded complex. */}
      {planters.map(([x, z, s], index) => (
        <group key={`bond-planter-${index}`} position={[x, 0, z]} scale={s}>
          <mesh position={[0, 0.28, 0]} receiveShadow>
            <cylinderGeometry args={[0.78, 0.9, 0.52, 18]} />
            <meshStandardMaterial color="#d9c49a" roughness={0.92} />
          </mesh>
          <mesh position={[0, 0.95, 0]} castShadow>
            <sphereGeometry args={[0.78, 16, 14]} />
            <meshStandardMaterial color={index % 2 ? '#6ea65b' : '#82b968'} roughness={0.9} />
          </mesh>
          <mesh position={[0.35, 1.18, 0.12]} castShadow>
            <sphereGeometry args={[0.44, 14, 12]} />
            <meshStandardMaterial color="#98c979" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function BondExchangeBuilding({ effect, stage, visited }) {
  const interestActive = effect === 'interest' || effect === 'handoff'
  const rateActive = effect === 'rate'

  return (
    <group>
      <BondApproachAndLandscaping />
      <RoundedBox args={[15.8, 0.18, 14.4]} radius={0.18} smoothness={3} position={[0, 0.08, 0]} receiveShadow><meshStandardMaterial color="#edf3e6" roughness={0.96} /></RoundedBox>
      <RoundedBox args={[15.8, 5.1, 0.36]} radius={0.14} smoothness={3} position={[0, 2.55, -7.05]} castShadow receiveShadow><meshPhysicalMaterial color="#709b55" roughness={0.6} clearcoat={0.14} /></RoundedBox>
      <RoundedBox args={[15.8, 5.1, 0.36]} radius={0.14} smoothness={3} position={[0, 2.55, 7.05]} castShadow receiveShadow><meshPhysicalMaterial color="#8bb36d" roughness={0.62} clearcoat={0.12} /></RoundedBox>
      <RoundedBox args={[0.36, 5.1, 14.4]} radius={0.14} smoothness={3} position={[7.72, 2.55, 0]} castShadow receiveShadow><meshPhysicalMaterial color="#8bb36d" roughness={0.62} clearcoat={0.12} /></RoundedBox>
      <RoundedBox args={[0.36, 5.1, 4.2]} radius={0.14} smoothness={3} position={[-7.72, 2.55, -5.1]} castShadow receiveShadow><meshPhysicalMaterial color="#709b55" roughness={0.6} clearcoat={0.14} /></RoundedBox>
      <RoundedBox args={[0.36, 5.1, 4.2]} radius={0.14} smoothness={3} position={[-7.72, 2.55, 5.1]} castShadow receiveShadow><meshPhysicalMaterial color="#709b55" roughness={0.6} clearcoat={0.14} /></RoundedBox>
      <RoundedBox args={[0.48, 0.5, 5.65]} radius={0.14} smoothness={3} position={[-7.58, 4.58, 0]} castShadow><meshStandardMaterial color="#071748" /></RoundedBox>
      <Billboard position={[-7.82, 6.55, 0]}><mesh><planeGeometry args={[6.8, 1.9]} /><meshBasicMaterial map={labelTexture('BOND STREET', { bg: '#071748', color: '#ffffff', accent: '#9ed36f' })} transparent toneMapped={false} depthTest={false} /></mesh></Billboard>
      <RoundedBox args={[1.5, 0.08, 5.4]} radius={0.08} smoothness={2} position={[-7.05, 0.13, 0]} receiveShadow><meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.12} /></RoundedBox>

      <BondGuide active={stage === 0} />
      <BorrowerBooth id="treasury" x={-2.8} z={-3.25} title="TREASURY" accent="#1464f0" active={stage === 1 || stage === 2} completed={visited.includes('treasury')} />
      <BorrowerBooth id="muni" x={2.1} z={-3.25} title="MUNICIPAL" accent="#00b37f" active={stage === 1 || stage === 2} completed={visited.includes('muni')} />
      <BorrowerBooth id="corporate" x={-0.35} z={3.0} title="CORPORATE" accent="#ff8a3d" active={stage === 1 || stage === 2} completed={visited.includes('corporate')} />
      <group position={[1.35, 0, 1.25]}><InterestAnimation active={interestActive} interactive={stage === 3} /></group>
      <RateSeesaw active={rateActive} interactive={stage === 4} />
    </group>
  )
}

export function BondStreetWorld() {
  const [effect, setEffect] = useState('idle')
  const [progress, setProgress] = useState({ stage: 0, visited: [] })
  const [selectedBondArrival] = useState(() => {
    try {
      if (typeof localStorage !== 'undefined' && localStorage.getItem('tayu-jump-module') === '6') return true
      return typeof sessionStorage !== 'undefined' && sessionStorage.getItem(BOND_ONLY_KEY) === '1'
    } catch { return false }
  })

  useEffect(() => { if (selectedBondArrival) placeAtBondStreetEntrance() }, [selectedBondArrival])

  useEffect(() => {
    let timer = null
    const onAction = (event) => {
      const next = event?.detail?.kind || 'arrival'
      setEffect(next)
      if (event?.detail?.progress) setProgress(event.detail.progress)
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => setEffect('idle'), next === 'handoff' ? 2600 : 1900)
    }
    window.addEventListener(BOND_WORLD_EVENT, onAction)
    return () => { window.removeEventListener(BOND_WORLD_EVENT, onAction); if (timer) window.clearTimeout(timer) }
  }, [])

  return <group position={[BOND_DISTRICT[0], 0, BOND_DISTRICT[1]]}><BondExchangeBuilding effect={effect} stage={progress.stage} visited={progress.visited || []} /></group>
}
