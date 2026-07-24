import { forwardRef, useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { SKIN_HEX, HAIR_HEX, EYE_HEX, SHIRT_HEX, PANTS_HEX, SHOE_HEX, resolveBuild } from '../constants/avatarOptions.js'

// Canonical TAYU character - a smooth, anatomically-shaped clay figure.
// The TORSO is a LatheGeometry (surface of revolution) whose profile is driven
// by gender + body type: hip flare, waist pinch, bust and shoulder widths give
// a real hourglass (curvy/female) or V-taper (muscular/male). Limb GROUPS are
// named for the walk cycle. Heights: feet≈0.1, head≈1.86.

const Clay = ({ color, rough = 0.92 }) => <meshStandardMaterial color={color} roughness={rough} metalness={0} />

const HEAD_Y = 1.86
const HEAD_R = 0.25
const DEPTH = 0.74 // torso depth ratio (wider than deep - realistic)

// HAIR (v7 §2 - eyes ALWAYS visible). Rules encoded here:
//  • the cap's thetaLength is 0.42π so its bottom rim stays ABOVE the brow line
//  • side/back shells exclude the front 120° arc entirely (phiStart/phiLength)
//  • nothing may dip below BROW_Y in the front arc, any style
const CAP_THETA = Math.PI * 0.42
const BROW_Y = HEAD_Y + 0.08 // brow line; eyes sit at HEAD_Y+0.02
// three.js sphere: front (+z) is phi=π/2 → excluding front 120° means
// phi ∈ [150°, 390°] (wraps through the back)
const BACK_PHI_START = Math.PI * (5 / 6)
const BACK_PHI_LENGTH = Math.PI * (4 / 3)

if (import.meta.env.DEV) {
  // regression check (v7 §2): the cap rim must clear the brow for every style
  const rimY = HEAD_Y + 0.04 + (HEAD_R + 0.025) * Math.cos(CAP_THETA)
  if (rimY < BROW_Y) console.warn(`[tayu] hair cap rim y=${rimY.toFixed(3)} is below brow ${BROW_Y.toFixed(3)} - eyes occluded!`)
}

function Hair({ style, color }) {
  return (
    <group>
      {/* skull cap - rim ends above the brow, never drapes over the eyes */}
      <mesh position={[0, HEAD_Y + 0.04, 0]} castShadow>
        <sphereGeometry args={[HEAD_R + 0.025, 28, 24, 0, Math.PI * 2, 0, CAP_THETA]} /><Clay color={color} rough={0.8} />
      </mesh>
      {/* CONNECTOR BAND (hair-gap fix): a back-240° band that overlaps the cap
          rim above and tucks under every side/back shell below, so each style
          reads as ONE continuous piece - no exposed scalp seam at the crown,
          sides, or nape. No front geometry (eyes stay visible). */}
      <mesh position={[0, HEAD_Y + 0.03, 0]} castShadow>
        <sphereGeometry args={[HEAD_R + 0.028, 28, 18, BACK_PHI_START, BACK_PHI_LENGTH, CAP_THETA - 0.12, Math.PI * 0.26]} /><Clay color={color} rough={0.8} />
      </mesh>
      {/* thin bangs ABOVE the brow (a torus segment, not a draped shell) */}
      <mesh position={[0, BROW_Y + 0.06, 0.02]} rotation={[Math.PI / 2.6, 0, 0]} castShadow>
        <torusGeometry args={[HEAD_R * 0.9, 0.035, 10, 20, Math.PI * 0.9]} /><Clay color={color} rough={0.8} />
      </mesh>
      <mesh position={[0, HEAD_Y + 0.19, 0.08]} rotation={[0.5, 0, 0]} castShadow>
        <sphereGeometry args={[0.09, 14, 14]} /><Clay color={color} rough={0.8} />
      </mesh>
      {style === 'medium' && (
        <mesh position={[0, HEAD_Y - 0.02, -0.01]} castShadow>
          <sphereGeometry args={[HEAD_R + 0.032, 18, 18, BACK_PHI_START, BACK_PHI_LENGTH, CAP_THETA - 0.04, Math.PI * 0.42]} /><Clay color={color} rough={0.8} />
        </mesh>
      )}
      {style === 'long' && (
        <>
          {/* side + back shell tucked under the band - front 120° arc open */}
          <mesh position={[0, HEAD_Y - 0.03, -0.01]} castShadow>
            <sphereGeometry args={[HEAD_R + 0.035, 18, 18, BACK_PHI_START, BACK_PHI_LENGTH, CAP_THETA - 0.04, Math.PI * 0.5]} /><Clay color={color} rough={0.8} />
          </mesh>
          <RoundedBox args={[0.42, 0.7, 0.18]} radius={0.08} smoothness={3} position={[0, HEAD_Y - 0.42, -0.17]} castShadow><Clay color={color} rough={0.8} /></RoundedBox>
        </>
      )}
      {style === 'curly' &&
        [[-0.17, 0.14, 0.05], [0.17, 0.14, 0.05], [0, 0.22, -0.02], [-0.2, 0.04, -0.08], [0.2, 0.04, -0.08], [0, 0.06, -0.18], [-0.12, 0.16, -0.14], [0.12, 0.16, -0.14]].map((p, i) => (
          <mesh key={i} position={[p[0], HEAD_Y + p[1], p[2]]} castShadow><sphereGeometry args={[0.125, 12, 12]} /><Clay color={color} rough={0.8} /></mesh>
        ))}
    </group>
  )
}

// C4: each eye shape renders clearly differently (round / almond / hooded).
const EYE_SHAPES = {
  round: { scale: [1, 1.25, 0.5], tilt: 0, lid: false },
  almond: { scale: [1.5, 0.8, 0.5], tilt: 0.16, lid: false },
  hooded: { scale: [1.25, 0.95, 0.5], tilt: 0, lid: true },
}
function Eye({ x, color, shape = 'round', skin = '#e8b486' }) {
  const sp = EYE_SHAPES[shape] || EYE_SHAPES.round
  return (
    <group position={[x, HEAD_Y + 0.02, HEAD_R * 0.84]} rotation={[0, 0, (x < 0 ? 1 : -1) * sp.tilt]}>
      <mesh scale={sp.scale}><sphereGeometry args={[0.052, 16, 16]} /><meshStandardMaterial color="#ffffff" roughness={0.4} /></mesh>
      {sp.lid && (
        <mesh position={[0, 0.035, 0.012]} scale={[1.3, 0.5, 0.5]}><sphereGeometry args={[0.052, 12, 12]} /><meshStandardMaterial color={skin} roughness={0.85} /></mesh>
      )}
      <mesh position={[0, -0.004, 0.028]}><sphereGeometry args={[0.032, 14, 14]} /><meshStandardMaterial color={color} roughness={0.35} /></mesh>
      <mesh position={[0, 0, 0.046]}><sphereGeometry args={[0.016, 10, 10]} /><meshStandardMaterial color="#141414" /></mesh>
      <mesh position={[0.011, 0.016, 0.054]}><sphereGeometry args={[0.007, 8, 8]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.4} /></mesh>
    </group>
  )
}

function Arm({ side, shHalf, top, shirt, skin, limb }) {
  const longSleeve = top === 'hoodie'
  const bare = top === 'tank'
  return (
    <group name={side < 0 ? 'leftArm' : 'rightArm'} position={[(shHalf + 0.02) * side, 1.5, 0]} rotation={[0, 0, 0.1 * side]}>
      <mesh position={[0, -0.05, 0]} castShadow><sphereGeometry args={[(bare ? 0.11 : 0.13) * limb, 14, 14]} /><Clay color={bare ? skin : shirt} /></mesh>
      <mesh position={[0, -0.34, 0]} castShadow><capsuleGeometry args={[(longSleeve ? 0.1 : 0.085) * limb, 0.36, 6, 12]} /><Clay color={longSleeve ? shirt : skin} /></mesh>
      <RoundedBox args={[0.17, 0.17, 0.17]} radius={0.07} smoothness={3} position={[0, -0.58, 0]} castShadow><Clay color={skin} /></RoundedBox>
    </group>
  )
}

function Leg({ side, bottom, pants, skin, shoe, legR }) {
  const bare = bottom !== 'pants'
  return (
    <group name={side < 0 ? 'leftLeg' : 'rightLeg'} position={[0.14 * side, 0.82, 0]}>
      <mesh position={[0, -0.34, 0]} castShadow><capsuleGeometry args={[legR, 0.5, 6, 12]} /><Clay color={bare ? skin : pants} /></mesh>
      {bottom === 'shorts' && (
        <mesh position={[0, -0.16, 0]} castShadow><capsuleGeometry args={[legR + 0.025, 0.16, 6, 12]} /><Clay color={pants} /></mesh>
      )}
      <RoundedBox args={[0.22, 0.14, 0.34]} radius={0.06} smoothness={3} position={[0, -0.68, 0.07]} castShadow><Clay color={shoe} rough={0.6} /></RoundedBox>
    </group>
  )
}

export const CharacterMesh = forwardRef(function CharacterMesh({ avatar = {} }, ref) {
  const b = resolveBuild(avatar)
  const skin = SKIN_HEX[avatar.skinTone] || '#e8b486'
  const hair = HAIR_HEX[avatar.hairColor] || '#5a3a22'
  const eye = EYE_HEX[avatar.eyeColor] || '#3a2a1a'
  const shirt = SHIRT_HEX[avatar.shirtColor] || '#1464f0'
  const pants = PANTS_HEX[avatar.pantsColor] || '#2a2f3a'
  const shoe = SHOE_HEX[avatar.shoeColor] || '#f5f5f5'
  const acc = avatar.accessories || []
  const top = avatar.topStyle || 'tee'
  const bottom = avatar.bottomStyle || 'pants'

  const shHalf = b.shoulder / 2
  const buHalf = b.bust / 2
  const waHalf = b.waist / 2
  const hiHalf = b.hip / 2
  const legR = 0.12 * b.limb

  // Smooth torso profile (radius, y) from pelvis up to the collar.
  const torsoPts = useMemo(() => [
    new THREE.Vector2(hiHalf * 0.5, 0.74),
    new THREE.Vector2(hiHalf * 0.92, 0.85),
    new THREE.Vector2(hiHalf, 0.96),
    new THREE.Vector2((hiHalf + waHalf) / 2, 1.06),
    new THREE.Vector2(waHalf, 1.17),
    new THREE.Vector2((waHalf + buHalf) / 2, 1.28),
    new THREE.Vector2(buHalf, 1.38),
    new THREE.Vector2((buHalf + shHalf) / 2 * 0.98, 1.47),
    new THREE.Vector2(shHalf, 1.54),
    new THREE.Vector2(shHalf * 0.6, 1.6),
    new THREE.Vector2(0.12, 1.64),
  ], [hiHalf, waHalf, buHalf, shHalf])

  return (
    <group ref={ref}>
      {/* LEGS */}
      <Leg side={-1} bottom={bottom} pants={pants} skin={skin} shoe={shoe} legR={legR} />
      <Leg side={1} bottom={bottom} pants={pants} skin={skin} shoe={shoe} legR={legR} />

      {/* pelvis plug (seats legs + closes torso bottom) */}
      {bottom !== 'skirt' && (
        <mesh position={[0, 0.8, 0]} scale={[1, 1, DEPTH]} castShadow><sphereGeometry args={[hiHalf * 0.78, 16, 12]} /><Clay color={pants} /></mesh>
      )}

      {/* SKIRT */}
      {bottom === 'skirt' && (
        <mesh position={[0, 0.86, 0]} castShadow>
          <cylinderGeometry args={[waHalf + 0.04, hiHalf + 0.24, 0.64, 24, 1, true]} />
          <meshStandardMaterial color={pants} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* SMOOTH TORSO (lathe) */}
      <mesh scale={[1, 1, DEPTH]} castShadow>
        <latheGeometry args={[torsoPts, 32]} />
        <Clay color={shirt} />
      </mesh>
      {top === 'hoodie' && (
        <mesh position={[0, 1.62, -0.13]} castShadow><sphereGeometry args={[0.2, 16, 16, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55]} /><Clay color={shirt} /></mesh>
      )}

      {/* ARMS */}
      <Arm side={-1} shHalf={shHalf} top={top} shirt={shirt} skin={skin} limb={b.limb} />
      <Arm side={1} shHalf={shHalf} top={top} shirt={shirt} skin={skin} limb={b.limb} />

      {/* NECK + HEAD */}
      <mesh position={[0, 1.64, 0]} castShadow><cylinderGeometry args={[0.088, 0.11, 0.18, 14]} /><Clay color={skin} /></mesh>
      <mesh position={[0, HEAD_Y, 0]} castShadow><sphereGeometry args={[HEAD_R, 30, 30]} /><Clay color={skin} rough={0.85} /></mesh>

      {/* FACE */}
      <Eye x={-0.092} color={eye} shape={avatar.eyeShape} skin={skin} />
      <Eye x={0.092} color={eye} shape={avatar.eyeShape} skin={skin} />
      {[-0.092, 0.092].map((x) => (
        <mesh key={x} position={[x, HEAD_Y + 0.105, HEAD_R * 0.78]} rotation={[0, 0, x < 0 ? 0.15 : -0.15]}><boxGeometry args={[0.075, 0.018, 0.02]} /><Clay color={hair} rough={0.7} /></mesh>
      ))}
      {[-0.15, 0.15].map((x) => (
        <mesh key={x} position={[x, HEAD_Y - 0.05, HEAD_R * 0.72]} scale={[1.3, 1, 0.5]}><sphereGeometry args={[0.04, 12, 12]} /><meshStandardMaterial color="#ff8a8a" transparent opacity={0.5} roughness={0.6} /></mesh>
      ))}
      <mesh position={[0, HEAD_Y - 0.02, HEAD_R * 0.92]}><sphereGeometry args={[0.03, 12, 12]} /><Clay color={skin} /></mesh>
      <mesh position={[0, HEAD_Y - 0.11, HEAD_R * 0.8]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.05, 0.014, 10, 18, Math.PI]} /><meshStandardMaterial color="#9a4b3b" roughness={0.6} /></mesh>

      <Hair style={avatar.hairStyle} color={hair} />

      {/* ACCESSORIES */}
      {acc.includes('backpack') && (
        <group>
          <RoundedBox args={[0.4, 0.46, 0.16]} radius={0.06} smoothness={3} position={[0, 1.3, -buHalf * DEPTH - 0.1]} castShadow><Clay color="#9b6b3a" /></RoundedBox>
          {[-0.16, 0.16].map((x) => (<mesh key={x} position={[x, 1.42, -0.02]} rotation={[0.2, 0, 0]}><boxGeometry args={[0.055, 0.46, 0.055]} /><Clay color="#7a5230" /></mesh>))}
        </group>
      )}
      {acc.includes('hat') && (
        <group position={[0, HEAD_Y + 0.22 + (avatar.hairStyle === 'curly' ? 0.1 : 0.03), 0]}>
          {/* D2: crown wider than the hair shell, lifted so the brim sits OVER
              the hair - per-style offsets keep every hair x hat combo clean */}
          <mesh castShadow><cylinderGeometry args={[0.24, 0.27, 0.15, 20]} /><Clay color="#1464f0" /></mesh>
          <mesh position={[0, -0.06, 0.12]}><cylinderGeometry args={[0.33, 0.33, 0.035, 20]} /><Clay color="#1464f0" /></mesh>
        </group>
      )}
      {acc.includes('necklace') && (
        <group>
          {/* D1: the chain reads at default camera distance; pendant ~2x bigger,
              still draping naturally on the collarbone */}
          <mesh position={[0, 1.57, buHalf * DEPTH * 0.7]} rotation={[Math.PI / 2.55, 0, Math.PI]}>
            <torusGeometry args={[0.13, 0.016, 10, 26, Math.PI]} />
            <meshStandardMaterial color="#f5c542" roughness={0.3} metalness={0.6} />
          </mesh>
          <mesh position={[0, 1.45, buHalf * DEPTH * 0.82]}>
            <sphereGeometry args={[0.052, 12, 12]} />
            <meshStandardMaterial color="#FFD700" roughness={0.25} metalness={0.6} />
          </mesh>
        </group>
      )}
    </group>
  )
})
