// Part J: the mystery party house - visible and LOCKED from the very first
// minute, so finishing the game has a physical promise attached. Floating
// question marks, a glowing door, and a message card that flips the moment
// everything is complete. Interaction lives in Player.jsx (near id 'party').
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Billboard } from '@react-three/drei'
import { useGame } from './store.js'
import { PARTY_HOUSE, RING } from './config.js'
import { labelTexture, cardTexture } from './textures.js'

// 7.4: the disco ball - spins always, sparkles harder once the game is done
function DiscoBall({ y, complete }) {
  const ref = useRef()
  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.y = Date.now() * (complete ? 0.002 : 0.0008)
  })
  return (
    <group position={[0, y, 1.2]}>
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      <mesh ref={ref} position={[0, -0.45, 0]}>
        <sphereGeometry args={[0.38, 12, 10]} />
        <meshStandardMaterial color="#cfd8ea" metalness={0.95} roughness={0.12} flatShading />
      </mesh>
    </group>
  )
}

// 7.4: little dancers grooving by the door - the finale vibe is visible
// from the road even before it unlocks (a promise of the party inside)
function Dancer({ x, z, color, phase, complete }) {
  const ref = useRef()
  useFrame(() => {
    if (!ref.current) return
    const t = Date.now() * 0.004 + phase
    const amp = complete ? 1 : 0.55
    ref.current.position.y = Math.abs(Math.sin(t)) * 0.28 * amp
    ref.current.rotation.y = Math.sin(t * 0.5) * 0.9 * amp
    ref.current.rotation.z = Math.sin(t) * 0.12 * amp
  })
  return (
    <group position={[x, 0, z]}>
      <group ref={ref}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <capsuleGeometry args={[0.22, 0.5, 6, 12]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.15, 0]} castShadow>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshStandardMaterial color="#f5c89b" roughness={0.7} />
        </mesh>
        {[-0.3, 0.3].map((ax) => (
          <mesh key={ax} position={[ax, 0.75, 0]} rotation={[0, 0, ax > 0 ? -0.9 : 0.9]}>
            <capsuleGeometry args={[0.06, 0.3, 4, 8]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// 7.4: pulsing party lights washing the front of the house
function PartyLights({ complete }) {
  const ref = useRef()
  useFrame(() => {
    if (!ref.current) return
    const t = Date.now() * 0.003
    ref.current.children.forEach((m, i) => {
      m.material.opacity = (complete ? 0.5 : 0.22) + Math.sin(t * 2 + i * 2.1) * 0.18
    })
  })
  const cols = ['#FFD700', '#00DCA0', '#7850F0']
  return (
    <group ref={ref}>
      {cols.map((c, i) => (
        <mesh key={c} position={[(i - 1) * 1.7, 0.06, 3.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.9, 20]} />
          <meshBasicMaterial color={c} transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function QuestionMark({ x, y, z, phase }) {
  const ref = useRef()
  useFrame(() => {
    if (!ref.current) return
    const t = Date.now() * 0.0012 + phase
    ref.current.position.y = y + Math.sin(t) * 0.25
    ref.current.rotation.y = Math.sin(t * 0.7) * 0.5
  })
  const tex = labelTexture('?', { bg: '#3a1f6e', color: '#FFD700', accent: '#FFD700' })
  return (
    <mesh ref={ref} position={[x, y, z]}>
      <planeGeometry args={[0.7, 0.7]} />
      <meshBasicMaterial map={tex} transparent side={2} />
    </mesh>
  )
}

export function PartyHouse() {
  const gameComplete = useGame((s) => s.gameComplete)
  const [hx, hz] = PARTY_HOUSE
  const faceRoad = Math.atan2(RING.c[0] - hx, RING.c[1] - hz)
  const door = useRef()
  useFrame(() => {
    const t = Date.now() * 0.003
    if (door.current) door.current.material.emissiveIntensity = gameComplete ? 0.9 + Math.sin(t * 2) * 0.4 : 0.45 + Math.sin(t) * 0.2
  })
  const sign = gameComplete
    ? cardTexture('FINALE AREA', 'Come in, Money Guru!', { bg: '#071748', color: '#ffffff', accent: '#FFD700' })
    : cardTexture('MODULE 6', 'Bond Street is next — keep going!', { bg: '#071748', color: '#ffffff', accent: '#7850F0' })
  return (
    <group position={[hx, 0, hz]} rotation={[0, faceRoad, 0]}>
      {/* the house - deep party purple with a starry roof */}
      <RoundedBox args={[5, 3.4, 4]} radius={0.16} smoothness={3} position={[0, 1.7, 0]} castShadow>
        <meshPhysicalMaterial color="#3a1f6e" clearcoat={0.5} roughness={0.45} />
      </RoundedBox>
      <mesh position={[0, 4.1, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.05, 1, 0.85]} castShadow>
        <coneGeometry args={[3.5, 1.8, 4]} />
        <meshStandardMaterial color="#241245" roughness={0.6} />
      </mesh>
      {/* the glowing door (faces the village, +z) */}
      <RoundedBox args={[1.3, 2.1, 0.14]} radius={0.06} smoothness={2} position={[0, 1.05, 2.02]}>
        <meshStandardMaterial color="#1b0f38" roughness={0.5} />
      </RoundedBox>
      <mesh ref={door} position={[0, 1.05, 2.1]}>
        <planeGeometry args={[1.1, 1.9]} />
        <meshStandardMaterial color={gameComplete ? '#FFD700' : '#7850F0'} emissive={gameComplete ? '#FFD700' : '#7850F0'} emissiveIntensity={0.5} roughness={0.3} />
      </mesh>
      {/* dark windows with a hint of disco color inside */}
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, 2, 2.02]}>
          <planeGeometry args={[0.9, 0.8]} />
          <meshStandardMaterial color="#120a26" emissive={gameComplete ? '#00DCA0' : '#241245'} emissiveIntensity={gameComplete ? 0.5 : 0.15} roughness={0.4} />
        </mesh>
      ))}
      {/* floating mystery marks */}
      <QuestionMark x={-1.4} y={4.6} z={0.6} phase={0} />
      <QuestionMark x={1.2} y={5} z={-0.2} phase={2.1} />
      <QuestionMark x={0.2} y={5.4} z={0.9} phase={4.2} />
      {/* 7.4: the FINALE AREA vibe - disco ball, dancers, pulsing lights */}
      <DiscoBall y={3.6} complete={gameComplete} />
      <Dancer x={-2.6} z={3.1} color="#e05252" phase={0} complete={gameComplete} />
      <Dancer x={2.6} z={3.3} color="#3f9a42" phase={2.2} complete={gameComplete} />
      <Dancer x={0.6} z={4.2} color="#7850F0" phase={4.1} complete={gameComplete} />
      <PartyLights complete={gameComplete} />
      {/* E3: the promise sign - billboarded toward the camera, raised and
          large so it reads clearly from the approach path */}
      <Billboard position={[0, 5.6, 0]}>
        <mesh>
          <planeGeometry args={[4.4, 2.2]} />
          <meshBasicMaterial map={sign} transparent side={2} depthTest={false} />
        </mesh>
      </Billboard>
    </group>
  )
}
