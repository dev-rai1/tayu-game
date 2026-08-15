import { Canvas } from '@react-three/fiber'
import { Component, Suspense } from 'react'
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
import { BondStreetWorld } from './BondStreetWorld.jsx'
import { PaycheckPlanetWorld } from './PaycheckPlanetWorld.jsx'
import { GuidanceArrow } from './GuidanceArrow.jsx'
import { CompassBeam } from './CompassBeam.jsx'
import { CoinLayer } from './CoinLayer.jsx'
import { CanvasViewportGuard, WorldBoundaryGuard } from './WorldSafety.jsx'
import { Boundary, logTayuError } from '../components/Boundary.jsx'
import { useGame } from './store.js'
import { isPaycheckWorldActive } from './paycheckMode.js'
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

  // Three.js and Player mount after route navigation. Re-apply the destination
  // after those mounts so initWorld/camera setup can never leave Modules 6/7 on
  // an empty background away from their actual buildings.
  placePhysicalModuleArrival(moduleId)
  window.requestAnimationFrame(() => placePhysicalModuleArrival(moduleId))
  window.setTimeout(() => placePhysicalModuleArrival(moduleId), 120)
  window.setTimeout(() => placePhysicalModuleArrival(moduleId), 360)
  window.setTimeout(() => {
    placePhysicalModuleArrival(moduleId)
    clearPhysicalModuleLaunch()
  }, 800)
}

export function GameWorld({ avatar }) {
  repairRuntimeState()
  const week = useGame((state) => state.week)
  const paycheckWorld = isPaycheckWorldActive()
  const sceneKey = paycheckWorld ? `paycheck-${week}` : `week-${week}`
  const safeAvatar = avatar && typeof avatar === 'object'
    ? { ...avatar, accessories: Array.isArray(avatar.accessories) ? avatar.accessories : [] }
    : {}

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
          gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
          onCreated={({ gl }) => {
            try {
              gl.getContext()
              if (typeof document !== 'undefined') document.documentElement.dataset.tayu3dReady = 'true'
              settlePhysicalLaunchAfterCanvasMount()
            } catch (error) {
              logTayuError('canvas:webgl-context', error?.message || error)
              throw error
            }
          }}
        >
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
            <SceneBoundary name="bond-street"><BondStreetWorld /></SceneBoundary>
            <SceneBoundary name="tax-town"><PaycheckPlanetWorld /></SceneBoundary>
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
    </div>
  )
}
