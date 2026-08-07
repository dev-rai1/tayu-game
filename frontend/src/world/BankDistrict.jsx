// MODULE 4 - THE BANK OF TAYU (Round 9, Part 6): the bank is now a STAGE.
// The building keeps its vault; around the plaza live the props the cast
// acts with: three teller windows (CHECKING / SAVINGS / CD with a padlock),
// the snack stall for card swipes, a CHECKING gauge that visibly drops, six
// debt blobs that grow and merge into one calm payment, and the shield the
// child earns for shooing the scammer. All driven by bk.fx timestamps.
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Billboard } from '@react-three/drei'
import { BANK_DISTRICT } from './config.js'
import { labelTexture, cardTexture } from './textures.js'
import { useGame, playerPos } from './store.js'

const since = (ts) => (ts ? (Date.now() - ts) / 1000 : Infinity)

function TellerWindow({ x, z, label, accent, locked }) {
  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[1.5, 1.3, 0.7]} radius={0.08} smoothness={2} position={[0, 0.65, 0]} castShadow>
        <meshPhysicalMaterial color="#f2e4c9" clearcoat={0.4} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 1.05, 0.37]}><planeGeometry args={[1.1, 0.5]} /><meshStandardMaterial color="#071748" /></mesh>
      <Billboard position={[0, 1.9, 0]}>
        <mesh><planeGeometry args={[1.7, 0.59]} /><meshBasicMaterial map={cardTexture(label, null, { accent })} transparent depthTest={false} /></mesh>
      </Billboard>
      {locked && (
        <group position={[0, 1.05, 0.44]}>
          <mesh><boxGeometry args={[0.26, 0.22, 0.08]} /><meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.3} /></mesh>
          <mesh position={[0, 0.16, 0]}><torusGeometry args={[0.09, 0.03, 8, 14, Math.PI]} /><meshStandardMaterial color="#c9a227" metalness={0.6} roughness={0.3} /></mesh>
        </group>
      )}
    </group>
  )
}

// the CHECKING gauge - a wall thermometer that visibly drops on a swipe
function CheckingGauge() {
  const bk = useGame((s) => s.bk)
  const bar = useRef()
  useFrame(() => { if (useGame.getState().week !== 4) return;
    if (!bar.current || !bk) return
    const total = Math.max(1, bk.vault + bk.savings + bk.cd + bk.checking + bk.bankAmount)
    const f = Math.max(0.04, Math.min(1, bk.checking / total))
    bar.current.scale.y += (f - bar.current.scale.y) * 0.08
    bar.current.position.y = 0.55 + bar.current.scale.y * 0.55
  })
  if (!bk) return null
  return (
    <group position={[-4.9, 0, 2]} scale={1.22}>
      <mesh position={[0, 1.1, 0]} castShadow><boxGeometry args={[0.5, 1.6, 0.24]} /><meshStandardMaterial color="#071748" roughness={0.6} /></mesh>
      <mesh ref={bar} position={[0, 1.1, 0.14]} scale={[1, 0.5, 1]}>
        <boxGeometry args={[0.3, 1.1, 0.06]} /><meshStandardMaterial color="#00DCA0" emissive="#00DCA0" emissiveIntensity={0.55} />
      </mesh>
      <Billboard position={[0, 2.35, 0]}>
        <mesh><planeGeometry args={[1.8, 0.62]} /><meshBasicMaterial map={cardTexture('CHECKING', null, { accent: '#1464F0' })} transparent depthTest={false} /></mesh>
      </Billboard>
    </group>
  )
}

