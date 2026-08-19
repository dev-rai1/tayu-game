import { Billboard, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { BOND_DISTRICT, TAX_DISTRICT } from './config.js'
import { labelTexture } from './textures.js'
import { Npc } from './Npc.jsx'

export const BOND_SPOT = [BOND_DISTRICT[0], BOND_DISTRICT[1]]
export const TAX_SPOT = [TAX_DISTRICT[0], TAX_DISTRICT[1]]
export const BOND_ENTRY = [BOND_SPOT[0], BOND_SPOT[1] + 6.5]
export const TAX_ENTRY = [TAX_SPOT[0], TAX_SPOT[1] + 6.5]
export const BOND_GUIDE = [BOND_SPOT[0] + 0.2, BOND_SPOT[1] + 3.2]
export const TAX_GUIDE = [TAX_SPOT[0] + 0.2, TAX_SPOT[1] + 3.2]

const BEN = { skinTone: 'warm_beige', hairColor: 'brown', hairStyle: 'short', shirtColor: 'yellow', pantsColor: 'navy', topStyle: 'tee', bottomStyle: 'pants' }
const REX = { skinTone: 'medium_brown', hairColor: 'black', hairStyle: 'short', shirtColor: 'teal', pantsColor: 'navy', topStyle: 'tee', bottomStyle: 'pants' }
const CLIENT_A = { skinTone: 'light_tan', hairColor: 'blonde', hairStyle: 'ponytail', shirtColor: 'purple', pantsColor: 'navy', topStyle: 'tee', bottomStyle: 'skirt' }
const CLIENT_B = { skinTone: 'deep_brown', hairColor: 'black', hairStyle: 'curly', shirtColor: 'orange', pantsColor: 'navy', topStyle: 'hoodie', bottomStyle: 'pants' }
const CLIENT_C = { skinTone: 'cream', hairColor: 'red', hairStyle: 'short', shirtColor: 'green', pantsColor: 'navy', topStyle: 'tee', bottomStyle: 'shorts' }

function SignLabel({ text, color, y = 6.0 }) {
  return (
    <Billboard position={[0, y, 0]}>
      <mesh>
        <planeGeometry args={[6.6, 1.3]} />
        <meshBasicMaterial map={labelTexture(text, color, '#ffffff')} transparent />
      </mesh>
    </Billboard>
  )
}

function Booth({ x, z, color, label }) {
  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[2.6, 2.0, 1.8]} radius={0.14} smoothness={3} position={[0, 1.0, 0]} castShadow receiveShadow><meshStandardMaterial color="#f7f4ee" roughness={0.8} /></RoundedBox>
      <mesh position={[0, 2.25, 0.5]} rotation={[-0.5, 0, 0]} castShadow><boxGeometry args={[2.8, 0.12, 1.4]} /><meshStandardMaterial color={color} /></mesh>
      <RoundedBox args={[2.6, 0.5, 0.5]} radius={0.08} smoothness={2} position={[0, 0.85, 1.0]} castShadow><meshStandardMaterial color={color} roughness={0.6} /></RoundedBox>
      <Billboard position={[0, 3.0, 0]}>
        <mesh><planeGeometry args={[3.0, 0.62]} /><meshBasicMaterial map={labelTexture(label, color, '#ffffff')} transparent /></mesh>
      </Billboard>
    </group>
  )
}

function ActivityBeacon({ position, color, label, feedback }) {
  const ring = useRef()
  const orb = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ring.current) {
      ring.current.rotation.z = t * (feedback === 'wrong' ? -2.2 : 1.35)
      const pulse = feedback === 'wrong' ? 1 + Math.sin(t * 12) * 0.12 : 1 + Math.sin(t * 4) * 0.08
      ring.current.scale.setScalar(pulse)
    }
    if (orb.current) {
      orb.current.position.y = 4.4 + Math.sin(t * (feedback ? 7 : 3)) * (feedback ? 0.35 : 0.18)
      if (feedback === 'wrong') orb.current.position.x = Math.sin(t * 18) * 0.22
      else orb.current.position.x = 0
    }
  })

  const feedbackColor = feedback === 'correct' ? '#00c982' : feedback === 'wrong' ? '#ff4d4f' : color
  const feedbackLabel = feedback === 'correct' ? 'NICE CHOICE!' : feedback === 'wrong' ? 'TRY AGAIN' : label

  return (
    <group position={position}>
      <mesh ref={ring} position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.55, 0.12, 12, 40]} />
        <meshStandardMaterial color={feedbackColor} emissive={feedbackColor} emissiveIntensity={0.85} />
      </mesh>
      <mesh ref={orb} position={[0, 4.4, 0]}>
        <sphereGeometry args={[0.34, 18, 18]} />
        <meshStandardMaterial color={feedbackColor} emissive={feedbackColor} emissiveIntensity={1.2} />
      </mesh>
      <Billboard position={[0, 5.2, 0]}>
        <mesh><planeGeometry args={[3.4, 0.72]} /><meshBasicMaterial map={labelTexture(feedbackLabel, feedbackColor, '#ffffff')} transparent /></mesh>
      </Billboard>
    </group>
  )
}

