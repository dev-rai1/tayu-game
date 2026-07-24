import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { playerPos } from './store.js'

// Ambient animated life to make the world feel alive: drifting clouds, a flock
// of flapping birds, and butterflies fluttering near the flowers. All cheap.

function Clouds() {
  const refs = useRef([])
  const data = useMemo(
    () => Array.from({ length: 9 }, (_, i) => ({ x: -34 + i * 8, y: 11 + (i % 3) * 2.4, z: -12 - (i % 4) * 6, s: 1.5 + (i % 3) * 0.7, speed: 0.4 + (i % 3) * 0.18 })),
    []
  )
  useFrame((_, d) => {
    refs.current.forEach((g, i) => {
      if (!g) return
      g.position.x += data[i].speed * d
      if (g.position.x > 42) g.position.x = -42
    })
  })
  return data.map((c, i) => (
    <group key={i} ref={(el) => (refs.current[i] = el)} position={[c.x, c.y, c.z]} scale={c.s}>
      <mesh><sphereGeometry args={[1.1, 12, 12]} /><meshStandardMaterial color="#ffffff" roughness={1} /></mesh>
      <mesh position={[1.1, -0.1, 0]}><sphereGeometry args={[0.85, 12, 12]} /><meshStandardMaterial color="#f3f8ff" roughness={1} /></mesh>
      <mesh position={[-1.1, -0.1, 0.1]}><sphereGeometry args={[0.8, 12, 12]} /><meshStandardMaterial color="#ffffff" roughness={1} /></mesh>
      <mesh position={[0.3, 0.5, 0.15]}><sphereGeometry args={[0.7, 12, 12]} /><meshStandardMaterial color="#ffffff" roughness={1} /></mesh>
    </group>
  ))
}

function Birds() {
  const grp = useRef([])
  const wings = useRef([])
  const t = useRef(0)
  const data = useMemo(() => Array.from({ length: 6 }, (_, i) => ({ r: 13 + i * 2.4, y: 8.5 + (i % 3) * 1.2, off: i * 1.1, speed: 0.32 + (i % 3) * 0.06 })), [])
  useFrame((_, d) => {
    t.current += d
    grp.current.forEach((g, i) => {
      if (!g) return
      const a = t.current * data[i].speed + data[i].off
      g.position.set(Math.cos(a) * data[i].r, data[i].y + Math.sin(a * 2) * 0.6, Math.sin(a) * data[i].r)
      g.rotation.y = -a
      const f = Math.sin(t.current * 9 + i) * 0.7
      const w = wings.current[i]
      if (w) { if (w[0]) w[0].rotation.z = f; if (w[1]) w[1].rotation.z = -f }
    })
  })
  return data.map((b, i) => (
    <group key={i} ref={(el) => (grp.current[i] = el)}>
      <mesh ref={(el) => { (wings.current[i] = wings.current[i] || [])[0] = el }} position={[0.22, 0, 0]}><boxGeometry args={[0.46, 0.04, 0.2]} /><meshStandardMaterial color="#3a3f4a" /></mesh>
      <mesh ref={(el) => { (wings.current[i] = wings.current[i] || [])[1] = el }} position={[-0.22, 0, 0]}><boxGeometry args={[0.46, 0.04, 0.2]} /><meshStandardMaterial color="#3a3f4a" /></mesh>
      <mesh><sphereGeometry args={[0.1, 8, 8]} /><meshStandardMaterial color="#2b2f38" /></mesh>
    </group>
  ))
}

// UNMISTAKABLY butterflies (v6 Section 3 - the old flat rectangles read as
// flying dollar bills). Two rounded teardrop wings hinged at a thin body,
// flapping with opposing sine rotation; bright NON-money colors (no green,
// no white/gray rectangles); fluttery erratic paths, low count.
const WING_GEO = (() => {
  const s = new THREE.Shape()
  // teardrop: fat rounded tip, narrow at the body hinge (x=0)
  s.moveTo(0, 0)
  s.bezierCurveTo(0.16, 0.3, 0.46, 0.34, 0.5, 0.1)
  s.bezierCurveTo(0.52, -0.12, 0.3, -0.3, 0.12, -0.2)
  s.bezierCurveTo(0.04, -0.14, 0, -0.06, 0, 0)
  s.closePath()
  return new THREE.ShapeGeometry(s, 12)
})()

