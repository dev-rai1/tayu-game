import { Billboard, RoundedBox } from '@react-three/drei'
import { BOND_DISTRICT, TAX_DISTRICT } from './config.js'
import { labelTexture } from './textures.js'
import { Npc } from './Npc.jsx'

// Bond Street and the Tax Office as full town districts on their own ring stops,
// spaced apart with room between them - like the Bank. Real walking NPCs (Ben,
// Rex + villagers), multiple booths, and distinct iconic silhouettes. Card-driven
// flow starts when the player reaches the guide; no separate scene, no blue screen.

export const BOND_SPOT = [BOND_DISTRICT[0], BOND_DISTRICT[1]]
export const TAX_SPOT = [TAX_DISTRICT[0], TAX_DISTRICT[1]]

// Spawn points a few steps in front of each building.
export const BOND_ENTRY = [BOND_SPOT[0], BOND_SPOT[1] + 6.5]
export const TAX_ENTRY = [TAX_SPOT[0], TAX_SPOT[1] + 6.5]

// Where Ben / Rex stand - the player walks up and talks to start.
export const BOND_GUIDE = [BOND_SPOT[0] + 0.2, BOND_SPOT[1] + 3.2]
export const TAX_GUIDE = [TAX_SPOT[0] + 0.2, TAX_SPOT[1] + 3.2]

// Distinct NPC looks (valid avatar keys).
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

// A borrower / service booth with a colored awning and a small counter.
function Booth({ x, z, color, label }) {
  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[2.6, 2.0, 1.8]} radius={0.14} smoothness={3} position={[0, 1.0, 0]} castShadow receiveShadow><meshStandardMaterial color="#f7f4ee" roughness={0.8} /></RoundedBox>
      {/* awning */}
      <mesh position={[0, 2.25, 0.5]} rotation={[-0.5, 0, 0]} castShadow><boxGeometry args={[2.8, 0.12, 1.4]} /><meshStandardMaterial color={color} /></mesh>
      {/* counter */}
      <RoundedBox args={[2.6, 0.5, 0.5]} radius={0.08} smoothness={2} position={[0, 0.85, 1.0]} castShadow><meshStandardMaterial color={color} roughness={0.6} /></RoundedBox>
      <Billboard position={[0, 3.0, 0]}>
        <mesh><planeGeometry args={[3.0, 0.62]} /><meshBasicMaterial map={labelTexture(label, color, '#ffffff')} transparent /></mesh>
      </Billboard>
    </group>
  )
}

// Bond Street: a modern glass-and-steel EXCHANGE with three borrower booths, a
// gold up-arrow tower, and a ticker board. Iconic = the tall gold arrow.
function BondBuilding() {
  return (
    <group position={[BOND_SPOT[0], 0, BOND_SPOT[1]]}>
      <mesh position={[0, 0.06, 0.5]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[8.0, 44]} /><meshStandardMaterial color="#e9eef7" roughness={0.95} />
      </mesh>
      {/* tall glass exchange tower */}
      <RoundedBox args={[7.6, 6.6, 4.0]} radius={0.26} smoothness={3} position={[0, 3.4, -3.0]} castShadow receiveShadow><meshStandardMaterial color="#264a86" roughness={0.5} metalness={0.1} /></RoundedBox>
      {/* glass stripes */}
      {[-2.2, -0.7, 0.8, 2.3].map((x) => (
        <mesh key={x} position={[x, 3.6, -0.98]}><boxGeometry args={[0.7, 5.4, 0.1]} /><meshStandardMaterial color="#8fb4ee" emissive="#8fb4ee" emissiveIntensity={0.15} /></mesh>
      ))}
      {/* flat roof cap */}
      <RoundedBox args={[8.4, 0.5, 4.6]} radius={0.14} smoothness={3} position={[0, 6.9, -3.0]} castShadow><meshStandardMaterial color="#12305f" /></RoundedBox>
      {/* ICONIC: tall gold up-arrow = growing interest */}
      <group position={[0, 8.4, -3.0]}>
        <mesh position={[0, 0.6, 0]} castShadow><coneGeometry args={[0.9, 1.4, 4]} /><meshStandardMaterial color="#f5c542" emissive="#f5c542" emissiveIntensity={0.4} /></mesh>
        <mesh position={[0, -0.7, 0]} castShadow><boxGeometry args={[0.5, 1.8, 0.4]} /><meshStandardMaterial color="#f5c542" emissive="#f5c542" emissiveIntensity={0.25} /></mesh>
      </group>
      {/* ticker board */}
      <mesh position={[0, 5.0, -0.9]}><planeGeometry args={[6.6, 0.9]} /><meshBasicMaterial map={labelTexture('BONDS  +interest  ▲', '#0d1f42', '#f5c542')} transparent /></mesh>
      {/* three borrower booths (Treasury / Muni / Corporate) */}
      <Booth x={-4.3} z={1.6} color="#1464f0" label="TREASURY" />
      <Booth x={0} z={2.4} color="#00b37f" label="MUNICIPAL" />
      <Booth x={4.3} z={1.6} color="#ff8a3d" label="CORPORATE" />
      <SignLabel text="BOND STREET" color="#264a86" />
      {/* real NPCs */}
      <Npc id="ben" name="Ben" avatar={BEN} position={[0.2, 0, 3.2]} accent="#f5c542" faceCamera />
      <Npc id="bond-client-a" name="" avatar={CLIENT_A} position={[-3.4, 0, 3.6]} accent="#7850F0" />
      <Npc id="bond-client-b" name="" avatar={CLIENT_B} position={[3.6, 0, 3.4]} accent="#ff8a3d" />
    </group>
  )
}

