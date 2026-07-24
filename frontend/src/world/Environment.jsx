// ROUND 9 PART 1: the CIRCULAR town environment. A two-way ring road loops
// the whole town (lane dashes down the middle), spurs run to every entrance,
// and the middle of the circle is a park: a lake with lily pads and ducks,
// palms, little forests, flowers, benches and a picnic. Districts sit around
// the outside of the ring in story order.
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBox, Billboard } from '@react-three/drei'
import { BLOCKERS, HOME, PATHS, RING, RING_POINTS, LAKE, STOP_ANGLES, ringPoint } from './config.js'
import { cardTexture } from './textures.js'

const P = {
  grassTop: '#8cbf6a', grassDark: '#7aad59', dirt: '#a9824f', path: '#e3cfa0',
  trunk: '#8a5a36', leaf1: '#5fa84a', leaf2: '#7cc25c', leaf3: '#4e9440',
  wall: '#f2e4c9', roof: '#d98a5a', door: '#7a4a2e', window: '#bfe0f2',
  hill: '#7fb88e', water: '#5aa6d8', waterDeep: '#3f8dc4', lane: '#f7ecd2',
}

function Clay({ color, rough = 0.95, flat = false, ...p }) {
  return <meshStandardMaterial color={color} roughness={rough} metalness={0} flatShading={flat} {...p} />
}

function Tree({ x, z, scale = 1, lean = 0.05, tint = 0 }) {
  const leaves = [P.leaf1, P.leaf2, P.leaf3][tint % 3]
  return (
    <group position={[x, 0, z]} rotation={[lean, 0, lean]} scale={scale}>
      <mesh position={[0, 0.65, 0]} castShadow><cylinderGeometry args={[0.16, 0.26, 1.3, 8]} /><Clay color={P.trunk} /></mesh>
      <mesh position={[0, 1.75, 0]} castShadow><icosahedronGeometry args={[0.95, 1]} /><Clay color={leaves} flat /></mesh>
      <mesh position={[0.45, 1.45, 0.25]} castShadow><icosahedronGeometry args={[0.6, 1]} /><Clay color={P.leaf2} flat /></mesh>
      <mesh position={[-0.4, 1.55, -0.2]} castShadow><icosahedronGeometry args={[0.5, 1]} /><Clay color={P.leaf1} flat /></mesh>
    </group>
  )
}

function Palm({ x, z, scale = 1, lean = 0.12 }) {
  return (
    <group position={[x, 0, z]} rotation={[0, 0, lean]} scale={scale}>
      <mesh position={[0, 1.1, 0]} castShadow><cylinderGeometry args={[0.12, 0.2, 2.2, 8]} /><Clay color="#a97e4f" /></mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.cos((i / 5) * Math.PI * 2) * 0.55, 2.35, Math.sin((i / 5) * Math.PI * 2) * 0.55]}
          rotation={[0.5 * Math.sin((i / 5) * Math.PI * 2), (i / 5) * Math.PI * 2, -0.5 * Math.cos((i / 5) * Math.PI * 2)]}>
          <boxGeometry args={[1.3, 0.05, 0.4]} /><Clay color={P.leaf1} flat />
        </mesh>
      ))}
      <mesh position={[0, 2.3, 0]} castShadow><sphereGeometry args={[0.16, 8, 8]} /><Clay color="#7a531f" /></mesh>
    </group>
  )
}

function Flower({ x, z, color }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.18, 0]}><cylinderGeometry args={[0.02, 0.02, 0.36, 5]} /><Clay color="#4f9a3f" /></mesh>
      <mesh position={[0, 0.4, 0]} castShadow><icosahedronGeometry args={[0.11, 0]} /><Clay color={color} flat /></mesh>
      <mesh position={[0, 0.41, 0]}><sphereGeometry args={[0.04, 8, 8]} /><Clay color="#ffd34d" /></mesh>
    </group>
  )
}

