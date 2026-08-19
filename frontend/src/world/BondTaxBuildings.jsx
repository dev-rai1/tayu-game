import { Billboard, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { BOND_DISTRICT } from './config.js'
import { TAX_SITE } from './taxDistrictLayout.js'
import { labelTexture } from './textures.js'
import { Npc } from './Npc.jsx'

export const BOND_SPOT = [BOND_DISTRICT[0], BOND_DISTRICT[1]]
export const TAX_SPOT = [TAX_SITE[0], TAX_SITE[1]]
export const BOND_ENTRY = [BOND_SPOT[0], BOND_SPOT[1] + 6.5]
export const TAX_ENTRY = [TAX_SPOT[0], TAX_SPOT[1] + 6.2]
export const BOND_GUIDE = [BOND_SPOT[0] + 0.2, BOND_SPOT[1] + 3.2]
export const TAX_GUIDE = [TAX_SPOT[0] + 0.2, TAX_SPOT[1] + 3.0]

const BEN = { skinTone: 'warm_beige', hairColor: 'brown', hairStyle: 'short', shirtColor: 'yellow', pantsColor: 'navy', topStyle: 'tee', bottomStyle: 'pants' }
const REX = { skinTone: 'medium_brown', hairColor: 'black', hairStyle: 'short', shirtColor: 'teal', pantsColor: 'navy', topStyle: 'tee', bottomStyle: 'pants' }
const CLIENT_A = { skinTone: 'light_tan', hairColor: 'blonde', hairStyle: 'ponytail', shirtColor: 'purple', pantsColor: 'navy', topStyle: 'tee', bottomStyle: 'skirt' }
const CLIENT_B = { skinTone: 'deep_brown', hairColor: 'black', hairStyle: 'curly', shirtColor: 'orange', pantsColor: 'navy', topStyle: 'hoodie', bottomStyle: 'pants' }
const CLIENT_C = { skinTone: 'cream', hairColor: 'red', hairStyle: 'short', shirtColor: 'green', pantsColor: 'navy', topStyle: 'tee', bottomStyle: 'shorts' }
const COURIER = { skinTone: 'tan', hairColor: 'black', hairStyle: 'short', shirtColor: 'blue', pantsColor: 'gray', topStyle: 'tee', bottomStyle: 'pants' }
const CLERK = { skinTone: 'medium_brown', hairColor: 'brown', hairStyle: 'long', shirtColor: 'green', pantsColor: 'navy', topStyle: 'tee', bottomStyle: 'pants' }

const lerp = (a, b, t) => a + (b - a) * t

function SignLabel({ text, color, y = 6.0 }) {
  return <Billboard position={[0, y, 0]}><mesh><planeGeometry args={[6.6, 1.3]} /><meshBasicMaterial map={labelTexture(text, color, '#ffffff')} transparent /></mesh></Billboard>
}

function Booth({ x, z, color, label }) {
  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[2.6, 2.0, 1.8]} radius={0.14} smoothness={3} position={[0, 1.0, 0]} castShadow receiveShadow><meshStandardMaterial color="#f7f4ee" roughness={0.8} /></RoundedBox>
      <mesh position={[0, 2.25, 0.5]} rotation={[-0.5, 0, 0]} castShadow><boxGeometry args={[2.8, 0.12, 1.4]} /><meshStandardMaterial color={color} /></mesh>
      <RoundedBox args={[2.6, 0.5, 0.5]} radius={0.08} smoothness={2} position={[0, 0.85, 1.0]} castShadow><meshStandardMaterial color={color} roughness={0.6} /></RoundedBox>
      <Billboard position={[0, 3.0, 0]}><mesh><planeGeometry args={[3.0, 0.62]} /><meshBasicMaterial map={labelTexture(label, color, '#ffffff')} transparent /></mesh></Billboard>
    </group>
  )
}

