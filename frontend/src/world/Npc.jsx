import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { CharacterMesh } from './CharacterMesh.jsx'
import { labelTexture } from './textures.js'
import { useGame } from './store.js'

// Reusable NPC = a recolored character + a billboarded name tag + gentle idle
// bob. Dialogue is driven from the store and shown as a DOM speech panel (Hud).
// `walking` enables a real arm/leg stride so moving NPCs do not look like they
// are sliding across the ground.
export function Npc({ id, name, avatar, position, faceCamera = false, accent = '#7850F0', walking = false, walkSpeed = 7 }) {
  const root = useRef()
  const mesh = useRef()
  const t = useRef(Math.random() * 10)
  const limbs = useRef(null)
  const tex = labelTexture(name, { accent })
  // Walk-cycle state: the stride advances with DISTANCE travelled (measured in
  // world space) rather than with wall-clock time. That keeps the feet planted
  // to the ground - legs never outrun the body and they stop when the body
  // stops - so moving NPCs no longer look like they are sliding/dragging.
  const stridePhase = useRef(Math.random() * Math.PI * 2)
  const worldPos = useRef(null)
  const prevPos = useRef(null)
  const lastStride = useRef(0)

  useFrame((_, d) => {
    t.current += d
    if (mesh.current && !limbs.current) {
      limbs.current = {
        ll: mesh.current.getObjectByName('leftLeg'),
        rl: mesh.current.getObjectByName('rightLeg'),
        la: mesh.current.getObjectByName('leftArm'),
        ra: mesh.current.getObjectByName('rightArm'),
      }
    }

    // How far did we move this frame (world space)?
    let dist = 0
    if (root.current) {
      if (!worldPos.current) worldPos.current = new THREE.Vector3()
      root.current.getWorldPosition(worldPos.current)
      if (prevPos.current) {
        dist = Math.hypot(worldPos.current.x - prevPos.current.x, worldPos.current.z - prevPos.current.z)
      } else {
        prevPos.current = new THREE.Vector3()
      }
      prevPos.current.copy(worldPos.current)
    }

    const moving = dist > 0.0016 || walking
    // Advance the stride in proportion to distance covered. The small time term
    // only kicks in for NPCs explicitly flagged `walking` so they stay lively at
    // a turnaround; it is far too small to cause a visible moonwalk.
    stridePhase.current += dist * 5.6 + (walking && dist < 0.004 ? d * walkSpeed * 0.5 : 0)
    const target = moving ? Math.sin(stridePhase.current) * 0.5 : 0
    // Ease toward the target so legs settle smoothly instead of snapping to rest.
    const stride = THREE.MathUtils.lerp(lastStride.current, target, Math.min(1, 14 * d))
    lastStride.current = stride

    if (limbs.current) {
      if (limbs.current.ll) limbs.current.ll.rotation.x = stride
      if (limbs.current.rl) limbs.current.rl.rotation.x = -stride
      if (limbs.current.la) limbs.current.la.rotation.x = -stride * 0.72
      if (limbs.current.ra) limbs.current.ra.rotation.x = stride * 0.72
    }
    if (root.current) {
      root.current.position.y = position[1] + (moving
        ? Math.abs(Math.sin(stridePhase.current)) * 0.02
        : Math.sin(t.current * 1.8) * 0.04)
    }
    // Gentle idle look-around only when genuinely standing still.
    if (mesh.current && !faceCamera && !moving) mesh.current.rotation.y = Math.sin(t.current * 0.4) * 0.25
  })

  return (
    <group ref={root} position={position}>
      <CharacterMesh ref={mesh} avatar={avatar} />
      <Billboard position={[0, 2.5, 0]}>
        <mesh>
          <planeGeometry args={[1.5, 0.47]} />
          <meshBasicMaterial map={tex} transparent toneMapped={false} />
        </mesh>
      </Billboard>
    </group>
  )
}

// A subtle floating "!" / "?" hint when the player is near an NPC they can talk to.
export function NpcHint({ position, show }) {
  const ref = useRef()
  const t = useRef(0)
  useFrame((_, d) => { t.current += d; if (ref.current) ref.current.position.y = position[1] + 0.15 + Math.sin(t.current * 4) * 0.12 })
  if (!show) return null
  return (
    <Billboard ref={ref} position={position}>
      <mesh><circleGeometry args={[0.22, 24]} /><meshBasicMaterial color="#00DCA0" toneMapped={false} /></mesh>
    </Billboard>
  )
}

export { useGame }
