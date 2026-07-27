// MODULE 3 - BUDGET TOWN v5 (R14): a SINGLE STATIONARY cutaway household.
// The child never walks. They stand with the Budget Keeper on the lawn and
// their spending choices animate the ONE house in front of them - exactly the
// way the Bank works. Pay rent -> the upstairs room lights and the family
// moves in; buy food -> groceries land in the kitchen and the family eats;
// fund the school run -> the bus pulls up and the kids head out the door;
// set aside health money -> the doctor visits; add fun -> the living room
// throws a party; then the split coins fly to the Bank slot and Garden slot.
// Every outcome is driven by bt.fx timestamps set in the store. No walking,
// no navigation, no per-building near-detection => none of the old lag/freeze.
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Billboard } from '@react-three/drei'
import { useGame } from './store.js'
import { BUDGET_TOWN, BT_ROOMS } from './config.js'
import { cardTexture, labelTexture } from './textures.js'

const since = (ts) => (ts ? (Date.now() - ts) / 1000 : Infinity)
const active3 = () => useGame.getState().week === 3

// billboarded room label that always faces the camera
function RoomTag({ text, pos, accent = '#00DCA0', w = 1.9 }) {
  return (
    <Billboard position={pos}>
      <mesh><planeGeometry args={[w, w * 0.345]} /><meshBasicMaterial map={cardTexture(text, null, { accent })} transparent depthTest={false} /></mesh>
    </Billboard>
  )
}

