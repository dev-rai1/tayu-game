import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { CharacterMesh } from './CharacterMesh.jsx'
import { labelTexture, emojiTexture, cardTexture } from './textures.js'
import { stage } from '../anim/stage.js'
import { tickTimelines, activeTimelines } from '../anim/timeline.js'
import { playerPos, useGame } from './store.js'
import { RING_POINTS, AMBIENT_NPCS } from './config.js'

// The cast that ACTS OUT consequences (Rule 7). Penny/Theo/Mia idle near the
// kitchen; Bram idles in the store. During a scene the timeline drives them via
// stage.actors - this component just reads stage every frame and animates.
const NPCS = [
  { id: 'penny', name: 'Penny', accent: '#00DCA0', avatar: { gender: 'female', bodyType: 'average', skinTone: 'warm_beige', hairStyle: 'long', hairColor: 'brown', topStyle: 'hoodie', bottomStyle: 'pants', shirtColor: 'green', pantsColor: 'blue', shoeColor: 'white', eyeColor: 'brown', eyeShape: 'round', accessories: [] } },
  { id: 'theo', name: 'Theo', accent: '#1464F0', avatar: { gender: 'male', bodyType: 'thin', skinTone: 'cream', hairStyle: 'short', hairColor: 'black', topStyle: 'tee', bottomStyle: 'shorts', shirtColor: 'blue', pantsColor: 'gray', shoeColor: 'red', eyeColor: 'brown', eyeShape: 'round', accessories: ['backpack'] } },
  { id: 'mia', name: 'Mia', accent: '#7850F0', avatar: { gender: 'female', bodyType: 'average', skinTone: 'medium_brown', hairStyle: 'curly', hairColor: 'black', topStyle: 'tee', bottomStyle: 'pants', shirtColor: 'orange', pantsColor: 'black', shoeColor: 'white', eyeColor: 'brown', eyeShape: 'round', accessories: [] } },
  { id: 'bram', name: 'Mr. Bram', accent: '#00DCA0', avatar: { gender: 'male', bodyType: 'muscular', skinTone: 'light_tan', hairStyle: 'short', hairColor: 'black', topStyle: 'tee', bottomStyle: 'pants', shirtColor: 'green', pantsColor: 'gray', shoeColor: 'black', eyeColor: 'brown', eyeShape: 'round', accessories: [] } },
  // Week 3 - Sprout Street cast (v7 §6.3)
  { id: 'sprout', name: 'Mr. Sprout', accent: '#00DCA0', avatar: { gender: 'female', bodyType: 'average', skinTone: 'deep_brown', hairStyle: 'curly', hairColor: 'black', topStyle: 'hoodie', bottomStyle: 'pants', shirtColor: 'green', pantsColor: 'gray', shoeColor: 'white', eyeColor: 'brown', eyeShape: 'round', accessories: [] } },
  { id: 'wanderer', name: 'Milo', accent: '#f0822e', avatar: { gender: 'male', bodyType: 'muscular', skinTone: 'deep_brown', hairStyle: 'curly', hairColor: 'red', topStyle: 'tank', bottomStyle: 'shorts', shirtColor: 'orange', pantsColor: 'blue', shoeColor: 'white', eyeColor: 'brown', eyeShape: 'round', accessories: ['hat'] } },
  { id: 'keeper', name: 'Mayor Penny-Wise', accent: '#FFD700', avatar: { gender: 'female', bodyType: 'average', skinTone: 'tan', hairStyle: 'short', hairColor: 'black', topStyle: 'hoodie', bottomStyle: 'pants', shirtColor: 'yellow', pantsColor: 'navy', shoeColor: 'brown', eyeColor: 'brown', eyeShape: 'round', accessories: ['hat'] } },
  { id: 'bea', name: 'Banker Bea', accent: '#1464F0', avatar: { gender: 'female', bodyType: 'thin', skinTone: 'deep_brown', hairStyle: 'short', hairColor: 'black', topStyle: 'hoodie', bottomStyle: 'pants', shirtColor: 'navy', pantsColor: 'navy', shoeColor: 'black', eyeColor: 'brown', eyeShape: 'hooded', accessories: ['glasses'] } },
  { id: 'nea', name: 'Nea', accent: '#7850F0', avatar: { gender: 'female', bodyType: 'thin', skinTone: 'light', hairStyle: 'long', hairColor: 'black', topStyle: 'hoodie', bottomStyle: 'skirt', shirtColor: 'purple', pantsColor: 'navy', shoeColor: 'black', eyeColor: 'blue', eyeShape: 'almond', accessories: ['necklace'] } },
  { id: 'scoop', name: 'Scoop', accent: '#FFD700', avatar: { gender: 'male', bodyType: 'thin', skinTone: 'cream', hairStyle: 'short', hairColor: 'red', topStyle: 'tee', bottomStyle: 'shorts', shirtColor: 'yellow', pantsColor: 'blue', shoeColor: 'red', eyeColor: 'green', eyeShape: 'round', accessories: ['hat'] } },
  // R9 Part 6 - the Bank of TAYU acting cast
  { id: 'teller', name: 'Teller Tom', accent: '#1464F0', avatar: { gender: 'male', bodyType: 'average', skinTone: 'tan', hairStyle: 'short', hairColor: 'brown', topStyle: 'hoodie', bottomStyle: 'pants', shirtColor: 'blue', pantsColor: 'navy', shoeColor: 'black', eyeColor: 'brown', eyeShape: 'round', accessories: ['glasses'] } },
  { id: 'clerk', name: 'Clerk Cleo', accent: '#f0822e', avatar: { gender: 'female', bodyType: 'average', skinTone: 'medium_brown', hairStyle: 'curly', hairColor: 'brown', topStyle: 'tee', bottomStyle: 'pants', shirtColor: 'orange', pantsColor: 'gray', shoeColor: 'white', eyeColor: 'brown', eyeShape: 'round', accessories: [] } },
  { id: 'mailer', name: 'Postal Pat', accent: '#7850F0', avatar: { gender: 'neutral', bodyType: 'thin', skinTone: 'light_tan', hairStyle: 'short', hairColor: 'black', topStyle: 'hoodie', bottomStyle: 'shorts', shirtColor: 'purple', pantsColor: 'navy', shoeColor: 'black', eyeColor: 'brown', eyeShape: 'round', accessories: ['hat'] } },
  { id: 'scammer', name: 'Sneaky Sam', accent: '#8a8a8a', avatar: { gender: 'male', bodyType: 'thin', skinTone: 'cream', hairStyle: 'short', hairColor: 'black', topStyle: 'hoodie', bottomStyle: 'pants', shirtColor: 'black', pantsColor: 'black', shoeColor: 'black', eyeColor: 'black', eyeShape: 'hooded', accessories: ['hat'] } },
  { id: 'helper', name: 'Helper Hana', accent: '#00DCA0', avatar: { gender: 'female', bodyType: 'average', skinTone: 'deep_brown', hairStyle: 'long', hairColor: 'black', topStyle: 'tee', bottomStyle: 'pants', shirtColor: 'green', pantsColor: 'blue', shoeColor: 'white', eyeColor: 'brown', eyeShape: 'round', accessories: [] } },
]

