// MODULE 3 - BUDGET TOWN v4 (Round 9, Part 5): a LIVED-IN cul-de-sac.
// Real buildings the child walks to and uses: the House (rent -> lights on,
// family waves), the Grocery (basket fills), the Bus Stop (the school bus
// drives in and away with waving kids), the Clinic (health jar + doctor
// thumbs-up), the Fun Park (a ferris wheel that spins up when ridden), and
// the Bank Kiosk + Garden Gate where the split coins get walked home.
// All outcome animation is driven by bt.fx timestamps set in the store.
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Billboard } from '@react-three/drei'
import { useGame } from './store.js'
import { BUDGET_TOWN, BT_SPOTS } from './config.js'
import { cardTexture, labelTexture } from './textures.js'

const since = (ts) => (ts ? (Date.now() - ts) / 1000 : Infinity)

function Sign({ text, accent = '#00DCA0', y = 2.9, w = 2 }) {
  return (
    <Billboard position={[0, y, 0]}>
      <mesh><planeGeometry args={[w, w * 0.345]} /><meshBasicMaterial map={cardTexture(text, null, { accent })} transparent depthTest={false} /></mesh>
    </Billboard>
  )
}

// a tiny standing figure (family member / doctor / rider) that can wave
function Figure({ color = '#e05252', wave = false, scale = 1, ...p }) {
  const arm = useRef()
  useFrame(() => {
    if (arm.current) arm.current.rotation.z = wave ? 2.4 + Math.sin(Date.now() * 0.012) * 0.5 : 0.4
  })
  return (
    <group {...p} scale={scale}>
      <mesh position={[0, 0.5, 0]} castShadow><capsuleGeometry args={[0.18, 0.4, 6, 10]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
      <mesh position={[0, 1.02, 0]} castShadow><sphereGeometry args={[0.17, 10, 10]} /><meshStandardMaterial color="#f5c89b" roughness={0.7} /></mesh>
      <mesh ref={arm} position={[0.22, 0.72, 0]}><capsuleGeometry args={[0.05, 0.26, 4, 8]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
    </group>
  )
}

function House() {
  const fx = useGame((s) => s.bt?.fx)
  const win = useRef()
  useFrame(() => {
    if (win.current) win.current.material.emissiveIntensity = fx?.houseLit ? 0.75 + Math.sin(Date.now() * 0.004) * 0.2 : 0.05
  })
  const waving = since(fx?.houseAt) < 6
  return (
    <group position={[BT_SPOTS.house[0], 0, BT_SPOTS.house[1]]}>
      <Sign text="House" accent="#d98a5a" />
      <RoundedBox args={[3, 2.2, 2.4]} radius={0.12} smoothness={3} position={[0, 1.1, 0]} castShadow>
        <meshPhysicalMaterial color="#f2e4c9" clearcoat={0.4} roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, 2.6, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 0.8]} castShadow>
        <coneGeometry args={[2.15, 1, 4]} /><meshStandardMaterial color="#d98a5a" roughness={0.8} />
      </mesh>
      {[-0.8, 0.8].map((wx) => (
        <mesh key={wx} ref={wx < 0 ? win : undefined} position={[wx, 1.2, 1.22]}>
          <planeGeometry args={[0.7, 0.6]} />
          <meshStandardMaterial color="#fff4cf" emissive="#ffe9a3" emissiveIntensity={0.05} roughness={0.4} />
        </mesh>
      ))}
      <RoundedBox args={[0.6, 1.1, 0.1]} radius={0.04} smoothness={2} position={[0, 0.55, 1.22]}><meshStandardMaterial color="#7a4a2e" /></RoundedBox>
      {/* the family waves at the door once rent is paid */}
      {fx?.houseLit && <Figure color="#e05252" wave={waving} position={[0.9, 0, 1.7]} scale={0.85} />}
      {fx?.houseLit && <Figure color="#1464F0" wave={waving} position={[1.5, 0, 1.5]} scale={0.65} />}
    </group>
  )
}

