import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, RoundedBox } from '@react-three/drei'
import { TAX_DISTRICT } from './config.js'
import { labelTexture } from './textures.js'
import { joystick, moveTarget, playerPos } from './store.js'

export const BOND_DISTRICT = [TAX_DISTRICT[0] + 18, TAX_DISTRICT[1] + 1.5]
export const BOND_ENTRY = [BOND_DISTRICT[0] - 9.4, BOND_DISTRICT[1] + 0.2]
export const BOND_WORLD_EVENT = 'tayu-bond-world-action'

export function placeAtBondStreetEntrance() {
  playerPos.x = BOND_ENTRY[0]
  playerPos.z = BOND_ENTRY[1]
  joystick.x = 0
  joystick.y = 0
  moveTarget.x = null
  moveTarget.z = null
}

function BorrowerBooth({ x, z, title, accent, active }) {
  const glow = useRef()
  useFrame((state) => {
    if (!glow.current) return
    const pulse = active ? 0.38 + Math.sin(state.clock.elapsedTime * 6 + x) * 0.22 : 0.08
    glow.current.emissiveIntensity = Math.max(0.05, pulse)
  })

  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[3.7, 2.35, 2.2]} radius={0.22} smoothness={3} position={[0, 1.18, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#fffaf0" roughness={0.72} />
      </RoundedBox>
      <RoundedBox args={[3.25, 0.26, 0.34]} radius={0.08} smoothness={2} position={[0, 2.18, -1.02]}>
        <meshStandardMaterial ref={glow} color={accent} emissive={accent} emissiveIntensity={0.08} />
      </RoundedBox>
      <Billboard position={[0, 2.95, -0.05]}>
        <mesh>
          <planeGeometry args={[3.2, 0.92]} />
          <meshBasicMaterial map={labelTexture(title, { bg: '#ffffff', color: '#071748', accent })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>
      <mesh position={[0, 0.38, -1.22]}>
        <cylinderGeometry args={[0.38, 0.38, 0.12, 24]} />
        <meshStandardMaterial color={accent} metalness={0.35} roughness={0.35} />
      </mesh>
    </group>
  )
}

function InterestAnimation({ active }) {
  const root = useRef()
  useFrame((state, delta) => {
    if (!root.current) return
    root.current.rotation.y += delta * (active ? 1.5 : 0.25)
    root.current.position.y = 0.15 + (active ? Math.abs(Math.sin(state.clock.elapsedTime * 4)) * 1.15 : Math.sin(state.clock.elapsedTime * 1.6) * 0.08)
  })

  return (
    <group ref={root} position={[0, 0.15, 0]}>
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(angle) * 2.4, 1.1 + (i % 2) * 0.55, Math.sin(angle) * 2.4]} rotation={[Math.PI / 2, 0, angle]}>
            <cylinderGeometry args={[0.22, 0.22, 0.07, 18]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={active ? 0.65 : 0.12} metalness={0.65} roughness={0.28} />
          </mesh>
        )
      })}
    </group>
  )
}

function RateSeesaw({ active }) {
  const beam = useRef()
  useFrame((state) => {
    if (!beam.current) return
    beam.current.rotation.z = active ? Math.sin(state.clock.elapsedTime * 3.8) * 0.35 : Math.sin(state.clock.elapsedTime * 1.1) * 0.06
  })
  return (
    <group position={[4.9, 0.15, 4.35]}>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.16, 0.32, 1.35, 12]} />
        <meshStandardMaterial color="#071748" />
      </mesh>
      <group ref={beam} position={[0, 1.42, 0]}>
        <RoundedBox args={[3.3, 0.18, 0.32]} radius={0.06} smoothness={2}>
          <meshStandardMaterial color="#1464f0" emissive="#1464f0" emissiveIntensity={active ? 0.45 : 0.1} />
        </RoundedBox>
        <mesh position={[-1.32, 0.32, 0]}><boxGeometry args={[0.55, 0.55, 0.22]} /><meshStandardMaterial color="#00dca0" /></mesh>
        <mesh position={[1.32, 0.32, 0]}><boxGeometry args={[0.55, 0.55, 0.22]} /><meshStandardMaterial color="#ff8a3d" /></mesh>
      </group>
    </group>
  )
}

