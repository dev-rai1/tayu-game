import { Billboard, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { BOND_DISTRICT, STOP_ANGLES, ringPoint } from './config.js'
import { TAX_FORWARD, TAX_SITE } from './taxDistrictLayout.js'
import { labelTexture } from './textures.js'
import { Npc } from './Npc.jsx'

export const BOND_SPOT = [BOND_DISTRICT[0], BOND_DISTRICT[1]]
export const TAX_SPOT = [TAX_SITE[0], TAX_SITE[1]]
export const BOND_ENTRY = [BOND_SPOT[0], BOND_SPOT[1] + 6.5]
export const TAX_ROTATION = Math.atan2(TAX_FORWARD[0], TAX_FORWARD[1])
export const TAX_ENTRY = [TAX_SPOT[0] + TAX_FORWARD[0] * 7.2, TAX_SPOT[1] + TAX_FORWARD[1] * 7.2]
export const BOND_GUIDE = [BOND_SPOT[0] + 0.2, BOND_SPOT[1] + 3.2]
export const TAX_GUIDE = [TAX_SPOT[0] + TAX_FORWARD[0] * 3.0, TAX_SPOT[1] + TAX_FORWARD[1] * 3.0]

const BEN = { skinTone: 'warm_beige', hairColor: 'brown', hairStyle: 'short', shirtColor: 'yellow', pantsColor: 'navy', topStyle: 'tee', bottomStyle: 'pants' }
const REX = { skinTone: 'medium_brown', hairColor: 'black', hairStyle: 'short', shirtColor: 'teal', pantsColor: 'navy', topStyle: 'tee', bottomStyle: 'pants' }
const COURIER = { skinTone: 'tan', hairColor: 'black', hairStyle: 'short', shirtColor: 'blue', pantsColor: 'gray', topStyle: 'tee', bottomStyle: 'pants' }

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
    root.current.position.y = 0
    root.current.rotation.y = wave > 0.5 ? Math.atan2(to[0] - from[0], to[1] - from[1]) : Math.atan2(from[0] - to[0], from[1] - to[1])
  })
  return <group ref={root}><Npc id={id} name="" avatar={avatar} position={[0, 0, 0]} accent={accent} walking walkSpeed={9} /></group>
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
  [[0.2, 0, 3.0], 'WHY TAXES?', '#d86b45'],
  [[-4.5, 0, 0.8], 'READ THE W-2', '#d86b45'],
  [[-4.5, 0, 0.8], 'ADD INCOME', '#d86b45'],
  [[0, 0, 4.25], 'SELF-EMPLOYMENT', '#00b37f'],
  [[0, 0, 4.25], 'EXCLUDE MUNI', '#00b37f'],
  [[0, 0, 4.25], 'SUBTRACT', '#00b37f'],
  [[0, 0, 4.25], 'BRACKET MATH', '#00b37f'],
  [[0, 0, 4.25], 'MARGINAL RATE', '#00b37f'],
  [[4.5, 0, 0.8], 'CAPITAL GAIN', '#7850f0'],
  [[4.5, 0, 0.8], 'HOLDING PERIOD', '#7850f0'],
  [[0.2, 0, 3.0], 'REFUND OR DUE', '#f5c542'],
  [[-4.5, 0, 0.8], 'WITHHOLDING', '#f5c542'],
  [[4.5, 0, 0.8], 'CATCH 3 ERRORS', '#ff8a3d'],
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
      <MovingNpc id="bond-courier" avatar={COURIER} from={[-6.0, 4.3]} to={[5.8, 3.7]} speed={0.62} phase={0.3} accent="#f5c542" />
      <FlyingEnvelope from={[-4.3, 1.6]} to={[0.2, 3.2]} phase={0.05} active={active && step >= 2} />
      <FlyingEnvelope from={[0, 2.4]} to={[0.2, 3.2]} phase={0.38} active={active && step >= 3} />
      <FlyingEnvelope from={[4.3, 1.6]} to={[0.2, 3.2]} phase={0.7} active={active && step >= 5} />
    </>
  )
}

function TaxOfficeLife({ active, step }) {
  return (
    <>
      <MovingNpc id="postal-pat" avatar={COURIER} from={[-7.0, 5.1]} to={[7.0, 4.5]} speed={0.58} phase={0.6} accent="#d86b45" />
      <FlyingEnvelope from={[-6.0, 5.0]} to={[0.2, 3.0]} phase={0.2} active={active && step >= 1} />
      <FlyingEnvelope from={[0.2, 3.0]} to={[4.5, 0.8]} phase={0.58} active={active && step >= 10} />
    </>
  )
}

