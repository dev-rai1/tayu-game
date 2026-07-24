import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGame } from './store.js'
import { MAILBOX, TAYU } from './config.js'

// Mailbox on a post. Lid swings open when the allowance is collected; glows when
// the player is in range.
export function Mailbox() {
  const lid = useRef()
  const box = useRef()
  const env = useRef()

  useFrame(() => {
    const st = useGame.getState()
    const opened = st.mailboxOpened
    const near = st.near?.id === 'mailbox'
    if (lid.current) lid.current.rotation.x = THREE.lerp(lid.current.rotation.x, opened ? -1.2 : 0, 0.15)
    if (env.current) env.current.scale.setScalar(opened ? THREE.lerp(env.current.scale.x, 1, 0.12) : 0.001)
    if (box.current) box.current.material.emissiveIntensity = near && !opened ? (Math.sin(Date.now() * 0.006) * 0.3 + 0.5) : 0
  })

  return (
    <group position={[MAILBOX[0], 0, MAILBOX[1]]}>
      {/* post */}
      <mesh position={[0, 0.5, 0]} castShadow><cylinderGeometry args={[0.08, 0.08, 1, 8]} /><meshStandardMaterial color="#6b4a2b" /></mesh>
      {/* box */}
      <mesh ref={box} position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.5, 0.4, 0.7]} />
        <meshStandardMaterial color={TAYU.electric} emissive={TAYU.teal} emissiveIntensity={0} />
      </mesh>
      {/* lid (pivot at back) */}
      <group position={[0, 1.35, -0.35]}>
        <mesh ref={lid} position={[0, 0, 0.35]}>
          <boxGeometry args={[0.52, 0.05, 0.7]} />
          <meshStandardMaterial color="#0e2a6b" />
        </mesh>
      </group>
      {/* flag */}
      <mesh position={[0.28, 1.25, 0]}><boxGeometry args={[0.05, 0.25, 0.02]} /><meshStandardMaterial color="#e23b3b" /></mesh>
      {/* envelope that pops out */}
      <mesh ref={env} position={[0, 1.5, 0]} scale={0.001}>
        <boxGeometry args={[0.4, 0.28, 0.04]} /><meshStandardMaterial color="#fff" />
      </mesh>
    </group>
  )
}

// tiny lerp helper (avoid importing all of three here)
const THREE = { lerp: (a, b, t) => a + (b - a) * t }
