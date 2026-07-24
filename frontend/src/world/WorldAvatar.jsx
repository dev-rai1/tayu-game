import { forwardRef } from 'react'
import { SKIN_HEX, HAIR_HEX, EYE_HEX, SHIRT_HEX, PANTS_HEX, SHOE_HEX } from '../constants/avatarOptions.js'

// In-world avatar built from primitives. Limb GROUPS are named so the player
// controller can swing them for the walk cycle (rotation only - cheap, 60fps).
// Pivots sit at the hip/shoulder so swings look natural.
export const WorldAvatar = forwardRef(function WorldAvatar({ avatar }, ref) {
  const skin = SKIN_HEX[avatar?.skinTone] || '#e8b486'
  const hair = HAIR_HEX[avatar?.hairColor] || '#5a3a22'
  const eye = EYE_HEX[avatar?.eyeColor] || '#1a1a2e'
  const shirt = SHIRT_HEX[avatar?.shirtColor] || '#1464f0'
  const pants = PANTS_HEX[avatar?.pantsColor] || '#22262e'
  const shoe = SHOE_HEX[avatar?.shoeColor] || '#f5f5f5'
  const M = (c) => <meshStandardMaterial color={c} roughness={0.7} />

  return (
    <group ref={ref}>
      {/* HEAD + HAIR + EYES */}
      <mesh position={[0, 1.62, 0]} castShadow name="head">
        <sphereGeometry args={[0.3, 20, 20]} />{M(skin)}
      </mesh>
      <mesh position={[0, 1.74, -0.02]} scale={[1.12, 0.9, 1.12]} name="hair">
        <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} />{M(hair)}
      </mesh>
      <mesh position={[0.1, 1.64, 0.27]} name="rightEye"><sphereGeometry args={[0.045, 10, 10]} />{M(eye)}</mesh>
      <mesh position={[-0.1, 1.64, 0.27]} name="leftEye"><sphereGeometry args={[0.045, 10, 10]} />{M(eye)}</mesh>
      <mesh position={[0, 1.5, 0.27]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.05, 0.012, 8, 14, Math.PI]} /><meshStandardMaterial color="#7a3b30" />
      </mesh>

      {/* TORSO (shirt) */}
      <mesh position={[0, 1.15, 0]} castShadow name="body">
        <boxGeometry args={[0.55, 0.6, 0.32]} />{M(shirt)}
      </mesh>

      {/* ARMS - group pivots at shoulder */}
      <group position={[-0.37, 1.4, 0]} name="leftArm">
        <mesh position={[0, -0.28, 0]} castShadow><capsuleGeometry args={[0.09, 0.42, 4, 10]} />{M(shirt)}</mesh>
        <mesh position={[0, -0.56, 0]} castShadow><sphereGeometry args={[0.1, 10, 10]} />{M(skin)}</mesh>
      </group>
      <group position={[0.37, 1.4, 0]} name="rightArm">
        <mesh position={[0, -0.28, 0]} castShadow><capsuleGeometry args={[0.09, 0.42, 4, 10]} />{M(shirt)}</mesh>
        <mesh position={[0, -0.56, 0]} castShadow><sphereGeometry args={[0.1, 10, 10]} />{M(skin)}</mesh>
      </group>

      {/* LEGS - group pivots at hip */}
      <group position={[-0.15, 0.85, 0]} name="leftLeg">
        <mesh position={[0, -0.32, 0]} castShadow><capsuleGeometry args={[0.11, 0.45, 4, 10]} />{M(pants)}</mesh>
        <mesh position={[0, -0.66, 0.05]} castShadow><boxGeometry args={[0.2, 0.12, 0.3]} />{M(shoe)}</mesh>
      </group>
      <group position={[0.15, 0.85, 0]} name="rightLeg">
        <mesh position={[0, -0.32, 0]} castShadow><capsuleGeometry args={[0.11, 0.45, 4, 10]} />{M(pants)}</mesh>
        <mesh position={[0, -0.66, 0.05]} castShadow><boxGeometry args={[0.2, 0.12, 0.3]} />{M(shoe)}</mesh>
      </group>
    </group>
  )
})
