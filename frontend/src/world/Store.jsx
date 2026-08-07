import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Billboard } from '@react-three/drei'
import { STORE, STORE_ITEMS } from './config.js'
import { emojiTexture, labelTexture, cardTexture } from './textures.js'
import { useGame } from './store.js'

const WALL = '#ffe0b5'
const WALL2 = '#f5cf9c'

function openTappedItem(item, event) {
  event.stopPropagation()
  const state = useGame.getState()
  if (!state.bramTalked) {
    state.setToast('Talk to Mr. Bram first. He will explain the shopping mission.')
    return
  }
  if (state.bought.includes(item.id)) {
    state.setToast(`${item.name} is already in your basket.`)
    return
  }
  state.openItem(item)
}

function Item({ item }) {
  const box = useRef()
  const tex = emojiTexture(item.emoji)
  useFrame(() => {
    const st = useGame.getState()
    const bought = st.bought.includes(item.id)
    const near = st.near?.id === `item:${item.id}` && !st.panelItem
    // attempt-3 scaffold: gently glow the food + drink items so kids find them
    const ghost = st.storeGhost && (item.tags?.includes('food') || item.tags?.includes('drink')) && !bought
    if (box.current) {
      box.current.material.emissiveIntensity = bought ? 0 : near ? Math.sin(Date.now() * 0.006) * 0.35 + 0.5 : ghost ? Math.sin(Date.now() * 0.004) * 0.25 + 0.35 : 0.08
      box.current.material.opacity = bought ? 0.28 : 1
    }
  })
  const [lx, lz] = item.pos
  // Keep the category hidden so the player has to decide whether the item is a need or a want.
  const nameCard = cardTexture(item.name.toUpperCase(), `$${item.price}`)
  return (
    <group
      position={[lx, 1.05, lz]}
      onClick={(event) => openTappedItem(item, event)}
      userData={{ interaction: `item:${item.id}` }}
    >
      <RoundedBox ref={box} args={[0.72, 0.72, 0.72]} radius={0.1} smoothness={4} castShadow>
        <meshPhysicalMaterial color={item.color} clearcoat={0.4} roughness={0.35} emissive={item.color} emissiveIntensity={0.08} transparent opacity={1} />
      </RoundedBox>
      <Billboard position={[0, 0.62, 0]}>
        <mesh><planeGeometry args={[0.58, 0.58]} /><meshBasicMaterial map={tex} transparent toneMapped={false} /></mesh>
      </Billboard>
      {/* Show only the item name and price before the player makes a choice. */}
      <Billboard position={[0, 1.36, 0]}>
        <mesh><planeGeometry args={[1.35, 0.65]} /><meshBasicMaterial map={nameCard} transparent toneMapped={false} /></mesh>
      </Billboard>
    </group>
  )
}

function Shelf({ z }) {
  return (
    <group position={[0, 0, z]}>
      <RoundedBox args={[8, 0.16, 0.8]} radius={0.05} smoothness={3} position={[0, 0.72, 0]} castShadow receiveShadow><meshStandardMaterial color="#c98f5a" roughness={0.8} /></RoundedBox>
      <RoundedBox args={[8, 0.14, 0.8]} radius={0.05} smoothness={3} position={[0, 1.5, 0]} castShadow><meshStandardMaterial color="#c98f5a" roughness={0.8} /></RoundedBox>
      {[-3.8, 3.8].map((x) => (<mesh key={x} position={[x, 0.75, 0]}><boxGeometry args={[0.14, 1.5, 0.8]} /><meshStandardMaterial color="#a9743f" /></mesh>))}
    </group>
  )
}

function tapCheckout(event) {
  event.stopPropagation()
  const state = useGame.getState()
  if (!state.bramTalked) {
    state.setToast('Talk to Mr. Bram before checking out.')
    return
  }
  state.confirmCheckout()
}