function MovingNpc({ id, avatar, from, to, speed = 0.35, phase = 0, accent = '#1464f0' }) {
  const root = useRef()
  useFrame(({ clock }) => {
    if (!root.current) return
    const wave = (Math.sin(clock.elapsedTime * speed + phase) + 1) / 2
    const eased = wave * wave * (3 - 2 * wave)
    root.current.position.x = lerp(from[0], to[0], eased)
    root.current.position.z = lerp(from[1], to[1], eased)
    root.current.position.y = Math.abs(Math.sin(clock.elapsedTime * speed * 4 + phase)) * 0.025
    root.current.rotation.y = wave > 0.5 ? Math.atan2(to[0] - from[0], to[1] - from[1]) : Math.atan2(from[0] - to[0], from[1] - to[1])
  })
  return <group ref={root}><Npc id={id} name="" avatar={avatar} position={[0, 0, 0]} accent={accent} /></group>
}

function FlyingEnvelope({ from, to, phase = 0, active = true }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current || !active) return
    const t = ((clock.elapsedTime * 0.18 + phase) % 1)
    ref.current.position.x = lerp(from[0], to[0], t)
    ref.current.position.z = lerp(from[1], to[1], t)
    ref.current.position.y = 1.8 + Math.sin(t * Math.PI) * 2.1
    ref.current.rotation.z = Math.sin(t * Math.PI * 4) * 0.18
  })
  if (!active) return null
  return <mesh ref={ref}><boxGeometry args={[0.72, 0.42, 0.07]} /><meshStandardMaterial color="#fff7df" emissive="#ffd86b" emissiveIntensity={0.18} /></mesh>
}

function ActivityBeacon({ position, color, label, feedback }) {
  const ring = useRef()
  const orb = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ring.current) {
      ring.current.rotation.z = t * (feedback === 'wrong' ? -2.2 : 1.35)
      ring.current.scale.setScalar(feedback === 'wrong' ? 1 + Math.sin(t * 12) * 0.12 : 1 + Math.sin(t * 4) * 0.08)
    }
    if (orb.current) {
      orb.current.position.y = 4.4 + Math.sin(t * (feedback ? 7 : 3)) * (feedback ? 0.35 : 0.18)
      orb.current.position.x = feedback === 'wrong' ? Math.sin(t * 18) * 0.22 : 0
    }
  })
  const feedbackColor = feedback === 'correct' ? '#00c982' : feedback === 'wrong' ? '#ff4d4f' : color
  const feedbackLabel = feedback === 'correct' ? 'NICE CHOICE!' : feedback === 'wrong' ? 'TRY AGAIN' : label
  return (
    <group position={position}>
      <mesh ref={ring} position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[1.55, 0.12, 12, 40]} /><meshStandardMaterial color={feedbackColor} emissive={feedbackColor} emissiveIntensity={0.85} /></mesh>
      <mesh ref={orb} position={[0, 4.4, 0]}><sphereGeometry args={[0.34, 18, 18]} /><meshStandardMaterial color={feedbackColor} emissive={feedbackColor} emissiveIntensity={1.2} /></mesh>
      <Billboard position={[0, 5.2, 0]}><mesh><planeGeometry args={[3.7, 0.72]} /><meshBasicMaterial map={labelTexture(feedbackLabel, feedbackColor, '#ffffff')} transparent /></mesh></Billboard>
    </group>
  )
}

const BOND_ACTIVITY = [
  [[0.2, 0, 3.2], 'LEND OR OWN', '#1464f0'],
  [[-4.3, 0, 1.6], 'CHECK BORROWER', '#1464f0'],
  [[-4.3, 0, 1.6], 'COUPON MATH', '#1464f0'],
  [[0, 0, 2.4], 'TAX-EQUIVALENT YIELD', '#00b37f'],
  [[0, 0, 2.4], 'MUNI TAX BENEFIT', '#00b37f'],
  [[4.3, 0, 1.6], 'RISK VS RETURN', '#ff8a3d'],
  [[0.2, 0, 3.2], 'RATE SHOCK', '#f5c542'],
  [[4.3, 0, 1.6], 'CREDIT NEWS', '#ff8a3d'],
  [[4.3, 0, 1.6], 'WHO GETS PAID?', '#f5c542'],
  [[0.2, 0, 2.8], 'ADD COUPONS', '#7850f0'],
  [[0.2, 0, 2.8], 'DIVERSIFY', '#7850f0'],
  [[0.2, 0, 2.8], 'MATURITY MATH', '#00c982'],
  [[0.2, 0, 3.2], 'ASSET ALLOCATION', '#00c982'],
  [[0.2, 0, 3.2], 'TO TAX OFFICE', '#00c982'],
]

