import { Canvas, useThree } from '@react-three/fiber'
import { Component, Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Player } from './Player.jsx'
import { Environment3D } from './Environment.jsx'
import { Ambient } from './Ambient.jsx'
import { Bank } from './Bank.jsx'
import { KitchenTable } from './Jars.jsx'
import { Store } from './Store.jsx'
import { LemonadeStand } from './LemonadeStand.jsx'
import { MoneyGarden } from './MoneyGarden.jsx'
import { ConsequenceStage } from './ConsequenceStage.jsx'
import { PartyHouse } from './PartyHouse.jsx'
import { BudgetTown } from './BudgetTown.jsx'
import { BankDistrict } from './BankDistrict.jsx'
import { ModuleLandmarks } from './ModuleLandmarks.jsx'
import { BondTaxBuildings } from './BondTaxBuildings.jsx'
import { WorldQuestionHelp } from './WorldQuestionHelp.jsx'
import { GuidanceArrow } from './GuidanceArrow.jsx'
import { CompassBeam } from './CompassBeam.jsx'
import { CoinLayer } from './CoinLayer.jsx'
import { CanvasViewportGuard, WorldBoundaryGuard } from './WorldSafety.jsx'
import { Boundary, logTayuError } from '../components/Boundary.jsx'
import { useGame } from './store.js'
import { activatePaycheckWorld, isPaycheckWorldActive } from './paycheckMode.js'
import { clearPhysicalModuleLaunch, placePhysicalModuleArrival, readPhysicalModuleLaunch } from './physicalModuleLaunch.js'

class SceneBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error) {
    logTayuError(`scene:${this.props.name || 'part'}`, error?.message || error)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function disposeMaterial(material) {
  if (!material) return
  for (const value of Object.values(material)) {
    if (value?.isTexture) value.dispose()
  }
  material.dispose?.()
}

// R3F normally disposes declarative objects, but module jumps and context
// recovery are unusually abrupt. Explicit cleanup keeps abandoned GPU buffers
// and canvas textures from accumulating across a long classroom session.
export function RendererLifecycle() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const sample = () => {
      const memory = gl.info?.memory || {}
      const render = gl.info?.render || {}
      if ((memory.geometries || 0) > 420 || (memory.textures || 0) > 180 || (render.calls || 0) > 520) {
        logTayuError('renderer:pressure', JSON.stringify({ ...memory, calls: render.calls || 0 }))
      }
    }
    const timer = window.setInterval(sample, 10000)
    return () => {
      window.clearInterval(timer)
      scene.traverse((object) => {
        object.geometry?.dispose?.()
        if (Array.isArray(object.material)) object.material.forEach(disposeMaterial)
        else disposeMaterial(object.material)
      })
      gl.renderLists?.dispose?.()
      gl.info?.reset?.()
    }
  }, [gl, scene])
  return null
}

export function repairRuntimeState() {
  const state = useGame.getState()
  const patch = {}
  if (!Array.isArray(state.cards)) patch.cards = []
  if (!Array.isArray(state.lessons)) patch.lessons = []
  const allocations = state.allocations
  if (!allocations || typeof allocations !== 'object' || Array.isArray(allocations)) {
    patch.allocations = { spend: 0, save: 0, give: 0 }
  } else if (![allocations.spend, allocations.save, allocations.give].every((value) => Number.isFinite(Number(value)))) {
    patch.allocations = {
      spend: Number.isFinite(Number(allocations.spend)) ? Number(allocations.spend) : 0,
      save: Number.isFinite(Number(allocations.save)) ? Number(allocations.save) : 0,
      give: Number.isFinite(Number(allocations.give)) ? Number(allocations.give) : 0,
    }
  }
  if (state.btPanel === undefined) patch.btPanel = null
  if (state.bkPanel === undefined) patch.bkPanel = null
  if (state.panelJar === undefined) patch.panelJar = null
  if (state.panelItem === undefined) patch.panelItem = null
  if (state.dialog === undefined) patch.dialog = null
  if (state.near === undefined) patch.near = null
  if (state.toast === undefined) patch.toast = null
  if (state.guide === undefined) patch.guide = null
  if (state.actorCaption === undefined) patch.actorCaption = null
  if (state.banner === undefined) patch.banner = null
  if (state.playerSpeedMult == null || !Number.isFinite(Number(state.playerSpeedMult))) patch.playerSpeedMult = 1
  if (Object.keys(patch).length) useGame.setState(patch)
}

function settlePhysicalLaunchAfterCanvasMount() {
  const moduleId = readPhysicalModuleLaunch()
  if (!moduleId || typeof window === 'undefined') return

  activatePaycheckWorld()

  placePhysicalModuleArrival(moduleId)
  window.requestAnimationFrame(() => placePhysicalModuleArrival(moduleId))
  ;[120, 360, 800].forEach((delay) => {
    window.setTimeout(() => placePhysicalModuleArrival(moduleId), delay)
  })
  window.setTimeout(() => {
    placePhysicalModuleArrival(moduleId)
    clearPhysicalModuleLaunch()
  }, 1000)
}