function Grocery() {
  const fx = useGame((s) => s.bt?.fx)
  const bags = useGame((s) => s.bt?.basket?.length || 0)
  return (
    <group position={[BT_SPOTS.grocery[0], 0, BT_SPOTS.grocery[1]]}>
      <Sign text="Grocery" accent="#3f9a42" />
      <RoundedBox args={[3, 2, 2.2]} radius={0.12} smoothness={3} position={[0, 1, 0]} castShadow>
        <meshPhysicalMaterial color="#3f9a42" clearcoat={0.4} roughness={0.55} />
      </RoundedBox>
      {/* striped awning */}
      {[-1, 0, 1].map((ax, i) => (
        <mesh key={ax} position={[ax, 1.9, 1.35]} rotation={[0.5, 0, 0]} castShadow>
          <boxGeometry args={[1, 0.06, 0.9]} /><meshStandardMaterial color={i % 2 ? '#ffffff' : '#e05252'} roughness={0.8} />
        </mesh>
      ))}
      {/* crates out front; grocery bags appear as the basket fills */}
      <mesh position={[-1, 0.3, 1.5]} castShadow><boxGeometry args={[0.6, 0.6, 0.6]} /><meshStandardMaterial color="#b98a55" /></mesh>
      <mesh position={[-1, 0.7, 1.5]}><sphereGeometry args={[0.16, 8, 8]} /><meshStandardMaterial color="#e23b3b" /></mesh>
      {Array.from({ length: Math.min(4, bags) }).map((_, i) => (
        <mesh key={i} position={[0.6 + i * 0.35, 0.22, 1.55]} castShadow>
          <boxGeometry args={[0.26, 0.44, 0.2]} /><meshStandardMaterial color="#e8dcc0" roughness={0.9} />
        </mesh>
      ))}
      {since(fx?.basketAt) < 4 && <Figure color="#3f9a42" wave position={[1.6, 0, 1.4]} scale={0.85} />}
    </group>
  )
}

