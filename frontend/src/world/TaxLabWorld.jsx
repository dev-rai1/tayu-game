import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Boundary } from '../components/Boundary.jsx'
import { PaycheckPlanetWorld } from './PaycheckPlanetWorld.jsx'
import { TAX_DISTRICT } from './config.js'

function TaxLabCamera() {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(TAX_DISTRICT[0], 7.6, TAX_DISTRICT[1] + 11.8)
    camera.lookAt(TAX_DISTRICT[0], 2.15, TAX_DISTRICT[1] + 0.7)
    camera.updateProjectionMatrix()
  }, [camera])

  return null
}

export function TaxLabWorld() {
  return (
    <div className="tayu-world-canvas" aria-label="Module 5 interactive tax lab">
      <Boundary name="tax-lab-canvas" hard>
        <Canvas
          camera={{ position: [TAX_DISTRICT[0], 7.6, TAX_DISTRICT[1] + 11.8], fov: 48 }}
          dpr={1}
          style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
          gl={{
            antialias: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.08,
          }}
        >
          <TaxLabCamera />
          <Suspense fallback={null}>
            <color attach="background" args={['#d8edf5']} />
            <fog attach="fog" args={['#d8edf5', 22, 48]} />
            <hemisphereLight args={['#fff6e6', '#7da669', 0.92]} />
            <ambientLight intensity={0.42} />
            <directionalLight position={[TAX_DISTRICT[0] + 8, 18, TAX_DISTRICT[1] + 7]} intensity={1.75} color="#fff3df" />
            <directionalLight position={[TAX_DISTRICT[0] - 6, 8, TAX_DISTRICT[1] - 4]} intensity={0.35} color="#bad8ff" />

            <mesh position={[TAX_DISTRICT[0], -0.04, TAX_DISTRICT[1] + 0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <circleGeometry args={[14, 48]} />
              <meshStandardMaterial color="#9cc47b" roughness={1} />
            </mesh>
            <mesh position={[TAX_DISTRICT[0], -0.02, TAX_DISTRICT[1] + 3.5]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[7.2, 12]} />
              <meshStandardMaterial color="#e7e3d4" roughness={1} />
            </mesh>

            <PaycheckPlanetWorld />
          </Suspense>
        </Canvas>
      </Boundary>
    </div>
  )
}