export function GameWorld({ avatar }) {
  const [rendererGeneration, setRendererGeneration] = useState(0)
  const [rendererStatus, setRendererStatus] = useState('loading')
  const stallLogged = useRef(false)
  repairRuntimeState()
  const week = useGame((state) => state.week)
  const bondStep = useGame((state) => state.bondStep)
  const taxStep = useGame((state) => state.taxStep)
  const activeCard = useGame((state) => state.cards?.[0] || null)
  const physicalModule = readPhysicalModuleLaunch()
  const paycheckWorld = physicalModule === 7 || isPaycheckWorldActive()
  const sceneKey = `week-${week ?? 0}-renderer-${rendererGeneration}`
  const safeAvatar = avatar && typeof avatar === 'object'
    ? { ...avatar, accessories: Array.isArray(avatar.accessories) ? avatar.accessories : [] }
    : {}

  const feedbackButton = activeCard?.buttons?.[0]
  const feedbackAction = feedbackButton?.act || ''
  const choiceFeedback = activeCard?.id?.startsWith('bondfb') || activeCard?.id?.startsWith('taxfb')
    ? (feedbackAction.endsWith('.next') ? 'correct' : feedbackAction.endsWith('.reask') ? 'wrong' : null)
    : null

  useEffect(() => {
    let frame = 0
    let previous = performance.now()
    const watch = (now) => {
      const gap = now - previous
      previous = now
      if (document.visibilityState === 'visible' && gap > 5000 && !stallLogged.current) {
        stallLogged.current = true
        logTayuError('renderer:stall', `${Math.round(gap)}ms between animation frames`)
      }
      frame = requestAnimationFrame(watch)
    }
    frame = requestAnimationFrame(watch)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="tayu-world-canvas" role="region" aria-label="TAYU 3D town game world. Use the on-screen objective and help controls for directions.">
      <Boundary key={sceneKey} name="canvas" hard>
        <Canvas
          key={sceneKey}
          role="application"
          aria-label="Interactive TAYU 3D learning world. Move through the town to the highlighted learning destination."
          camera={{ position: [0, 7, 11], fov: 52 }}
          dpr={1}
          style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
          gl={{ antialias: false, powerPreference: 'default', failIfMajorPerformanceCaveat: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
          onCreated={({ gl }) => {
            try {
              gl.getContext()
              if (typeof document !== 'undefined') document.documentElement.dataset.tayu3dReady = 'true'
              const canvas = gl.domElement
              if (canvas && !canvas.dataset.ctxGuard) {
                canvas.dataset.ctxGuard = '1'
                canvas.addEventListener('webglcontextlost', (event) => {
                  event.preventDefault()
                  logTayuError('canvas:context-lost', 'webgl context lost')
                  setRendererStatus('recovering')
                }, false)
                canvas.addEventListener('webglcontextrestored', () => {
                  logTayuError('canvas:context-restored', 'webgl context restored')
                  setRendererStatus('loading')
                  // Remounting rebuilds every geometry, material, texture, and
                  // scene reference against the browser's restored context.
                  requestAnimationFrame(() => setRendererGeneration((value) => value + 1))
                }, false)
              }
              setRendererStatus('ready')
              settlePhysicalLaunchAfterCanvasMount()
            } catch (error) {
              logTayuError('canvas:webgl-context', error?.message || error)
              throw error
            }
          }}
        >
          <RendererLifecycle />
          <CanvasViewportGuard />
          <Suspense fallback={null}>
            <color attach="background" args={[paycheckWorld ? '#f4efe3' : '#cfe6f2']} />
            <fog attach="fog" args={[paycheckWorld ? '#e9e3d6' : '#d6e9f0', 26, 74]} />
            <hemisphereLight args={['#fdf3e3', '#7ca35e', 0.75]} />
            <ambientLight intensity={0.28} />
            <directionalLight position={[16, 22, 10]} intensity={2.0} color="#fff2dc" />
            <directionalLight position={[-8, 6, -6]} intensity={0.4} color="#bcd4ff" />

            <SceneBoundary name="environment"><Environment3D /></SceneBoundary>
            <SceneBoundary name="ambient"><Ambient /></SceneBoundary>
            <SceneBoundary name="bank"><Bank /></SceneBoundary>
            <SceneBoundary name="jars"><KitchenTable /></SceneBoundary>
            <SceneBoundary name="store"><Store /></SceneBoundary>
            <SceneBoundary name="lemonade"><LemonadeStand /></SceneBoundary>
            <SceneBoundary name="budget"><BudgetTown /></SceneBoundary>
            <SceneBoundary name="bank-district"><BankDistrict /></SceneBoundary>
            <SceneBoundary name="landmarks"><ModuleLandmarks /></SceneBoundary>
            <SceneBoundary name="bond-tax"><BondTaxBuildings week={week} bondStep={bondStep} taxStep={taxStep} choiceFeedback={choiceFeedback} /></SceneBoundary>
            <SceneBoundary name="garden"><MoneyGarden /></SceneBoundary>
            <SceneBoundary name="consequence"><ConsequenceStage /></SceneBoundary>
            <SceneBoundary name="party"><PartyHouse /></SceneBoundary>
            <SceneBoundary name="guidance"><GuidanceArrow /></SceneBoundary>
            <SceneBoundary name="compass"><CompassBeam /></SceneBoundary>
            <SceneBoundary name="coins"><CoinLayer /></SceneBoundary>
            <Player avatar={safeAvatar} />
            <SceneBoundary name="world-boundary"><WorldBoundaryGuard /></SceneBoundary>
          </Suspense>
        </Canvas>
      </Boundary>
      <div className="pointer-events-none absolute inset-0 z-[750] grid place-items-center" aria-live="polite" aria-atomic="true">
        {rendererStatus !== 'ready' && (
          <div role="status" className="rounded-2xl bg-navy/95 px-6 py-4 text-center font-extrabold text-white shadow-2xl">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-teal" aria-hidden="true" />
            {rendererStatus === 'recovering' ? 'Rebuilding the world...' : 'Loading the world...'}
          </div>
        )}
      </div>
      <WorldQuestionHelp />
    </div>
  )
}
