import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { CharacterMesh } from './CharacterMesh.jsx'
import { labelTexture } from './textures.js'
import { useGame } from './store.js'

// Reusable NPC = a recolored character + a billboarded name tag + gentle idle
// bob. Dialogue is driven from the store and shown as a DOM speech panel (Hud).
// This is the base for Penny, Mr. Bram, Theo, Mia, Grandma Rose, Coach Dollar.
export function Npc({ id, name, avatar, position, faceCamera = false, accent = '#7850F0' }) {
  const root = useRef()
  const mesh = useRef()
  const t = useRef(Math.random() * 10)
  const tex = labelTexture(name, { accent })

  useFrame((_, d) => {
    t.current += d
    if (root.current) root.current.position.y = position[1] + Math.sin(t.current * 1.8) * 0.04
    if (mesh.current && !faceCamera) mesh.current.rotation.y = Math.sin(t.current * 0.4) * 0.25
    // light up the name tag when the player is talking to / near this npc
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