// R12 PERF: ONE draw call for a whole family of props. items:
// [{x, z, s, c}] - position, uniform scale, palette index. Static after mount.
function Scatter({ geometry, colors, items, y = 0, castShadow = false, rough = 0.95, flat = true }) {
  const ref = useRef()
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: rough, metalness: 0, flatShading: flat }), [rough, flat])
  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    items.forEach((it, i) => {
      dummy.position.set(it.x, y + (it.y ?? 0), it.z)
      dummy.scale.setScalar(it.s ?? 1)
      dummy.rotation.set(0, (i * 2.39996) % (Math.PI * 2), 0) // golden-angle variety
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      color.set(colors[(it.c ?? i) % colors.length])
      m.setColorAt(i, color)
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [items, colors, y])
  return <instancedMesh ref={ref} args={[geometry, mat, items.length]} castShadow={castShadow} />
}

// every tree in town, drawn in FOUR draw calls total (trunks, canopies, two
// accent blob passes) instead of ~160 individual meshes
const TREE_SPOTS = [
  // former collision-blocker trees
  { x: 18, z: -17, s: 1 }, { x: 42, z: -19, s: 1.2 }, { x: 22, z: 3, s: 1 }, { x: 41, z: 5, s: 1.2 },
  { x: 30, z: -23.5, s: 1 }, { x: 8, z: -12, s: 1.2 }, { x: 55, z: 8, s: 1 },
  // park trees
  { x: 14, z: -12, s: 1.2 }, { x: 46, z: -12, s: 1.1 }, { x: 16, z: 1, s: 1.05 }, { x: 44, z: -1, s: 1.25 },
  { x: 24, z: -22, s: 1.1 }, { x: 36, z: -22.5, s: 1.15 }, { x: 12, z: -5, s: 0.95 }, { x: 48, z: -7, s: 1.0 },
  // little forests (three per clump)
  { x: 10, z: -16, s: 1.15 }, { x: 12.2, z: -15, s: 0.9 }, { x: 8.4, z: -14.2, s: 0.8 },
  { x: 50, z: -17, s: 1.15 }, { x: 52.2, z: -16, s: 0.9 }, { x: 48.4, z: -15.2, s: 0.8 },
  { x: -10, z: 6, s: 1.15 }, { x: -7.8, z: 7, s: 0.9 }, { x: -11.6, z: 7.8, s: 0.8 },
  { x: 70, z: 2, s: 1.15 }, { x: 72.2, z: 3, s: 0.9 }, { x: 68.4, z: 3.8, s: 0.8 },
  { x: 2, z: 18, s: 1.15 }, { x: 4.2, z: 19, s: 0.9 }, { x: 0.4, z: 19.8, s: 0.8 },
].map((t, i) => ({ ...t, c: i }))

const GEO = {
  trunk: new THREE.CylinderGeometry(0.16, 0.26, 1.3, 7),
  canopy: new THREE.IcosahedronGeometry(0.95, 1),
  blobA: new THREE.IcosahedronGeometry(0.6, 1),
  blobB: new THREE.IcosahedronGeometry(0.5, 1),
  bush: new THREE.IcosahedronGeometry(0.8, 1),
  stem: new THREE.CylinderGeometry(0.02, 0.02, 0.36, 5),
  petal: new THREE.IcosahedronGeometry(0.11, 0),
}

function InstancedTrees() {
  const trunks = TREE_SPOTS.map((t) => ({ x: t.x, z: t.z, s: t.s, y: 0.65 * t.s, c: 0 }))
  const canopies = TREE_SPOTS.map((t) => ({ x: t.x, z: t.z, s: t.s, y: 1.75 * t.s, c: t.c }))
  const blobsA = TREE_SPOTS.map((t) => ({ x: t.x + 0.45 * t.s, z: t.z + 0.25 * t.s, s: t.s, y: 1.45 * t.s, c: t.c + 1 }))
  const blobsB = TREE_SPOTS.map((t) => ({ x: t.x - 0.4 * t.s, z: t.z - 0.2 * t.s, s: t.s, y: 1.55 * t.s, c: t.c + 2 }))
  return (
    <group>
      <Scatter geometry={GEO.trunk} colors={[P.trunk]} items={trunks} castShadow flat={false} />
      <Scatter geometry={GEO.canopy} colors={[P.leaf1, P.leaf2, P.leaf3]} items={canopies} castShadow />
      <Scatter geometry={GEO.blobA} colors={[P.leaf2, P.leaf1, P.leaf3]} items={blobsA} />
      <Scatter geometry={GEO.blobB} colors={[P.leaf3, P.leaf2, P.leaf1]} items={blobsB} />
    </group>
  )
}

