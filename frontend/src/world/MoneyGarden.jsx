import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { SPROUT, TAYU } from './config.js'
import { COMPANIES, COMPANY_IDS, companyFacingAngle } from '../scenarios/moneyGarden.js'
import { cardTexture, labelTexture } from './textures.js'
import { useGame } from './store.js'

// Mr. Sprout's Money Garden (Part F6) - a small plaza with the three company
// storefronts in a shallow arc. Each storefront carries an always-visible
// company card: the gold "You own: N" badge (bounces on change), the name,
// the price with a trend arrow, and an animated sparkline of the last 6
// prices. Storefronts idle playfully and "droop-squash" when their price dips.

const UP_COLOR = '#22c55e'
const DOWN_COLOR = '#f97316'
const FLAT_COLOR = '#9ca3af'

// --- animated sparkline: a small canvas redrawn with a draw-on animation ---
function Sparkline({ id }) {
  const meshRef = useRef()
  const state = useRef({ key: '', progress: 1, canvas: null, tex: null })
  useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128; c.height = 44
    state.current.canvas = c
    state.current.tex = new THREE.CanvasTexture(c)
  }, [])

  useFrame((_, d) => { if (useGame.getState().week !== 5) return;
    const st = useGame.getState()
    const mg = st.mg
    if (!mg || !meshRef.current) return
    const hist = mg.companies[id].history
    const key = hist.join(',')
    const S = state.current
    if (key !== S.key) { S.key = key; S.progress = 0 } // new point → animate draw-on
    if (S.progress >= 1 && S.drawnKey === key) return
    S.progress = Math.min(1, S.progress + d / 0.8)
    const c = S.canvas, x = c.getContext('2d')
    const spec = COMPANIES[id]
    x.clearRect(0, 0, c.width, c.height)
    x.fillStyle = 'rgba(7,23,72,0.85)'
    x.beginPath(); x.roundRect(0, 0, c.width, c.height, 10); x.fill()
    const pts = hist.slice(-6)
    if (pts.length >= 2) {
      const min = spec.min, max = spec.max
      const px = (i) => 10 + (i / (pts.length - 1)) * (c.width - 20)
      const py = (v) => c.height - 8 - ((v - min) / (max - min)) * (c.height - 16)
      // draw up to `progress` through the final segment
      const fullSegs = pts.length - 1
      const reveal = (fullSegs - 1 + S.progress) / fullSegs
      x.strokeStyle = pts[pts.length - 1] >= pts[pts.length - 2] ? UP_COLOR : DOWN_COLOR
      x.lineWidth = 5; x.lineCap = 'round'; x.lineJoin = 'round'
      x.beginPath()
      x.moveTo(px(0), py(pts[0]))
      const total = fullSegs * reveal
      for (let i = 1; i <= Math.floor(total); i++) x.lineTo(px(i), py(pts[i]))
      const frac = total - Math.floor(total)
      const i = Math.floor(total)
      if (i < fullSegs && frac > 0) {
        x.lineTo(px(i) + (px(i + 1) - px(i)) * frac, py(pts[i]) + (py(pts[i + 1]) - py(pts[i])) * frac)
      }
      x.stroke()
    }
    S.tex.needsUpdate = true
    if (S.progress >= 1) S.drawnKey = key
    meshRef.current.material.map = S.tex
  })
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1.5, 0.52]} />
      <meshBasicMaterial transparent toneMapped={false} />
    </mesh>
  )
}

