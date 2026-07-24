import { Canvas } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import { Suspense } from 'react'
import * as THREE from 'three'
import { Player } from './Player.jsx'
import { Environment3D } from './Environment.jsx'
import { BackgroundLife } from './BackgroundLife.jsx'
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
import { CompassBeam } from './CompassBeam.jsx'
import { CoinLayer } from './CoinLayer.jsx'
import { ClickMarker } from './ClickMarker.jsx'
import { Boundary } from '../components/Boundary.jsx'

// Root 3D scene - "soft clay diorama": warm key light, gentle fill, fog for
// depth, ACES tone mapping. HUD is a sibling DOM layer (pages/World.jsx).
export function GameWorld({ avatar }) {
  return (
    <Boundary name="canvas" hard><Canvas
      shadows
      camera={{ position: [0, 7, 11], fov: 52 }}
      dpr={[1, 1.5]} // R12: cap pixel ratio - the single biggest GPU win on Chromebooks
      onCreated={({ gl }) => { if (typeof window !== 'undefined') window.__tayuGL = gl }}
      gl={{
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
    >
      <Suspense fallback={null}>
        {/* atmosphere */}
        <color attach="background" args={['#cfe6f2']} />
        <fog attach="fog" args={['#d6e9f0', 26, 74]} />
        <Sky sunPosition={[60, 30, 40]} turbidity={8} rayleigh={0.7} mieCoefficient={0.004} mieDirectionalG={0.85} />

        {/* lighting */}
        <hemisphereLight args={['#fdf3e3', '#7ca35e', 0.75]} />
        <ambientLight intensity={0.28} />
        <directionalLight
          position={[16, 22, 10]}
          intensity={2.0}
          color="#fff2dc"
          castShadow
          shadow-mapSize={[1024, 1024]} // R12: half-res shadows read the same at this art style
          shadow-bias={-0.0004}
          shadow-normalBias={0.02}
          shadow-camera-left={-26}
          shadow-camera-right={26}
          shadow-camera-top={26}
          shadow-camera-bottom={-26}
          shadow-camera-near={1}
          shadow-camera-far={70}
        />
        <directionalLight position={[-8, 6, -6]} intensity={0.4} color="#bcd4ff" />

        <Environment3D />
        <BackgroundLife />
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
        <CompassBeam />
        <CoinLayer />
        <ClickMarker />
        <Player avatar={avatar} />
      </Suspense>
    </Canvas></Boundary>
  )
}
