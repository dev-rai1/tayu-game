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
import { GuidanceArrow } from './GuidanceArrow.jsx'
import { ObjectiveEdgePointer } from './ObjectiveEdgePointer.jsx'
import { CompassBeam } from './CompassBeam.jsx'
import { CoinLayer } from './CoinLayer.jsx'
import { Boundary } from '../components/Boundary.jsx'

// Root 3D scene - "soft clay diorama": warm key light, gentle fill, fog for
// depth, ACES tone mapping. HUD is a sibling DOM layer (pages/World.jsx).
export function GameWorld({ avatar }) {
  return (
    <Boundary name="canvas" hard><Canvas
      camera={{ position: [0, 7, 11], fov: 52 }}
      dpr={1} // Keep the world at CSS-pixel resolution; high-DPI canvases were a major source of lag.
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
    >
      <Suspense fallback={null}>
        {/* atmosphere */}
        <color attach="background" args={['#cfe6f2']} />
        <fog attach="fog" args={['#d6e9f0', 26, 74]} />
        {/* lighting */}
        <hemisphereLight args={['#fdf3e3', '#7ca35e', 0.75]} />
        <ambientLight intensity={0.28} />
        <directionalLight
          position={[16, 22, 10]}
          intensity={2.0}
          color="#fff2dc"
        />
        <directionalLight position={[-8, 6, -6]} intensity={0.4} color="#bcd4ff" />

        <Environment3D />
        {/* Decorative wildlife is intentionally omitted: it added six
            permanent frame loops without affecting any game objective. */}
        <Ambient />
        <Bank />
        <KitchenTable />
        <Store />
        <LemonadeStand />
        <MoneyGarden />
        <ConsequenceStage />
        <PartyHouse />
        <BudgetTown />
        <BankDistrict />
        <GuidanceArrow />
        <ObjectiveEdgePointer />
        <CompassBeam />
        <CoinLayer />
        <Player avatar={avatar} />
      </Suspense>
    </Canvas></Boundary>
  )
}
