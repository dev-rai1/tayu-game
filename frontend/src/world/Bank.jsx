import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { useGame } from './store.js'
import { MAILBOX } from './config.js'
import { cardTexture } from './textures.js'

// A cute bank where the player collects their weekly allowance. A glowing gold
// "$" coin hovers, bobs, drifts and spins above it (billboarded to face camera).
// Keeps the legacy 'mailbox' interaction id so gameplay logic is unchanged.

function makeDollarTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const x = c.getContext('2d')
  x.clearRect(0, 0, 256, 256)
  x.fillStyle = '#FFD24A'
  x.beginPath(); x.arc(128, 128, 118, 0, Math.PI * 2); x.fill()
  x.lineWidth = 16; x.strokeStyle = '#E0A92E'
  x.beginPath(); x.arc(128, 128, 110, 0, Math.PI * 2); x.stroke()
  x.fillStyle = '#0f6b3a'
  x.font = 'bold 180px Georgia, "Times New Roman", serif'
  x.textAlign = 'center'; x.textBaseline = 'middle'
  x.fillText('$', 128, 142)
  const t = new THREE.CanvasTexture(c)
  t.anisotropy = 4
  return t
}

function DollarCoin({ baseY }) {
  const ref = useRef()
  const t = useRef(0)
  const { camera } = useThree()
  const tex = useMemo(() => makeDollarTexture(), [])
  useFrame((_, d) => {
    t.current += d
    if (!ref.current) return
    const near = useGame.getState().near?.id === 'mailbox'
    // bob + gentle circular drift
    ref.current.position.x = Math.cos(t.current * 1.1) * 0.45
    ref.current.position.z = Math.sin(t.current * 1.1) * 0.45
    ref.current.position.y = baseY + Math.sin(t.current * 2.2) * 0.22
    ref.current.quaternion.copy(camera.quaternion) // billboard
    const s = near ? 1 + Math.sin(t.current * 6) * 0.08 : 1
    ref.current.scale.setScalar(s)
  })
  return (
    <mesh ref={ref} position={[0, baseY, 0]}>
      <circleGeometry args={[0.62, 40]} />
      <meshBasicMaterial map={tex} transparent side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  )
}

export function Bank() {
  const glow = useRef()
  useFrame(() => {
    const near = useGame.getState().near?.id === 'mailbox'
    const opened = useGame.getState().mailboxOpened
    if (glow.current) glow.current.material.emissiveIntensity = near && !opened ? Math.sin(Date.now() * 0.006) * 0.4 + 0.5 : 0.12
  })
  return (
    <group position={[MAILBOX[0], 0, MAILBOX[1]]}>
      {/* steps */}
      <RoundedBox args={[3.2, 0.25, 2.2]} radius={0.05} smoothness={3} position={[0, 0.12, 0.9]} receiveShadow castShadow><meshStandardMaterial color="#cbb994" roughness={1} /></RoundedBox>
      <RoundedBox args={[2.8, 0.25, 1.7]} radius={0.05} smoothness={3} position={[0, 0.36, 0.75]} receiveShadow castShadow><meshStandardMaterial color="#d8c9a6" roughness={1} /></RoundedBox>
      {/* main block */}
      <RoundedBox args={[3, 2, 2.2]} radius={0.1} smoothness={4} position={[0, 1.5, -0.2]} castShadow><meshStandardMaterial color="#e9dcc0" roughness={0.95} /></RoundedBox>
      {/* columns */}
      {[-1.05, -0.35, 0.35, 1.05].map((x) => (
        <mesh key={x} position={[x, 1.25, 0.95]} castShadow><cylinderGeometry args={[0.16, 0.16, 1.8, 14]} /><meshStandardMaterial color="#f3ead6" roughness={0.9} /></mesh>
      ))}
      {/* pediment roof */}
      <mesh position={[0, 2.75, 0.4]} rotation={[0, 0, Math.PI / 4]} castShadow><boxGeometry args={[1.5, 1.5, 2.4]} /><meshStandardMaterial color="#5b8a72" roughness={0.9} /></mesh>
      <RoundedBox args={[3.4, 0.4, 2.6]} radius={0.06} smoothness={3} position={[0, 2.45, 0.3]} castShadow><meshStandardMaterial color="#4f7d66" roughness={0.9} /></RoundedBox>
      {/* door */}
      <RoundedBox args={[0.9, 1.3, 0.12]} radius={0.05} smoothness={3} position={[0, 0.95, 0.92]} castShadow><meshStandardMaterial color="#6e4a2c" roughness={0.8} /></RoundedBox>
      {/* glowing $ plaque on the facade */}
      <mesh ref={glow} position={[0, 2.05, 0.95]}>
        <circleGeometry args={[0.42, 32]} />
        <meshStandardMaterial color="#FFD24A" emissive="#FFD24A" emissiveIntensity={0.2} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.05, 0.97]}>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial map={useMemo(() => makeDollarTexture(), [])} transparent toneMapped={false} />
      </mesh>
      {/* big BANK sign, readable from the path (Section 2.3) */}
      <Billboard position={[0, 5.4, 0]}>
        <mesh><planeGeometry args={[2.6, 0.9]} /><meshBasicMaterial map={cardTexture('ALLOWANCE BANK', null, { accent: '#FFD700' })} transparent toneMapped={false} /></mesh>
      </Billboard>

      {/* hovering spinning $ coin */}
      <DollarCoin baseY={4.1} />
    </group>
  )
}