function Butterflies() {
  const refs = useRef([])
  const wings = useRef([])
  const t = useRef(0)
  const data = useMemo(() => [
    { x: -5, z: 3.6, c: '#7850F0' }, { x: 6, z: 1, c: '#FFD700' },
    { x: -9, z: 1.4, c: '#ff7eb6' }, { x: 2.6, z: -6, c: '#ff9f43' },
    { x: 8, z: 4.6, c: '#c77dff' }, { x: -12, z: -6, c: '#ff7eb6' },
  ], [])
  useFrame((_, d) => {
    t.current += d
    refs.current.forEach((g, i) => {
      if (!g) return
      const a = t.current * 0.9 + i * 2.1
      // erratic flutter: two incommensurate sine frequencies + quick bobs,
      // never a straight glide
      const bx = Math.cos(a) * 1.2 + Math.sin(a * 2.7) * 0.5
      const bz = Math.sin(a * 1.3) * 1.2 + Math.cos(a * 3.1) * 0.4
      const by = 0.85 + Math.sin(a * 4.2) * 0.28 + Math.sin(t.current * 9 + i) * 0.06
      g.position.set(data[i].x + bx, by, data[i].z + bz)
      g.rotation.y = Math.atan2(
        -Math.sin(a) * 1.2 + Math.cos(a * 2.7) * 1.35,
        Math.cos(a * 1.3) * 1.56 - Math.sin(a * 3.1) * 1.24
      )
      const flap = Math.sin(t.current * 13 + i * 1.7) * 1.05
      const w = wings.current[i]
      if (w) { if (w[0]) w[0].rotation.y = -0.35 - flap; if (w[1]) w[1].rotation.y = Math.PI + 0.35 + flap }
    })
  })
  return data.map((b, i) => (
    <group key={i} ref={(el) => (refs.current[i] = el)} position={[b.x, 0.85, b.z]} scale={0.62}>
      {/* thin body - clearly an insect, not a bill */}
      <mesh rotation={[Math.PI / 2, 0, 0]}><capsuleGeometry args={[0.028, 0.3, 4, 8]} /><meshStandardMaterial color="#3a2f4a" /></mesh>
      {/* two teardrop wings hinged at the body, flapping in opposition */}
      <mesh ref={(el) => { (wings.current[i] = wings.current[i] || [])[0] = el }} geometry={WING_GEO} rotation={[-Math.PI / 2.6, 0, 0]}>
        <meshStandardMaterial color={b.c} roughness={0.55} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={(el) => { (wings.current[i] = wings.current[i] || [])[1] = el }} geometry={WING_GEO} rotation={[-Math.PI / 2.6, Math.PI, 0]}>
        <meshStandardMaterial color={b.c} roughness={0.55} side={THREE.DoubleSide} />
      </mesh>
    </group>
  ))
}

// F4: little ground birds that hop about and flutter away as you approach.
function GroundBirds() {
  const refs = useRef([])
  const birds = useMemo(() => [
    { x: -4, z: 10, home: [-4, 10] }, { x: 10, z: 8, home: [10, 8] }, { x: -12, z: -6, home: [-12, -6] },
  ].map((b) => ({ ...b, t: Math.random() * 10, fleeing: 0, tx: b.x, tz: b.z })), [])
  useFrame((_, d) => {
    birds.forEach((b, i) => {
      const m = refs.current[i]
      if (!m) return
      b.t += d
      const dp = Math.hypot(b.x - playerPos.x, b.z - playerPos.z)
      if (dp < 2.5 && b.fleeing <= 0) {
        b.fleeing = 1.4
        const ang = Math.atan2(b.x - playerPos.x, b.z - playerPos.z) + (Math.random() - 0.5)
        b.tx = b.x + Math.sin(ang) * 7
        b.tz = b.z + Math.cos(ang) * 7
      }
      if (b.fleeing > 0) {
        b.fleeing -= d
        b.x += (b.tx - b.x) * 2.4 * d
        b.z += (b.tz - b.z) * 2.4 * d
        m.position.set(b.x, 0.25 + Math.sin(b.fleeing * Math.PI / 1.4) * 2.2, b.z)
      } else {
        // hop about near home
        if (Math.random() < 0.008) { b.tx = b.home[0] + (Math.random() * 4 - 2); b.tz = b.home[1] + (Math.random() * 4 - 2) }
        b.x += (b.tx - b.x) * 0.8 * d
        b.z += (b.tz - b.z) * 0.8 * d
        m.position.set(b.x, 0.12 + Math.abs(Math.sin(b.t * 8)) * 0.1, b.z)
      }
      m.rotation.y = Math.atan2(b.tx - b.x, b.tz - b.z)
    })
  })
  return birds.map((b, i) => (
    <group key={i} ref={(el) => (refs.current[i] = el)} position={[b.x, 0.12, b.z]}>
      <mesh castShadow><sphereGeometry args={[0.12, 10, 10]} /><meshStandardMaterial color="#8a6b4a" /></mesh>
      <mesh position={[0, 0.09, 0.09]}><sphereGeometry args={[0.075, 8, 8]} /><meshStandardMaterial color="#a0805c" /></mesh>
      <mesh position={[0, 0.09, 0.17]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.03, 0.08, 6]} /><meshStandardMaterial color="#f5c542" /></mesh>
    </group>
  ))
}