const PROP_COLOR = { water: '#7fd0ff', gift: '#ff5fa2', giftBox: '#c9c9c9' }

function StageNpc({ id, name, accent, avatar }) {
  const root = useRef()
  const mesh = useRef()
  const prop = useRef()
  const limbs = useRef(null)
  const idle = useRef(Math.random() * 10)
  const tex = labelTexture(name, { accent })

  useEffect(() => {
    if (!mesh.current) return
    limbs.current = {
      ll: mesh.current.getObjectByName('leftLeg'), rl: mesh.current.getObjectByName('rightLeg'),
      la: mesh.current.getObjectByName('leftArm'), ra: mesh.current.getObjectByName('rightArm'),
    }
  }, [])

  useFrame((_, dRaw) => {
    const d = Math.min(dRaw, 0.05)
    const a = stage.actors[id]
    if (!a) return
    // R13c PERF: a distant, idle NPC does not need per-frame animation - it
    // stays rendered at rest. Only animate anyone mid-walk or near the player.
    if (!a.moving) {
      const pdx = playerPos.x - a.x, pdz = playerPos.z - a.z
      if (pdx * pdx + pdz * pdz > 900) { if (root.current) { root.current.position.x = a.x; root.current.position.z = a.z } return }
    }
    idle.current += d

    if (a.moving) {
      const dx = a.tx - a.x, dz = a.tz - a.z
      const dist = Math.hypot(dx, dz)
      if (dist < 0.06) {
        a.x = a.tx; a.z = a.tz; a.moving = false
        const cb = a.onArrive; a.onArrive = null; cb && cb()
      } else {
        const step = Math.min(dist, a.speed * d)
        a.x += (dx / dist) * step; a.z += (dz / dist) * step
        a.walk += d * 9; a.rotY = Math.atan2(dx, dz)
      }
    } else {
      a.walk = THREE.MathUtils.lerp(a.walk % (Math.PI * 2), 0, 0.2)
      // v9 5.3: NPCs feel ALIVE - face the child nearby, wave on approach
      const pd = Math.hypot(playerPos.x - a.x, playerPos.z - a.z)
      if (pd < 3.4) {
        if (['idle', 'dance2'].includes(a.pose)) a.rotY = Math.atan2(playerPos.x - a.x, playerPos.z - a.z)
        if (!a._nearPlayer) {
          a._nearPlayer = true
          if (a.pose === 'idle') {
            a.pose = 'dance2'; a.poseT = 0
            stage.emotes.push({ id: ++stage._eid, actor: id, symbol: '👋', t: 0, dur: 1.2, dx: 0 })
            setTimeout(() => { if (a.pose === 'dance2') a.pose = 'idle' }, 1100)
          }
        }
      } else if (pd > 4.5) {
        a._nearPlayer = false
      }
    }

    if (root.current) {
      root.current.position.x = a.x
      root.current.position.z = a.z
      root.current.position.y = a.moving ? Math.abs(Math.sin(a.walk)) * 0.04 : Math.sin(idle.current * 1.7) * 0.02
    }
    if (mesh.current) {
      let diff = a.rotY - mesh.current.rotation.y
      diff = Math.atan2(Math.sin(diff), Math.cos(diff))
      mesh.current.rotation.y += diff * Math.min(1, 9 * d)
      const targetTilt = a.pose === 'droop' ? 0.3 : a.pose === 'sit' ? 0.15 : 0
      mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, targetTilt, Math.min(1, 8 * d))
      // ambient poses (F3): two dance loops + chatting
      if (a.pose === 'dance1') {
        mesh.current.rotation.y += d * 5 // happy spin
        root.current.position.y += Math.abs(Math.sin(idle.current * 8)) * 0.1
      } else if (a.pose === 'dance2') {
        mesh.current.rotation.z = Math.sin(idle.current * 7) * 0.14 // side-step sway
        root.current.position.y += Math.abs(Math.sin(idle.current * 6)) * 0.07
      } else if (a.pose === 'chat') {
        root.current.position.y += Math.abs(Math.sin(idle.current * 4)) * 0.04 // head-bob chatter
        mesh.current.rotation.z = THREE.MathUtils.lerp(mesh.current.rotation.z, 0, 0.2)
      } else {
        mesh.current.rotation.z = THREE.MathUtils.lerp(mesh.current.rotation.z, 0, 0.2)
      }
    }
    const swing = Math.sin(a.walk) * (a.moving ? 0.5 : 0)
    const L = limbs.current
    if (L) {
      if (L.ll) L.ll.rotation.x = swing
      if (L.rl) L.rl.rotation.x = -swing
      if (L.la) L.la.rotation.x = -swing * 0.6
      if (L.ra) L.ra.rotation.x = swing * 0.6
    }
    if (prop.current) {
      const on = !!a.prop
      prop.current.visible = on
      if (on) prop.current.material.color.set(PROP_COLOR[a.prop] || '#ffffff')
    }
  })

  const a0 = stage.actors[id]
  return (
    <group ref={root} position={[a0.x, 0, a0.z]}>
      <CharacterMesh ref={mesh} avatar={avatar} />
      <mesh ref={prop} position={[0.42, 1.05, 0.25]} visible={false} castShadow>
        <boxGeometry args={[0.22, 0.3, 0.22]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <Billboard position={[0, 2.55, 0]}>
        <mesh>
          <planeGeometry args={[1.5, 0.47]} />
          <meshBasicMaterial map={tex} transparent toneMapped={false} />
        </mesh>
      </Billboard>
    </group>
  )
}