// Faraway low hills ringing the play area (faded by fog -> depth).
function Hills() {
  const ring = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2
    const r = 82 + (i % 3) * 6
    const x = RING.c[0] + Math.cos(a) * r, z = RING.c[1] + Math.sin(a) * r
    const s = 6 + (i % 4) * 2
    return { x, z, s }
  })
  return ring.map((h, i) => (
    <mesh key={i} position={[h.x, -1.5, h.z]} scale={[h.s, h.s * 0.55, h.s]} castShadow>
      <icosahedronGeometry args={[1, 1]} /><Clay color={P.hill} flat />
    </mesh>
  ))
}

// THE CENTRAL LAKE - the heart of the park inside the ring.
function Lake() {
  const pads = [[3.2, 2.1], [-4.1, 1.4], [1.1, -4.4], [-2.6, -3.5], [5.2, -1.8], [-5.6, -0.6]]
  const rocks = [[7.2, 3.4], [-6.8, -4.2], [4.6, -6.6], [-7.6, 2.6]]
  return (
    <group position={[LAKE.x, 0, LAKE.z]}>
      {/* sandy shore ring, then shallow water, then a deeper heart */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[LAKE.r - 0.4, LAKE.r + 1.1, 48]} /><Clay color="#caa46a" />
      </mesh>
      <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[LAKE.r - 0.3, 48]} /><meshStandardMaterial color={P.water} roughness={0.15} metalness={0.1} transparent opacity={0.94} />
      </mesh>
      <mesh position={[0, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[LAKE.r * 0.55, 40]} /><meshStandardMaterial color={P.waterDeep} roughness={0.12} metalness={0.12} transparent opacity={0.9} />
      </mesh>
      {pads.map(([lx, lz], i) => (
        <group key={i} position={[lx, 0.07, lz]}>
          <mesh rotation={[-Math.PI / 2, 0, (i * 1.7) % Math.PI]}><circleGeometry args={[0.5, 12, 0.4, Math.PI * 1.75]} /><Clay color="#43a047" /></mesh>
          {i % 2 === 0 && <mesh position={[0.12, 0.06, 0.1]}><sphereGeometry args={[0.09, 8, 8]} /><Clay color="#ff8fb3" /></mesh>}
        </group>
      ))}
      {rocks.map(([rx, rz], i) => (
        <mesh key={`r${i}`} position={[rx, 0.14, rz]} castShadow><dodecahedronGeometry args={[0.34 + (i % 2) * 0.12, 0]} /><Clay color="#9aa0a6" flat /></mesh>
      ))}
      {/* reeds on the shore */}
      {[[8.6, -1.2], [-8.4, 1.8], [2.2, 8.4], [-3, -8.2]].map(([qx, qz], i) => (
        <group key={`q${i}`} position={[qx, 0, qz]}>
          {[0, 1, 2].map((n) => (
            <mesh key={n} position={[n * 0.16 - 0.16, 0.42, (n % 2) * 0.12]} rotation={[0, 0, (n - 1) * 0.14]}>
              <cylinderGeometry args={[0.03, 0.045, 0.85, 5]} /><Clay color="#5a8f3c" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function Fence({ from, to }) {
  const segs = 8
  const posts = []
  for (let i = 0; i <= segs; i++) {
    const tx = from[0] + (to[0] - from[0]) * (i / segs)
    const tz = from[1] + (to[1] - from[1]) * (i / segs)
    posts.push([tx, tz])
  }
  const mx = (from[0] + to[0]) / 2, mz = (from[1] + to[1]) / 2
  const len = Math.hypot(to[0] - from[0], to[1] - from[1])
  const ang = Math.atan2(to[0] - from[0], to[1] - from[1])
  return (
    <group>
      {posts.map(([px, pz], i) => (
        <mesh key={i} position={[px, 0.4, pz]} castShadow><boxGeometry args={[0.12, 0.8, 0.12]} /><Clay color="#b98a55" /></mesh>
      ))}
      {[0.32, 0.6].map((h) => (
        <mesh key={h} position={[mx, h, mz]} rotation={[0, ang, 0]} castShadow><boxGeometry args={[0.06, 0.1, len]} /><Clay color="#cda06a" /></mesh>
      ))}
    </group>
  )
}

function Lamp({ x, z }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1, 0]} castShadow><cylinderGeometry args={[0.07, 0.09, 2, 10]} /><Clay color="#3a4654" /></mesh>
      <mesh position={[0, 2.05, 0]}><sphereGeometry args={[0.18, 14, 14]} /><meshStandardMaterial color="#fff6cf" emissive="#ffe9a3" emissiveIntensity={0.6} /></mesh>
    </group>
  )
}

function Bench({ x, z, rot = 0 }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow><boxGeometry args={[1.4, 0.1, 0.5]} /><Clay color="#a9743f" /></mesh>
      <mesh position={[0, 0.75, -0.22]} castShadow><boxGeometry args={[1.4, 0.5, 0.08]} /><Clay color="#a9743f" /></mesh>
      {[-0.6, 0.6].map((lx) => (<mesh key={lx} position={[lx, 0.22, 0]} castShadow><boxGeometry args={[0.1, 0.45, 0.45]} /><Clay color="#7a531f" /></mesh>))}
    </group>
  )
}

// picnic blanket + basket for the park
function Picnic({ x, z }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0.4]}><planeGeometry args={[2.4, 2]} /><Clay color="#e8626f" /></mesh>
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0.4]}><planeGeometry args={[2.4, 0.28]} /><Clay color="#fff2f2" /></mesh>
      <mesh position={[0.5, 0.22, 0.3]} castShadow><boxGeometry args={[0.5, 0.35, 0.35]} /><Clay color="#a9743f" /></mesh>
      <mesh position={[-0.4, 0.1, -0.3]}><sphereGeometry args={[0.11, 10, 10]} /><Clay color="#e23b3b" /></mesh>
    </group>
  )
}

