import { useRef } from 'react'
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
    const stride = walking ? Math.sin(t.current * walkSpeed) * 0.52 : 0
    if (limbs.current) {
      if (limbs.current.ll) limbs.current.ll.rotation.x = stride
      if (limbs.current.rl) limbs.current.rl.rotation.x = -stride
      if (limbs.current.la) limbs.current.la.rotation.x = -stride * 0.72
      if (limbs.current.ra) limbs.current.ra.rotation.x = stride * 0.72
    }
    if (root.current) {
      root.current.position.y = position[1] + (walking
        ? Math.abs(Math.sin(t.current * walkSpeed * 2)) * 0.018
        : Math.sin(t.current * 1.8) * 0.04)
    }
    if (mesh.current && !faceCamera && !walking) mesh.current.rotation.y = Math.sin(t.current * 0.4) * 0.25
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
