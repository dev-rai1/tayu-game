import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { CharacterMesh } from './CharacterMesh.jsx'
import { INTERACT_RADIUS, RING, ringPoint } from './config.js'
import { playerPos } from './store.js'
import { isBondStreetActive } from './bondMode.js'
import { BOND_TYPES, useBondStreet } from './bondStreetStore.js'

const gate = ringPoint(10)
const dx = gate[0] - RING.c[0], dz = gate[1] - RING.c[1], d = Math.hypot(dx, dz) || 1
const radial = [dx / d, dz / d]
export const BOND_STREET_CENTER = [gate[0] + radial[0] * 20, gate[1] + radial[1] * 20]
export const BOND_GUIDE_POINT = [BOND_STREET_CENTER[0], BOND_STREET_CENTER[1] + 3]
const local = ([x, z]) => [x - BOND_STREET_CENTER[0], 0, z - BOND_STREET_CENTER[1]]
const closeEnough = (point) => Math.hypot(point[0] - playerPos.x, point[1] - playerPos.z) <= INTERACT_RADIUS
function SafetyStars({ count }) { return <group>{[0, 1, 2].map((i) => <mesh key={i} position={[(i - 1) * 0.34, 0, 0]}><sphereGeometry args={[0.1, 10, 10]} /><meshStandardMaterial color={i < count ? '#ffd700' : '#8e97a8'} emissive={i < count ? '#ffd700' : '#000000'} emissiveIntensity={i < count ? 0.35 : 0} /></mesh>)}</group> }
function BondKiosk({ bond, index }) {
  const x = (index - 1) * 2.6
  return <group position={[x, 0, -0.9]}><RoundedBox args={[2.15, 1.5, 1.35]} radius={0.18} smoothness={3} position={[0, 0.75, 0]} castShadow><meshStandardMaterial color={bond.id === 'treasury' ? '#dbe8ff' : bond.id === 'muni' ? '#d8f5e6' : '#ffe1cc'} roughness={0.65} /></RoundedBox><group position={[0, 1.72, 0.7]}><SafetyStars count={bond.safety} /></group><mesh position={[0, 1.48, 0.72]}><boxGeometry args={[1.55, 0.34, 0.08]} /><meshStandardMaterial color="#071748" /></mesh></group>
}
export function BondStreetWorld() {
  const active = isBondStreetActive(), phase = useBondStreet((s) => s.phase), [hovered, setHovered] = useState(false), beau = useRef(), t = useRef(0)
  useFrame((_, delta) => { t.current += delta; if (beau.current) beau.current.rotation.y = Math.sin(t.current * 0.55) * 0.16 })
  const beauAvatar = { gender: 'male', bodyType: 'average', skinTone: 'medium_brown', hairStyle: 'short', hairColor: 'black', shirtColor: 'orange', pantsColor: 'navy', topStyle: 'tee', bottomStyle: 'pants' }
  return <group position={[BOND_STREET_CENTER[0], 0, BOND_STREET_CENTER[1]]}><mesh position={[0, 0.025, 4.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[3.2, 12]} /><meshStandardMaterial color="#d7c7a6" roughness={1} /></mesh><mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[5.4, 36]} /><meshStandardMaterial color="#edf7dd" roughness={1} /></mesh><RoundedBox args={[7.8, 3.1, 3]} radius={0.28} smoothness={4} position={[0, 1.58, -2.65]} castShadow><meshPhysicalMaterial color="#cfe3a8" roughness={0.55} clearcoat={0.18} /></RoundedBox><RoundedBox args={[8.25, 0.52, 3.35]} radius={0.2} smoothness={4} position={[0, 3.35, -2.65]} castShadow><meshStandardMaterial color="#305f3a" /></RoundedBox>{BOND_TYPES.map((bond, index) => <BondKiosk key={bond.id} bond={bond} index={index} />)}<group position={local(BOND_GUIDE_POINT)} onClick={(event) => { event.stopPropagation(); if (active && closeEnough(BOND_GUIDE_POINT)) useBondStreet.getState().open() }} onPointerOver={() => { if (active) { setHovered(true); document.body.style.cursor = 'pointer' } }} onPointerOut={() => { setHovered(false); document.body.style.cursor = '' }}><group ref={beau} scale={hovered ? 1.05 : 1}><CharacterMesh avatar={beauAvatar} /></group>{active && phase !== 'complete' && <mesh position={[0, 2.75, 0]}><sphereGeometry args={[0.2, 14, 14]} /><meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.75} /></mesh>}</group></group>
}