// --- the always-visible company card (F4) ---
function CompanyCard({ id }) {
  const badge = useRef()
  const priceMesh = useRef()
  const arrow = useRef()
  const last = useRef({ owned: -1, price: -1, bounce: 0 })
  const spec = COMPANIES[id]
  const nameTex = cardTexture(spec.name.toUpperCase(), null, { accent: spec.color })

  useFrame((_, d) => { if (useGame.getState().week !== 5) return;
    const st = useGame.getState()
    const mg = st.mg
    if (!mg) return
    const c = mg.companies[id]
    const L = last.current
    // gold "You own: N" badge - bounces whenever N changes, grayed at 0
    if (badge.current && c.owned !== L.owned) {
      L.owned = c.owned
      L.bounce = 0.35
      badge.current.material.map = labelTexture(`You own: ${c.owned}`, c.owned > 0
        ? { bg: '#FFD700', color: '#071748', accent: '#071748' }
        : { bg: '#6b7280', color: '#e5e7eb', accent: '#4b5563' })
      badge.current.material.needsUpdate = true
    }
    if (badge.current) {
      L.bounce = Math.max(0, L.bounce - d)
      const k = L.bounce > 0 ? 1 + Math.sin((0.35 - L.bounce) / 0.35 * Math.PI) * 0.25 : 1
      badge.current.scale.setScalar(k)
    }
    // price + trend arrow (shape + color together: colorblind-safe)
    if (priceMesh.current && c.price !== L.price) {
      const prev = c.history.length > 1 ? c.history[c.history.length - 2] : c.price
      const dirUp = c.price > prev, flat = c.price === prev
      L.price = c.price
      priceMesh.current.material.map = labelTexture(`$${c.price}`, { bg: '#071748', accent: spec.color })
      priceMesh.current.material.needsUpdate = true
      if (arrow.current) {
        arrow.current.material.color.set(flat ? FLAT_COLOR : dirUp ? UP_COLOR : DOWN_COLOR)
        arrow.current.rotation.z = flat ? 0 : dirUp ? 0 : Math.PI
        arrow.current.scale.setScalar(flat ? 0.7 : 1)
      }
    }
  })

  return (
    <Billboard position={[0, 4.5, 0]}>
      <group>
        {/* gold ownership badge on TOP (comment 45) */}
        <mesh ref={badge} position={[0, 1.05, 0]}>
          <planeGeometry args={[1.5, 0.47]} />
          <meshBasicMaterial map={labelTexture('You own: 0', { bg: '#6b7280', color: '#e5e7eb', accent: '#4b5563' })} transparent toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <planeGeometry args={[1.9, 0.65]} />
          <meshBasicMaterial map={nameTex} transparent toneMapped={false} />
        </mesh>
        <mesh ref={priceMesh} position={[-0.35, -0.15, 0]}>
          <planeGeometry args={[1.1, 0.34]} />
          <meshBasicMaterial map={labelTexture(`$${spec.base}`, { bg: '#071748', accent: spec.color })} transparent toneMapped={false} />
        </mesh>
        <mesh ref={arrow} position={[0.55, -0.15, 0]}>
          <circleGeometry args={[0.14, 3]} />
          <meshBasicMaterial color={FLAT_COLOR} toneMapped={false} />
        </mesh>
        <group position={[0, -0.62, 0]}>
          <Sparkline id={id} />
        </group>
      </group>
    </Billboard>
  )
}

// --- storefronts with personality + droop-squash reactions ---
function useSquash(id) {
  const ref = useRef()
  const last = useRef({ price: null, squash: 0 })
  useFrame((_, d) => { if (useGame.getState().week !== 5) return;
    const mg = useGame.getState().mg
    if (!mg || !ref.current) return
    const price = mg.companies[id].price
    const L = last.current
    if (L.price !== null && price < L.price) L.squash = 0.5 // cartoon droop
    L.price = price
    L.squash = Math.max(0, L.squash - d)
    const k = L.squash > 0 ? 1 - Math.sin((0.5 - L.squash) / 0.5 * Math.PI) * 0.05 : 1
    ref.current.scale.y = k
    const highlight = useGame.getState().mgHighlight === id
    ref.current.position.y = highlight ? Math.abs(Math.sin(Date.now() * 0.004)) * 0.08 : 0
  })
  return ref
}

