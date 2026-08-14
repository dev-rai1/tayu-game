import { Billboard } from '@react-three/drei'
import { SPROUT } from './config.js'
import { labelTexture } from './textures.js'
import { TAX_ENTRY } from './PaycheckPlanetWorld.jsx'

function MoneyGardenMarker() {
  return (
    <Billboard position={[SPROUT[0], 8.4, SPROUT[1] + 1.2]}>
      <mesh>
        <planeGeometry args={[6.4, 2]} />
        <meshBasicMaterial map={labelTexture('THE MONEY GARDEN', { bg: '#071748', color: '#ffffff', accent: '#00b37f' })} transparent toneMapped={false} depthTest={false} />
      </mesh>
    </Billboard>
  )
}

function TaxOfficeMarker() {
  return (
    <Billboard position={[TAX_ENTRY[0], 8.8, TAX_ENTRY[1] - 4.5]}>
      <mesh>
        <planeGeometry args={[7.8, 2.15]} />
        <meshBasicMaterial map={labelTexture('MODULE 7 · TAYU TAX OFFICE', { bg: '#071748', color: '#ffffff', accent: '#ff8a3d' })} transparent toneMapped={false} depthTest={false} />
      </mesh>
    </Billboard>
  )
}

export function ModuleLandmarks() {
  return <><MoneyGardenMarker /><TaxOfficeMarker /></>
}

export { TAX_ENTRY }