function Home() {
  const signTex = cardTexture('HOME', null, { accent: '#00DCA0' })
  return (
    <group position={[HOME[0], 0, HOME[1]]}>
      <Billboard position={[0, 5.6, 0]}>
        <mesh><planeGeometry args={[2.6, 0.9]} /><meshBasicMaterial map={signTex} transparent toneMapped={false} /></mesh>
      </Billboard>
      <RoundedBox args={[7, 3, 3.4]} radius={0.18} smoothness={4} position={[0, 1.5, -0.9]} castShadow receiveShadow><Clay color={P.wall} rough={0.9} /></RoundedBox>
      <mesh position={[0, 3.5, -0.9]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[4.7, 1.7, 4]} /><Clay color={P.roof} /></mesh>
      <mesh position={[0, 4.45, -0.9]}><icosahedronGeometry args={[0.18, 0]} /><Clay color="#caa46a" /></mesh>
      <RoundedBox args={[1.1, 1.9, 0.16]} radius={0.06} smoothness={3} position={[0, 0.95, 0.82]} castShadow><Clay color={P.door} /></RoundedBox>
      <mesh position={[0.32, 0.95, 0.92]}><sphereGeometry args={[0.06, 10, 10]} /><Clay color="#f5c542" rough={0.4} /></mesh>
      {[-2.1, 2.1].map((wx) => (
        <group key={wx} position={[wx, 1.5, 0.82]}>
          <RoundedBox args={[1.2, 1.2, 0.1]} radius={0.05} smoothness={3}><Clay color="#fff" /></RoundedBox>
          <mesh position={[0, 0, 0.03]}><boxGeometry args={[1, 1, 0.06]} /><Clay color={P.window} rough={0.3} /></mesh>
          <mesh position={[0, 0, 0.06]}><boxGeometry args={[0.06, 1, 0.04]} /><Clay color="#fff" /></mesh>
          <mesh position={[0, 0, 0.06]}><boxGeometry args={[1, 0.06, 0.04]} /><Clay color="#fff" /></mesh>
        </group>
      ))}
      <RoundedBox args={[0.5, 1, 0.5]} radius={0.06} smoothness={3} position={[1.8, 3.7, -1.4]} castShadow><Clay color="#c87b54" /></RoundedBox>
    </group>
  )
}