function ToyTown() {
  const root = useSquash('toy')
  const arm = useRef()
  useFrame((_, d) => { if (useGame.getState().week !== 5) return; if (arm.current) arm.current.rotation.z = 0.4 + Math.sin(Date.now() * 0.002) * 0.35 })
  return (
    <group ref={root}>
      <RoundedBox args={[3.4, 2.4, 2.4]} radius={0.12} smoothness={3} position={[0, 1.2, 0]} castShadow>
        <meshPhysicalMaterial color="#e23b3b" clearcoat={0.4} roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[3.7, 0.5, 2.7]} radius={0.1} smoothness={3} position={[0, 2.6, 0]} castShadow>
        <meshStandardMaterial color="#f5c542" roughness={0.6} />
      </RoundedBox>
      {/* the giant teddy on the roof */}
      <group position={[0, 3.3, 0]}>
        <mesh castShadow><sphereGeometry args={[0.42, 16, 16]} /><meshStandardMaterial color="#b07a3f" roughness={0.8} /></mesh>
        <mesh position={[0, 0.5, 0]} castShadow><sphereGeometry args={[0.3, 16, 16]} /><meshStandardMaterial color="#b07a3f" roughness={0.8} /></mesh>
        {[-0.18, 0.18].map((x) => (
          <mesh key={x} position={[x, 0.74, 0]} castShadow><sphereGeometry args={[0.1, 10, 10]} /><meshStandardMaterial color="#8a5a2b" roughness={0.8} /></mesh>
        ))}
        <mesh ref={arm} position={[0.45, 0.15, 0]} castShadow><capsuleGeometry args={[0.09, 0.3, 4, 8]} /><meshStandardMaterial color="#b07a3f" roughness={0.8} /></mesh>
      </group>
      {/* window + door */}
      <mesh position={[-0.8, 1.1, 1.21]}><planeGeometry args={[1, 0.9]} /><meshStandardMaterial color="#bfe0f2" roughness={0.3} /></mesh>
      <RoundedBox args={[0.8, 1.4, 0.1]} radius={0.05} smoothness={2} position={[0.9, 0.7, 1.21]}><meshStandardMaterial color="#7a4a2e" /></RoundedBox>
    </group>
  )
}

function SnackShack() {
  const root = useSquash('snack')
  const awning = useRef()
  useFrame(() => { if (useGame.getState().week !== 5) return; if (awning.current) awning.current.scale.z = 1 + Math.sin(Date.now() * 0.0025) * 0.04 })
  return (
    <group ref={root}>
      <RoundedBox args={[3, 1.6, 1.8]} radius={0.12} smoothness={3} position={[0, 0.8, 0]} castShadow>
        <meshPhysicalMaterial color="#ffffff" clearcoat={0.3} roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[3, 0.7, 1.8]} radius={0.1} smoothness={3} position={[0, 1.9, 0]} castShadow>
        <meshStandardMaterial color="#3f9a42" roughness={0.6} />
      </RoundedBox>
      {/* striped awning */}
      <group ref={awning} position={[0, 2.5, 0.9]} rotation={[0.35, 0, 0]}>
        {[-1.2, -0.4, 0.4, 1.2].map((x, i) => (
          <mesh key={x} position={[x, 0, 0]} castShadow>
            <boxGeometry args={[0.78, 0.06, 1.3]} />
            <meshStandardMaterial color={i % 2 ? '#ffffff' : '#3f9a42'} roughness={0.7} />
          </mesh>
        ))}
      </group>
      {/* counter + juice cups */}
      {[-0.7, 0, 0.7].map((x) => (
        <mesh key={x} position={[x, 1.75, 0.7]} castShadow><cylinderGeometry args={[0.1, 0.08, 0.22, 10]} /><meshStandardMaterial color={x === 0 ? '#ffb347' : '#7fd0ff'} roughness={0.4} /></mesh>
      ))}
      {/* cart wheels */}
      {[-1.1, 1.1].map((x) => (
        <mesh key={x} position={[x, 0.3, 0.95]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.3, 0.3, 0.12, 14]} /><meshStandardMaterial color="#3a3f4a" /></mesh>
      ))}
    </group>
  )
}

