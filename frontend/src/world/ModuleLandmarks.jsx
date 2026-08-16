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
  return null
}

export function ModuleLandmarks() {
  return <><MoneyGardenMarker /><TaxOfficeMarker /></>
}

export { TAX_ENTRY }