const EMOTE_POOL = 22
function EmoteField() {
  const { camera } = useThree()
  const refs = useRef([])
  const lastSym = useRef([])
  useFrame((_, dRaw) => {
    const d = Math.min(dRaw, 0.05)
    const em = stage.emotes
    for (let i = em.length - 1; i >= 0; i--) { em[i].t += d; if (em[i].t > em[i].dur) em.splice(i, 1) }
    for (let i = 0; i < EMOTE_POOL; i++) {
      const s = refs.current[i]; if (!s) continue
      const e = em[i]
      if (!e || e.t < 0) { s.visible = false; continue }
      const src = e.actor === 'player' ? playerPos : stage.actors[e.actor]
      if (!src) { s.visible = false; continue }
      const p = Math.min(1, e.t / e.dur)
      s.visible = true
      s.position.set(src.x + e.dx, 2.2 + p * 1.25, src.z)
      s.scale.setScalar(0.55 * (1 - p * 0.18))
      s.material.opacity = p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85
      s.quaternion.copy(camera.quaternion)
      if (lastSym.current[i] !== e.symbol) { s.material.map = emojiTexture(e.symbol); s.material.needsUpdate = true; lastSym.current[i] = e.symbol }
    }
  })
  return (
    <>
      {Array.from({ length: EMOTE_POOL }).map((_, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} visible={false}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial transparent toneMapped={false} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}

// R9 Part 6: SPEECH BUBBLES over acting NPCs - the tiny in-animation pop-up.
const BUBBLE_POOL = 4
function BubbleLayer() {
  const { camera } = useThree()
  const refs = useRef([])
  const lastText = useRef([])
  useFrame((_, dRaw) => {
    const d = Math.min(dRaw, 0.05)
    const bl = stage.bubbles
    for (let i = bl.length - 1; i >= 0; i--) { bl[i].t += d; if (bl[i].t > bl[i].dur) bl.splice(i, 1) }
    for (let i = 0; i < BUBBLE_POOL; i++) {
      const m = refs.current[i]; if (!m) continue
      const b = bl[i]
      if (!b) { m.visible = false; continue }
      let src = b.actor === 'player' ? playerPos : stage.actors[b.actor]
      if (!src && b.actor.startsWith('amb-')) {
        const amb = AMBIENT_NPCS.find((n) => n.id === b.actor)
        if (amb) src = { x: amb.pos[0], z: amb.pos[1] }
      }
      if (!src) { m.visible = false; continue }
      const p = Math.min(1, b.t / b.dur)
      m.visible = true
      m.position.set(src.x, 3.15 + Math.sin(b.t * 2.2) * 0.06, src.z)
      m.material.opacity = p < 0.08 ? p / 0.08 : p > 0.85 ? (1 - p) / 0.15 : 1
      m.quaternion.copy(camera.quaternion)
      if (lastText.current[i] !== b.text) {
        m.material.map = cardTexture(b.text, null, { accent: '#1464F0' })
        m.material.needsUpdate = true
        lastText.current[i] = b.text
        const w = Math.min(4.6, 1.6 + b.text.length * 0.075)
        m.scale.set(w, w * 0.345, 1)
      }
    }
  })
  return (
    <>
      {Array.from({ length: BUBBLE_POOL }).map((_, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} visible={false} renderOrder={30}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial transparent toneMapped={false} depthWrite={false} depthTest={false} />
        </mesh>
      ))}
    </>
  )
}

const SPARK_POOL = 30
function SparkleField() {
  const { camera } = useThree()
  const refs = useRef([])
  useFrame((_, dRaw) => {
    const d = Math.min(dRaw, 0.05)
    const sp = stage.sparkles
    for (let i = sp.length - 1; i >= 0; i--) { sp[i].t += d; if (sp[i].t > sp[i].dur) sp.splice(i, 1) }
    for (let i = 0; i < SPARK_POOL; i++) {
      const s = refs.current[i]; if (!s) continue
      const e = sp[i]
      if (!e || e.t < 0) { s.visible = false; continue }
      const p = Math.min(1, e.t / e.dur)
      const rad = 0.15 + p * 0.55
      s.visible = true
      s.position.set(e.x + Math.cos(e.a) * rad, e.y + p * 1.1, e.z + Math.sin(e.a) * rad)
      s.scale.setScalar(Math.max(0.001, (1 - p) * 0.17))
      s.material.opacity = 1 - p
      s.quaternion.copy(camera.quaternion)
    }
  })
  return (
    <>
      {Array.from({ length: SPARK_POOL }).map((_, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} visible={false}>
          <circleGeometry args={[1, 5]} />
          <meshBasicMaterial color="#FFD54A" transparent toneMapped={false} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}

function ToyProp() {
  const ref = useRef()
  useFrame((_, dRaw) => {
    const d = Math.min(dRaw, 0.05)
    const toy = stage.toy
    const m = ref.current
    if (!m) return
    if (!toy.visible) { m.visible = false; return }
    m.visible = true
    toy.t += d
    const p = Math.min(1, toy.t / toy.dur)
    const x = toy.fx + (toy.tx - toy.fx) * p
    const z = toy.fz + (toy.tz - toy.fz) * p
    const y = toy.fy + (toy.ty - toy.fy) * p + Math.sin(p * Math.PI) * 1.25
    m.position.set(x, y, z)
    m.scale.setScalar(0.28)
    m.rotation.y += d * 6
  })
  return (
    <mesh ref={ref} visible={false} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#8b5a2b" emissive="#c88a4a" emissiveIntensity={0.35} roughness={0.5} />
    </mesh>
  )
}

function Ticker() {
  // v9 FIX B: the scenarioLocked WATCHDOG. If input has been locked for ~7s
  // with NO timeline running, something died mid-sequence - force-release so
  // a single failure can never permanently freeze a child.
  const stuckSince = useRef(null)
  useFrame((_, dRaw) => {
    // v9 FIX C: a timeline error can never kill the render loop
    try { tickTimelines(Math.min(dRaw, 0.05)) } catch (e) { console.error('[tayu] tick error', e) }
    try {
      const st = useGame.getState()
      if (st.scenarioLocked && activeTimelines() === 0) {
        if (stuckSince.current === null) stuckSince.current = performance.now()
        else if (performance.now() - stuckSince.current > 7000) {
          stuckSince.current = null
          console.error('[tayu] watchdog: scenarioLocked stuck with no timeline - force releasing')
          useGame.setState({ scenarioLocked: false, near: null })
        }
      } else {
        stuckSince.current = null
      }
    } catch (e) { console.error('[tayu] watchdog error', e) }
  })
  return null
}

// F3 - the ambient action scheduler: no NPC ever stands frozen. Each idle
// actor holds an activity for 4-10s, then transitions (weighted, unsynced):
// wander, two dance loops, chat pairs, plus role work - Bram restocks his
// shelves, Mr. Sprout waters her garden plants.
// R9: the patrol IS the ring road - Milo walks the loop clockwise, Nea
// counter-clockwise, so the two-way street reads two-way.
const PATROL = RING_POINTS.filter((_, i) => i % 2 === 0)

const AMBIENT_ROLES = {
  // E7: Mr. Bram stays AT his counter - scan, register, bag, restock, all
  // within arm's reach. No pacing across the store.
  bram: [{ act: 'work', to: [0.7, -0.3] }, { act: 'work', to: [-0.7, -0.3] }, { act: 'work', to: [0, 0.5] }, { act: 'work', to: [0.3, -0.6] }],
  // Mr. Sprout stationed at the garden, counting stock at the near beds
  sprout: [{ act: 'work', to: [1.2, -0.6] }, { act: 'work', to: [-1, 0.4] }, { act: 'work', to: [0.6, 0.8] }],
  wanderer: [{ act: 'patrol' }],
  nea: [{ act: 'patrol', reverse: true }],
  scoop: [{ act: 'play' }],
  // the Budget Keeper works her board; Banker Bea stamps, stacks, polishes
  keeper: [{ act: 'work', to: [0.8, -0.4] }, { act: 'work', to: [-0.8, -0.2] }, { act: 'work', to: [0, 0.6] }],
  bea: [{ act: 'work', to: [0.6, -0.3] }, { act: 'work', to: [-0.6, -0.3] }, { act: 'work', to: [0, 0.5] }],
  teller: [{ act: 'work', to: [0.5, -0.3] }, { act: 'work', to: [-0.5, 0.2] }, { act: 'work', to: [0, 0.4] }],
  clerk: [{ act: 'work', to: [0.5, 0.3] }, { act: 'work', to: [-0.4, -0.2] }],
  mailer: [{ act: 'work', to: [0.4, 0.3] }],
  scammer: [{ act: 'work', to: [0.4, -0.3] }],
  helper: [{ act: 'work', to: [-0.4, 0.3] }],
  penny: [{ act: 'chat', partner: 'theo' }, { act: 'dance1' }, { act: 'wander' }, { act: 'dance2' }],
  theo: [{ act: 'chat', partner: 'mia' }, { act: 'dance2' }, { act: 'wander' }, { act: 'dance1' }],
  mia: [{ act: 'dance1' }, { act: 'wander' }, { act: 'chat', partner: 'penny' }, { act: 'dance2' }],
}

function AmbientScheduler() {
  const timers = useRef({})
  useFrame((_, dRaw) => {
    const d = Math.min(dRaw, 0.05)
    const st = useGame.getState()
    if (st.scenarioLocked) return // scenes own the stage; resume after
    for (const id of Object.keys(stage.actors)) {
      const a = stage.actors[id]
      const T = (timers.current[id] = timers.current[id] || { t: 1 + Math.random() * 4, i: (Math.random() * 4) | 0 })
      // graceful interrupt: skip anyone mid-walk or the player's current talk target
      if (a.moving) continue
      if (st.near && st.near.id === 'sprout' && id === 'sprout') { a.pose = 'idle'; continue }
      T.t -= d
      if (T.t > 0) continue
      T.t = 4 + Math.random() * 6 // hold the next action 4-10s
      const pool = AMBIENT_ROLES[id] || [{ act: 'wander' }, { act: 'dance1' }]
      const pick = pool[T.i++ % pool.length]
      if (pick.act === 'patrol') {
        // the town loop; Nea walks it the other way so the two never twin
        a.wp = (a.wp ?? (pick.reverse ? PATROL.length - 1 : 0) + PATROL.length) % PATROL.length
        const [px2, pz2] = PATROL[a.wp]
        a.wp = (a.wp + (pick.reverse ? -1 : 1) + PATROL.length) % PATROL.length
        if (Math.random() < 0.15) { a.pose = 'dance2'; T.t = 2 } // brief pause/wave beat
        else { a.pose = 'idle'; npcWalkToAmbient(a, [px2, pz2]) ; T.t = 1 }
      } else if (pick.act === 'play') {
        // E6: Scoop PLAYS - he chases his bouncing ball wherever it settles
        const ball = stage.scoopBall || (stage.scoopBall = { x: a.homeX + 2, z: a.homeZ, t: 0 })
        ball.x = a.homeX + (Math.random() * 6 - 3)
        ball.z = a.homeZ + (Math.random() * 6 - 3)
        ball.t = 0
        a.pose = 'idle'
        npcWalkToAmbient(a, [ball.x + 0.6, ball.z])
        T.t = 2.5
      } else if (pick.act === 'wander') {
        const wx = a.homeX + (Math.random() * 4 - 2)
        const wz = a.homeZ + (Math.random() * 4 - 2)
        a.pose = 'idle'
        npcWalkToAmbient(a, [wx, wz])
      } else if (pick.act === 'work' && pick.to) {
        a.pose = 'idle'
        npcWalkToAmbient(a, [a.homeX + pick.to[0], a.homeZ + pick.to[1]], true)
      } else if (pick.act === 'chat' && pick.partner) {
        const p = stage.actors[pick.partner]
        if (p && !p.moving) {
          a.pose = 'chat'; p.pose = 'chat'
          a.rotY = Math.atan2(p.x - a.x, p.z - a.z)
          p.rotY = Math.atan2(a.x - p.x, a.z - p.z)
        } else a.pose = 'dance1'
      } else {
        a.pose = pick.act // dance1 / dance2
      }
    }
  })
  return null
}

// small helper: walk out and drift home after, without fighting scene walks
function npcWalkToAmbient(a, [tx, tz], thenHome = false) {
  a.tx = tx; a.tz = tz; a.moving = true
  a.onArrive = () => {
    a.moving = false
    if (thenHome) setTimeout(() => { if (!a.moving) { a.tx = a.homeX; a.tz = a.homeZ; a.moving = true; a.onArrive = () => { a.moving = false } } }, 1600)
  }
}

// E6: the ball Scoop plays with - always bouncing, drifting where he kicks it
function ScoopBall() {
  const ref = useRef()
  useFrame((_, d) => {
    const b = stage.scoopBall
    if (!b || !ref.current) return
    b.t += d
    ref.current.position.set(b.x, 0.28 + Math.abs(Math.sin(b.t * 5)) * 0.55, b.z)
  })
  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.26, 14, 14]} />
      <meshStandardMaterial color="#e23b3b" roughness={0.4} />
    </mesh>
  )
}

export function ConsequenceStage() {
  const week = useGame((s) => s.week)
  return (
    <group>
      {NPCS.map((n) => {
        // E9: the Module 2 host tends the stand in an apron-and-visor look
        if (n.id === 'penny' && week === 2) {
          return <StageNpc key={n.id} {...n} avatar={{ ...n.avatar, accessories: [...(n.avatar.accessories || []), 'hat'], shirtColor: 'yellow' }} />
        }
        return <StageNpc key={n.id} {...n} />
      })}
      <ScoopBall />
      <ToyProp />
      <EmoteField />
      <SparkleField />
      <BubbleLayer />
      <Ticker />
      <AmbientScheduler />
    </group>
  )
}