function PathSegment({ from, to, w = 2.2 }) {
  const mx = (from[0] + to[0]) / 2, mz = (from[1] + to[1]) / 2
  const dx = to[0] - from[0], dz = to[1] - from[1]
  const len = Math.hypot(dx, dz) + 1.6
  const angle = Math.atan2(dx, dz)
  return (
    <mesh position={[mx, 0.02, mz]} rotation={[-Math.PI / 2, 0, -angle]} receiveShadow>
      <planeGeometry args={[w, len]} /><Clay color={P.path} rough={1} />
    </mesh>
  )
}

function PathLine({ points, w }) {
  const segs = []
  for (let i = 0; i < points.length - 1; i++) segs.push([points[i], points[i + 1]])
  return segs.map(([a, b], i) => <PathSegment key={i} from={a} to={b} w={w} />)
}

// THE TWO-WAY RING ROAD: wide segments around the circle + a dashed center
// line so the two lanes read clearly. Sits slightly above the grass.
function RingRoad() {
  const segs = []
  for (let i = 0; i < RING_POINTS.length - 1; i++) segs.push([RING_POINTS[i], RING_POINTS[i + 1]])
  // lane dashes: one short tangent-aligned stripe at every segment midpoint
  const dashes = segs.map(([a, b]) => {
    const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2
    const ang = Math.atan2(b[0] - a[0], b[1] - a[1])
    return { mx, mz, ang }
  })
  return (
    <group>
      {segs.map(([a, b], i) => <PathSegment key={i} from={a} to={b} w={4.8} />)}
      {dashes.map((d, i) => (
        <mesh key={`d${i}`} position={[d.mx, 0.032, d.mz]} rotation={[-Math.PI / 2, 0, -d.ang]}>
          <planeGeometry args={[0.24, 1.7]} /><Clay color={P.lane} rough={1} />
        </mesh>
      ))}
    </group>
  )
}