// A short physical payoff after each correct decision. It deliberately lives
// in the 3D scene, like the Lemonade selling day and Bank teller sequences,
// instead of being another card animation.
function DecisionCutscene({ kind, step, feedback }) {
  const root = useRef()
  const runner = useRef()
  const stamp = useRef()
  const bars = useRef()
  const started = useRef(null)
  const lastKey = useRef('')
  const key = `${kind}-${step}-${feedback || 'none'}`
  useFrame(({ clock }) => {
    if (!root.current) return
    if (feedback !== 'correct') {
      root.current.visible = false
      started.current = null
      lastKey.current = key
      return
    }
    if (lastKey.current !== key || started.current == null) {
      started.current = clock.elapsedTime
      lastKey.current = key
    }
    const p = Math.min(1, (clock.elapsedTime - started.current) / 3.4)
    root.current.visible = p < 1
    const ease = 1 - Math.pow(1 - p, 3)
    root.current.rotation.y = Math.sin(p * Math.PI * 2) * 0.08
    if (runner.current) {
      runner.current.position.x = -4.8 + ease * 9.6
      runner.current.position.y = 1.0 + Math.sin(p * Math.PI) * 3.1
      runner.current.rotation.z = p * Math.PI * 4
    }
    if (stamp.current) {
      stamp.current.position.y = 4.8 - Math.min(1, p * 4) * 3.3 + Math.abs(Math.sin(p * Math.PI * 5)) * (1 - p) * 0.8
      stamp.current.rotation.y = p * Math.PI * 2
    }
    if (bars.current) {
      bars.current.scale.y = 0.2 + Math.min(1, p * 2.4) * 0.8
      bars.current.rotation.y = p * 0.8
    }
  })
  const bond = kind === 'bond'
  const accent = bond
    ? ['#f5c542', '#1464f0', '#00b37f', '#ff8a3d'][step % 4]
    : ['#d86b45', '#00b37f', '#7850f0', '#f5c542'][step % 4]
  return (
    <group ref={root} visible={false} position={[0, 0, 2.4]}>
      <group ref={runner}>
        {bond ? (
          <>
            <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.42, 0.42, 0.12, 24]} /><meshStandardMaterial color="#ffd34d" metalness={0.6} roughness={0.28} emissive="#7a5a00" emissiveIntensity={0.35} /></mesh>
            <mesh position={[0, 0.55, 0]}><boxGeometry args={[1.3, 0.72, 0.08]} /><meshStandardMaterial color="#fff8dc" emissive={accent} emissiveIntensity={0.16} /></mesh>
          </>
        ) : (
          <>
            <mesh><boxGeometry args={[1.2, 0.82, 0.06]} /><meshStandardMaterial color="#fffdf5" emissive={accent} emissiveIntensity={0.14} /></mesh>
            <mesh position={[0, 0, 0.04]}><boxGeometry args={[0.78, 0.05, 0.025]} /><meshStandardMaterial color={accent} /></mesh>
          </>
        )}
      </group>
      <group ref={bars} position={[0, 0.25, -0.4]}>
        {[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[(i - 2) * 0.62, 0.45 + i * 0.2, 0]}><boxGeometry args={[0.38, 0.9 + i * 0.28, 0.38]} /><meshStandardMaterial color={i % 2 ? accent : '#ffffff'} emissive={accent} emissiveIntensity={0.22} /></mesh>)}
      </group>
      <group ref={stamp} position={[0, 4.8, 0.6]}>
        <mesh><cylinderGeometry args={[0.72, 0.72, 0.32, 24]} /><meshStandardMaterial color={bond ? '#0d2560' : '#b94e36'} emissive={accent} emissiveIntensity={0.35} /></mesh>
        <mesh position={[0, -0.34, 0]}><cylinderGeometry args={[0.22, 0.38, 0.48, 18]} /><meshStandardMaterial color="#f2e4c9" /></mesh>
      </group>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2
        return <mesh key={i} position={[Math.cos(a) * 3.3, 1.0 + (i % 3) * 0.45, Math.sin(a) * 2.1]}><sphereGeometry args={[0.12 + (i % 2) * 0.05, 10, 10]} /><meshStandardMaterial color={i % 2 ? accent : '#ffd34d'} emissive={accent} emissiveIntensity={0.5} /></mesh>
      })}
    </group>
  )
}

function WorldPathSegment({ from, to, width = 4.4, color = '#f1dfb7' }) {
  const mx = (from[0] + to[0]) / 2
  const mz = (from[1] + to[1]) / 2
  const dx = to[0] - from[0]
  const dz = to[1] - from[1]
  const len = Math.hypot(dx, dz) + 1.2
  const angle = Math.atan2(dx, dz)
  return <mesh position={[mx, 0.035, mz]} rotation={[-Math.PI / 2, 0, -angle]} receiveShadow><planeGeometry args={[width, len]} /><meshStandardMaterial color={color} roughness={1} /></mesh>
}

function LateGameApproaches() {
  const bondRoad = ringPoint(STOP_ANGLES.bond)
  const taxRoad = ringPoint(STOP_ANGLES.tax)
  return (
    <group>
      <WorldPathSegment from={bondRoad} to={BOND_ENTRY} width={5.2} color="#b9c9cf" />
      <WorldPathSegment from={bondRoad} to={BOND_ENTRY} width={3.7} color="#e8d6ab" />
      <WorldPathSegment from={taxRoad} to={TAX_ENTRY} width={5.4} color="#c7b59e" />
      <WorldPathSegment from={taxRoad} to={TAX_ENTRY} width={3.8} color="#f2dfba" />
    </group>
  )
}

