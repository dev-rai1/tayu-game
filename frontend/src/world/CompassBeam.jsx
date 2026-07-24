import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGame, playerPos } from './store.js'
import { getObjectiveTarget, arriveRadius, guidePath } from './objective.js'
import { TAYU } from './config.js'

// THE guidance arrow (Master Adjustment C2 - comments 11/14/17).
//  • Emits from the avatar's NECK height - never from the ground.
//  • A straight, HORIZONTAL shaft+head locked flat (never tilts into the floor).
//  • Re-aimed at the exact current target EVERY frame - cannot be stale.
//  • Bright brand teal with a glow and a gentle pulse toward the target.
//  • Disappears the moment the player arrives (paired with the overhead marker).
// A breadcrumb dot trail regenerates from the avatar outward so the route
// visibly "flows" toward the destination like airport floor lights.

const NECK_H = 1.5
const DOTS = 14
const DOT_SPACING = 1.4

export function CompassBeam() {
  const grp = useRef()
  const pulse = useRef()
  const dots = useRef([])
  const t = useRef(0)

  useFrame((_, d) => {
    t.current += d
    const st = useGame.getState()
    const target = getObjectiveTarget(st)
    const g = grp.current
    if (!g) return
    let dist = 0
    const show = !!target && (dist = Math.hypot(target[0] - playerPos.x, target[1] - playerPos.z)) > arriveRadius(st)
    g.visible = show // stop on arrival - no arrow keeps pointing after the objective is reached
    // R9 1.3: the guide path follows the RING ROAD around the park; the neck
    // arrow aims at the first waypoint, the breadcrumbs march the whole path.
    let path = null
    if (show) {
      path = guidePath(playerPos.x, playerPos.z, target)
      // aim at the first waypoint that isn't already underfoot
      let aim = path[path.length - 1]
      for (const p of path) {
        if (Math.hypot(p[0] - playerPos.x, p[1] - playerPos.z) > 1.6) { aim = p; break }
      }
      const ang = Math.atan2(aim[0] - playerPos.x, aim[1] - playerPos.z)
      g.position.set(playerPos.x, NECK_H, playerPos.z) // neck-anchored, flat
      g.rotation.set(0, ang, 0) // horizontal only - never angles down
      if (pulse.current) {
        const p = 1 + 0.08 * Math.sin(t.current * 4)
        pulse.current.scale.setScalar(p)
        pulse.current.position.z = 0.9 + 0.08 * Math.sin(t.current * 4)
      }
    }
    // breadcrumbs: marched along the guide path (arc-aware), fresh each frame
    let di = 0
    if (show && path) {
      let px = playerPos.x, pz = playerPos.z
      let carry = DOT_SPACING
      for (const [qx, qz] of path) {
        let segLen = Math.hypot(qx - px, qz - pz)
        while (segLen >= carry && di < DOTS) {
          const f = carry / segLen
          px += (qx - px) * f; pz += (qz - pz) * f
          segLen = Math.hypot(qx - px, qz - pz)
          if (Math.hypot(target[0] - px, target[1] - pz) < 1.4) break
          const m = dots.current[di]
          if (m) {
            m.visible = true
            m.position.set(px, 0.06, pz)
            m.material.opacity = 0.3 + 0.5 * Math.max(0, Math.sin(t.current * 3 - di * 0.8))
            m.scale.setScalar(0.16 + 0.05 * Math.sin(t.current * 3 - di * 0.8))
          }
          di++
          carry = DOT_SPACING
        }
        if (di >= DOTS) break
        carry -= segLen
        px = qx; pz = qz
      }
    }
    for (let i = di; i < DOTS; i++) { const m = dots.current[i]; if (m) m.visible = false }
  })

  return (
    <>
      <group ref={grp} visible={false}>
        <group ref={pulse}>
          {/* straight shaft */}
          <mesh position={[0, 0, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.7, 8]} />
            <meshStandardMaterial color={TAYU.teal} emissive={TAYU.teal} emissiveIntensity={1} transparent opacity={0.95} />
          </mesh>
          {/* arrow head */}
          <mesh position={[0, 0, 1.1]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.16, 0.4, 10]} />
            <meshStandardMaterial color={TAYU.teal} emissive={TAYU.teal} emissiveIntensity={1} transparent opacity={0.95} />
          </mesh>
          {/* soft glow halo so it reads against any background */}
          <mesh position={[0, 0, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.26, 0.9, 10]} />
            <meshBasicMaterial color={TAYU.teal} transparent opacity={0.18} toneMapped={false} depthWrite={false} />
          </mesh>
        </group>
      </group>
      {Array.from({ length: DOTS }).map((_, i) => (
        <mesh key={i} ref={(el) => (dots.current[i] = el)} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1, 16]} />
          <meshBasicMaterial color={TAYU.teal} transparent opacity={0.5} toneMapped={false} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}