// the snack stall where debit and credit cards get swiped
function SnackStall() {
  const fx = useGame((s) => s.bk?.fx)
  const card = useRef()
  useFrame(() => { if (useGame.getState().week !== 4) return;
    if (!card.current) return
    const t = Math.min(since(fx?.swipeAt), since(fx?.swipe2At))
    card.current.visible = t < 2.6
    if (t < 2.6) {
      const pulse = 1 + Math.sin(Math.min(1, t / 2.6) * Math.PI) * 0.28
      card.current.position.y = 1.28 + Math.sin(t * 4) * 0.16
      card.current.rotation.z = -0.55 + t * 0.42
      card.current.scale.setScalar(pulse)
    }
  })
  return (
    <group position={[-6.5, 0, 4.8]}>
      <RoundedBox args={[2.2, 1.1, 1]} radius={0.08} smoothness={2} position={[0, 0.55, 0]} castShadow>
        <meshPhysicalMaterial color="#e05252" clearcoat={0.4} roughness={0.5} />
      </RoundedBox>
      {[-0.8, 0, 0.8].map((ax, i) => (
        <mesh key={ax} position={[ax, 1.55, 0.2]} rotation={[0.45, 0, 0]} castShadow>
          <boxGeometry args={[0.8, 0.05, 0.8]} /><meshStandardMaterial color={i % 2 ? '#ffffff' : '#f5c542'} roughness={0.8} />
        </mesh>
      ))}
      {[-0.7, 0.7].map((px) => (
        <mesh key={px} position={[px, 1, 0.5]} castShadow><cylinderGeometry args={[0.04, 0.05, 1.4, 6]} /><meshStandardMaterial color="#8a5a36" /></mesh>
      ))}
      <mesh position={[0.5, 1.22, 0.1]}><sphereGeometry args={[0.14, 10, 10]} /><meshStandardMaterial color="#7fd0ff" roughness={0.4} /></mesh>
      {/* Make the tap terminal and moving card oversized enough to read as the focus. */}
      <mesh position={[-0.6, 1.25, 0.3]} castShadow><boxGeometry args={[0.4, 0.5, 0.16]} /><meshStandardMaterial color="#071748" emissive="#1464F0" emissiveIntensity={0.18} /></mesh>
      <mesh ref={card} visible={false} position={[-0.6, 1.28, 0.48]} castShadow>
        <boxGeometry args={[0.72, 0.46, 0.04]} /><meshStandardMaterial color="#1464F0" emissive="#1464F0" emissiveIntensity={0.5} metalness={0.3} roughness={0.25} />
      </mesh>
      <Billboard position={[0, 2.5, 0]}>
        <mesh><planeGeometry args={[2, 0.69]} /><meshBasicMaterial map={cardTexture('Snacks', null, { accent: '#e05252' })} transparent depthTest={false} /></mesh>
      </Billboard>
    </group>
  )
}

// six debt blobs grow with late fees, then merge into ONE calm blue payment
function DebtBlobs() {
  const fx = useGame((s) => s.bk?.fx)
  const refs = useRef([])
  const calm = useRef()
  const SPOTS = [[2.2, 3.2], [3.2, 4.6], [4.4, 3.4], [2.6, 5.4], [4.6, 5.2], [3.6, 2.6]]
  const CENTER = [3.5, 4.2]
  useFrame(() => { if (useGame.getState().week !== 4) return;
    const tGrow = since(fx?.debtAt)
    const tMerge = since(fx?.debtMergeAt)
    const merging = tMerge < 1.4
    const merged = tMerge <= 8 && tMerge >= 1.1
    SPOTS.forEach(([sx, sz], i) => {
      const m = refs.current[i]
      if (!m) return
      const alive = tGrow < 60 && !(tMerge < 60 && tMerge >= 1.1)
      m.visible = alive
      if (!alive) return
      const grow = Math.min(1, tGrow / 4)
      const s = 0.42 + grow * 0.72 + Math.sin(Date.now() * 0.006 + i * 1.7) * 0.07
      if (merging) {
        const f = Math.min(1, tMerge / 1.2)
        m.position.x = sx + (CENTER[0] - sx) * f
        m.position.z = sz + (CENTER[1] - sz) * f
        m.scale.setScalar(s * (1 - f * 0.7))
      } else {
        m.position.x = sx; m.position.z = sz
        m.scale.setScalar(s)
      }
      m.position.y = m.scale.y * 0.9
    })
    if (calm.current) {
      calm.current.visible = merged
      if (merged) {
        calm.current.position.set(CENTER[0], 0.95 + Math.sin(Date.now() * 0.003) * 0.08, CENTER[1])
        calm.current.scale.setScalar(1.05)
      }
    }
  })
  return (
    <group>
      {SPOTS.map((_, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} visible={false} castShadow>
          <icosahedronGeometry args={[1, 1]} /><meshStandardMaterial color="#d84b4b" emissive="#d84b4b" emissiveIntensity={0.12} roughness={0.6} flatShading /></mesh>
      ))}
      <mesh ref={calm} visible={false} castShadow>
        <icosahedronGeometry args={[1, 1]} /><meshStandardMaterial color="#1464F0" emissive="#1464F0" emissiveIntensity={0.22} roughness={0.5} flatShading />
      </mesh>
    </group>
  )
}