// Tax Office: a classical CIVIC HALL with a columned portico, a big teal % on a
// pediment, filing-cabinet wings, and three service desks. Iconic = the % pediment.
function TaxBuilding() {
  return (
    <group position={[TAX_SPOT[0], 0, TAX_SPOT[1]]}>
      <mesh position={[0, 0.06, 0.5]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[8.0, 44]} /><meshStandardMaterial color="#f4efe6" roughness={0.95} />
      </mesh>
      {/* civic hall body */}
      <RoundedBox args={[8.6, 4.6, 4.0]} radius={0.24} smoothness={3} position={[0, 2.4, -3.0]} castShadow receiveShadow><meshStandardMaterial color="#f2e7d2" roughness={0.66} /></RoundedBox>
      {/* filing-cabinet wings */}
      {[-5.0, 5.0].map((x) => (
        <RoundedBox key={x} args={[2.2, 3.0, 3.0]} radius={0.14} smoothness={3} position={[x, 1.6, -3.0]} castShadow><meshStandardMaterial color="#e6d8bd" roughness={0.8} /></RoundedBox>
      ))}
      {/* pediment + hipped roof */}
      <mesh position={[0, 5.6, -3.0]} rotation={[0, Math.PI / 4, 0]} scale={[1.16, 1, 0.62]} castShadow><coneGeometry args={[5.8, 1.9, 4]} /><meshStandardMaterial color="#0d2560" roughness={0.6} /></mesh>
      {/* portico columns */}
      {[-3.4, -1.15, 1.15, 3.4].map((x) => (
        <mesh key={x} position={[x, 2.2, -0.9]} castShadow><cylinderGeometry args={[0.34, 0.42, 4.4, 14]} /><meshStandardMaterial color="#efe0cb" /></mesh>
      ))}
      {/* entablature */}
      <RoundedBox args={[8.0, 0.6, 1.0]} radius={0.12} smoothness={3} position={[0, 4.6, -0.9]} castShadow><meshStandardMaterial color="#0d2560" /></RoundedBox>
      {/* ICONIC: big teal % on the pediment */}
      <group position={[0, 5.4, -0.7]} scale={1.5}>
        <mesh position={[-0.4, 0.38, 0]} castShadow><sphereGeometry args={[0.2, 14, 14]} /><meshStandardMaterial color="#00dca0" emissive="#00dca0" emissiveIntensity={0.35} /></mesh>
        <mesh position={[0.4, -0.38, 0]} castShadow><sphereGeometry args={[0.2, 14, 14]} /><meshStandardMaterial color="#00dca0" emissive="#00dca0" emissiveIntensity={0.35} /></mesh>
        <mesh rotation={[0, 0, -0.7]} castShadow><boxGeometry args={[0.16, 1.25, 0.16]} /><meshStandardMaterial color="#00dca0" emissive="#00dca0" emissiveIntensity={0.28} /></mesh>
      </group>
      {/* three service desks (W-2 / Deductions / Filing) */}
      <Booth x={-4.3} z={1.6} color="#1464f0" label="W-2 DESK" />
      <Booth x={0} z={2.4} color="#00b37f" label="DEDUCTIONS" />
      <Booth x={4.3} z={1.6} color="#7850f0" label="E-FILE" />
      <SignLabel text="TAYU TAX OFFICE" color="#0d2560" />
      {/* real NPCs */}
      <Npc id="rex" name="Rex" avatar={REX} position={[0.2, 0, 3.2]} accent="#00dca0" faceCamera />
      <Npc id="tax-client-a" name="" avatar={CLIENT_C} position={[-3.4, 0, 3.6]} accent="#00b37f" />
      <Npc id="tax-client-b" name="" avatar={CLIENT_A} position={[3.6, 0, 3.4]} accent="#7850F0" />
    </group>
  )
}

export function BondTaxBuildings() {
  return (
    <group>
      <BondBuilding />
      <TaxBuilding />
    </group>
  )
}