function GameLand() {
  const root = useSquash('game')
  const sign = useRef()
  useFrame(() => { if (useGame.getState().week !== 5) return; if (sign.current) sign.current.material.emissiveIntensity = 0.45 + Math.sin(Date.now() * 0.003) * 0.3 })
  return (
    <group ref={root}>
      <RoundedBox args={[3.4, 2.8, 2.4]} radius={0.14} smoothness={3} position={[0, 1.4, 0]} castShadow>
        <meshPhysicalMaterial color="#7850F0" clearcoat={0.5} roughness={0.45} />
      </RoundedBox>
      {/* glowing arcade sign */}
      <mesh ref={sign} position={[0, 3.05, 0.4]} castShadow>
        <boxGeometry args={[2.6, 0.55, 0.3]} />
        <meshStandardMaterial color="#00DCA0" emissive="#00DCA0" emissiveIntensity={0.5} roughness={0.4} />
      </mesh>
      {/* screen window */}
      <mesh position={[0, 1.4, 1.21]}><planeGeometry args={[2.2, 1.2]} /><meshStandardMaterial color="#071748" emissive="#1464F0" emissiveIntensity={0.35} roughness={0.3} /></mesh>
      {/* joystick bollards */}
      {[-1, 1].map((x) => (
        <group key={x} position={[x, 0.35, 1.5]}>
          <mesh castShadow><cylinderGeometry args={[0.12, 0.14, 0.7, 10]} /><meshStandardMaterial color="#4b3aa8" /></mesh>
          <mesh position={[0, 0.45, 0]} castShadow><sphereGeometry args={[0.14, 10, 10]} /><meshStandardMaterial color="#FFD700" roughness={0.4} /></mesh>
        </group>
      ))}
    </group>
  )
}

const FRONTS = { toy: ToyTown, snack: SnackShack, game: GameLand }

export function MoneyGarden() {
  return (
    <group position={[SPROUT[0], 0, SPROUT[1]]}>
      {/* plaza ground - a clean, cared-for square (E-I.3). Slightly above the
          path layer so there is no z-fighting at the junction. */}
      <mesh position={[0, 0.025, 0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9.5, 40]} /><meshStandardMaterial color="#e9f2e0" roughness={1} />
      </mesh>
      <mesh position={[0, 0.032, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[9.5, 10.2, 40]} /><meshStandardMaterial color="#8cbf6a" roughness={1} />
      </mesh>
      <mesh position={[0, 0.028, 9.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.2, 3.6]} /><meshStandardMaterial color="#e9f2e0" roughness={1} />
      </mesh>
      {/* NO bushes anywhere near the plaza (E-I.1) and NO world-space sign
          (E-I.5) - the guidance arrow and bottom cards are the instruction
          channel. Framing instead: lamps, benches, planters (E-I.3). */}
      {[-8.6, 8.6].map((x) => (
        <group key={`lamp${x}`} position={[x, 0, 4.4]}>
          <mesh position={[0, 1, 0]} castShadow><cylinderGeometry args={[0.07, 0.09, 2, 10]} /><meshStandardMaterial color="#3a4654" /></mesh>
          <mesh position={[0, 2.05, 0]}><sphereGeometry args={[0.18, 14, 14]} /><meshStandardMaterial color="#fff6cf" emissive="#ffe9a3" emissiveIntensity={0.6} /></mesh>
        </group>
      ))}
      {[-8.2, 8.2].map((x) => (
        <group key={`bench${x}`} position={[x, 0, 0.6]} rotation={[0, x < 0 ? 0.9 : -0.9, 0]}>
          <mesh position={[0, 0.45, 0]} castShadow><boxGeometry args={[1.4, 0.1, 0.5]} /><meshStandardMaterial color="#a9743f" roughness={0.85} /></mesh>
          <mesh position={[0, 0.75, -0.22]} castShadow><boxGeometry args={[1.4, 0.5, 0.08]} /><meshStandardMaterial color="#a9743f" roughness={0.85} /></mesh>
          {[-0.6, 0.6].map((lx) => (<mesh key={lx} position={[lx, 0.22, 0]} castShadow><boxGeometry args={[0.1, 0.45, 0.45]} /><meshStandardMaterial color="#7a531f" roughness={0.85} /></mesh>))}
        </group>
      ))}
      {/* planters framing the entrance (low - never occlude anything) */}
      {[[-1.8, 7.6], [1.8, 7.6]].map(([x, z], i) => (
        <group key={`planter${i}`} position={[x, 0, z]}>
          <mesh position={[0, 0.22, 0]} castShadow><cylinderGeometry args={[0.4, 0.48, 0.44, 12]} /><meshStandardMaterial color="#b06a3a" roughness={0.9} /></mesh>
          <mesh position={[0, 0.52, 0]} castShadow><icosahedronGeometry args={[0.16, 0]} /><meshStandardMaterial color={i ? '#ef6f6f' : '#f5c542'} flatShading /></mesh>
        </group>
      ))}

      {/* the three storefronts in a shallow arc, everything up front (E-I.4) */}
      <BankSprout />
      {/* E8: one big shared header - BEHIND the storefront row and above the
          rooflines, so it never covers a shop's own floating title */}
      <Billboard position={[0, 6.8, -4.2]}>
        <mesh>
          <planeGeometry args={[7, 2.19]} />
          <meshBasicMaterial map={labelTexture('THE THREE COMPANIES', { bg: '#071748', color: '#ffffff', accent: '#FFD700' })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>
      {COMPANY_IDS.map((id) => {
        const Front = FRONTS[id]
        const [lx, lz] = COMPANIES[id].pos
        return (
          <group key={id} position={[lx, 0, lz]} rotation={[0, companyFacingAngle([lx, lz]), 0]}>
            <Front />
            {/* R13 6.3: a readable, correctly-proportioned name sign matching
                the other district signs (navy pill, billboarded, 3.2 aspect) */}
            <Billboard position={[0, 5.3, 0]}>
              <mesh><planeGeometry args={[3.4, 1.0625]} /><meshBasicMaterial map={labelTexture(COMPANIES[id].name.toUpperCase(), { bg: '#071748', color: '#ffffff', accent: COMPANIES[id].color })} transparent toneMapped={false} depthTest={false} /></mesh>
            </Billboard>
            <CompanyCard id={id} />
            <LessonFx id={id} />
          </group>
        )
      })}

      {/* flower beds Mr. Sprout tends (kept low and to the sides) */}
      {[[-6.8, 3.4], [6.8, 3.4]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.18, 0]}><cylinderGeometry args={[0.02, 0.02, 0.36, 5]} /><meshStandardMaterial color="#4f9a3f" /></mesh>
          <mesh position={[0, 0.4, 0]} castShadow><icosahedronGeometry args={[0.11, 0]} /><meshStandardMaterial color={['#ef6f6f', '#c77dff'][i]} flatShading /></mesh>
        </group>
      ))}
    </group>
  )
}


