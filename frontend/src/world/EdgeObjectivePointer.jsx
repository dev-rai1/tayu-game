import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { loadProfile } from '../services/walletStore.js'
import { getObjectiveTarget, arriveRadius } from './objective.js'
import { playerPos, useGame } from './store.js'

const EDGE_X = 0.84
const EDGE_Y = 0.74
const AWAY_SECONDS = 6

function playThisWayChime() {
  if (loadProfile()?.muted) return
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const gain = ctx.createGain()
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(520, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.14)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.24)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.25)
    osc.addEventListener('ended', () => ctx.close().catch(() => {}), { once: true })
  } catch {
    // Sound is a gentle extra. Guidance still works without Web Audio.
  }
}

export function EdgeObjectivePointer() {
  const { camera } = useThree()
  const pointer = useRef()
  const label = useRef()
  const world = useRef(new THREE.Vector3())
  const projected = useRef(new THREE.Vector3())
  const previousDistance = useRef(null)
  const awayFor = useRef(0)
  const chimeReady = useRef(true)
  const flashUntil = useRef(0)

  useEffect(() => {
    const flash = () => { flashUntil.current = performance.now() + 1500 }
    window.addEventListener('tayu-flash-arrow', flash)
    return () => window.removeEventListener('tayu-flash-arrow', flash)
  }, [])

  useFrame((_, delta) => {
    const el = pointer.current
    if (!el) return
    const st = useGame.getState()
    const target = getObjectiveTarget(st)
    if (!target) {
      el.style.display = 'none'
      previousDistance.current = null
      awayFor.current = 0
      return
    }

    const distance = Math.hypot(target[0] - playerPos.x, target[1] - playerPos.z)
    if (distance <= arriveRadius(st)) {
      el.style.display = 'none'
      return
    }

    world.current.set(target[0], 1.6, target[1])
    projected.current.copy(world.current).project(camera)
    let x = projected.current.x
    let y = -projected.current.y
    const behind = projected.current.z > 1
    if (behind) { x *= -1; y *= -1 }

    const onScreen = !behind && Math.abs(x) <= 0.92 && Math.abs(y) <= 0.82 && projected.current.z >= -1
    if (onScreen) {
      el.style.display = 'none'
    } else {
      const divisor = Math.max(Math.abs(x) / EDGE_X, Math.abs(y) / EDGE_Y, 0.001)
      const edgeX = x / divisor
      const edgeY = y / divisor
      const angle = Math.atan2(y, x) * 180 / Math.PI
      const distanceScale = Math.max(0.72, Math.min(1.12, 0.7 + distance / 45))
      const flashing = performance.now() < flashUntil.current || awayFor.current >= AWAY_SECONDS
      el.style.display = 'grid'
      el.style.left = `${50 + edgeX * 50}%`
      el.style.top = `${50 + edgeY * 50}%`
      el.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scale(${distanceScale})`
      el.dataset.pulse = flashing ? 'true' : 'false'
      if (label.current) label.current.textContent = distance < 8 ? 'Almost there' : 'This way'
    }

    const previous = previousDistance.current
    if (previous !== null) {
      if (distance > previous + 0.035) {
        awayFor.current += delta
        if (awayFor.current >= AWAY_SECONDS && chimeReady.current) {
          chimeReady.current = false
          flashUntil.current = performance.now() + 1600
          playThisWayChime()
        }
      } else if (distance < previous - 0.08) {
        awayFor.current = 0
        chimeReady.current = true
      }
    }
    previousDistance.current = distance
  })

  return (
    <Html fullscreen style={{ pointerEvents: 'none' }}>
      <div
        ref={pointer}
        aria-hidden="true"
        className="tayu-edge-pointer"
        style={{
          display: 'none', position: 'fixed', zIndex: 175, width: 62, height: 62,
          placeItems: 'center', borderRadius: '50%', background: '#071748',
          border: '4px solid #00DCA0', boxShadow: '0 8px 24px rgba(7,23,72,0.38)',
          transformOrigin: 'center', transition: 'left 80ms linear, top 80ms linear, transform 120ms ease',
        }}
      >
        <span style={{ color: '#00DCA0', fontSize: 34, lineHeight: 1 }}>➜</span>
        <span
          ref={label}
          style={{
            position: 'absolute', left: '50%', top: 'calc(100% + 7px)', transform: 'translateX(-50%)',
            whiteSpace: 'nowrap', borderRadius: 10, background: '#071748', color: '#fff',
            padding: '4px 8px', fontSize: 11, fontWeight: 800,
          }}
        >This way</span>
      </div>
      <style>{`
        .tayu-edge-pointer[data-pulse="true"] { animation: tayuEdgePulse .65s ease-in-out infinite alternate; }
        @keyframes tayuEdgePulse { from { filter: drop-shadow(0 0 0 rgba(0,220,160,0)); } to { filter: drop-shadow(0 0 12px rgba(0,220,160,.95)); } }
      `}</style>
    </Html>
  )
}