function BusStop() {
  const fx = useGame((s) => s.bt?.fx)
  const bus = useRef()
  const wheels = useRef([])
  useFrame(() => {
    const g = bus.current
    if (!g) return
    const t = since(fx?.busAt)
    // drive in from the west, pause at the stop, drive off east and away
    let x = -14, vis = false
    if (t < 20) {
      vis = true
      if (t < 2.2) x = -14 + (t / 2.2) * 12.5
      else if (t < 4.2) x = -1.5
      else x = -1.5 + (t - 4.2) * 7
      if (x > 16) vis = false
    }
    g.visible = vis && !!fx?.busAt
    g.position.x = x
    wheels.current.forEach((w) => { if (w) w.rotation.x += 0.15 })
  })
  return (
    <group position={[BT_SPOTS.bus[0], 0, BT_SPOTS.bus[1]]}>
      <Sign text="Bus Stop" accent="#1464F0" y={2.5} />
      {/* sign pole + bench */}
      <mesh position={[-0.9, 0.9, 0.6]} castShadow><cylinderGeometry args={[0.05, 0.05, 1.8, 8]} /><meshStandardMaterial color="#3a4654" /></mesh>
      <mesh position={[-0.9, 1.75, 0.6]}><boxGeometry args={[0.5, 0.34, 0.05]} /><meshStandardMaterial color="#f5c542" /></mesh>
      <mesh position={[0.8, 0.4, 0.7]} castShadow><boxGeometry args={[1.3, 0.1, 0.45]} /><meshStandardMaterial color="#a9743f" /></mesh>
      {[-1.3, 1.3].map((lx) => <mesh key={lx} position={[0.8 + lx * 0.45, 0.2, 0.7]}><boxGeometry args={[0.1, 0.4, 0.4]} /><meshStandardMaterial color="#7a531f" /></mesh>)}
      {/* THE SCHOOL BUS - animated by fx.busAt */}
      <group ref={bus} visible={false} position={[-14, 0, -1.2]}>
        <RoundedBox args={[3.2, 1.3, 1.3]} radius={0.12} smoothness={2} position={[0, 0.95, 0]} castShadow>
          <meshPhysicalMaterial color="#f5c542" clearcoat={0.5} roughness={0.4} />
        </RoundedBox>
        {[-0.9, 0.1, 1].map((wx2, i) => (
          <mesh key={i} position={[wx2, 1.15, 0.66]}><planeGeometry args={[0.55, 0.42]} /><meshStandardMaterial color="#bfe0f2" roughness={0.3} /></mesh>
        ))}
        {/* waving kids in the windows */}
        <Figure color="#e05252" wave scale={0.42} position={[-0.9, 0.95, 0.4]} />
        <Figure color="#00b37f" wave scale={0.42} position={[0.1, 0.95, 0.4]} />
        {[[-1.05, 0.35], [1.05, 0.35]].map(([wx2, wy], i) => (
          <mesh key={i} ref={(el) => (wheels.current[i] = el)} position={[wx2, wy, 0.55]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.32, 0.32, 0.18, 12]} /><meshStandardMaterial color="#2b2b2b" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Clinic() {
  const fx = useGame((s) => s.bt?.fx)
  const cross = useRef()
  useFrame(() => {
    if (cross.current) cross.current.material.emissiveIntensity = since(fx?.clinicAt) < 6 ? 0.9 + Math.sin(Date.now() * 0.008) * 0.3 : 0.25
  })
  return (
    <group position={[BT_SPOTS.clinic[0], 0, BT_SPOTS.clinic[1]]}>
      <Sign text="Clinic" accent="#e23b3b" />
      <RoundedBox args={[2.8, 2, 2.2]} radius={0.12} smoothness={3} position={[0, 1, 0]} castShadow>
        <meshPhysicalMaterial color="#ffffff" clearcoat={0.4} roughness={0.5} />
      </RoundedBox>
      <group position={[0, 1.9, 1.15]}>
        <mesh ref={cross}><boxGeometry args={[0.7, 0.22, 0.06]} /><meshStandardMaterial color="#e23b3b" emissive="#e23b3b" emissiveIntensity={0.25} /></mesh>
        <mesh><boxGeometry args={[0.22, 0.7, 0.06]} /><meshStandardMaterial color="#e23b3b" emissive="#e23b3b" emissiveIntensity={0.25} /></mesh>
      </group>
      {/* the health JAR by the door - a gold coin sits in it once funded */}
      <mesh position={[1, 0.4, 1.35]} castShadow><cylinderGeometry args={[0.3, 0.26, 0.6, 14]} /><meshPhysicalMaterial color="#bfe0f2" transmission={0.3} roughness={0.2} /></mesh>
      {fx?.clinicAt && (
        <mesh position={[1, 0.35, 1.35]}><cylinderGeometry args={[0.24, 0.22, 0.3, 12]} /><meshStandardMaterial color="#FFD700" metalness={0.5} roughness={0.35} /></mesh>
      )}
      {since(fx?.clinicAt) < 5 && <Figure color="#ffffff" wave position={[-1.4, 0, 1.4]} scale={0.9} />}
    </group>
  )
}

function FunPark() {
  const fx = useGame((s) => s.bt?.fx)
  const wheel = useRef()
  const speed = useRef(0.12)
  useFrame((_, d) => {
    const party = since(fx?.wheelAt) < 10
    speed.current += ((party ? 1.6 : 0.12) - speed.current) * 0.04
    if (wheel.current) wheel.current.rotation.z += speed.current * d * 2
  })
  const party = since(fx?.wheelAt) < 10
  return (
    <group position={[BT_SPOTS.fun[0], 0, BT_SPOTS.fun[1]]}>
      <Sign text="Fun Park" accent="#e23b7a" y={4.4} />
      {/* mini ferris wheel */}
      {[-0.5, 0.5].map((lx) => (
        <mesh key={lx} position={[lx, 1.4, 0]} rotation={[0, 0, lx > 0 ? -0.35 : 0.35]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 2.9, 8]} /><meshStandardMaterial color="#8a5a36" />
        </mesh>
      ))}
      <group ref={wheel} position={[0, 2.7, 0]}>
        <mesh><torusGeometry args={[1.35, 0.07, 10, 28]} /><meshStandardMaterial color="#e23b7a" roughness={0.5} /></mesh>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2
          return (
            <group key={i}>
              <mesh rotation={[0, 0, a]}><boxGeometry args={[0.05, 2.7, 0.05]} /><meshStandardMaterial color="#f5a0c0" /></mesh>
              <mesh position={[Math.cos(a) * 1.35, Math.sin(a) * 1.35, 0]}>
                <boxGeometry args={[0.42, 0.34, 0.34]} />
                <meshPhysicalMaterial color={['#1464F0', '#00DCA0', '#FFD700', '#7850F0'][i]} clearcoat={0.5} roughness={0.4} />
              </mesh>
            </group>
          )
        })}
      </group>
      {/* little fence + cheering riders when the wheel spins up */}
      {[-1.6, 1.6].map((fx2) => <mesh key={fx2} position={[fx2, 0.35, 1]} castShadow><boxGeometry args={[0.08, 0.7, 0.08]} /><meshStandardMaterial color="#b98a55" /></mesh>)}
      <mesh position={[0, 0.6, 1]}><boxGeometry args={[3.2, 0.07, 0.06]} /><meshStandardMaterial color="#cda06a" /></mesh>
      {party && <Figure color="#f5a623" wave position={[-1.1, 0, 1.5]} scale={0.8} />}
      {party && <Figure color="#00b37f" wave position={[1.1, 0, 1.6]} scale={0.75} />}
    </group>
  )
}

