import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { LEMONADE, TAYU } from './config.js'
import { cardTexture, emojiTexture } from './textures.js'
import { PROFIT_GOAL } from '../scenarios/lemonade.js'
import { useGame } from './store.js'

// v7 §5.1 - the Profit Goal thermometer: a glass tube on the stand that fills
// GOLD as cumulative Money Profit approaches the $40 gate.
function GoalMeter() {
  const fill = useRef()
  useFrame((_, d) => {
    const st = useGame.getState()
    const p = Math.max(0.02, Math.min(1, st.lemCumProfit / PROFIT_GOAL))
    if (fill.current) {
      fill.current.scale.y = THREE.MathUtils.lerp(fill.current.scale.y, p, Math.min(1, 3 * d))
      fill.current.position.y = 0.5 + (fill.current.scale.y * 1.9) / 2
    }
  })
  return (
    <group position={[1.7, 0, -0.2]}>
      {/* glass tube */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 2, 14]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.25} roughness={0.1} clearcoat={0.8} />
      </mesh>
      {/* gold fill */}
      <mesh ref={fill} position={[0, 0.6, 0]} scale={[1, 0.02, 1]}>
        <cylinderGeometry args={[0.12, 0.12, 1.9, 14]} />
        <meshStandardMaterial color={TAYU.gold} emissive={TAYU.gold} emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow><cylinderGeometry args={[0.22, 0.26, 0.2, 14]} /><meshStandardMaterial color="#8a5a2b" roughness={0.8} /></mesh>
      {/* two-line card canvas is 2:1 - plane must match or the words squish */}
      <Billboard position={[0, 3.05, 0]}>
        <mesh><planeGeometry args={[1.8, 0.9]} /><meshBasicMaterial map={cardTexture('PROFIT GOAL', `$${PROFIT_GOAL}`, { accent: '#FFD700' })} transparent toneMapped={false} /></mesh>
      </Billboard>
    </group>
  )
}

// Week 2 lemonade stand - appears west of the house. Wooden counter, striped
// awning, pitcher + cup stack, and a big LEMONADE sign (label everything).
// The stand is ALWAYS part of the world (it never "disappears" between
// sessions or weeks) - only its interactions unlock in Week 2.
export function LemonadeStand() {
  const glow = useRef()
  const signTex = cardTexture('LEMONADE', null, { accent: '#FFD700' })
  const lemonTex = emojiTexture('🍋')

  useFrame(() => {
    const st = useGame.getState()
    const near = st.near?.id === 'stand' || st.near?.id === 'stand2'
    if (glow.current) glow.current.material.emissiveIntensity = near ? Math.sin(Date.now() * 0.006) * 0.35 + 0.5 : 0.15
  })

  return (
    <group position={[LEMONADE[0], 0, LEMONADE[1]]}>
      {/* counter */}
      <RoundedBox ref={glow} args={[2.6, 1.05, 1]} radius={0.08} smoothness={3} position={[0, 0.55, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#f5c542" clearcoat={0.35} roughness={0.5} emissive="#f5c542" emissiveIntensity={0.15} />
      </RoundedBox>
      {/* awning posts + striped top */}
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} position={[x, 1.45, -0.35]} castShadow><cylinderGeometry args={[0.06, 0.06, 1.9, 10]} /><meshStandardMaterial color="#c9a06a" /></mesh>
      ))}
      <RoundedBox args={[3, 0.18, 1.5]} radius={0.06} smoothness={3} position={[0, 2.45, -0.2]} castShadow>
        <meshStandardMaterial color="#ffde59" roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[3, 0.06, 1.5]} radius={0.03} smoothness={2} position={[0, 2.36, -0.2]}>
        <meshStandardMaterial color="#e2564f" roughness={0.7} />
      </RoundedBox>
      {/* pitcher */}
      <mesh position={[-0.6, 1.35, 0]} castShadow><cylinderGeometry args={[0.18, 0.22, 0.5, 14]} /><meshPhysicalMaterial color="#fff1a8" clearcoat={0.6} roughness={0.2} transparent opacity={0.9} /></mesh>
      {/* cup stack */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.55, 1.18 + i * 0.14, 0.1]} castShadow><cylinderGeometry args={[0.1, 0.08, 0.16, 10]} /><meshStandardMaterial color="#ffffff" roughness={0.5} /></mesh>
      ))}
      {/* floating lemon */}
      <Billboard position={[0, 3.1, 0]}>
        <mesh><planeGeometry args={[0.6, 0.6]} /><meshBasicMaterial map={lemonTex} transparent toneMapped={false} /></mesh>
      </Billboard>
      {/* big LEMONADE sign */}
      <Billboard position={[0, 3.75, 0]}>
        <mesh><planeGeometry args={[2.9, 1]} /><meshBasicMaterial map={signTex} transparent toneMapped={false} /></mesh>
      </Billboard>
      <GoalMeter />
    </group>
  )
}
