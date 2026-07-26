// ROUND 9 PART 1.2 + 7: ambient life in the park. Townsfolk dancing, sitting
// by the water and picnicking (all talkable - Player.jsx picks them up from
// AMBIENT_NPCS), ducks circling the lake, and bunnies hopping in the grass.
// All cheap useFrame animation on plain meshes - no re-renders, no physics.
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { playerPos } from './store.js'
import { AMBIENT_NPCS, LAKE } from './config.js'

// v8 Section 4: reduced-motion stills all decorative life
const STILL = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Clay({ color, rough = 0.9 }) {
  return <meshStandardMaterial color={color} roughness={rough} metalness={0} />
}

// one little person; kind: dance | sit | picnic
function Villager({ npc, phase }) {
  const body = useRef()
  useFrame(() => {
    const g = body.current
    if (!g) return
    const dx = playerPos.x - npc.pos[0], dz = playerPos.z - npc.pos[1]
    if (dx * dx + dz * dz > 1225) return // R13c: freeze distant park folk (35u)
    const t = Date.now() * 0.004 + phase
    if (npc.kind === 'dance') {
      g.position.y = Math.abs(Math.sin(t)) * 0.26
      g.rotation.y = Math.sin(t * 0.5) * 0.9
      g.rotation.z = Math.sin(t) * 0.1
    } else if (npc.kind === 'sit') {
      g.position.y = 0.02 + Math.sin(t * 0.4) * 0.03 // gentle sway on the bench
      g.rotation.y = Math.sin(t * 0.22) * 0.25
    } else {
      g.position.y = Math.max(0, Math.sin(t * 0.7)) * 0.08 // picnic bounce
      g.rotation.y = Math.sin(t * 0.3) * 0.5
    }
  })
  const sitting = npc.kind === 'sit'
  return (
    <group position={[npc.pos[0], 0, npc.pos[1]]}>
      <group ref={body}>
        <mesh position={[0, sitting ? 0.72 : 0.55, 0]} castShadow>
          <capsuleGeometry args={[0.2, 0.44, 6, 12]} /><Clay color={npc.color} />
        </mesh>
        <mesh position={[0, sitting ? 1.26 : 1.1, 0]} castShadow>
          <sphereGeometry args={[0.19, 12, 12]} /><Clay color="#f5c89b" />
        </mesh>
        {/* arms - up when dancing, folded low otherwise */}
        {[-0.28, 0.28].map((ax) => (
          <mesh key={ax} position={[ax, sitting ? 0.85 : npc.kind === 'dance' ? 0.78 : 0.6, 0]}
            rotation={[0, 0, npc.kind === 'dance' ? (ax > 0 ? -1 : 1) : ax > 0 ? -0.35 : 0.35]}>
            <capsuleGeometry args={[0.055, 0.28, 4, 8]} /><Clay color={npc.color} />
          </mesh>
        ))}
        {/* legs forward when sitting */}
        {sitting && [-0.1, 0.1].map((lx) => (
          <mesh key={lx} position={[lx, 0.42, 0.22]} rotation={[1.2, 0, 0]}>
            <capsuleGeometry args={[0.06, 0.3, 4, 8]} /><Clay color="#2f3b52" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Duck({ r, speed, phase, dir = 1 }) {
  const ref = useRef()
  useFrame(() => {
    const g = ref.current
    if (!g) return
    const dx = playerPos.x - LAKE.x, dz = playerPos.z - LAKE.z
    if (dx * dx + dz * dz > 1600) return // R13c: freeze ducks when away from the lake
    const t = Date.now() * 0.001 * speed * dir + phase
    g.position.set(LAKE.x + Math.cos(t) * r, 0.12 + Math.sin(t * 6) * 0.02, LAKE.z + Math.sin(t) * r)
    g.rotation.y = -t - dir * Math.PI / 2
  })
  return (
    <group ref={ref}>
      <mesh castShadow><sphereGeometry args={[0.22, 10, 10]} /><Clay color="#fff8e0" /></mesh>
      <mesh position={[0.16, 0.16, 0]} castShadow><sphereGeometry args={[0.13, 10, 10]} /><Clay color="#fff8e0" /></mesh>
      <mesh position={[0.28, 0.15, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.05, 0.12, 6]} /><Clay color="#f5a623" /></mesh>
    </group>
  )
}

function Bunny({ x, z, phase }) {
  const ref = useRef()
  useFrame(() => {
    const g = ref.current
    if (!g) return
    const dx = playerPos.x - x, dz = playerPos.z - z
    if (dx * dx + dz * dz > 1225) return // R13c: freeze distant bunnies
    const t = Date.now() * 0.0016 + phase
    const hop = Math.abs(Math.sin(t * 3))
    g.position.set(x + Math.sin(t) * 1.6, hop * 0.3, z + Math.cos(t * 0.7) * 1.2)
    g.rotation.y = Math.cos(t) * 0.8
  })
  return (
    <group ref={ref}>
      <mesh castShadow><sphereGeometry args={[0.16, 10, 10]} /><Clay color="#e8e2d8" /></mesh>
      <mesh position={[0.1, 0.14, 0]} castShadow><sphereGeometry args={[0.1, 10, 10]} /><Clay color="#e8e2d8" /></mesh>
      {[-0.04, 0.04].map((ex) => (
        <mesh key={ex} position={[0.12 + ex, 0.28, 0]} rotation={[0, 0, ex * 3]}>
          <capsuleGeometry args={[0.025, 0.12, 4, 6]} /><Clay color="#e8e2d8" />
        </mesh>
      ))}
      <mesh position={[-0.16, 0.04, 0]}><sphereGeometry args={[0.06, 8, 8]} /><Clay color="#fff" /></mesh>
    </group>
  )
}

export function Ambient() {
  if (STILL) return (
    <group>
      {AMBIENT_NPCS.map((npc) => (
        <group key={npc.id} position={[npc.pos[0], 0, npc.pos[1]]}>
          <mesh position={[0, 0.55, 0]} castShadow><capsuleGeometry args={[0.2, 0.44, 6, 12]} /><meshStandardMaterial color={npc.color} roughness={0.9} /></mesh>
          <mesh position={[0, 1.1, 0]} castShadow><sphereGeometry args={[0.19, 12, 12]} /><meshStandardMaterial color="#f5c89b" roughness={0.9} /></mesh>
        </group>
      ))}
    </group>
  )
  return (
    <group>
      {AMBIENT_NPCS.map((npc, i) => <Villager key={npc.id} npc={npc} phase={i * 1.9} />)}
      <Duck r={4.2} speed={0.5} phase={0} />
      <Duck r={5.6} speed={0.4} phase={2.4} dir={-1} />
      <Duck r={3.1} speed={0.62} phase={4.4} />
      <Bunny x={12} z={-18} phase={0} />
      <Bunny x={46} z={-5} phase={2.6} />
    </group>
  )
}