function BankKiosk() {
  const bt = useGame((s) => s.bt)
  const glow = bt?.stage === 'carry' && !bt?.carried?.bank
  return (
    <group position={[BT_SPOTS.kiosk[0], 0, BT_SPOTS.kiosk[1]]}>
      <Sign text="Bank Kiosk" accent="#1464F0" y={2.6} w={2.2} />
      <RoundedBox args={[1.7, 1.8, 1.4]} radius={0.1} smoothness={2} position={[0, 0.9, 0]} castShadow>
        <meshPhysicalMaterial color="#1464F0" clearcoat={0.5} roughness={0.45} emissive="#1464F0" emissiveIntensity={glow ? 0.35 : 0} />
      </RoundedBox>
      <mesh position={[0, 1.15, 0.72]}><planeGeometry args={[0.8, 0.5]} /><meshStandardMaterial color="#071748" /></mesh>
      <mesh position={[0, 0.85, 0.74]}><boxGeometry args={[0.5, 0.06, 0.04]} /><meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.3} /></mesh>
      {bt?.carried?.bank && <mesh position={[0, 2.1, 0]}><sphereGeometry args={[0.16, 10, 10]} /><meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.25} /></mesh>}
    </group>
  )
}

function GardenGate() {
  const bt = useGame((s) => s.bt)
  const glow = bt?.stage === 'carry' && bt?.carried?.bank && !bt?.carried?.garden
  return (
    <group position={[BT_SPOTS.gate[0], 0, BT_SPOTS.gate[1]]}>
      <Sign text="Garden Gate" accent="#00b37f" y={2.9} w={2.2} />
      {[-0.9, 0.9].map((px) => (
        <mesh key={px} position={[px, 1.1, 0]} castShadow><cylinderGeometry args={[0.1, 0.12, 2.2, 8]} /><meshStandardMaterial color="#8a5a36" /></mesh>
      ))}
      <mesh position={[0, 2.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.09, 0.09, 2, 8]} /><meshStandardMaterial color="#8a5a36" /></mesh>
      {/* vines */}
      {[-0.9, 0, 0.9].map((vx, i) => (
        <mesh key={i} position={[vx, 1.9 - (i % 2) * 0.3, 0.12]}><icosahedronGeometry args={[0.24, 1]} /><meshStandardMaterial color={glow ? '#00DCA0' : '#5fa84a'} emissive={glow ? '#00DCA0' : '#000000'} emissiveIntensity={glow ? 0.4 : 0} flatShading /></mesh>
      ))}
      {bt?.carried?.garden && (
        <group position={[0.4, 0, 0.5]}>
          <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.05, 0.07, 0.5, 6]} /><meshStandardMaterial color="#3f9a42" /></mesh>
          <mesh position={[0, 0.55, 0]}><icosahedronGeometry args={[0.16, 1]} /><meshStandardMaterial color="#00b37f" flatShading /></mesh>
        </group>
      )}
    </group>
  )
}

export function BudgetTown() {
  const [bx, bz] = BUDGET_TOWN
  return (
    <group position={[bx, 0, bz]}>
      {/* cul-de-sac plaza, opening north to the ring road */}
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9.6, 40]} />
        <meshStandardMaterial color="#efe6d2" roughness={1} />
      </mesh>
      <mesh position={[0, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[9.6, 10.3, 40]} />
        <meshStandardMaterial color="#caa46a" roughness={1} />
      </mesh>
      {/* the Keeper's welcome board at the entrance */}
      <group position={[BT_SPOTS.board[0], 0, BT_SPOTS.board[1]]}>
        {[-1.2, 1.2].map((x) => (
          <mesh key={x} position={[x, 0.95, 0]} castShadow><cylinderGeometry args={[0.08, 0.1, 1.9, 8]} /><meshStandardMaterial color="#7a4a2e" /></mesh>
        ))}
        <RoundedBox args={[3.1, 1.5, 0.14]} radius={0.06} smoothness={2} position={[0, 1.7, 0]} castShadow>
          <meshStandardMaterial color="#071748" roughness={0.6} />
        </RoundedBox>
        <mesh position={[0, 1.7, 0.09]}>
          <planeGeometry args={[2.8, 0.875]} />
          <meshBasicMaterial map={labelTexture('LIVE ONE DAY!', { bg: '#071748', color: '#ffffff', accent: '#FFD700' })} transparent />
        </mesh>
      </group>
      {/* the district sign, readable from the ring approach */}
      <Billboard position={[0, 6.2, 0]}>
        <mesh><planeGeometry args={[6.4, 2]} /><meshBasicMaterial map={labelTexture('BUDGET TOWN', { bg: '#071748', color: '#ffffff', accent: '#00DCA0' })} transparent depthTest={false} /></mesh>
      </Billboard>
      <House />
      <Grocery />
      <BusStop />
      <Clinic />
      <FunPark />
      <BankKiosk />
      <GardenGate />
    </group>
  )
}
