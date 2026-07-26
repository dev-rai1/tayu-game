import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import * as THREE from 'three'
import { CharacterMesh } from '../world/CharacterMesh.jsx'

// 3D preview: warm studio lighting, soft shadow, auto-rotate, orbit/zoom.
export default function AvatarPreview({ avatar }) {
  return (
    <div className="h-full w-full overflow-hidden rounded-3xl bg-gradient-to-b from-[#dce8f5] to-[#aac2e0]">
      <Canvas
        camera={{ position: [0, 0.85, 4.6], fov: 34 }}
        dpr={1}
        gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      >
        <Suspense fallback={null}>
          <hemisphereLight args={['#fff4e2', '#9fb6c9', 0.85]} />
          <ambientLight intensity={0.35} />
          <directionalLight position={[3, 5, 3]} intensity={2.1} color="#fff3e0" />
          <directionalLight position={[-3, 2, -1]} intensity={0.5} color="#bcd4ff" />
          <group position={[0, -1.05, 0]}>
            <CharacterMesh avatar={avatar} />
          </group>
          <OrbitControls
            enablePan={false}
            minDistance={2.2}
            maxDistance={5.5}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.95}
            autoRotate
            autoRotateSpeed={1.1}
            target={[0, 0.05, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