// H8: per-week visual dressing on the storefronts, driven by mg.fx.
// rain cloud, SALE flags, busy/dusty door cards, trouble boards, the rocket
// balloon, gold star - each lesson gets its own on-stage look.
function LessonFx({ id }) {
  const fx = useGame((s) => s.mg?.fx) || {}
  const star = useRef()
  const balloon = useRef()
  useFrame(() => { if (useGame.getState().week !== 5) return;
    const t = Date.now() * 0.003
    if (star.current) {
      star.current.rotation.z = t
      star.current.scale.setScalar(1 + Math.sin(t * 2) * 0.15)
    }
    if (balloon.current) {
      const k = 1 + Math.abs(Math.sin(t * 0.7)) * 0.5
      balloon.current.scale.setScalar(k)
    }
  })
  const bits = []
  if (fx.sale === id || fx.sale2 === id) {
    bits.push(
      <group key="sale" position={[0, 3.9, 0.6]}>
        <mesh position={[0, -0.5, 0]}><cylinderGeometry args={[0.04, 0.04, 1.4, 8]} /><meshStandardMaterial color="#7a4a2e" /></mesh>
        <mesh position={[0.7, 0, 0]}><planeGeometry args={[1.4, 0.5]} /><meshBasicMaterial map={cardTexture('SALE!', null, { bg: '#e23b3b', color: '#ffffff', accent: '#FFD700' })} transparent side={2} /></mesh>
      </group>
    )
  }
  if (fx.rain === id) {
    bits.push(
      <group key="rain" position={[0, 4.6, 0]}>
        {[[-0.5, 0, 0], [0.5, 0.1, 0.2], [0, 0.25, -0.2], [0.9, 0, 0]].map((c, i) => (
          <mesh key={i} position={c}><icosahedronGeometry args={[0.45, 1]} /><meshStandardMaterial color="#6b7688" roughness={0.9} /></mesh>
        ))}
        {[[-0.4, -0.7], [0.2, -0.9], [0.7, -0.7]].map(([x, y], i) => (
          <mesh key={`d${i}`} position={[x, y, 0]}><sphereGeometry args={[0.06, 6, 6]} /><meshStandardMaterial color="#7fb6ff" emissive="#7fb6ff" emissiveIntensity={0.4} /></mesh>
        ))}
      </group>
    )
  }
  if (fx.busy === id) {
    bits.push(
      <mesh key="busy" position={[0, 3.55, 0.9]}>
        <planeGeometry args={[2.2, 0.72]} />
        <meshBasicMaterial map={cardTexture('PACKED!', null, { bg: '#00DCA0', color: '#071748', accent: '#071748' })} transparent side={2} />
      </mesh>
    )
  }
  if (fx.dusty === id) {
    bits.push(
      <mesh key="dusty" position={[0, 3.55, 0.9]}>
        <planeGeometry args={[2.2, 0.72]} />
        <meshBasicMaterial map={cardTexture('EMPTY...', null, { bg: '#9aa6b8', color: '#071748', accent: '#5a6678' })} transparent side={2} />
      </mesh>
    )
  }
  if (fx.balloon === id) {
    bits.push(
      <group key="balloon" position={[0, 5, 0]}>
        <mesh ref={balloon}><sphereGeometry args={[0.55, 14, 14]} /><meshStandardMaterial color="#e23b3b" roughness={0.4} /></mesh>
        <mesh position={[0, -1, 0]}><cylinderGeometry args={[0.015, 0.015, 1.4, 6]} /><meshStandardMaterial color="#3a3f4a" /></mesh>
      </group>
    )
  }
  if (fx.shabby === id) {
    bits.push(
      <group key="shabby">
        {[-0.25, 0.25].map((r, i) => (
          <mesh key={i} position={[0, 1.3 + i * 0.5, 1.35]} rotation={[0, 0, r]}>
            <boxGeometry args={[2.6, 0.28, 0.06]} />
            <meshStandardMaterial color="#8a6a44" roughness={0.95} />
          </mesh>
        ))}
        <mesh position={[0, 3.6, 0.8]}>
          <planeGeometry args={[1.9, 0.65]} />
          <meshBasicMaterial map={cardTexture('TROUBLE...', null, { bg: '#3a3f4a', color: '#ffffff', accent: '#ea580c' })} transparent side={2} />
        </mesh>
      </group>
    )
  }
  if (fx.star === id) {
    bits.push(
      <mesh key="star" ref={star} position={[0, 4.1, 0.4]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial map={cardTexture('+', null, { bg: '#FFD700', color: '#071748', accent: '#b8860b' })} transparent side={2} />
      </mesh>
    )
  }
  if (fx.dip === id && fx.rain !== id) {
    bits.push(
      <mesh key="dip" position={[0, 4.1, 0.4]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial map={cardTexture('-', null, { bg: '#9aa6b8', color: '#071748', accent: '#5a6678' })} transparent side={2} />
      </mesh>
    )
  }
  return bits.length ? <group>{bits}</group> : null
}

// H3: the persistent Bank Sprout kiosk beside the garden - the straight
// gentle slope, made physical. Module 5's savings account formalizes it.
function BankSprout() {
  const leaf = useRef()
  useFrame(() => { if (useGame.getState().week !== 5) return; if (leaf.current) leaf.current.rotation.z = Math.sin(Date.now() * 0.0015) * 0.15 })
  return (
    <group position={[8.5, 0, 3]}>
      <mesh position={[0, 0.35, 0]} castShadow><cylinderGeometry args={[0.55, 0.65, 0.7, 12]} /><meshStandardMaterial color="#1464F0" roughness={0.5} /></mesh>
      <group ref={leaf} position={[0, 0.9, 0]}>
        <mesh castShadow><cylinderGeometry args={[0.05, 0.07, 0.6, 8]} /><meshStandardMaterial color="#3f9a42" /></mesh>
        <mesh position={[0.18, 0.28, 0]} rotation={[0, 0, -0.6]} castShadow><sphereGeometry args={[0.16, 10, 10]} /><meshStandardMaterial color="#00DCA0" /></mesh>
        <mesh position={[-0.18, 0.34, 0]} rotation={[0, 0, 0.6]} castShadow><sphereGeometry args={[0.14, 10, 10]} /><meshStandardMaterial color="#00DCA0" /></mesh>
      </group>
      <mesh position={[0, 1.9, 0]}>
        <planeGeometry args={[2, 0.62]} />
        <meshBasicMaterial map={cardTexture('BANK SPROUT', null, { bg: '#1464F0', color: '#ffffff', accent: '#00DCA0' })} transparent side={2} />
      </mesh>
    </group>
  )
}
