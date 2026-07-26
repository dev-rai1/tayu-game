import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { useGame } from './store.js'
import { JARS, KITCHEN, TAYU } from './config.js'
import { cardTexture } from './textures.js'

const JAR_DEFS = [
  { key: 'spend', label: 'SPEND', color: TAYU.electric },
  { key: 'save', label: 'SAVE', color: TAYU.teal },
  { key: 'give', label: 'GIVE', color: TAYU.purple },
]

const JAR_FULL = 15 // visual "full" amount ($30 split across jars)

function Jar({ jarKey, label, color, pos }) {
  const amount = useGame((s) => s.allocations[jarKey])
  const body = useRef()
  const fill = useRef()
  const ghost = useRef()
  const selector = useRef()
  // Keep the player's choice attached to the object it affects. This is much
  // easier to scan than matching the jars to a separate HUD legend.
  const labelTex = cardTexture(`$${amount}`, label, { bg: '#ffffff', color: TAYU.navy, accent: color })
  useFrame(() => {
    const st = useGame.getState()
    const amt = st.allocations[jarKey]
    const frac = Math.max(0, Math.min(1, amt / JAR_FULL))
    if (fill.current) {
      fill.current.scale.y = Math.max(0.001, frac)
      fill.current.position.y = (frac * 0.6) / 2 + 0.05
    }
    const near = st.near?.id === `jar:${jarKey}` && !st.panelJar
    const chiming = st.jarGlow === jarKey
    if (selector.current) {
      selector.current.visible = near
      selector.current.rotation.z += 0.025
      selector.current.material.opacity = Math.sin(Date.now() * 0.008) * 0.18 + 0.72
    }
    if (body.current) {
      body.current.material.emissiveIntensity = chiming
        ? Math.sin(Date.now() * 0.02) * 0.4 + 0.7
        : near ? Math.sin(Date.now() * 0.006) * 0.35 + 0.55 : amt > 0 ? 0.15 : 0
    }
    // attempt-3 scaffold: translucent "about this much" outline at the target level
    if (ghost.current) {
      const show = st.jarGhost && st.scenario
      ghost.current.visible = !!show
      if (show) {
        const tf = Math.max(0.05, Math.min(1, (st.scenario.target[jarKey] || 0) / JAR_FULL))
        ghost.current.scale.y = tf
        ghost.current.position.y = (tf * 0.6) / 2 + 0.05
        ghost.current.material.opacity = Math.sin(Date.now() * 0.005) * 0.12 + 0.28
      }
    }
  })
  return (
    <group position={[pos[0], 1.0, pos[1]]}>
      <mesh ref={body} castShadow>
        <cylinderGeometry args={[0.3, 0.26, 0.7, 18]} />
        <meshStandardMaterial color={color} transparent opacity={0.55} emissive={color} emissiveIntensity={0} />
      </mesh>
      {/* gold fill (scales on Y) */}
      <mesh ref={fill} position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.25, 0.23, 0.6, 18]} />
        <meshStandardMaterial color={TAYU.gold} emissive={TAYU.gold} emissiveIntensity={0.25} />
      </mesh>
      {/* ghost target outline */}
      <mesh ref={ghost} position={[0, 0.05, 0]} visible={false}>
        <cylinderGeometry args={[0.27, 0.25, 0.6, 18]} />
        <meshBasicMaterial color={TAYU.gold} transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.38, 0]}><cylinderGeometry args={[0.32, 0.32, 0.07, 18]} /><meshStandardMaterial color="#8B6914" /></mesh>
      {/* A bright selector makes it unambiguous which jar E will open. */}
      <mesh ref={selector} position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.42, 0.56, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} depthWrite={false} />
      </mesh>
      {/* Keep each live dollar amount centered above its own jar. The narrower,
          raised card prevents neighboring SPEND / SAVE / GIVE labels from crowding. */}
      <Billboard position={[0, 1.3, 0]}>
        <mesh><planeGeometry args={[1.15, 0.72]} /><meshBasicMaterial map={labelTex} transparent toneMapped={false} /></mesh>
      </Billboard>
    </group>
  )
}

export function KitchenTable() {
  const [cx, cz] = KITCHEN
  return (
    <group>
      {/* table top */}
      <mesh position={[cx, 0.92, cz]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.16, 1.4]} /><meshStandardMaterial color="#a9743f" />
      </mesh>
      {/* legs */}
      {[[-2, -0.5], [2, -0.5], [-2, 0.5], [2, 0.5]].map(([dx, dz], i) => (
        <mesh key={i} position={[cx + dx, 0.45, cz + dz]} castShadow>
          <boxGeometry args={[0.14, 0.9, 0.14]} /><meshStandardMaterial color="#7a531f" />
        </mesh>
      ))}
      {JAR_DEFS.map((j) => <Jar key={j.key} jarKey={j.key} label={j.label} color={j.color} pos={JARS[j.key]} />)}
    </group>
  )
}