// a tiny standing figure (family member / doctor / rider) that can wave
function Figure({ color = '#e05252', wave = false, scale = 1, ...p }) {
  const arm = useRef()
  useFrame(() => {
    if (!active3()) return
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

// the back-of-room glow panel: dim until its decision is made, then it warms up
function GlowPanel({ pos, color = '#ffe9a3', on = false, pulse = false }) {
  const m = useRef()
  useFrame(() => {
    if (!active3() || !m.current) return
    const target = on ? (pulse ? 0.75 + Math.sin(Date.now() * 0.004) * 0.2 : 0.6) : 0.04
    m.current.material.emissiveIntensity += (target - m.current.material.emissiveIntensity) * 0.1
  })
  return (
    <mesh ref={m} position={pos}>
      <planeGeometry args={[2.5, 1.7]} />
      <meshStandardMaterial color="#fff4cf" emissive={color} emissiveIntensity={0.04} roughness={0.5} />
    </mesh>
  )
}

// UPSTAIRS-LEFT: shelter. Lights come on and the family moves in.
function RoomHome() {
  const fx = useGame((s) => s.bt?.fx)
  const [rx, ry, rz] = BT_ROOMS.home
  const lit = !!fx?.houseLit
  const waving = since(fx?.houseAt) < 6
  return (
    <group position={[rx, 0, rz - 0.7]}>
      <GlowPanel pos={[0, ry, -1.25]} on={lit} pulse />
      <RoomTag text="Home" pos={[0, ry + 1.15, 0.9]} accent="#d98a5a" />
      {/* a cozy bed */}
      <RoundedBox args={[1.4, 0.3, 0.8]} radius={0.06} smoothness={2} position={[0, ry - 0.65, -0.4]} castShadow><meshStandardMaterial color={lit ? '#c8567a' : '#7c6a72'} roughness={0.7} /></RoundedBox>
      <mesh position={[-0.5, ry - 0.42, -0.4]}><boxGeometry args={[0.35, 0.22, 0.7]} /><meshStandardMaterial color="#fff" roughness={0.8} /></mesh>
      {/* the family enters once rent is paid */}
      {lit && <Figure color="#e05252" wave={waving} position={[0.55, ry - 0.85, 0.3]} scale={0.7} />}
      {lit && <Figure color="#1464F0" wave={waving} position={[0.95, ry - 0.85, 0.2]} scale={0.55} />}
    </group>
  )
}

// UPSTAIRS-RIGHT: the health visit. The doctor pops in and gives a thumbs-up.
function RoomHealth() {
  const fx = useGame((s) => s.bt?.fx)
  const [rx, ry, rz] = BT_ROOMS.health
  const cross = useRef()
  const visiting = since(fx?.clinicAt) < 6
  useFrame(() => {
    if (!active3() || !cross.current) return
    const t = visiting ? 0.9 + Math.sin(Date.now() * 0.008) * 0.3 : 0.2
    cross.current.material.emissiveIntensity += (t - cross.current.material.emissiveIntensity) * 0.1
  })
  return (
    <group position={[rx, 0, rz - 0.7]}>
      <GlowPanel pos={[0, ry, -1.25]} color="#bfe0f2" on={!!fx?.clinicAt} />
      <RoomTag text="Health" pos={[0, ry + 1.15, 0.9]} accent="#e23b3b" />
      {/* red medical cross that glows on the visit */}
      <group position={[0, ry + 0.1, -1.15]}>
        <mesh ref={cross}><boxGeometry args={[0.6, 0.2, 0.06]} /><meshStandardMaterial color="#e23b3b" emissive="#e23b3b" emissiveIntensity={0.2} /></mesh>
        <mesh><boxGeometry args={[0.2, 0.6, 0.06]} /><meshStandardMaterial color="#e23b3b" emissive="#e23b3b" emissiveIntensity={0.2} /></mesh>
      </group>
      {/* the health jar - a gold coin drops in once funded */}
      <mesh position={[-0.7, ry - 0.6, 0.1]} castShadow><cylinderGeometry args={[0.26, 0.22, 0.5, 14]} /><meshPhysicalMaterial color="#bfe0f2" transmission={0.3} roughness={0.2} /></mesh>
      {fx?.clinicAt && <mesh position={[-0.7, ry - 0.62, 0.1]}><cylinderGeometry args={[0.2, 0.18, 0.26, 12]} /><meshStandardMaterial color="#FFD700" metalness={0.5} roughness={0.35} /></mesh>}
      {/* the doctor enters, then leaves */}
      {visiting && <Figure color="#ffffff" wave position={[0.5, ry - 0.85, 0.3]} scale={0.72} />}
    </group>
  )
}

// DOWNSTAIRS-LEFT: the kitchen. Groceries arrive and the family sits to eat.
function RoomKitchen() {
  const fx = useGame((s) => s.bt?.fx)
  const bags = useGame((s) => s.bt?.basket?.length || 0)
  const [rx, ry, rz] = BT_ROOMS.kitchen
  const got = !!fx?.basketAt
  return (
    <group position={[rx, 0, rz - 0.7]}>
      <GlowPanel pos={[0, ry, -1.25]} color="#c9f2b0" on={got} />
      <RoomTag text="Kitchen" pos={[0, ry + 1.15, 0.9]} accent="#3f9a42" />
      {/* the table */}
      <RoundedBox args={[1.3, 0.12, 0.7]} radius={0.04} smoothness={2} position={[0, ry - 0.35, -0.2]} castShadow><meshStandardMaterial color="#a9743f" roughness={0.7} /></RoundedBox>
      {[-0.5, 0.5].map((lx) => <mesh key={lx} position={[lx, ry - 0.65, -0.2]}><cylinderGeometry args={[0.05, 0.05, 0.5, 6]} /><meshStandardMaterial color="#7a531f" /></mesh>)}
      {/* grocery bags line the counter as the basket fills */}
      {Array.from({ length: Math.min(4, bags) }).map((_, i) => (
        <mesh key={i} position={[-0.6 + i * 0.35, ry - 0.15, -0.1]} castShadow>
          <boxGeometry args={[0.24, 0.4, 0.18]} /><meshStandardMaterial color="#e8dcc0" roughness={0.9} />
        </mesh>
      ))}
      {/* the family sits down to eat */}
      {got && <Figure color="#3f9a42" wave position={[0.65, ry - 0.85, 0.25]} scale={0.62} />}
      {got && <Figure color="#f5a623" wave position={[-0.75, ry - 0.85, 0.25]} scale={0.58} />}
    </group>
  )
}

// DOWNSTAIRS-RIGHT: the living room. A little party when fun is chosen.
function RoomLiving() {
  const fx = useGame((s) => s.bt?.fx)
  const [rx, ry, rz] = BT_ROOMS.living
  const party = since(fx?.wheelAt) < 12
  const balloons = useRef()
  useFrame(() => {
    if (!active3() || !balloons.current) return
    balloons.current.position.y = party ? Math.sin(Date.now() * 0.003) * 0.08 : 0
    balloons.current.rotation.y += party ? 0.01 : 0
  })
  return (
    <group position={[rx, 0, rz - 0.7]}>
      <GlowPanel pos={[0, ry, -1.25]} color="#ffd0ec" on={!!fx?.wheelAt} pulse={party} />
      <RoomTag text="Living Room" pos={[0, ry + 1.15, 0.9]} accent="#e23b7a" w={2.3} />
      {/* couch */}
      <RoundedBox args={[1.5, 0.5, 0.6]} radius={0.1} smoothness={2} position={[0, ry - 0.55, -0.3]} castShadow><meshStandardMaterial color="#7850F0" roughness={0.6} /></RoundedBox>
      {/* balloons appear for the celebration */}
      <group ref={balloons} position={[0, ry + 0.2, -0.2]} visible={!!fx?.wheelAt}>
        {['#1464F0', '#00DCA0', '#FFD700'].map((c, i) => (
          <mesh key={c} position={[(i - 1) * 0.5, 0.3, 0]}><sphereGeometry args={[0.18, 10, 10]} /><meshStandardMaterial color={c} roughness={0.4} /></mesh>
        ))}
      </group>
      {party && <Figure color="#f5a623" wave position={[0.6, ry - 0.85, 0.3]} scale={0.62} />}
      {party && <Figure color="#00b37f" wave position={[-0.6, ry - 0.85, 0.3]} scale={0.6} />}
    </group>
  )
}

// FRONT PORCH: the school run. The bus pulls up and the kids head out the door.
function SchoolRun() {
  const fx = useGame((s) => s.bt?.fx)
  const bus = useRef()
  const wheels = useRef([])
  const kids = useRef()
  const [dx, , dz] = BT_ROOMS.door
  useFrame(() => {
    if (!active3()) return
    const t = since(fx?.busAt)
    const g = bus.current
    if (g) {
      // drive in from the left, wait at the curb, drive off to the right
      let x = -12, vis = false
      if (fx?.busAt && t < 18) {
        vis = true
        if (t < 2.2) x = -12 + (t / 2.2) * 9
        else if (t < 5) x = -3
        else x = -3 + (t - 5) * 6
        if (x > 14) vis = false
      }
      g.visible = vis
      g.position.x = dx + x
      wheels.current.forEach((w) => { if (w) w.rotation.x += 0.15 })
    }
    if (kids.current) {
      // the kids step out toward the curb between t=2.4 and t=5, then are gone
      const walking = fx?.busAt && t > 2.2 && t < 5.2
      kids.current.visible = !!walking
      if (walking) kids.current.position.z = dz + 0.4 + Math.min(1.4, (t - 2.2) * 0.7)
    }
  })
  return (
    <group>
      {/* the front door */}
      <RoundedBox args={[0.8, 1.3, 0.12]} radius={0.05} smoothness={2} position={[dx, 0.65, dz - 0.62]} castShadow><meshStandardMaterial color="#7a4a2e" roughness={0.6} /></RoundedBox>
      <mesh position={[dx + 0.22, 0.65, dz - 0.55]}><sphereGeometry args={[0.05, 8, 8]} /><meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.3} /></mesh>
      <RoomTag text="School Run" pos={[dx, 1.7, dz]} accent="#1464F0" w={2.1} />
      {/* the kids leaving for school */}
      <group ref={kids} visible={false}>
        <Figure color="#e23b3b" wave={false} position={[dx - 0.2, 0, dz]} scale={0.6} />
        <Figure color="#00b37f" wave={false} position={[dx + 0.25, 0, dz]} scale={0.56} />
      </group>
      {/* THE SCHOOL BUS - animated by fx.busAt, drives across the lawn */}
      <group ref={bus} visible={false} position={[dx - 12, 0, dz + 2.2]}>
        <RoundedBox args={[2.8, 1.15, 1.2]} radius={0.12} smoothness={2} position={[0, 0.85, 0]} castShadow>
          <meshPhysicalMaterial color="#f5c542" clearcoat={0.5} roughness={0.4} />
        </RoundedBox>
        {[-0.8, 0.1, 0.9].map((wx, i) => (
          <mesh key={i} position={[wx, 1.0, 0.61]}><planeGeometry args={[0.5, 0.38]} /><meshStandardMaterial color="#bfe0f2" roughness={0.3} /></mesh>
        ))}
        <Figure color="#e05252" wave scale={0.36} position={[-0.8, 0.85, 0.35]} />
        <Figure color="#00b37f" wave scale={0.36} position={[0.1, 0.85, 0.35]} />
        {[[-0.9, 0.3], [0.9, 0.3]].map(([wx, wy], i) => (
          <mesh key={i} ref={(el) => (wheels.current[i] = el)} position={[wx, wy, 0.5]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.28, 0.28, 0.16, 12]} /><meshStandardMaterial color="#2b2b2b" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// FRONT LAWN: the two homes for the leftover - bank deposit + garden deposit.
function DepositSlots() {
  const fx = useGame((s) => s.bt?.fx)
  const [bx, , bz] = BT_ROOMS.bank
  const [gx, , gz] = BT_ROOMS.garden
  const sprout = useRef()
  useFrame(() => {
    if (!active3() || !sprout.current) return
    const grown = fx?.gardenAt ? Math.min(1, (Date.now() - fx.gardenAt) / 1200) : 0
    sprout.current.scale.setScalar(0.001 + grown)
  })
  return (
    <group>
      {/* BANK slot - a little vault box; a gold coin lands on deposit */}
      <group position={[bx, 0, bz]}>
        <RoomTag text="Bank" pos={[0, 1.7, 0]} accent="#1464F0" w={1.5} />
        <RoundedBox args={[1.2, 1.2, 1]} radius={0.1} smoothness={2} position={[0, 0.6, 0]} castShadow>
          <meshPhysicalMaterial color="#1464F0" clearcoat={0.5} roughness={0.45} emissive="#1464F0" emissiveIntensity={fx?.bankAt ? 0.3 : 0} />
        </RoundedBox>
        <mesh position={[0, 0.6, 0.52]}><boxGeometry args={[0.4, 0.06, 0.04]} /><meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.3} /></mesh>
        {fx?.bankAt && <mesh position={[0, 1.45, 0]}><sphereGeometry args={[0.16, 10, 10]} /><meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.25} /></mesh>}
      </group>
      {/* GARDEN slot - a planter; a sprout grows out of it on deposit */}
      <group position={[gx, 0, gz]}>
        <RoomTag text="Garden" pos={[0, 1.5, 0]} accent="#00b37f" w={1.6} />
        <mesh position={[0, 0.35, 0]} castShadow><cylinderGeometry args={[0.5, 0.4, 0.7, 14]} /><meshStandardMaterial color="#8a5a36" roughness={0.8} /></mesh>
        <group ref={sprout} position={[0, 0.7, 0]} scale={0.001}>
          <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.05, 0.07, 0.5, 6]} /><meshStandardMaterial color="#3f9a42" /></mesh>
          <mesh position={[0, 0.55, 0]}><icosahedronGeometry args={[0.18, 1]} /><meshStandardMaterial color="#00b37f" flatShading /></mesh>
        </group>
      </group>
    </group>
  )
}

// the cutaway shell: back + side walls, two floors, a divider, and a gable roof.
function HouseShell() {
  const wall = '#f2e4c9'
  return (
    <group>
      {/* foundation */}
      <RoundedBox args={[7.8, 0.2, 3]} radius={0.06} smoothness={2} position={[0, 0.06, -0.85]} receiveShadow><meshStandardMaterial color="#d8c7a2" roughness={0.9} /></RoundedBox>
      {/* back wall */}
      <mesh position={[0, 2.25, -2.1]} receiveShadow><boxGeometry args={[7.6, 4.5, 0.2]} /><meshStandardMaterial color={wall} roughness={0.7} /></mesh>
      {/* side walls */}
      {[-3.75, 3.75].map((x) => (
        <mesh key={x} position={[x, 2.25, -0.95]} castShadow><boxGeometry args={[0.2, 4.5, 2.5]} /><meshStandardMaterial color={wall} roughness={0.7} /></mesh>
      ))}
      {/* mid floor + vertical divider (the 2x2 room grid) */}
      <mesh position={[0, 2.0, -0.95]}><boxGeometry args={[7.6, 0.14, 2.5]} /><meshStandardMaterial color="#e2d3b2" roughness={0.8} /></mesh>
      <mesh position={[0, 2.25, -0.95]}><boxGeometry args={[0.14, 4.5, 2.5]} /><meshStandardMaterial color="#e2d3b2" roughness={0.8} /></mesh>
      {/* gable roof */}
      <mesh position={[0, 5.1, -0.95]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 0.62]} castShadow>
        <coneGeometry args={[4.9, 1.7, 4]} /><meshStandardMaterial color="#d98a5a" roughness={0.85} />
      </mesh>
    </group>
  )
}

export function BudgetTown() {
  const [bx, bz] = BUDGET_TOWN
  return (
    <group position={[bx, 0, bz]}>
      {/* the lawn / plaza the child stands on */}
      <mesh position={[0, 0.02, 1.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[7.2, 40]} />
        <meshStandardMaterial color="#a7d08a" roughness={1} />
      </mesh>
      <mesh position={[1.9, 0.03, 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 4]} />
        <meshStandardMaterial color="#efe6d2" roughness={1} />
      </mesh>
      {/* the district sign, readable from the ring approach */}
      <Billboard position={[0, 6.6, 1]}>
        <mesh><planeGeometry args={[6.4, 2]} /><meshBasicMaterial map={labelTexture('BUDGET TOWN', { bg: '#071748', color: '#ffffff', accent: '#00DCA0' })} transparent depthTest={false} /></mesh>
      </Billboard>

      <HouseShell />
      <RoomHome />
      <RoomHealth />
      <RoomKitchen />
      <RoomLiving />
      <SchoolRun />
      <DepositSlots />

      {/* the Keeper's welcome board on the front-left, balancing the lawn */}
      <group position={[-3.0, 0, 4.4]}>
        {[-1.1, 1.1].map((x) => (
          <mesh key={x} position={[x, 0.9, 0]} castShadow><cylinderGeometry args={[0.07, 0.09, 1.8, 8]} /><meshStandardMaterial color="#7a4a2e" /></mesh>
        ))}
        <RoundedBox args={[2.8, 1.4, 0.14]} radius={0.06} smoothness={2} position={[0, 1.7, 0]} castShadow>
          <meshStandardMaterial color="#071748" roughness={0.6} />
        </RoundedBox>
        <mesh position={[0, 1.7, 0.09]}>
          <planeGeometry args={[2.5, 0.78]} />
          <meshBasicMaterial map={labelTexture('LIVE ONE DAY!', { bg: '#071748', color: '#ffffff', accent: '#FFD700' })} transparent />
        </mesh>
      </group>
    </group>
  )
}
