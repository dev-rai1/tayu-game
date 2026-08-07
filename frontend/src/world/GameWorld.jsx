import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
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
import { GuidanceArrow } from './GuidanceArrow.jsx'
import { CompassBeam } from './CompassBeam.jsx'
import { CoinLayer } from './CoinLayer.jsx'
import { CanvasViewportGuard, WorldBoundaryGuard } from './WorldSafety.jsx'
import { Boundary } from '../components/Boundary.jsx'

// Root 3D scene - "soft clay diorama": warm key light, gentle fill, fog for
// depth, ACES tone mapping. HUD is a sibling DOM layer (pages/World.jsx).
export function GameWorld({ avatar }) {
  return (
    <div className="tayu-world-canvas" aria-label="TAYU town game world">
      <Boundary name="canvas" hard>
        <Canvas
          camera={{ position: [0, 7, 11], fov: 52 }}
          dpr={1}
          style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
          gl={{
            antialias: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
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

            <Environment3D />
            <Ambient />
            <Bank />
            <KitchenTable />
            <Store />
            <LemonadeStand />
            <BudgetTown />
            <BankDistrict />
            <ModuleLandmarks />
            <MoneyGarden />
            <ConsequenceStage />
            <PartyHouse />
            <GuidanceArrow />
            <CompassBeam />
            <CoinLayer />
            <Player avatar={avatar} />
            <WorldBoundaryGuard />
          </Suspense>
        </Canvas>
      </Boundary>
    </div>
  )
}
