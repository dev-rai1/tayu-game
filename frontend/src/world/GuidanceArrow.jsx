import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGame, playerPos } from './store.js'
import { getObjectiveTarget, arriveRadius } from './objective.js'
import { TAX_DISTRICT, TAYU } from './config.js'
import { isPaycheckWorldActive } from './paycheckMode.js'

// Gold bobbing DESTINATION marker above the current objective. Like the neck
// arrow, it STOPS on arrival (comment 14) - no indicator keeps pointing after
// the player reaches the target.
export function GuidanceArrow() {
  const grp = useRef()
  const spin = useRef()
  const t = useRef(0)

  useFrame((_, d) => {
    t.current += d
    const st = useGame.getState()
    const paycheck = isPaycheckWorldActive()
    // Public Module 5 is an in-world layer rather than an internal week, so the
    // legacy objective system does not know about it. While Module 5 is active,
    // point guidance at the glowing paycheck stations instead of the stale
    // objective from the underlying legacy chapter.
    const target = paycheck
      ? [TAX_DISTRICT[0], TAX_DISTRICT[1] + 4.2]
      : getObjectiveTarget(st)
    const radius = paycheck ? 0.45 : arriveRadius(st)
    if (!grp.current) return
    const show = !!target &&
      Math.hypot(target[0] - playerPos.x, target[1] - playerPos.z) > radius
    grp.current.visible = show
    if (target) grp.current.position.set(target[0], 0, target[1])
    if (spin.current) {
      spin.current.position.y = 6.6 + Math.sin(t.current * 2) * 0.35
      spin.current.rotation.y += d * 0.8
    }
  })

  return (
    <group ref={grp} visible={false}>
      <group ref={spin}>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 1.2, 10]} />
          <meshStandardMaterial color={TAYU.gold} emissive={TAYU.gold} emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, -0.1, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.32, 0.6, 10]} />
          <meshStandardMaterial color={TAYU.gold} emissive={TAYU.gold} emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  )
}