// the SHIELD badge floats over the child after the scammer is shooed
function Shield() {
  const fx = useGame((s) => s.bk?.fx)
  const ref = useRef()
  useFrame(() => { if (useGame.getState().week !== 4) return;
    const g = ref.current
    if (!g) return
    const t = since(fx?.shieldAt)
    g.visible = t < 4.5
    if (t < 4.5) {
      g.position.set(playerPos.x, 2.8 + Math.sin(t * 3) * 0.14, playerPos.z)
      g.rotation.y += 0.04
      g.scale.setScalar(1.35 + Math.sin(t * 5) * 0.08)
    }
  })
  return (
    <group ref={ref} visible={false}>
      <mesh><cylinderGeometry args={[0.34, 0.26, 0.08, 6]} /><meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.25} metalness={0.65} roughness={0.25} /></mesh>
      <mesh position={[0, 0.06, 0]}><boxGeometry args={[0.3, 0.05, 0.08]} /><meshStandardMaterial color="#1464F0" /></mesh>
    </group>
  )
}

export function BankDistrict() {
  const [bx, bz] = BANK_DISTRICT
  const bk = useGame((s) => s.bk)
  const wheel = useRef()
  const vaultPulse = useRef()
  useFrame(() => { if (useGame.getState().week !== 4) return;
    const spun = since(bk?.fx?.vaultAt)
    if (wheel.current) wheel.current.rotation.z += spun < 2.4 ? 0.32 : Math.sin(Date.now() * 0.0006) * 0.002
    if (vaultPulse.current) {
      const p = spun < 1.8 ? 1 + Math.sin(Math.min(1, spun / 1.8) * Math.PI) * 0.3 : 1
      vaultPulse.current.scale.setScalar(p)
    }
  })
  return (
    <group position={[bx, 0, bz]}>
      {/* the bank building itself (rotated so the door faces the ring road) */}
      <group rotation={[0, Math.PI, 0]}>
        {/* plaza */}
        <mesh position={[0, 0.025, -1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[8.5, 36]} />
          <meshStandardMaterial color="#e8ecf5" roughness={1} />
        </mesh>
        {/* the bank - open front so the follow camera sees the vault inside */}
        <RoundedBox args={[9, 4.6, 5]} radius={0.18} smoothness={3} position={[0, 2.3, 1.6]} castShadow>
          <meshPhysicalMaterial color="#f2e4c9" clearcoat={0.4} roughness={0.55} />
        </RoundedBox>
        {[-3.2, -1.1, 1.1, 3.2].map((x) => (
          <mesh key={x} position={[x, 1.9, -1.2]} castShadow>
            <cylinderGeometry args={[0.28, 0.32, 3.8, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, 4.9, 1.6]} rotation={[0, Math.PI / 4, 0]} scale={[1.18, 1, 0.72]} castShadow>
          <coneGeometry args={[5.4, 1.5, 4]} />
          <meshStandardMaterial color="#071748" roughness={0.6} />
        </mesh>
        {/* THE VAULT - a giant round door; it spins and THUNKS on deposit */}
        <group ref={vaultPulse} position={[0, 1.7, -0.7]}>
          <mesh castShadow>
            <cylinderGeometry args={[1.35, 1.35, 0.4, 28]} />
            <meshStandardMaterial color="#8b95a8" metalness={0.65} roughness={0.3} />
          </mesh>
          <mesh ref={wheel} position={[0, 0, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.55, 0.09, 10, 22]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.22} metalness={0.7} roughness={0.25} />
          </mesh>
          {[0, Math.PI / 2].map((r) => (
            <mesh key={r} position={[0, 0, 0.26]} rotation={[Math.PI / 2, r, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 1.05, 8]} />
              <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.2} metalness={0.7} roughness={0.25} />
            </mesh>
          ))}
        </group>
        {/* R13 6.3: the stray electric-blue teller counter is GONE - the three
            labeled teller windows are the counters now */}
        <Billboard position={[0, 6, 0]}>
          <mesh>
            <planeGeometry args={[7, 2.19]} />
            <meshBasicMaterial map={labelTexture('BANK OF TAYU', { bg: '#071748', color: '#ffffff', accent: '#FFD700' })} transparent depthTest={false} />
          </mesh>
        </Billboard>
      </group>

      {/* R9 Part 6: the ACTING PROPS, in plain world-facing coordinates */}
      <TellerWindow x={-3.4} z={2.2} label="Checking" accent="#9aa6b8" />
      <TellerWindow x={-1.2} z={2.6} label="Savings" accent="#00DCA0" />
      <TellerWindow x={1.2} z={2.6} label="CD" accent="#FFD700" locked={!!bk?.fx?.cdLockAt} />
      <CheckingGauge />
      <SnackStall />
      <DebtBlobs />
      <Shield />
    </group>
  )
}
