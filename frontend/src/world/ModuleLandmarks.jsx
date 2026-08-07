import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, RoundedBox } from '@react-three/drei'
import { BANK_DISTRICT, SPROUT } from './config.js'
import { playerPos } from './store.js'
import { labelTexture } from './textures.js'

const TAX_DISTRICT = [
  (BANK_DISTRICT[0] + SPROUT[0]) / 2,
  (BANK_DISTRICT[1] + SPROUT[1]) / 2,
]
const TAX_ENTRY = [TAX_DISTRICT[0], TAX_DISTRICT[1] + 3.4]
const ENTRY_RADIUS = 4.2

function enterTaxModule() {
  window.location.assign('/tax-paycheck')
}

function PaycheckPlanetDistrict() {
  const nearRef = useRef(false)
  const [near, setNear] = useState(false)

  useFrame(() => {
    const distance = Math.hypot(playerPos.x - TAX_ENTRY[0], playerPos.z - TAX_ENTRY[1])
    const next = distance <= ENTRY_RADIUS
    nearRef.current = next
    setNear((current) => (current === next ? current : next))
  })

  useEffect(() => {
    const enterWhenNear = (event) => {
      if (!nearRef.current) return
      if (event.type === 'keydown' && event.code !== 'KeyE' && event.code !== 'Enter') return
      enterTaxModule()
    }
    window.addEventListener('keydown', enterWhenNear)
    window.addEventListener('tayu-interact', enterWhenNear)
    return () => {
      window.removeEventListener('keydown', enterWhenNear)
      window.removeEventListener('tayu-interact', enterWhenNear)
    }
  }, [])

  return (
    <group position={[TAX_DISTRICT[0], 0, TAX_DISTRICT[1]]}>
      <mesh position={[0, 0.025, 0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.4, 32]} />
        <meshStandardMaterial color="#fff0dc" roughness={1} />
      </mesh>
      <mesh position={[0, 0.032, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.4, 5.9, 32]} />
        <meshStandardMaterial color="#ff8a3d" roughness={1} />
      </mesh>

      <RoundedBox args={[6.2, 4.2, 3.6]} radius={0.28} smoothness={4} position={[0, 2.1, -0.8]} castShadow>
        <meshPhysicalMaterial color="#ffb36f" roughness={0.5} clearcoat={0.35} />
      </RoundedBox>
      <RoundedBox args={[6.7, 0.7, 4.1]} radius={0.22} smoothness={4} position={[0, 4.35, -0.8]} castShadow>
        <meshStandardMaterial color="#071748" roughness={0.55} />
      </RoundedBox>

      <RoundedBox args={[1.55, 2.55, 0.18]} radius={0.12} smoothness={3} position={[0, 1.35, 1.04]} castShadow>
        <meshStandardMaterial color="#1464f0" emissive="#1464f0" emissiveIntensity={near ? 0.45 : 0.12} />
      </RoundedBox>
      {[-2.05, 2.05].map((x) => (
        <mesh key={x} position={[x, 2.25, 1.03]}>
          <planeGeometry args={[1.35, 1.35]} />
          <meshStandardMaterial color="#d8f3ff" emissive="#9bdfff" emissiveIntensity={0.18} />
        </mesh>
      ))}

      <Billboard position={[0, 6.45, 0]}>
        <mesh>
          <planeGeometry args={[6.8, 2.12]} />
          <meshBasicMaterial map={labelTexture('MODULE 5 · PAYCHECK PLANET', { bg: '#071748', color: '#ffffff', accent: '#ff8a3d' })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>
      <Billboard position={[0, 5.15, 0.2]}>
        <mesh>
          <planeGeometry args={[4.8, 1.5]} />
          <meshBasicMaterial map={labelTexture('JOBS · TAXES · TAKE-HOME PAY', { bg: '#ff8a3d', color: '#071748', accent: '#ffffff' })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>
      <Billboard position={[0, 2.65, 2.25]}>
        <mesh>
          <planeGeometry args={[4.6, 1.44]} />
          <meshBasicMaterial map={labelTexture(near ? 'PRESS E OR CLICK TO PLAY' : 'WALK UP TO PLAY', { bg: near ? '#00dca0' : '#071748', color: near ? '#071748' : '#ffffff', accent: '#ffd700' })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>

      <mesh
        position={[0, 1.5, 2.0]}
        onClick={(event) => { event.stopPropagation(); enterTaxModule() }}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = '' }}
      >
        <boxGeometry args={[5.4, 3.4, 1.8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

function MoneyGardenModuleSixMarker() {
  return (
    <Billboard position={[SPROUT[0], 8.4, SPROUT[1] + 1.2]}>
      <mesh>
        <planeGeometry args={[6.4, 2]} />
        <meshBasicMaterial map={labelTexture('MODULE 6 · THE MONEY GARDEN', { bg: '#071748', color: '#ffffff', accent: '#00b37f' })} transparent toneMapped={false} depthTest={false} />
      </mesh>
    </Billboard>
  )
}

export function ModuleLandmarks() {
  return (
    <>
      <PaycheckPlanetDistrict />
      <MoneyGardenModuleSixMarker />
    </>
  )
}

export { TAX_DISTRICT, TAX_ENTRY }
