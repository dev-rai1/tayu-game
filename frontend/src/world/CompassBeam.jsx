import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGame, playerPos } from './store.js'
import { getObjectiveTarget, arriveRadius, guidePath } from './objective.js'
import { TAX_DISTRICT, TAYU } from './config.js'
import { BOND_POINTS } from './BondStreetWorld.jsx'
import { isPaycheckWorldActive } from './paycheckMode.js'

const BOND_ONLY_KEY = 'tayu-bond-only-entry'
const NECK_H = 1.5
const DOTS = 18
const DOT_SPACING = 1.1
const AVATAR_CLEARANCE = 2.6

function isBondStreetModuleActive() {
  try { return sessionStorage.getItem(BOND_ONLY_KEY) === '1' } catch { return false }
}

export function CompassBeam() {
  const grp = useRef()
  const pulse = useRef()
  const dots = useRef([])
  const beacon = useRef()
  const beaconArrow = useRef()
  const beaconRing = useRef()
  const t = useRef(0)

  useFrame((_, d) => {
    t.current += d
    const st = useGame.getState()
    const paycheck = isPaycheckWorldActive()
    const bondStreet = isBondStreetModuleActive()
    // A direct Module 6 launch must guide to the first Bond Street interaction,
    // not to whatever legacy campaign objective happens to be stored in state.
    const target = bondStreet
      ? BOND_POINTS.guide
      : paycheck
        ? [TAX_DISTRICT[0], TAX_DISTRICT[1] + 4.2]
        : getObjectiveTarget(st)
    const radius = bondStreet ? 1.2 : paycheck ? 0.45 : arriveRadius(st)
    const g = grp.current
    const b = beacon.current
    if (!g) return
    let dist = 0
    const show = !!target && (dist = Math.hypot(target[0] - playerPos.x, target[1] - playerPos.z)) > radius
    g.visible = show
    if (b) b.visible = show

    let path = null
    if (show) {
      path = guidePath(playerPos.x, playerPos.z, target)
      let aim = path[path.length - 1]
      for (const p of path) {
        if (Math.hypot(p[0] - playerPos.x, p[1] - playerPos.z) > 1.6) { aim = p; break }
      }
      const ang = Math.atan2(aim[0] - playerPos.x, aim[1] - playerPos.z)
      g.position.set(playerPos.x, NECK_H, playerPos.z)
      g.rotation.set(0, ang, 0)
      if (pulse.current) {
        const p = 1 + 0.12 * Math.sin(t.current * 4)
        pulse.current.scale.setScalar(p)
        pulse.current.position.z = 0.95 + 0.12 * Math.sin(t.current * 4)
      }

      if (b) b.position.set(target[0], 0.08, target[1])
      if (beaconArrow.current) {
        beaconArrow.current.position.y = 2.35 + 0.22 * Math.sin(t.current * 4)
        beaconArrow.current.scale.setScalar(1 + 0.1 * Math.sin(t.current * 4))
      }
      if (beaconRing.current) {
        const ringScale = 1 + 0.18 * Math.sin(t.current * 3)
        beaconRing.current.scale.setScalar(ringScale)
      }
    }

    let di = 0
    if (show && path) {
      let px = playerPos.x, pz = playerPos.z
      let carry = AVATAR_CLEARANCE
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
            m.position.set(px, 0.08, pz)
            m.material.opacity = 0.45 + 0.5 * Math.max(0, Math.sin(t.current * 3 - di * 0.65))
            m.scale.setScalar(0.2 + 0.07 * Math.sin(t.current * 3 - di * 0.65))
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
          <mesh position={[0, 0, 0.58]} rotation={[Math.PI / 2, 0, 0]} renderOrder={1000}>
            <cylinderGeometry args={[0.065, 0.065, 0.78, 10]} />
            <meshBasicMaterial color={TAYU.teal} transparent opacity={0.98} toneMapped={false} depthTest={false} />
          </mesh>
          <mesh position={[0, 0, 1.2]} rotation={[Math.PI / 2, 0, 0]} renderOrder={1000}>
            <coneGeometry args={[0.22, 0.48, 12]} />
            <meshBasicMaterial color={TAYU.teal} transparent opacity={0.98} toneMapped={false} depthTest={false} />
          </mesh>
          <mesh position={[0, 0, 0.86]} rotation={[Math.PI / 2, 0, 0]} renderOrder={999}>
            <coneGeometry args={[0.34, 1.05, 12]} />
            <meshBasicMaterial color={TAYU.teal} transparent opacity={0.2} toneMapped={false} depthTest={false} depthWrite={false} />
          </mesh>
        </group>
      </group>

      <group ref={beacon} visible={false}>
        <mesh ref={beaconRing} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1001}>
          <ringGeometry args={[0.55, 0.82, 36]} />
          <meshBasicMaterial color={TAYU.gold} transparent opacity={0.9} toneMapped={false} depthTest={false} depthWrite={false} />
        </mesh>
        <mesh position={[0, 1.15, 0]} renderOrder={1000}>
          <cylinderGeometry args={[0.045, 0.11, 2.2, 12]} />
          <meshBasicMaterial color={TAYU.gold} transparent opacity={0.72} toneMapped={false} depthTest={false} depthWrite={false} />
        </mesh>
        <group ref={beaconArrow} position={[0, 2.35, 0]}>
          <mesh rotation={[0, 0, Math.PI]} renderOrder={1002}>
            <coneGeometry args={[0.38, 0.75, 16]} />
            <meshBasicMaterial color={TAYU.gold} transparent opacity={0.98} toneMapped={false} depthTest={false} />
          </mesh>
          <pointLight color={TAYU.gold} intensity={1.6} distance={5} />
        </group>
      </group>

      {Array.from({ length: DOTS }).map((_, i) => (
        <mesh key={i} ref={(el) => (dots.current[i] = el)} visible={false} rotation={[-Math.PI / 2, 0, 0]} renderOrder={998}>
          <circleGeometry args={[1, 20]} />
          <meshBasicMaterial color={TAYU.teal} transparent opacity={0.65} toneMapped={false} depthTest={false} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}
