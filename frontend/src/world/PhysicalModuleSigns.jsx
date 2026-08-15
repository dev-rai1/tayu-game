import { Billboard } from '@react-three/drei'
import { TAX_DISTRICT } from './config.js'
import { labelTexture } from './textures.js'

// This sign is rendered after the Tax Office itself, directly over the legacy
// numbered billboard. Public in-world labels use place names, not module numbers.
export function PhysicalModuleSigns() {
  return (
    <Billboard position={[TAX_DISTRICT[0], 6.3, TAX_DISTRICT[1] + 7.97]}>
      <mesh renderOrder={1000}>
        <planeGeometry args={[9.8, 2.25]} />
        <meshBasicMaterial
          map={labelTexture('TAYU TAX OFFICE · UNDER CONSTRUCTION', { bg: '#071748', color: '#ffffff', accent: '#ff9a52' })}
          transparent
          toneMapped={false}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </Billboard>
  )
}