export function Environment3D() {
  // lamps light every stop along the ring (just inside the road edge)
  const lampStops = ['allowance', 'home', 'market', 'lemonade', 'budget', 'bank', 'garden', 'party']
  const lamps = lampStops.map((k) => {
    const [x, z] = ringPoint(STOP_ANGLES[k])
    // nudge the lamp toward the center so it never blocks a spur
    const dx = RING.c[0] - x, dz = RING.c[1] - z
    const d = Math.hypot(dx, dz)
    return [x + (dx / d) * 3.4, z + (dz / d) * 3.4]
  })
  return (
    <group>
      {/* big island ground centered under the ring */}
      <mesh position={[RING.c[0], -1, RING.c[1]]} receiveShadow>
        <cylinderGeometry args={[68, 68, 2, 64]} /><Clay color={P.grassTop} rough={1} />
      </mesh>
      {[[6, -20, 4], [20, 6, 5], [44, -22, 4], [46, 2, 4], [30, -6, 11], [0, 10, 5], [62, -8, 4]].map(([x, z, r], i) => (
        <mesh key={i} position={[x, 0.011, z]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[r, 24]} /><Clay color={P.grassDark} rough={1} /></mesh>
      ))}

      <Hills />
      {/* sun */}
      <mesh position={[50, 24, -50]}><sphereGeometry args={[3, 24, 24]} /><meshStandardMaterial color="#fff4cf" emissive="#ffe9a3" emissiveIntensity={0.9} /></mesh>

      {/* PART 1: the two-way ring road + entrance spurs */}
      <RingRoad />
      <PathLine points={PATHS.spurAllowance} />
      <PathLine points={PATHS.spurJars} />
      <PathLine points={PATHS.spurMarket} />
      <PathLine points={PATHS.spurLemonade} />
      <PathLine points={PATHS.spurBudget} />
      <PathLine points={PATHS.spurBank} />
      <PathLine points={PATHS.spurGarden} />
      <PathLine points={PATHS.spurParty} />

      <Home />
      {/* THE PARK: lake at the heart of the circle */}
      <Lake />
      <Picnic x={24.6} z={2.6} />
      <Bench x={36.4} z={-13.2} rot={2.2} />
      <Bench x={23.2} z={-13.8} rot={0.9} />
      <Bench x={1.6} z={-8.6} rot={-0.6} />
      <Fence from={[10, 22]} to={[24, 26.5]} />
      <Fence from={[52, -46]} to={[64, -40]} />

      {lamps.map(([x, z], i) => <Lamp key={`l${i}`} x={x} z={z} />)}

      {/* R12 PERF: every tree in town in 4 instanced draw calls */}
      <InstancedTrees />
      {/* palms around the lake shore and the ring's outer edge */}
      {[[21, -9, 1], [39, -10.5, 1.05], [21.5, -2, 0.95], [38.5, -0.5, 1], [30, -19, 1.1], [-8, -25, 0.95], [30, 27.5, 1], [68, -27, 0.95], [-4, 8, 0.9]].map(([x, z, sc], i) => (
        <Palm key={`p${i}`} x={x} z={z} scale={sc} lean={i % 2 ? 0.12 : -0.1} />
      ))}
      {/* little forests: two inside the park, three around the outside */}
      {/* forest clumps are folded into InstancedTrees above */}

      <BushRing />

      {/* R12 PERF: all flowers in 2 instanced draw calls */}
      {(() => {
        const F = [[4, -14, 0], [12, -24, 1], [24, -26, 2], [36, -26, 3], [46, -24, 4], [52, -14, 0], [50, -3, 1], [40, 8, 2], [28, 10, 3], [16, 8, 4], [6, 2, 0], [2, -18, 3], [26, -10, 1], [34, -2.5, 5]]
        const stems = F.map(([x, z]) => ({ x, z, y: 0.18, c: 0 }))
        const petals = F.map(([x, z, c]) => ({ x, z, y: 0.4, c }))
        return (
          <group>
            <Scatter geometry={GEO.stem} colors={['#4f9a3f']} items={stems} flat={false} />
            <Scatter geometry={GEO.petal} colors={['#ef6f6f', '#f5c542', '#7aa6ff', '#c77dff', '#ff9f43', '#ff8fb3']} items={petals} />
          </group>
        )
      })()}
    </group>
  )
}

// Bushes hug the world edge in a big ellipse around the bounds.
function BushRing() {
  const spots = []
  const CX = 32, CZ = -8, RX = 51, RZ = 47, N = 96
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2
    spots.push([CX + Math.cos(a) * RX, CZ + Math.sin(a) * RZ])
  }
  for (const sp of spots) {
    // never past the ground disc edge - every bush on real ground
    const dx = sp[0] - RING.c[0], dz = sp[1] - RING.c[1]
    const d = Math.hypot(dx, dz)
    if (d > 65) { sp[0] = RING.c[0] + dx * (65 / d); sp[1] = RING.c[1] + dz * (65 / d) }
  }
  const items = spots.map(([x, z], i) => ({
    x: x + (i % 3) * 0.3 - 0.3, z: z + (i % 5) * 0.2 - 0.4,
    y: 0.42 + (i % 2) * 0.08, s: (0.75 + (i % 4) * 0.12) / 0.8, c: i,
  }))
  // R12 PERF: 96 bushes = ONE draw call, no shadows (they hug the far edge)
  return <Scatter geometry={GEO.bush} colors={[P.leaf1, P.leaf2, P.leaf3]} items={items} />
}