function BondBuilding({ active, step, feedback }) {
  return (
    <group position={[BOND_SPOT[0], 0, BOND_SPOT[1]]}>
      <mesh position={[0, 0.06, 0.5]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[9.0, 48]} /><meshStandardMaterial color="#e9eef7" roughness={0.95} /></mesh>
      <RoundedBox args={[8.8, 7.0, 4.5]} radius={0.26} smoothness={3} position={[0, 3.6, -3.2]} castShadow receiveShadow><meshStandardMaterial color="#264a86" roughness={0.5} metalness={0.1} /></RoundedBox>
      {[-2.7, -0.9, 0.9, 2.7].map((x) => <mesh key={x} position={[x, 3.8, -0.92]}><boxGeometry args={[0.72, 5.7, 0.1]} /><meshStandardMaterial color="#8fb4ee" emissive="#8fb4ee" emissiveIntensity={0.15} /></mesh>)}
      <RoundedBox args={[9.4, 0.5, 5.0]} radius={0.14} smoothness={3} position={[0, 7.15, -3.2]} castShadow><meshStandardMaterial color="#12305f" /></RoundedBox>
      <mesh position={[0, 5.25, -0.86]}><planeGeometry args={[7.2, 0.9]} /><meshBasicMaterial map={labelTexture('BONDS  +interest  ▲', '#0d1f42', '#f5c542')} transparent /></mesh>
      <Booth x={-4.3} z={1.6} color="#1464f0" label="TREASURY" />
      <Booth x={0} z={2.4} color="#00b37f" label="MUNICIPAL" />
      <Booth x={4.3} z={1.6} color="#ff8a3d" label="CORPORATE" />
      <SignLabel text="BOND STREET" color="#264a86" y={7.8} />
      <Npc id="ben" name="Ben" avatar={BEN} position={[0.2, 0, 3.2]} accent="#f5c542" faceCamera />
      <BondStreetLife active={active} step={step} />
      {active && <DecisionCutscene kind="bond" step={step} feedback={feedback} />}
      {active && <StepActivity data={BOND_ACTIVITY} step={step} feedback={feedback} />}
    </group>
  )
}

function TaxBuilding({ active, step, feedback }) {
  return (
    <group position={[TAX_SPOT[0], 0, TAX_SPOT[1]]} rotation={[0, TAX_ROTATION, 0]}>
      <mesh position={[0, 0.055, 0.8]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[10.6, 56]} /><meshStandardMaterial color="#efe5d5" roughness={0.97} /></mesh>
      <mesh position={[0, 0.06, 3.8]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[5.4, 40]} /><meshStandardMaterial color="#d8b98e" roughness={1} /></mesh>
      <RoundedBox args={[10.4, 5.4, 4.6]} radius={0.24} smoothness={3} position={[0, 2.8, -3.25]} castShadow receiveShadow><meshStandardMaterial color="#f2e7d2" roughness={0.66} /></RoundedBox>
      <mesh position={[0, 6.2, -3.25]} rotation={[0, Math.PI / 4, 0]} scale={[1.3, 1, 0.62]} castShadow><coneGeometry args={[6.0, 2.1, 4]} /><meshStandardMaterial color="#6f2f28" roughness={0.62} /></mesh>
      {[-3.8, -1.25, 1.25, 3.8].map((x) => <mesh key={x} position={[x, 2.5, -0.78]} castShadow><cylinderGeometry args={[0.34, 0.44, 4.9, 14]} /><meshStandardMaterial color="#efe0cb" /></mesh>)}
      <RoundedBox args={[9.5, 0.65, 1.0]} radius={0.12} smoothness={3} position={[0, 5.15, -0.78]} castShadow><meshStandardMaterial color="#6f2f28" /></RoundedBox>
      <Booth x={-4.5} z={0.8} color="#d86b45" label="W-2 SCANNER" />
      <Booth x={0} z={4.25} color="#00b37f" label="BRACKET MACHINE" />
      <Booth x={4.5} z={0.8} color="#7850f0" label="E-FILE DESK" />
      <SignLabel text="TAYU TAX OFFICE" color="#6f2f28" y={7.2} />
      <Npc id="rex" name="Rex" avatar={REX} position={[0.2, 0, 3.0]} accent="#00dca0" faceCamera />
      <TaxOfficeLife active={active} step={step} />
      {active && <DecisionCutscene kind="tax" step={step} feedback={feedback} />}
      {active && <StepActivity data={TAX_ACTIVITY} step={step} feedback={feedback} />}
    </group>
  )
}

export function BondTaxBuildings({ week, bondStep = 0, taxStep = 0, choiceFeedback = null }) {
  return (
    <group>
      <LateGameApproaches />
      <BondBuilding active={week === 6} step={bondStep} feedback={week === 6 ? choiceFeedback : null} />
      <TaxBuilding active={week === 7} step={taxStep} feedback={week === 7 ? choiceFeedback : null} />
    </group>
  )
}
