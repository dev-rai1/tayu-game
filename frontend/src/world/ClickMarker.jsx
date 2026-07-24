import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGame } from './store.js'

// Expanding teal ring where the player tapped to move (Adopt Me "tap to move").
export function ClickMarker() {
  const marker = useGame((s) => s.clickMarker)
  const ref = useRef()
  const life = useRef(1)

  useEffect(() => {
    if (marker && ref.current) {
      life.current = 0
      ref.current.position.set(marker.x, 0.06, marker.z)
    }
  }, [marker])

  useFrame((_, d) => {
    if (!ref.current) return
    life.current = Math.min(life.current + d * 2.2, 1)
    const p = life.current
    ref.current.scale.setScalar(0.4 + p * 1.7)
    ref.current.material.opacity = (1 - p) * 0.65
    ref.current.visible = p < 1
  })

  if (!marker) return null
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.42, 0.62, 32]} />
      <meshBasicMaterial color="#00DCA0" transparent toneMapped={false} depthWrite={false} />
    </mesh>
  )
}
