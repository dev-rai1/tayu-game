import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from './store.js'
import { TAYU } from './config.js'

const FLIGHT = 0.6 // seconds per coin

function AnimatedCoin({ from, to, delay, onDone }) {
  const ref = useRef()
  const t = useRef(-delay)
  const done = useRef(false)
  useFrame((_, d) => {
    t.current += d
    if (t.current < 0 || done.current) return
    const p = Math.min(t.current / FLIGHT, 1)
    const x = THREE.MathUtils.lerp(from.x, to.x, p)
    const z = THREE.MathUtils.lerp(from.z, to.z, p)
    const y = THREE.MathUtils.lerp(from.y, to.y, p) + Math.sin(p * Math.PI) * 2.2
    if (ref.current) {
      ref.current.position.set(x, y, z)
      ref.current.rotation.x += d * 12
      ref.current.visible = p < 1
    }
    if (p >= 1 && !done.current) { done.current = true; onDone?.() }
  })
  return (
    <mesh ref={ref} position={[from.x, from.y, from.z]}>
      <cylinderGeometry args={[0.1, 0.1, 0.03, 14]} />
      <meshStandardMaterial color={TAYU.gold} emissive={TAYU.gold} emissiveIntensity={0.5} metalness={0.4} roughness={0.3} />
    </mesh>
  )
}

function Batch({ batch }) {
  const remaining = useRef(batch.count)
  const removeBatch = useGame((s) => s.removeBatch)
  const coins = Array.from({ length: batch.count }, (_, i) => i)
  return (
    <>
      {coins.map((i) => (
        <AnimatedCoin
          key={i}
          from={batch.from}
          to={batch.to}
          delay={i * 0.08}
          onDone={() => { remaining.current -= 1; if (remaining.current <= 0) removeBatch(batch.id) }}
        />
      ))}
    </>
  )
}

export function CoinLayer() {
  const batches = useGame((s) => s.coinBatches)
  return <>{batches.map((b) => <Batch key={b.id} batch={b} />)}</>
}