function BondActivity({ step, feedback }) {
  const locations = [
    [-4.3, 0, 1.6],
    [-4.3, 0, 1.6],
    [0, 0, 2.4],
    [4.3, 0, 1.6],
    [0.2, 0, 3.2],
    [0.2, 0, 3.2],
    [0, 0, 2.4],
    [0.2, 0, 3.2],
  ]
  const labels = ['COMPARE', 'INTEREST MATH', 'TAX BENEFIT', 'RISK VS RETURN', 'RATE SHOCK', 'WHO GETS PAID?', 'BUILD YOUR MIX', 'COMPLETE']
  const colors = ['#1464f0', '#1464f0', '#00b37f', '#ff8a3d', '#f5c542', '#f5c542', '#7850f0', '#00c982']
  const i = Math.min(Math.max(step || 0, 0), locations.length - 1)
  return <ActivityBeacon position={locations[i]} color={colors[i]} label={labels[i]} feedback={feedback} />
}

function TaxActivity({ step, feedback }) {
  const locations = [
    [-4.3, 0, 1.6],
    [-4.3, 0, 1.6],
    [0, 0, 2.4],
    [0, 0, 2.4],
    [0, 0, 2.4],
    [4.3, 0, 1.6],
    [4.3, 0, 1.6],
    [0.2, 0, 3.2],
  ]
  const labels = ['READ THE W-2', 'ADD THE INCOME', 'BOND INCOME', 'SUBTRACT', 'BRACKET MATH', 'CAPITAL GAIN', 'CATCH THE ERROR', 'COMPLETE']
  const colors = ['#1464f0', '#1464f0', '#00b37f', '#00b37f', '#00b37f', '#7850f0', '#7850f0', '#00c982']
  const i = Math.min(Math.max(step || 0, 0), locations.length - 1)
  return <ActivityBeacon position={locations[i]} color={colors[i]} label={labels[i]} feedback={feedback} />
}

function BondBuilding({ active, step, feedback }) {
  return (
    <group position={[BOND_SPOT[0], 0, BOND_SPOT[1]]}>
      <mesh position={[0, 0.06, 0.5]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[8.0, 44]} /><meshStandardMaterial color="#e9eef7" roughness={0.95} />
      </mesh>
      <RoundedBox args={[7.6, 6.6, 4.0]} radius={0.26} smoothness={3} position={[0, 3.4, -3.0]} castShadow receiveShadow><meshStandardMaterial color="#264a86" roughness={0.5} metalness={0.1} /></RoundedBox>
      {[-2.2, -0.7, 0.8, 2.3].map((x) => (
        <mesh key={x} position={[x, 3.6, -0.98]}><boxGeometry args={[0.7, 5.4, 0.1]} /><meshStandardMaterial color="#8fb4ee" emissive="#8fb4ee" emissiveIntensity={0.15} /></mesh>
      ))}
      <RoundedBox args={[8.4, 0.5, 4.6]} radius={0.14} smoothness={3} position={[0, 6.9, -3.0]} castShadow><meshStandardMaterial color="#12305f" /></RoundedBox>
      <group position={[0, 8.4, -3.0]}>
        <mesh position={[0, 0.6, 0]} castShadow><coneGeometry args={[0.9, 1.4, 4]} /><meshStandardMaterial color="#f5c542" emissive="#f5c542" emissiveIntensity={0.4} /></mesh>
        <mesh position={[0, -0.7, 0]} castShadow><boxGeometry args={[0.5, 1.8, 0.4]} /><meshStandardMaterial color="#f5c542" emissive="#f5c542" emissiveIntensity={0.25} /></mesh>
      </group>
      <mesh position={[0, 5.0, -0.9]}><planeGeometry args={[6.6, 0.9]} /><meshBasicMaterial map={labelTexture('BONDS  +interest  ▲', '#0d1f42', '#f5c542')} transparent /></mesh>
      <Booth x={-4.3} z={1.6} color="#1464f0" label="TREASURY" />
      <Booth x={0} z={2.4} color="#00b37f" label="MUNICIPAL" />
      <Booth x={4.3} z={1.6} color="#ff8a3d" label="CORPORATE" />
      <SignLabel text="BOND STREET" color="#264a86" />
      <Npc id="ben" name="Ben" avatar={BEN} position={[0.2, 0, 3.2]} accent="#f5c542" faceCamera />
      <Npc id="bond-client-a" name="" avatar={CLIENT_A} position={[-3.4, 0, 3.6]} accent="#7850F0" />
      <Npc id="bond-client-b" name="" avatar={CLIENT_B} position={[3.6, 0, 3.4]} accent="#ff8a3d" />
      {active && <BondActivity step={step} feedback={feedback} />}
    </group>
  )
}

