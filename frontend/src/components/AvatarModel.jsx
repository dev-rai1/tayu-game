import { SKIN_HEX, EYE_HEX, HAIR_HEX, SHIRT_HEX, PANTS_HEX, SHOE_HEX, BODY_SCALE } from '../constants/avatarOptions.js'

// A procedural low-poly humanoid built from Three.js primitives - no external
// assets, fully recolorable/customizable, and light enough to hit 60fps.
function Part({ geo, args, color, roughness = 0.75, ...rest }) {
  return (
    <mesh castShadow {...rest}>
      {geo === 'box' && <boxGeometry args={args} />}
      {geo === 'sphere' && <sphereGeometry args={args} />}
      {geo === 'capsule' && <capsuleGeometry args={args} />}
      {geo === 'cylinder' && <cylinderGeometry args={args} />}
      {geo === 'torus' && <torusGeometry args={args} />}
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  )
}

function Hair({ style, color }) {
  const headY = 1.42
  const r = 0.27
  const cap = <Part geo="sphere" args={[r, 20, 20]} position={[0, headY + 0.07, -0.02]} scale={[1.12, 0.85, 1.12]} color={color} />
  return (
    <group>
      {cap}
      {style === 'medium' && <Part geo="box" args={[0.5, 0.28, 0.18]} position={[0, headY - 0.12, -0.18]} color={color} />}
      {style === 'long' && <Part geo="box" args={[0.5, 0.7, 0.18]} position={[0, headY - 0.35, -0.18]} color={color} />}
      {style === 'curly' && (
        <>
          {[-0.18, 0, 0.18].map((x) => (
            <Part key={x} geo="sphere" args={[0.13, 12, 12]} position={[x, headY + 0.16, -0.05]} color={color} />
          ))}
          <Part geo="sphere" args={[0.13, 12, 12]} position={[-0.22, headY, -0.05]} color={color} />
          <Part geo="sphere" args={[0.13, 12, 12]} position={[0.22, headY, -0.05]} color={color} />
        </>
      )}
    </group>
  )
}

function Eye({ x, headY, r, shape, color }) {
  const scale = shape === 'almond' ? [1.4, 0.65, 1] : shape === 'hooded' ? [1.25, 0.8, 1] : [1, 1, 1]
  return (
    <group position={[x, headY + 0.03, r * 0.86]} scale={scale}>
      <Part geo="sphere" args={[0.05, 14, 14]} color="#ffffff" />
      <Part geo="sphere" args={[0.032, 12, 12]} position={[0, 0, 0.03]} color={color} />
      <Part geo="sphere" args={[0.016, 10, 10]} position={[0, 0, 0.05]} color="#0a0a0a" />
    </group>
  )
}

export default function AvatarModel({ avatar }) {
  const skin = SKIN_HEX[avatar.skinTone] || '#e8b486'
  const hair = HAIR_HEX[avatar.hairColor] || '#5a3a22'
  const eye = EYE_HEX[avatar.eyeColor] || '#6b4423'
  const shirt = SHIRT_HEX[avatar.shirtColor] || '#1464f0'
  const pants = PANTS_HEX[avatar.pantsColor] || '#22262e'
  const shoe = SHOE_HEX[avatar.shoeColor] || '#f5f5f5'
  const [bx, by, bz] = BODY_SCALE[avatar.bodyType] || [1, 1, 1]
  const headY = 1.42
  const r = 0.27
  const acc = avatar.accessories || []

  return (
    <group position={[0, -0.85, 0]}>
      {/* Legs */}
      <Part geo="capsule" args={[0.11, 0.5, 6, 14]} position={[-0.13, 0.45, 0]} color={pants} />
      <Part geo="capsule" args={[0.11, 0.5, 6, 14]} position={[0.13, 0.45, 0]} color={pants} />
      {/* Shoes */}
      <Part geo="box" args={[0.17, 0.12, 0.3]} position={[-0.13, 0.06, 0.05]} color={shoe} />
      <Part geo="box" args={[0.17, 0.12, 0.3]} position={[0.13, 0.06, 0.05]} color={shoe} />

      {/* Torso (scaled by body type) */}
      <group scale={[bx, by, bz]}>
        <Part geo="capsule" args={[0.27, 0.45, 6, 16]} position={[0, 1.02, 0]} color={shirt} />
      </group>

      {/* Arms - sleeves (shirt) + hands (skin) */}
      <Part geo="capsule" args={[0.075, 0.42, 6, 12]} position={[-0.33 * bx, 1.05, 0]} rotation={[0, 0, 0.12]} color={shirt} />
      <Part geo="capsule" args={[0.075, 0.42, 6, 12]} position={[0.33 * bx, 1.05, 0]} rotation={[0, 0, -0.12]} color={shirt} />
      <Part geo="sphere" args={[0.085, 12, 12]} position={[-0.37 * bx, 0.78, 0]} color={skin} />
      <Part geo="sphere" args={[0.085, 12, 12]} position={[0.37 * bx, 0.78, 0]} color={skin} />

      {/* Neck + head */}
      <Part geo="cylinder" args={[0.09, 0.09, 0.12, 12]} position={[0, 1.22, 0]} color={skin} />
      <Part geo="sphere" args={[r, 24, 24]} position={[0, headY, 0]} color={skin} />

      {/* Eyes */}
      <Eye x={-0.1} headY={headY} r={r} shape={avatar.eyeShape} color={eye} />
      <Eye x={0.1} headY={headY} r={r} shape={avatar.eyeShape} color={eye} />
      {/* Smile (lower-half torus arc = upturned mouth) */}
      <Part geo="torus" args={[0.055, 0.014, 8, 16, Math.PI]} position={[0, headY - 0.13, r * 0.9]} rotation={[0, 0, Math.PI]} color="#7a3b30" />

      <Hair style={avatar.hairStyle} color={hair} />

      {/* Accessories */}
      {acc.includes('backpack') && <Part geo="box" args={[0.34, 0.42, 0.16]} position={[0, 1.02, -0.26]} color="#7a4a25" />}
      {acc.includes('hat') && (
        <>
          <Part geo="cylinder" args={[0.29, 0.29, 0.12, 18]} position={[0, headY + 0.2, 0]} color="#1464f0" />
          <Part geo="cylinder" args={[0.42, 0.42, 0.03, 18]} position={[0, headY + 0.15, 0.12]} color="#1464f0" />
        </>
      )}
      {acc.includes('necklace') && <Part geo="torus" args={[0.13, 0.02, 8, 20]} position={[0, 1.15, 0.06]} rotation={[Math.PI / 2.4, 0, 0]} color="#f5c542" />}
    </group>
  )
}
