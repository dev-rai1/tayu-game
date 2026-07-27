// ROUND 9 PART 1.2 + 7: ambient life in the park. Townsfolk dancing, sitting
// by the water and picnicking (all talkable - Player.jsx picks them up from
// AMBIENT_NPCS), ducks circling the lake, and bunnies hopping in the grass.
// All cheap useFrame animation on plain meshes - no re-renders, no physics.
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { playerPos } from './store.js'
import { AMBIENT_NPCS, LAKE, RING, SCENERY_ZONES, ringPoint } from './config.js'

// v8 Section 4: reduced-motion stills all decorative life
const STILL = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Clay({ color, rough = 0.9 }) {
  return <meshStandardMaterial color={color} roughness={rough} metalness={0} />
}

const gapSpot = (angle, radialOffset, tangentOffset = 0) => {
  const [x, z] = ringPoint(angle)
  const rx = (x - RING.c[0]) / RING.r
  const rz = (z - RING.c[1]) / RING.r
  return [
    x + rx * radialOffset - rz * tangentOffset,
    z + rz * radialOffset + rx * tangentOffset,
  ]
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

function Butterfly({ x, z, phase, color }) {
  const ref = useRef()
  const leftWing = useRef()
  const rightWing = useRef()
  useFrame(() => {
    const g = ref.current
    if (!g) return
    const t = Date.now() * 0.001 + phase
    g.position.set(x + Math.cos(t * 0.8) * 1.25, 1.15 + Math.sin(t * 1.7) * 0.35, z + Math.sin(t * 0.8) * 1.25)
    g.rotation.y = -t * 0.8
    const flap = Math.sin(t * 12) * 0.75
    if (leftWing.current) leftWing.current.rotation.y = flap
    if (rightWing.current) rightWing.current.rotation.y = -flap
  })
  return (
    <group ref={ref}>
      <mesh position={[0, 0, 0]}><capsuleGeometry args={[0.025, 0.12, 3, 6]} /><Clay color="#3b2a35" /></mesh>
      <mesh ref={leftWing} position={[-0.1, 0, 0]} rotation={[0, 0.35, 0.15]}>
        <circleGeometry args={[0.16, 10]} /><meshStandardMaterial color={color} side={2} roughness={0.65} />
      </mesh>
      <mesh ref={rightWing} position={[0.1, 0, 0]} rotation={[0, -0.35, -0.15]}>
        <circleGeometry args={[0.16, 10]} /><meshStandardMaterial color={color} side={2} roughness={0.65} />
      </mesh>
    </group>
  )
}

function Bird({ x, z, phase, color = '#5aa6ff' }) {
  const ref = useRef()
  useFrame(() => {
    const g = ref.current
    if (!g) return
    const t = Date.now() * 0.0011 + phase
    g.position.set(x + Math.cos(t) * 2.2, 2.4 + Math.sin(t * 2) * 0.25, z + Math.sin(t) * 2.2)
    g.rotation.y = -t - Math.PI / 2
    g.rotation.z = Math.sin(t * 8) * 0.08
  })
  return (
    <group ref={ref}>
      <mesh><sphereGeometry args={[0.12, 8, 8]} /><Clay color={color} /></mesh>
      <mesh position={[0.13, 0.02, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.04, 0.12, 6]} /><Clay color="#f5a623" /></mesh>
      {[-0.16, 0.16].map((zWing) => (
        <mesh key={zWing} position={[0, 0, zWing]} rotation={[0.15, 0, zWing > 0 ? 0.45 : -0.45]}>
          <boxGeometry args={[0.32, 0.035, 0.12]} /><Clay color={color} />
        </mesh>
      ))}
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

function ParkAnimal({ x, z, phase, color = '#b8794d', kind = 'dog' }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const g = ref.current
    if (!g) return
    const t = clock.elapsedTime * 0.55 + phase
    g.position.set(x + Math.sin(t) * 0.7, 0, z + Math.cos(t * 0.8) * 0.55)
    g.rotation.y = Math.atan2(Math.cos(t), -Math.sin(t * 0.8))
  })
  const earHeight = kind === 'deer' ? 0.34 : 0.25
  return (
    <group ref={ref}>
      <mesh position={[0, 0.34, 0]} castShadow><capsuleGeometry args={[0.18, 0.42, 6, 10]} /><Clay color={color} /></mesh>
      <mesh position={[0.28, 0.53, 0]} castShadow><sphereGeometry args={[0.2, 10, 10]} /><Clay color={color} /></mesh>
      {[-0.1, 0.1].map((ez) => (
        <mesh key={ez} position={[0.28, 0.73, ez]} rotation={[0, 0, ez * 2]}>
          <coneGeometry args={[0.065, earHeight, 6]} /><Clay color={color} />
        </mesh>
      ))}
      <mesh position={[-0.27, 0.5, 0]} rotation={[0, 0, -0.65]}>
        <capsuleGeometry args={[0.035, 0.28, 4, 6]} /><Clay color={kind === 'cat' ? '#6f8796' : color} />
      </mesh>
      {[[-0.12, 0.13], [0.12, 0.13]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.14, lz]}><capsuleGeometry args={[0.045, 0.22, 4, 6]} /><Clay color={color} /></mesh>
      ))}
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
      {/* Friendly park animals animate in small pockets beside the town buildings. */}
      <ParkAnimal x={15} z={10} phase={0.2} color="#bf7a4f" kind="dog" />
      <ParkAnimal x={45} z={10} phase={1.8} color="#6f8796" kind="cat" />
      <ParkAnimal x={20} z={-24} phase={3.1} color="#c49a6c" kind="deer" />
      <ParkAnimal x={40} z={-24} phase={4.6} color="#d89b65" kind="dog" />
      {/* R14 P3: duck orbits fit the smaller pond (lake r ~5.2) */}
      <Duck r={2.7} speed={0.5} phase={0} />
      <Duck r={3.8} speed={0.4} phase={2.4} dir={-1} />
      <Duck r={2.0} speed={0.62} phase={4.4} />
      {/* A few gentle butterflies tie the new center pavilions to the lake. */}
      <Butterfly x={19} z={-2} phase={0.4} color="#ffb3cf" />
      <Butterfly x={41} z={-2} phase={2.1} color="#8fc9ff" />
      <Butterfly x={30} z={5} phase={3.7} color="#ffe47a" />
      {/* Wildlife matches each neighborhood instead of repeating everywhere. */}
      {SCENERY_ZONES.filter((zone) => ['orchard', 'mushroom-woods', 'picnic-grove', 'pine-trail', 'autumn-grove'].includes(zone.theme)).map((zone, i) => {
        const [x, z] = gapSpot(zone.angle, 10.5, i % 2 ? 5.2 : -5.2)
        return <Bunny key={`gap-bunny-${zone.theme}`} x={x} z={z} phase={i * 1.7} />
      })}
      {SCENERY_ZONES.filter((zone) => ['butterfly-meadow', 'sunflower-field', 'wildflower-hill'].includes(zone.theme)).map((zone, i) => {
        const [x, z] = gapSpot(zone.angle, 6.2, i % 2 ? 4.5 : -4.5)
        return <Butterfly key={`gap-butterfly-${zone.theme}`} x={x} z={z} phase={i * 1.3} color={zone.accent} />
      })}
      {SCENERY_ZONES.filter((zone) => ['birdhouse-grove', 'pine-trail', 'sculpture-garden'].includes(zone.theme)).map((zone, i) => {
        const [x, z] = gapSpot(zone.angle, 8.2, i % 2 ? 3.8 : -3.8)
        return <Bird key={`gap-bird-${zone.theme}`} x={x} z={z} phase={i * 1.8} color={zone.accent} />
      })}
    </group>
  )
}