const TAX_ACTIVITY = [
  [[0.2, 0, 3.0], 'WHY TAXES?', '#1464f0'],
  [[-4.3, 0, 1.6], 'READ THE W-2', '#1464f0'],
  [[-4.3, 0, 1.6], 'ADD INCOME', '#1464f0'],
  [[-1.8, 0, 3.0], 'SELF-EMPLOYMENT', '#00b37f'],
  [[0, 0, 2.4], 'EXCLUDE MUNI', '#00b37f'],
  [[0, 0, 2.4], 'SUBTRACT', '#00b37f'],
  [[0, 0, 2.4], 'BRACKET MATH', '#00b37f'],
  [[0, 0, 2.4], 'MARGINAL RATE', '#00b37f'],
  [[4.3, 0, 1.6], 'CAPITAL GAIN', '#7850f0'],
  [[4.3, 0, 1.6], 'HOLDING PERIOD', '#7850f0'],
  [[2.0, 0, 3.2], 'REFUND OR DUE', '#f5c542'],
  [[-2.0, 0, 3.2], 'WITHHOLDING', '#f5c542'],
  [[4.3, 0, 1.6], 'CATCH 3 ERRORS', '#ff8a3d'],
  [[0.2, 0, 3.0], 'FINAL CHECK', '#00c982'],
  [[0.2, 0, 3.0], 'TO FINALE', '#00c982'],
]

function StepActivity({ data, step, feedback }) {
  const i = Math.min(Math.max(Number(step || 0), 0), data.length - 1)
  const [position, label, color] = data[i]
  return <ActivityBeacon position={position} color={color} label={label} feedback={feedback} />
}

function BondStreetLife({ active, step }) {
  return (
    <>
      <MovingNpc id="bond-courier" avatar={COURIER} from={[-6.0, 4.3]} to={[5.8, 3.7]} speed={0.42} phase={0.3} accent="#f5c542" />
      <MovingNpc id="town-project-worker" avatar={CLIENT_C} from={[-1.5, 5.1]} to={[1.5, 1.8]} speed={0.31} phase={2.1} accent="#00b37f" />
      <MovingNpc id="corporate-analyst" avatar={CLIENT_B} from={[5.5, 4.8]} to={[3.8, 1.2]} speed={0.38} phase={4.4} accent="#ff8a3d" />
      <FlyingEnvelope from={[-4.3, 1.6]} to={[0.2, 3.2]} phase={0.05} active={active && step >= 2} />
      <FlyingEnvelope from={[0, 2.4]} to={[0.2, 3.2]} phase={0.38} active={active && step >= 3} />
      <FlyingEnvelope from={[4.3, 1.6]} to={[0.2, 3.2]} phase={0.7} active={active && step >= 5} />
    </>
  )
}

function TaxOfficeLife({ active, step }) {
  return (
    <>
      <MovingNpc id="postal-pat" avatar={COURIER} from={[-6.2, 4.9]} to={[-1.2, 3.0]} speed={0.4} phase={0.6} accent="#1464f0" />
      <MovingNpc id="tax-clerk" avatar={CLERK} from={[5.4, 4.6]} to={[2.0, 1.4]} speed={0.28} phase={2.7} accent="#00dca0" />
      <MovingNpc id="taxpayer-queue" avatar={CLIENT_A} from={[-3.7, 5.4]} to={[3.7, 5.4]} speed={0.25} phase={4.2} accent="#7850f0" />
      <FlyingEnvelope from={[-6.0, 5.0]} to={[0.2, 3.0]} phase={0.2} active={active && step >= 1} />
      <FlyingEnvelope from={[0.2, 3.0]} to={[4.3, 1.6]} phase={0.58} active={active && step >= 10} />
    </>
  )
}

