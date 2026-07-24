import { Component, Suspense, forwardRef, useEffect, useMemo, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { SkeletonUtils } from 'three-stdlib'

// Real rigged 3D avatars: a Ready Player Me GLB when available, else a bundled
// animated robot (works offline / when RPM is unreachable). Animations crossfade
// between Idle and Walking based on movingRef.current. ref → the root group the
// player controller rotates to face the movement direction.

const ROBOT_URL = '/models/robot.glb'
const IDLE_URL = '/animations/idle.glb'
const WALK_URL = '/animations/walk.glb'

useGLTF.preload(ROBOT_URL)
useGLTF.preload(IDLE_URL)
useGLTF.preload(WALK_URL)

// crossfade Idle<->Walking from a moving ref (no per-frame React re-renders)
function useLocomotion(actions, movingRef, names) {
  const active = useRef(names.idle)
  useEffect(() => {
    actions[names.idle]?.reset().fadeIn(0.25).play()
    return () => Object.values(actions).forEach((a) => a?.stop())
  }, [actions, names.idle])
  useFrame(() => {
    const want = movingRef?.current ? names.walk : names.idle
    if (want !== active.current && actions[want]) {
      actions[active.current]?.fadeOut(0.22)
      actions[want].reset().fadeIn(0.22).play()
      active.current = want
    }
  })
}

const Robot = forwardRef(function Robot({ movingRef }, ref) {
  const { scene, animations } = useGLTF(ROBOT_URL)
  const model = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { actions } = useAnimations(animations, model)
  useLocomotion(actions, movingRef, { idle: 'Idle', walk: 'Walking' })
  return (
    <group ref={ref}>
      <primitive object={model} scale={0.42} />
    </group>
  )
})

const RPM = forwardRef(function RPM({ url, movingRef }, ref) {
  const { scene } = useGLTF(url)
  const model = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const idleGlb = useGLTF(IDLE_URL)
  const walkGlb = useGLTF(WALK_URL)
  const clips = useMemo(() => {
    const i = idleGlb.animations[0]?.clone(); if (i) i.name = 'Idle'
    const w = walkGlb.animations[0]?.clone(); if (w) w.name = 'Walking'
    return [i, w].filter(Boolean)
  }, [idleGlb, walkGlb])
  const { actions } = useAnimations(clips, model)
  useLocomotion(actions, movingRef, { idle: 'Idle', walk: 'Walking' })
  return (
    <group ref={ref}>
      {/* RPM avatars are ~1.8m, origin at feet, facing +Z */}
      <primitive object={model} />
    </group>
  )
})

// Render error boundary: if the RPM GLB fails to load, show the robot.
class GLBBoundary extends Component {
  constructor(p) { super(p); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(e) { console.warn('[Avatar3D] RPM load failed, using fallback:', e?.message) }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

export const Avatar3D = forwardRef(function Avatar3D({ url, movingRef }, ref) {
  if (!url) return <Robot ref={ref} movingRef={movingRef} />
  return (
    <GLBBoundary fallback={<Robot ref={ref} movingRef={movingRef} />}>
      <Suspense fallback={<Robot ref={ref} movingRef={movingRef} />}>
        <RPM ref={ref} url={url} movingRef={movingRef} />
      </Suspense>
    </GLBBoundary>
  )
})
