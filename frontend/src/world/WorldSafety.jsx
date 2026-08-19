import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RING } from './config.js'
import { playerPos } from './store.js'

// The late-game Bond/Tax districts now use a wider local ground apron, so the
// playable safety radius is widened too. This prevents the player from being
// invisibly pushed back while trying to walk around those larger districts.
export const WORLD_GROUND_RADIUS = 77
export const MAX_CAMERA_DISTANCE = 16
export const WORLD_EDGE_MARGIN = 2
export const PLAYER_SAFE_RADIUS = WORLD_GROUND_RADIUS - MAX_CAMERA_DISTANCE - WORLD_EDGE_MARGIN

export function clampToPlayableIsland(x, z) {
  const dx = x - RING.c[0]
  const dz = z - RING.c[1]
  const distance = Math.hypot(dx, dz)
  if (!Number.isFinite(distance) || distance === 0 || distance <= PLAYER_SAFE_RADIUS) return [x, z]
  const scale = PLAYER_SAFE_RADIUS / distance
  return [RING.c[0] + dx * scale, RING.c[1] + dz * scale]
}

export function WorldBoundaryGuard() {
  useFrame(() => {
    const [x, z] = clampToPlayableIsland(playerPos.x, playerPos.z)
    playerPos.x = x
    playerPos.z = z
  })
  return null
}

export function CanvasViewportGuard() {
  const { gl, camera, setSize, size } = useThree()
  const sizeRef = useRef(size)

  useEffect(() => {
    sizeRef.current = size
  }, [size])

  useEffect(() => {
    const canvas = gl.domElement
    const parent = canvas.parentElement
    let frame = 0

    const sync = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = parent?.getBoundingClientRect()
        const width = Math.max(1, Math.round(rect?.width || window.innerWidth || 1))
        const height = Math.max(1, Math.round(rect?.height || window.visualViewport?.height || window.innerHeight || 1))
        const current = sizeRef.current

        if (Math.abs(current.width - width) > 1 || Math.abs(current.height - height) > 1) {
          setSize(width, height)
          sizeRef.current = { ...current, width, height }
        }

        gl.setScissorTest(false)
        gl.setViewport(0, 0, width, height)
        if ('aspect' in camera) {
          camera.aspect = width / height
          camera.updateProjectionMatrix()
        }
      })
    }

    const observer = typeof ResizeObserver !== 'undefined' && parent
      ? new ResizeObserver(sync)
      : null
    observer?.observe(parent)

    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', sync)
    window.visualViewport?.addEventListener('resize', sync)
    window.visualViewport?.addEventListener('scroll', sync)
    document.addEventListener('visibilitychange', sync)
    sync()

    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', sync)
      window.visualViewport?.removeEventListener('resize', sync)
      window.visualViewport?.removeEventListener('scroll', sync)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [camera, gl, setSize])

  return null
}