function TaxBuilding({ active, step, feedback }) {
  return (
    <group position={[TAX_SPOT[0], 0, TAX_SPOT[1]]}>
      <mesh position={[0, 0.06, 0.5]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[8.0, 44]} /><meshStandardMaterial color="#f4efe6" roughness={0.95} />
      </mesh>
      <RoundedBox args={[8.6, 4.6, 4.0]} radius={0.24} smoothness={3} position={[0, 2.4, -3.0]} castShadow receiveShadow><meshStandardMaterial color="#f2e7d2" roughness={0.66} /></RoundedBox>
      {[-5.0, 5.0].map((x) => (
        <RoundedBox key={x} args={[2.2, 3.0, 3.0]} radius={0.14} smoothness={3} position={[x, 1.6, -3.0]} castShadow><meshStandardMaterial color="#e6d8bd" roughness={0.8} /></RoundedBox>
      ))}
      <mesh position={[0, 5.6, -3.0]} rotation={[0, Math.PI / 4, 0]} scale={[1.16, 1, 0.62]} castShadow><coneGeometry args={[5.8, 1.9, 4]} /><meshStandardMaterial color="#0d2560" roughness={0.6} /></mesh>
      {[-3.4, -1.15, 1.15, 3.4].map((x) => (
        <mesh key={x} position={[x, 2.2, -0.9]} castShadow><cylinderGeometry args={[0.34, 0.42, 4.4, 14]} /><meshStandardMaterial color="#efe0cb" /></mesh>
      ))}
      <RoundedBox args={[8.0, 0.6, 1.0]} radius={0.12} smoothness={3} position={[0, 4.6, -0.9]} castShadow><meshStandardMaterial color="#0d2560" /></RoundedBox>
      <group position={[0, 5.4, -0.7]} scale={1.5}>
        <mesh position={[-0.4, 0.38, 0]} castShadow><sphereGeometry args={[0.2, 14, 14]} /><meshStandardMaterial color="#00dca0" emissive="#00dca0" emissiveIntensity={0.35} /></mesh>
        <mesh position={[0.4, -0.38, 0]} castShadow><sphereGeometry args={[0.2, 14, 14]} /><meshStandardMaterial color="#00dca0" emissive="#00dca0" emissiveIntensity={0.35} /></mesh>
        <mesh rotation={[0, 0, -0.7]} castShadow><boxGeometry args={[0.16, 1.25, 0.16]} /><meshStandardMaterial color="#00dca0" emissive="#00dca0" emissiveIntensity={0.28} /></mesh>
      </group>
      <Booth x={-4.3} z={1.6} color="#1464f0" label="W-2 DESK" />
      <Booth x={0} z={2.4} color="#00b37f" label="DEDUCTIONS" />
      <Booth x={4.3} z={1.6} color="#7850f0" label="E-FILE" />
      <SignLabel text="TAYU TAX OFFICE" color="#0d2560" />
      <Npc id="rex" name="Rex" avatar={REX} position={[0.2, 0, 3.2]} accent="#00dca0" faceCamera />
      <Npc id="tax-client-a" name="" avatar={CLIENT_C} position={[-3.4, 0, 3.6]} accent="#00b37f" />
      <Npc id="tax-client-b" name="" avatar={CLIENT_A} position={[3.6, 0, 3.4]} accent="#7850F0" />
      {active && <TaxActivity step={step} feedback={feedback} />}
    </group>
  )
}

export function BondTaxBuildings({ week, bondStep = 0, taxStep = 0, choiceFeedback = null }) {
  return (
    <group>
      <BondBuilding active={week === 6} step={bondStep} feedback={week === 6 ? choiceFeedback : null} />
      <TaxBuilding active={week === 7} step={taxStep} feedback={week === 7 ? choiceFeedback : null} />
    </group>
  )
}