// Checkout mat supports walking + E/DO and direct touch/click selection.
function Checkout() {
  const ring = useRef()
  const labelTex = labelTexture('CHECKOUT • TAP OR PRESS E', { bg: '#00DCA0', color: '#071748', accent: '#FFD700' })
  useFrame(() => {
    const st = useGame.getState()
    const basket = st.bought.map((id) => STORE_ITEMS.find((item) => item.id === id)).filter(Boolean)
    const active = basket.some((item) => item.tags?.includes('food')) && basket.some((item) => item.tags?.includes('drink'))
    if (ring.current) {
      const pulse = active ? Math.sin(Date.now() * 0.005) * 0.25 + 0.6 : 0.15
      ring.current.material.opacity = pulse
    }
  })
  return (
    <group position={[0, 0, 4.2]} onClick={tapCheckout} userData={{ interaction: 'checkout' }}>
      <mesh ref={ring} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.75, 32]} /><meshBasicMaterial color="#00DCA0" transparent opacity={0.15} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.05, 32]} /><meshStandardMaterial color="#00DCA0" transparent opacity={0.22} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.55, 1.15, 2.7, 24, 1, true]} />
        <meshBasicMaterial color="#00DCA0" transparent opacity={0.1} depthWrite={false} toneMapped={false} />
      </mesh>
      <Billboard position={[0, 2.45, 0]}>
        <mesh><planeGeometry args={[3.8, 1]} /><meshBasicMaterial map={labelTex} transparent toneMapped={false} /></mesh>
      </Billboard>
    </group>
  )
}

export function Store() {
  const signTex = labelTexture('TAYU MART', { bg: '#1464F0', accent: '#FFD700' })
  const marketTex = cardTexture('MARKET', null, { accent: '#1464F0' })
  return (
    <group position={[STORE[0], 0, STORE[1]]}>
      {/* big MARKET sign, readable from the path (Section 2.3) */}
      <Billboard position={[0, 5.2, 0]}>
        <mesh><planeGeometry args={[3.2, 1.1]} /><meshBasicMaterial map={marketTex} transparent toneMapped={false} /></mesh>
      </Billboard>
      {/* floor */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} /><meshStandardMaterial color="#fff1d6" roughness={1} />
      </mesh>
      {/* OPEN-FRONT storefront: back + two low side walls; front fully open so the
          camera sees the shelves. Sign sits on the BACK wall (never occludes). */}
      <RoundedBox args={[10, 3, 0.4]} radius={0.12} smoothness={3} position={[0, 1.5, -4.8]} castShadow><meshStandardMaterial color={WALL} roughness={0.9} /></RoundedBox>
      <RoundedBox args={[0.4, 2.4, 9.6]} radius={0.12} smoothness={3} position={[-4.8, 1.2, -0.2]} castShadow><meshStandardMaterial color={WALL2} roughness={0.9} /></RoundedBox>
      <RoundedBox args={[0.4, 2.4, 9.6]} radius={0.12} smoothness={3} position={[4.8, 1.2, -0.2]} castShadow><meshStandardMaterial color={WALL2} roughness={0.9} /></RoundedBox>
      {/* sign mounted flat on the back wall, facing the camera */}
      <mesh position={[0, 2.4, -4.55]}><planeGeometry args={[4.16, 1.3]} /><meshBasicMaterial map={signTex} transparent toneMapped={false} /></mesh>
      {/* slim striped awning at the very top of the open front (high, doesn't block shelves) */}
      {[-4.4, 4.4].map((x) => (<mesh key={x} position={[x, 1.5, 4.7]} castShadow><cylinderGeometry args={[0.1, 0.1, 3, 10]} /><meshStandardMaterial color="#c9a06a" /></mesh>))}
      <RoundedBox args={[10, 0.4, 0.6]} radius={0.1} smoothness={3} position={[0, 3, 4.7]} castShadow><meshStandardMaterial color="#e2564f" roughness={0.8} /></RoundedBox>

      <Shelf z={-1} />
      <Shelf z={2.6} />

      {/* checkout counter */}
      <RoundedBox args={[3, 1, 1]} radius={0.1} smoothness={3} position={[0, 0.5, -2.4]} castShadow><meshStandardMaterial color="#8a5a2b" roughness={0.8} /></RoundedBox>

      {STORE_ITEMS.map((it) => <Item key={it.id} item={it} />)}
      <Checkout />
      {/* Mr. Bram is now an animatable stage actor (ConsequenceStage), idling here. */}
    </group>
  )
}