function BondExchangeBuilding({ effect }) {
  const allocationActive = effect === 'allocation' || effect === 'borrowers'
  const interestActive = effect === 'interest' || effect === 'handoff'
  const rateActive = effect === 'rate'

  return (
    <group>
      <RoundedBox args={[15.8, 0.18, 14.4]} radius={0.18} smoothness={3} position={[0, 0.08, 0]} receiveShadow>
        <meshStandardMaterial color="#edf3e6" roughness={0.96} />
      </RoundedBox>

      <RoundedBox args={[15.8, 5.1, 0.36]} radius={0.14} smoothness={3} position={[0, 2.55, -7.05]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#709b55" roughness={0.6} clearcoat={0.14} />
      </RoundedBox>
      <RoundedBox args={[15.8, 5.1, 0.36]} radius={0.14} smoothness={3} position={[0, 2.55, 7.05]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#8bb36d" roughness={0.62} clearcoat={0.12} />
      </RoundedBox>
      <RoundedBox args={[0.36, 5.1, 14.4]} radius={0.14} smoothness={3} position={[7.72, 2.55, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#8bb36d" roughness={0.62} clearcoat={0.12} />
      </RoundedBox>

      {/* West facade is split around a wide walk-through entrance facing the module avenue. */}
      <RoundedBox args={[0.36, 5.1, 4.2]} radius={0.14} smoothness={3} position={[-7.72, 2.55, -5.1]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#709b55" roughness={0.6} clearcoat={0.14} />
      </RoundedBox>
      <RoundedBox args={[0.36, 5.1, 4.2]} radius={0.14} smoothness={3} position={[-7.72, 2.55, 5.1]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#709b55" roughness={0.6} clearcoat={0.14} />
      </RoundedBox>
      <RoundedBox args={[0.48, 0.5, 5.65]} radius={0.14} smoothness={3} position={[-7.58, 4.58, 0]} castShadow>
        <meshStandardMaterial color="#071748" />
      </RoundedBox>

      <Billboard position={[-7.82, 6.55, 0]}>
        <mesh>
          <planeGeometry args={[8.2, 2.15]} />
          <meshBasicMaterial map={labelTexture('MODULE 6 · BOND STREET', { bg: '#071748', color: '#ffffff', accent: '#9ed36f' })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>

      <RoundedBox args={[1.5, 0.08, 5.4]} radius={0.08} smoothness={2} position={[-7.05, 0.13, 0]} receiveShadow>
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.12} />
      </RoundedBox>

      <BorrowerBooth x={-2.8} z={-3.25} title="TREASURY" accent="#1464f0" active={allocationActive} />
      <BorrowerBooth x={2.1} z={-3.25} title="MUNICIPAL" accent="#00b37f" active={allocationActive} />
      <BorrowerBooth x={-0.35} z={3.0} title="CORPORATE" accent="#ff8a3d" active={allocationActive} />

      <group position={[1.35, 0, 1.25]}>
        <InterestAnimation active={interestActive} />
      </group>
      <RateSeesaw active={rateActive} />
    </group>
  )
}

export function BondStreetWorld() {
  const [effect, setEffect] = useState('idle')

  useEffect(() => {
    let timer = null
    const onAction = (event) => {
      const next = event?.detail?.kind || 'arrival'
      setEffect(next)
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => setEffect('idle'), next === 'handoff' ? 2600 : 1900)
    }
    window.addEventListener(BOND_WORLD_EVENT, onAction)
    return () => {
      window.removeEventListener(BOND_WORLD_EVENT, onAction)
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  return (
    <group position={[BOND_DISTRICT[0], 0, BOND_DISTRICT[1]]}>
      <BondExchangeBuilding effect={effect} />
    </group>
  )
}
