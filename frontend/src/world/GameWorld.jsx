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
import { PaycheckPlanetWorld } from './PaycheckPlanetWorld.jsx'
import { GuidanceArrow } from './GuidanceArrow.jsx'
import { CompassBeam } from './CompassBeam.jsx'
import { CoinLayer } from './CoinLayer.jsx'
import { CanvasViewportGuard, WorldBoundaryGuard } from './WorldSafety.jsx'
import { Boundary, logTayuError } from '../components/Boundary.jsx'
import { useGame } from './store.js'
import { isPaycheckWorldActive } from './paycheckMode.js'

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

function repairRuntimeState() {
  const state = useGame.getState()
  const patch = {}
  if (!Array.isArray(state.cards)) patch.cards = []
  if (!Array.isArray(state.lessons)) patch.lessons = []
  if (!Array.isArray(state.allocations)) patch.allocations = []
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

export function GameWorld({ avatar }) {
  repairRuntimeState()
  const week = useGame((state) => state.week)
  // Each public module starts with a clean Canvas lifecycle. React Three Fiber
  // otherwise has to reconcile an entire module's live scene mutations inside
  // the previous frame, so one bad transition can poison every later module.
  // The keyed boundary also clears a prior Canvas error instead of leaving the
  // player trapped on the retry screen.
  const sceneKey = isPaycheckWorldActive() ? `paycheck-${week}` : `week-${week}`
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
          gl={{
            antialias: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
          }}
          onCreated={({ gl }) => {
            try {
              gl.getContext()
              if (typeof document !== 'undefined') document.documentElement.dataset.tayu3dReady = 'true'
            } catch (error) {
              logTayuError('canvas:webgl-context', error?.message || error)
              throw error
            }
          }}
        >
          <CanvasViewportGuard />
          <Suspense fallback={null}>
            <color attach="background" args={['#cfe6f2']} />
            <fog attach="fog" args={['#d6e9f0', 26, 74]} />
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
