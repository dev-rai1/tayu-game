import { Billboard, RoundedBox } from '@react-three/drei'
import { TAX_DISTRICT } from './config.js'
import { labelTexture } from './textures.js'

// Bond Street and the Tax Office as plain town buildings that sit ON the island,
// spaced apart with room between them - just like the Bank or Lemonade Stand.
// No separate scene, no paycheck world. The card-driven flow (Beau / Rex) starts
// on arrival; these are the landmarks the player spawns next to.

// Tax office at its ring stop; Bond exchange spaced along the ring, both well
// inside the playable island.
export const TAX_SPOT = [TAX_DISTRICT[0], TAX_DISTRICT[1]]
export const BOND_SPOT = [TAX_DISTRICT[0] - 15, TAX_DISTRICT[1] + 1]

// Spawn points a few steps in front of each building (player faces the door).
export const TAX_ENTRY = [TAX_SPOT[0], TAX_SPOT[1] + 6]
export const BOND_ENTRY = [BOND_SPOT[0], BOND_SPOT[1] + 6]

// Where Beau / Rex stand - the player walks up to them and talks to start.
export const BOND_GUIDE = [BOND_SPOT[0] + 1.6, BOND_SPOT[1] + 2.4]
export const TAX_GUIDE = [TAX_SPOT[0] + 1.7, TAX_SPOT[1] + 2.5]

function SignLabel({ text, color, y = 5.4 }) {
  return (
    <Billboard position={[0, y, 0]}>
      <mesh>
        <planeGeometry args={[6.2, 1.25]} />
        <meshBasicMaterial map={labelTexture(text, color, '#ffffff')} transparent />
      </mesh>
    </Billboard>
  )
}

function Person({ x = 0, z = 0, shirt = '#2b6fe0', name, nameColor = '#071748' }) {
  return (
    <group position={[x, 0, z]}>
      {/* legs */}
      <mesh position={[0, 0.55, 0]} castShadow><cylinderGeometry args={[0.26, 0.3, 1.1, 10]} /><meshStandardMaterial color="#3a3f52" /></mesh>
      {/* body */}
      <mesh position={[0, 1.5, 0]} castShadow><capsuleGeometry args={[0.36, 0.7, 4, 10]} /><meshStandardMaterial color={shirt} /></mesh>
      {/* head */}
      <mesh position={[0, 2.35, 0]} castShadow><sphereGeometry args={[0.34, 16, 16]} /><meshStandardMaterial color="#f2c79a" /></mesh>
      {name && (
        <Billboard position={[0, 3.15, 0]}>
          <mesh><planeGeometry args={[3.2, 0.7]} /><meshBasicMaterial map={labelTexture(name, nameColor, '#ffffff')} transparent /></mesh>
        </Billboard>
      )}
    </group>
  )
}

function BondBuilding() {
  return (
    <group position={[BOND_SPOT[0], 0, BOND_SPOT[1]]}>
      {/* plaza pad */}
      <mesh position={[0, 0.06, 1]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6.2, 40]} /><meshStandardMaterial color="#e9eef7" roughness={0.95} />
      </mesh>
      {/* body - deep blue exchange, open front toward the player (+z) */}
      <RoundedBox args={[8.2, 4.4, 4.4]} radius={0.24} smoothness={3} position={[0, 2.3, -1.1]} castShadow receiveShadow>
        <meshStandardMaterial color="#264a86" roughness={0.6} />
      </RoundedBox>
      {/* flat roof cap */}
      <RoundedBox args={[9.0, 0.5, 5.1]} radius={0.14} smoothness={3} position={[0, 4.7, -1.1]} castShadow>
        <meshStandardMaterial color="#12305f" />
      </RoundedBox>
      {/* columns across the front */}
      {[-3.1, -1.05, 1.05, 3.1].map((x) => (
        <mesh key={x} position={[x, 2.0, 1.05]} castShadow><cylinderGeometry args={[0.3, 0.34, 3.9, 12]} /><meshStandardMaterial color="#eaf0fb" /></mesh>
      ))}
      {/* doorway */}
      <RoundedBox args={[2.4, 2.6, 0.4]} radius={0.1} smoothness={3} position={[0, 1.5, 1.0]}><meshStandardMaterial color="#0d1f42" /></RoundedBox>
      {/* gold up-arrow emblem = growing interest */}
      <group position={[0, 3.6, 1.15]}>
        <mesh position={[0, 0.35, 0]} castShadow><coneGeometry args={[0.62, 0.9, 4]} rotation={[0, Math.PI / 4, 0]} /><meshStandardMaterial color="#f5c542" emissive="#f5c542" emissiveIntensity={0.3} /></mesh>
        <mesh position={[0, -0.45, 0]} castShadow><boxGeometry args={[0.42, 1.0, 0.24]} /><meshStandardMaterial color="#f5c542" emissive="#f5c542" emissiveIntensity={0.2} /></mesh>
      </group>
      <SignLabel text="BOND STREET" color="#264a86" />
      <Person x={1.6} z={2.4} shirt="#f5c542" name="Beau" nameColor="#264a86" />
    </group>
  )
}

function TaxBuilding() {
  return (
    <group position={[TAX_SPOT[0], 0, TAX_SPOT[1]]}>
      {/* plaza pad */}
      <mesh position={[0, 0.06, 1]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6.2, 40]} /><meshStandardMaterial color="#f4efe6" roughness={0.95} />
      </mesh>
      {/* body - cream civic hall, front toward the player (+z) */}
      <RoundedBox args={[8.4, 4.2, 4.2]} radius={0.24} smoothness={3} position={[0, 2.2, -1.1]} castShadow receiveShadow>
        <meshStandardMaterial color="#f2e7d2" roughness={0.66} />
      </RoundedBox>
      {/* hipped roof */}
      <mesh position={[0, 4.8, -1.1]} rotation={[0, Math.PI / 4, 0]} scale={[1.12, 1, 0.62]} castShadow>
        <coneGeometry args={[5.4, 1.7, 4]} /><meshStandardMaterial color="#0d2560" roughness={0.6} />
      </mesh>
      {/* portico columns */}
      {[-3.2, -1.05, 1.05, 3.2].map((x) => (
        <mesh key={x} position={[x, 2.0, 1.15]} castShadow><cylinderGeometry args={[0.32, 0.4, 4.0, 14]} /><meshStandardMaterial color="#efe0cb" /></mesh>
      ))}
      {/* doorway */}
      <RoundedBox args={[2.4, 2.6, 0.4]} radius={0.1} smoothness={3} position={[0, 1.5, 1.05]}><meshStandardMaterial color="#0d2560" /></RoundedBox>
      {/* teal % emblem */}
      <group position={[0, 3.5, 1.2]}>
        <mesh position={[-0.4, 0.38, 0]} castShadow><sphereGeometry args={[0.2, 14, 14]} /><meshStandardMaterial color="#00dca0" emissive="#00dca0" emissiveIntensity={0.3} /></mesh>
        <mesh position={[0.4, -0.38, 0]} castShadow><sphereGeometry args={[0.2, 14, 14]} /><meshStandardMaterial color="#00dca0" emissive="#00dca0" emissiveIntensity={0.3} /></mesh>
        <mesh rotation={[0, 0, -0.7]} castShadow><boxGeometry args={[0.16, 1.25, 0.16]} /><meshStandardMaterial color="#00dca0" emissive="#00dca0" emissiveIntensity={0.24} /></mesh>
      </group>
      <SignLabel text="TAYU TAX OFFICE" color="#0d2560" />
      <Person x={1.7} z={2.5} shirt="#00dca0" name="Rex" nameColor="#0d2560" />
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
