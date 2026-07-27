import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { TUTORIAL_COIN_OFFSET, TUTORIAL_GREETER_OFFSET } from '../utils/kidUx.js'
import { SPAWN } from './config.js'
import { playerPos, useGame } from './store.js'

export const TUTORIAL_COIN = [SPAWN[0] + TUTORIAL_COIN_OFFSET[0], SPAWN[1] + TUTORIAL_COIN_OFFSET[1]]
export const TUTORIAL_GREETER = [SPAWN[0] + TUTORIAL_GREETER_OFFSET[0], SPAWN[1] + TUTORIAL_GREETER_OFFSET[1]]

export function TutorialWorldGuide() {
  const step = useGame((s) => s.kidUxTutorialStep ?? 2)
  const coin = useRef()
  const greeter = useRef()
  const fired = useRef(false)
  const time = useRef(0)

  useFrame((_, delta) => {
    time.current += delta
    if (coin.current) {
      coin.current.rotation.y += delta * 2.2
      coin.current.position.y = 1.05 + Math.sin(time.current * 3.2) * 0.12
    }
    if (greeter.current) greeter.current.position.y = Math.sin(time.current * 2.2) * 0.04
    if (step !== 0) {
      fired.current = false
      return
    }
    const distance = Math.hypot(playerPos.x - TUTORIAL_COIN[0], playerPos.z - TUTORIAL_COIN[1])
    if (distance < 0.95 && !fired.current) {
      fired.current = true
      window.dispatchEvent(new Event('tayu-tutorial-step-one'))
    }
  })

  if (step >= 2) return null

  return (
    <group>
      {step === 0 && (
        <group position={[TUTORIAL_COIN[0], 0, TUTORIAL_COIN[1]]}>
          <mesh ref={coin} position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.12, 24]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.9} metalness={0.25} roughness={0.35} />
          </mesh>
          <pointLight position={[0, 1.15, 0]} color="#FFD700" intensity={1.1} distance={5} />
          <Html center position={[0, 2.05, 0]} style={{ pointerEvents: 'none' }}>
            <div style={{ whiteSpace: 'nowrap', borderRadius: 12, background: '#071748', color: '#fff', padding: '6px 10px', fontSize: 13, fontWeight: 800 }}>
              Walk to the coin
            </div>
          </Html>
        </group>
      )}
      {step === 1 && (
        <group position={[TUTORIAL_GREETER[0], 0, TUTORIAL_GREETER[1]]}>
          <group ref={greeter}>
            <mesh position={[0, 1.25, 0]}>
              <capsuleGeometry args={[0.32, 0.7, 8, 16]} />
              <meshStandardMaterial color="#7850F0" roughness={0.85} />
            </mesh>
            <mesh position={[0, 2.02, 0]}>
              <sphereGeometry args={[0.34, 20, 20]} />
              <meshStandardMaterial color="#f0ba8b" roughness={0.85} />
            </mesh>
            <mesh position={[-0.12, 2.08, 0.3]}><sphereGeometry args={[0.035, 10, 10]} /><meshStandardMaterial color="#071748" /></mesh>
            <mesh position={[0.12, 2.08, 0.3]}><sphereGeometry args={[0.035, 10, 10]} /><meshStandardMaterial color="#071748" /></mesh>
          </group>
          <pointLight position={[0, 1.5, 0]} color="#00DCA0" intensity={0.8} distance={5} />
          <Html center position={[0, 2.75, 0]} style={{ pointerEvents: 'none' }}>
            <div style={{ whiteSpace: 'nowrap', borderRadius: 12, background: '#071748', color: '#fff', padding: '6px 10px', fontSize: 13, fontWeight: 800 }}>
              Say hi with the blue button
            </div>
          </Html>
        </group>
      )}
    </group>
  )
}