function BondBuilding({ active, step, feedback }) {
  return (
    <group position={[BOND_SPOT[0], 0, BOND_SPOT[1]]}>
      <mesh position={[0, 0.06, 0.5]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[8.0, 44]} /><meshStandardMaterial color="#e9eef7" roughness={0.95} /></mesh>
      <RoundedBox args={[7.6, 6.6, 4.0]} radius={0.26} smoothness={3} position={[0, 3.4, -3.0]} castShadow receiveShadow><meshStandardMaterial color="#264a86" roughness={0.5} metalness={0.1} /></RoundedBox>
      {[-2.2, -0.7, 0.8, 2.3].map((x) => <mesh key={x} position={[x, 3.6, -0.98]}><boxGeometry args={[0.7, 5.4, 0.1]} /><meshStandardMaterial color="#8fb4ee" emissive="#8fb4ee" emissiveIntensity={0.15} /></mesh>)}
      <RoundedBox args={[8.4, 0.5, 4.6]} radius={0.14} smoothness={3} position={[0, 6.9, -3.0]} castShadow><meshStandardMaterial color="#12305f" /></RoundedBox>
      <mesh position={[0, 5.0, -0.9]}><planeGeometry args={[6.6, 0.9]} /><meshBasicMaterial map={labelTexture('BONDS  +interest  ▲', '#0d1f42', '#f5c542')} transparent /></mesh>
      <Booth x={-4.3} z={1.6} color="#1464f0" label="TREASURY" />
      <Booth x={0} z={2.4} color="#00b37f" label="MUNICIPAL" />
      <Booth x={4.3} z={1.6} color="#ff8a3d" label="CORPORATE" />
      <SignLabel text="BOND STREET" color="#264a86" />
      <Npc id="ben" name="Ben" avatar={BEN} position={[0.2, 0, 3.2]} accent="#f5c542" faceCamera />
      <Npc id="bond-client-a" name="" avatar={CLIENT_A} position={[-3.4, 0, 3.6]} accent="#7850F0" />
      <Npc id="bond-client-b" name="" avatar={CLIENT_B} position={[3.6, 0, 3.4]} accent="#ff8a3d" />
      <BondStreetLife active={active} step={step} />
      {active && <StepActivity data={BOND_ACTIVITY} step={step} feedback={feedback} />}
    </group>
  )
}

function TaxBuilding({ active, step, feedback }) {
  return (
    <group position={[TAX_SPOT[0], 0, TAX_SPOT[1]]}>
      <mesh position={[0, 0.06, 0.5]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[7.4, 44]} /><meshStandardMaterial color="#f4efe6" roughness={0.95} /></mesh>
      <RoundedBox args={[8.2, 4.6, 3.7]} radius={0.24} smoothness={3} position={[0, 2.4, -2.75]} castShadow receiveShadow><meshStandardMaterial color="#f2e7d2" roughness={0.66} /></RoundedBox>
      <mesh position={[0, 5.6, -2.75]} rotation={[0, Math.PI / 4, 0]} scale={[1.12, 1, 0.58]} castShadow><coneGeometry args={[5.5, 1.9, 4]} /><meshStandardMaterial color="#0d2560" roughness={0.6} /></mesh>
      {[-3.2, -1.05, 1.05, 3.2].map((x) => <mesh key={x} position={[x, 2.2, -0.78]} castShadow><cylinderGeometry args={[0.32, 0.4, 4.4, 14]} /><meshStandardMaterial color="#efe0cb" /></mesh>)}
      <RoundedBox args={[7.7, 0.6, 1.0]} radius={0.12} smoothness={3} position={[0, 4.6, -0.78]} castShadow><meshStandardMaterial color="#0d2560" /></RoundedBox>
      <Booth x={-4.3} z={1.6} color="#1464f0" label="W-2 DESK" />
      <Booth x={0} z={2.4} color="#00b37f" label="DEDUCTIONS" />
      <Booth x={4.3} z={1.6} color="#7850f0" label="E-FILE" />
      <SignLabel text="TAYU TAX OFFICE" color="#0d2560" />
      <Npc id="rex" name="Rex" avatar={REX} position={[0.2, 0, 3.0]} accent="#00dca0" faceCamera />
      <Npc id="tax-client-a" name="" avatar={CLIENT_C} position={[-3.4, 0, 3.6]} accent="#00b37f" />
      <Npc id="tax-client-b" name="" avatar={CLIENT_A} position={[3.6, 0, 3.4]} accent="#7850F0" />
      <TaxOfficeLife active={active} step={step} />
      {active && <StepActivity data={TAX_ACTIVITY} step={step} feedback={feedback} />}
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