// F4: a happy dog that wanders the green and spins when you come say hi.
function Dog() {
  const grp = useRef()
  const state = useRef({ x: 6, z: 12, tx: 6, tz: 12, t: 0, spin: 0, spun: false })
  useFrame((_, d) => {
    const s = state.current
    const m = grp.current
    if (!m) return
    s.t += d
    const dp = Math.hypot(s.x - playerPos.x, s.z - playerPos.z)
    if (dp < 2 && !s.spun) { s.spin = 1.1; s.spun = true }
    if (dp > 4) s.spun = false
    if (s.spin > 0) {
      s.spin -= d
      m.rotation.y += d * 12 // happy spin!
      m.position.y = Math.abs(Math.sin(s.t * 10)) * 0.18
    } else {
      if (Math.random() < 0.005) { s.tx = 4 + Math.random() * 10; s.tz = 8 + Math.random() * 8 }
      const dx = s.tx - s.x, dz = s.tz - s.z
      const dist = Math.hypot(dx, dz)
      if (dist > 0.2) {
        s.x += (dx / dist) * 1.4 * d
        s.z += (dz / dist) * 1.4 * d
        m.rotation.y = Math.atan2(dx, dz)
        m.position.y = Math.abs(Math.sin(s.t * 9)) * 0.06
      } else m.position.y = 0
    }
    m.position.x = s.x
    m.position.z = s.z
  })
  return (
    <group ref={grp} position={[6, 0, 12]}>
      <mesh position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><capsuleGeometry args={[0.16, 0.34, 6, 10]} /><meshStandardMaterial color="#c9974a" /></mesh>
      <mesh position={[0, 0.5, 0.3]} castShadow><sphereGeometry args={[0.15, 12, 12]} /><meshStandardMaterial color="#c9974a" /></mesh>
      {[-0.09, 0.09].map((x) => (
        <mesh key={x} position={[x, 0.63, 0.28]} rotation={[0.3, 0, x < 0 ? 0.4 : -0.4]} castShadow><coneGeometry args={[0.05, 0.12, 6]} /><meshStandardMaterial color="#a0743a" /></mesh>
      ))}
      <mesh position={[0, 0.42, -0.34]} rotation={[0.8, 0, 0]} castShadow><capsuleGeometry args={[0.035, 0.2, 4, 8]} /><meshStandardMaterial color="#a0743a" /></mesh>
      {[[-0.12, 0.16], [0.12, 0.16], [-0.12, -0.14], [0.12, -0.14]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.12, z]} castShadow><cylinderGeometry args={[0.04, 0.045, 0.24, 8]} /><meshStandardMaterial color="#b0813f" /></mesh>
      ))}
    </group>
  )
}

// F4: a kite drifting high overhead on a long invisible breeze.
function Kite() {
  const grp = useRef()
  const t = useRef(0)
  useFrame((_, d) => {
    t.current += d
    const m = grp.current
    if (!m) return
    const a = t.current * 0.12
    m.position.set(Math.cos(a) * 18, 10 + Math.sin(t.current * 0.7) * 1.2, -6 + Math.sin(a * 1.3) * 12)
    m.rotation.z = Math.sin(t.current * 1.2) * 0.25
  })
  return (
    <group ref={grp} position={[10, 10, -6]}>
      <mesh rotation={[0, 0, Math.PI / 4]}><planeGeometry args={[0.9, 0.9]} /><meshBasicMaterial color="#e2564f" side={THREE.DoubleSide} toneMapped={false} /></mesh>
      <mesh rotation={[0, 0, Math.PI / 4]} position={[0.02, -0.02, 0.001]} scale={0.55}><planeGeometry args={[0.9, 0.9]} /><meshBasicMaterial color="#FFD700" side={THREE.DoubleSide} toneMapped={false} /></mesh>
      {[0.5, 1.0, 1.5].map((yy, i) => (
        <mesh key={i} position={[Math.sin(i) * 0.15, -0.8 - yy * 0.5, 0]}><planeGeometry args={[0.16, 0.1]} /><meshBasicMaterial color={['#00DCA0', '#7850F0', '#1464F0'][i]} side={THREE.DoubleSide} toneMapped={false} /></mesh>
      ))}
    </group>
  )
}

const STILL = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function BackgroundLife() {
  if (STILL) return null // v8: decorative motion stills under reduced-motion
  return (
    <>
      <Clouds />
      <Birds />
      <Butterflies />
      <GroundBirds />
      <Dog />
      <Kite />
    </>
  )
}
