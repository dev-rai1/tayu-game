import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { playerPos, useGame } from './store.js'

export const AVATAR_UNLOCKS = [
  'Coin Pin',
  'Teal Trail',
  'Purple Cape',
  'Money Crown',
  'Guru Stars',
]

export function AvatarBadgeAura() {
  const badgeCount = useGame((s) => s.kidUxBadgeCount || 0)
  const root = useRef()
  const stars = useRef()
  const time = useRef(0)

  useFrame((_, delta) => {
    time.current += delta
    if (root.current) root.current.position.set(playerPos.x, 0, playerPos.z)
    if (stars.current) stars.current.rotation.y += delta * 0.65
  })

  if (badgeCount <= 0) return null

  return (
    <group ref={root}>
      {/* Badge 1: a bright coin pin at chest height. */}
      <mesh position={[0.24, 1.42, 0.34]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.035, 18]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.45} metalness={0.35} roughness={0.35} />
      </mesh>

      {/* Badge 2: a soft teal trail ring follows the avatar. */}
      {badgeCount >= 2 && (
        <mesh position={[0, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.58, 0.045, 10, 32]} />
          <meshBasicMaterial color="#00DCA0" transparent opacity={0.72} toneMapped={false} />
        </mesh>
      )}

      {/* Badge 3: a small purple cape panel behind the avatar. */}
      {badgeCount >= 3 && (
        <mesh position={[0, 1.15, -0.34]} rotation={[0.18, 0, 0]}>
          <planeGeometry args={[0.58, 0.82]} />
          <meshStandardMaterial color="#7850F0" roughness={0.85} side={2} />
        </mesh>
      )}

      {/* Badge 4: a visible money crown. */}
      {badgeCount >= 4 && (
        <group position={[0, 2.32, 0]}>
          <mesh><cylinderGeometry args={[0.25, 0.28, 0.16, 20]} /><meshStandardMaterial color="#FFD700" metalness={0.3} roughness={0.35} /></mesh>
          {[-0.18, 0, 0.18].map((x) => (
            <mesh key={x} position={[x, 0.15, 0]}><coneGeometry args={[0.09, 0.28, 10]} /><meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.25} /></mesh>
          ))}
        </group>
      )}

      {/* Badge 5: five Guru stars orbit above the crown. */}
      {badgeCount >= 5 && (
        <group ref={stars} position={[0, 2.72, 0]}>
          {Array.from({ length: 5 }, (_, index) => {
            const angle = index * Math.PI * 2 / 5
            return (
              <mesh key={index} position={[Math.cos(angle) * 0.55, Math.sin(angle * 2) * 0.06, Math.sin(angle) * 0.55]}>
                <sphereGeometry args={[0.07, 10, 10]} />
                <meshBasicMaterial color="#FFD700" toneMapped={false} />
              </mesh>
            )
          })}
        </group>
      )}
    </group>
  )
}
