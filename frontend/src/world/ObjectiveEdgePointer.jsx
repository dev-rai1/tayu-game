import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { playerPos, useGame } from './store.js'
import { arriveRadius, getObjectiveTarget } from './objective.js'

const targetVector = new THREE.Vector3()
const toTarget = new THREE.Vector3()
const cameraDirection = new THREE.Vector3()

export function ObjectiveEdgePointer() {
  const { camera, size } = useThree()
  const pointer = useRef(null)
  const arrow = useRef(null)
  const awayFor = useRef(0)
  const previousDistance = useRef(null)
  const lastPulse = useRef(0)
  const forcePulseUntil = useRef(0)

  useEffect(() => {
    const refocus = () => {
      forcePulseUntil.current = performance.now() + 1800
      pointer.current?.animate?.(
        [{ transform: pointer.current.style.transform }, { transform: `${pointer.current.style.transform} scale(1.16)` }, { transform: pointer.current.style.transform }],
        { duration: 650, easing: 'ease-out' },
      )
    }
    window.addEventListener('tayu-refocus-objective', refocus)
    return () => window.removeEventListener('tayu-refocus-objective', refocus)
  }, [])

  useFrame((_, delta) => {
    const element = pointer.current
    const arrowElement = arrow.current
    if (!element || !arrowElement) return

    const state = useGame.getState()
    const target = getObjectiveTarget(state)
    if (!target) {
      element.style.display = 'none'
      previousDistance.current = null
      awayFor.current = 0
      return
    }

    const distance = Math.hypot(target[0] - playerPos.x, target[1] - playerPos.z)
    if (distance <= arriveRadius(state)) {
      element.style.display = 'none'
      previousDistance.current = distance
      awayFor.current = 0
      return
    }

    targetVector.set(target[0], 3.6, target[1])
    toTarget.copy(targetVector).sub(camera.position)
    camera.getWorldDirection(cameraDirection)
    const behindCamera = cameraDirection.dot(toTarget) <= 0
    targetVector.project(camera)

    if (behindCamera) {
      targetVector.x *= -1
      targetVector.y *= -1
    }

    const outside = behindCamera || Math.abs(targetVector.x) > 0.82 || Math.abs(targetVector.y) > 0.72
    if (!outside) {
      element.style.display = 'none'
      previousDistance.current = distance
      awayFor.current = 0
      return
    }

    const margin = Math.min(64, Math.max(42, Math.min(size.width, size.height) * 0.08))
    const maxX = Math.max(1, size.width / 2 - margin)
    const maxY = Math.max(1, size.height / 2 - margin)
    const rawX = targetVector.x * size.width / 2
    const rawY = -targetVector.y * size.height / 2
    const divisor = Math.max(Math.abs(rawX) / maxX, Math.abs(rawY) / maxY, 1)
    const x = rawX / divisor
    const y = rawY / divisor
    const angle = Math.atan2(y, x) * 180 / Math.PI + 90
    const scale = Math.min(1.18, 0.76 + distance / 85)

    element.style.display = 'block'
    element.style.left = `calc(50% + ${x}px)`
    element.style.top = `calc(50% + ${y}px)`
    element.style.transform = `translate(-50%, -50%) scale(${scale})`
    arrowElement.style.transform = `rotate(${angle}deg)`

    const previous = previousDistance.current
    if (previous !== null && distance > previous + 0.025) awayFor.current += delta
    else if (previous !== null && distance < previous - 0.025) awayFor.current = 0
    previousDistance.current = distance

    const now = performance.now()
    const shouldPulse = awayFor.current >= 6 || now < forcePulseUntil.current
    if (shouldPulse && now - lastPulse.current > 6000) {
      lastPulse.current = now
      awayFor.current = 0
      element.animate?.(
        [{ opacity: 0.72, transform: element.style.transform }, { opacity: 1, transform: `${element.style.transform} scale(1.14)` }, { opacity: 0.9, transform: element.style.transform }],
        { duration: 900, easing: 'ease-in-out' },
      )
    }
  })

  return (
    <Html fullscreen style={{ pointerEvents: 'none', zIndex: 170 }}>
      <div
        ref={pointer}
        role="status"
        aria-label="The next objective is off screen. Follow this arrow."
        className="fixed hidden rounded-2xl border-2 border-sun bg-navy/95 px-3 py-2 text-center text-white shadow-2xl"
      >
        <div ref={arrow} className="mx-auto text-3xl leading-none text-sun" aria-hidden>▲</div>
        <div className="mt-0.5 text-[10px] font-extrabold uppercase tracking-[0.15em] text-teal">This way</div>
      </div>
    </Html>
  )
}
