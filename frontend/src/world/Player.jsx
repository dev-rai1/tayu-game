import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CharacterMesh } from './CharacterMesh.jsx'
import { useKeyboardControls } from './useKeyboardControls.js'
import { useGame, playerPos, joystick, moveTarget } from './store.js'
import { cameraRig, rotateCamera, pitchCamera, zoomCamera } from './cameraRig.js'
import {
  MAILBOX, JARS, STORE, STORE_ITEMS, SHOPKEEPER, BLOCKERS, BOUNDS,
  INTERACT_RADIUS, JAR_RADIUS, ITEM_RADIUS, NPC_RADIUS, LEMONADE, SPROUT, PARTY_HOUSE, AMBIENT_NPCS } from './config.js'
import { getObjectiveTarget } from './objective.js'
import { NPC_HOME, stage } from '../anim/stage.js'

// panels that pause the world while open (any DOM decision surface)
const LEM_PANEL_PHASES = ['recap', 'supplies', 'pool', 'template', 'recapCard', 'results', 'goalCard', 'tipCard']
export const isFrozen = (st) =>
  !!st.panelJar || !!st.panelItem || !!st.dialog || st.weekComplete || st.scenarioLocked ||
  st.lessons.some((l) => !l.soft) || LEM_PANEL_PHASES.includes(st.lemPhase) ||
  st.cards.length > 0 || (st.week === 5 && st.mgPhase === 'summary') || st.panelPortfolio ||
  st.btPanel !== null || st.bkPanel !== null ||
  // R12 1.1: the garden's panel phases only freeze movement IN the garden -
  // a stale mg.phase from an earlier session must never trap the player in
  // Budget Town (the walk-to-the-House module) or anywhere else
  (st.week === 5 && ['choices', 'slider'].includes(st.mg?.phase || '')) || st.helpOpen

const WALK_SPEED = 6
const TURN_SPEED = 9
const GROUND = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
const LOOK_SENS = 0.006 // radians per px of horizontal drag
const KEY_ROT = 1.6 // radians/sec for comma/period keyboard rotate

const dist2 = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz)

// The mini drag-pad lives in the bottom-left 64px corner (MobileControls, v7).
// Any pointer that starts there is movement, never camera-look.
const inJoystick = (e) => e.clientX < 96 && e.clientY > window.innerHeight - 96

function collide(x, z) {
  for (const b of BLOCKERS) {
    const d = dist2(x, z, b.x, b.z)
    const min = b.r + 0.5
    if (d < min && d > 0.0001) {
      const nx = (x - b.x) / d, nz = (z - b.z) / d
      x = b.x + nx * min
      z = b.z + nz * min
    }
  }
  x = THREE.MathUtils.clamp(x, BOUNDS.xMin, BOUNDS.xMax)
  z = THREE.MathUtils.clamp(z, BOUNDS.zMin, BOUNDS.zMax)
  return [x, z]
}

// Mr. Bram's dialog - clean, emoji-free (C5). Talking to him UNLOCKS shopping.
// G1: needs-vs-wants DISCOVERY - Mr. Bram teaches the concept, never the basket.
const SHOP_LINES_INTRO = [
  "Welcome to the MARKET! I'm Mr. Bram.",
  'Prioritize your needs first. It is okay to enjoy a want too!',
  'Explore the store and choose what feels right, then head to checkout.',
]
const SHOP_LINES_REMIND = ['Needs first, then a want if you can afford it. The checkout mat is waiting!']

// E9: one host per module, strictly ordered. Talking to a future host gets a
// friendly locked line; the CURRENT host always re-explains the step.
const HOST_MODULE = { bram: 1, penny: 2, keeper: 3, bea: 4, sprout: 5 }
const NPC_NAME = { theo: 'Theo', mia: 'Mia', scoop: 'Scoop', wanderer: 'Milo', nea: 'Nea', teller: 'Teller Tom', clerk: 'Clerk Cleo', mailer: 'Postal Pat', helper: 'Helper Hana', scammer: 'Sneaky Sam' }
const HOST_LABEL = { bram: 'Talk to Mr. Bram', penny: 'Talk to Penny', sprout: 'Talk to Mr. Sprout', keeper: 'Talk to the Budget Keeper', bea: 'Talk to Banker Bea' }
const LOCKED_LINES = {
  penny: 'Penny: "Not right now - finish the Tayu Market first, then come see me at the stand!"',
  sprout: 'Mr. Sprout: "Not right now - finish the Bank of TAYU first, then come grow your money with me!"',
  keeper: 'The Budget Keeper: "Not right now - finish the Lemonade Stand first, then come visit Budget Town!"',
  bea: 'Banker Bea: "Not right now - finish Budget Town first, then come see me at the bank!"',
}
const DONE_LINES = {
  bram: 'Mr. Bram: "Come back for a healthy snack anytime, champ!"',
  penny: 'Penny: "I knew you could do it! Keep going!"',
  sprout: 'Mr. Sprout: "The garden remembers you, gardener. Keep growing!"',
  keeper: 'Mayor Penny-Wise: "Your budget still looks great, Budget Boss!"',
}

export function Player({ avatar }) {
  const { camera, gl } = useThree()
  const root = useRef()
  const mesh = useRef()
  const keysRef = useKeyboardControls()
  const walk = useRef(0)
  const t = useRef(0)
  const limbs = useRef(null)
  const ray = useRef(new THREE.Raycaster())
  const rotKey = useRef(0) // -1 left, +1 right (comma/period held)

  const setNear = useGame((s) => s.setNear)

  const week = useGame((s) => s.week)

  useEffect(() => {
    if (!mesh.current) return
    limbs.current = {
      ll: mesh.current.getObjectByName('leftLeg'), rl: mesh.current.getObjectByName('rightLeg'),
      la: mesh.current.getObjectByName('leftArm'), ra: mesh.current.getObjectByName('rightArm'),
    }
  }, [avatar])

  // Spawn facing the direction of travel (Master Adjustment B2): orient the
  // avatar toward the first objective so "go this way" is instantly intuitive.
  useEffect(() => {
    const target = getObjectiveTarget(useGame.getState())
    if (target && mesh.current) {
      mesh.current.rotation.y = Math.atan2(target[0] - playerPos.x, target[1] - playerPos.z)
    }
  }, [avatar, week])

  // ★ CAMERA & INPUT OVERHAUL (Round 3, Part D) ★
  //  D1: same-direction look - drag right = look RIGHT, drag up = look UP.
  //  D2: camera lives on the RIGHT mouse button (Roblox-style): hold+drag for
  //      any duration; context menu suppressed. LEFT never touches the camera.
  //  D3: on touch, TWO-finger drag rotates the view; one finger stays
  //      tap-to-move / interaction.
  //  Left click remains a tap: raycast the ground -> click-to-move.
  useEffect(() => {
    const el = gl.domElement
    el.style.touchAction = 'none' // stop touch-drag from scrolling the page
    let rmb = false // right-mouse camera drag active
    let lastX = 0, lastY = 0
    let tapStart = null // { id, x, y } for left/touch tap detection
    const touches = new Map() // active touch pointers: id -> {x, y}

    const onContextMenu = (e) => e.preventDefault() // clean right-hold-drag (D2)

    const onDown = (e) => {
      if (inJoystick(e)) return // belongs to the movement pad
      if (e.pointerType === 'mouse') {
        if (e.button === 2) { rmb = true; lastX = e.clientX; lastY = e.clientY }
        else if (e.button === 0) tapStart = { id: e.pointerId, x: e.clientX, y: e.clientY }
      } else {
        touches.set(e.pointerId, { x: e.clientX, y: e.clientY })
        if (touches.size === 1) tapStart = { id: e.pointerId, x: e.clientX, y: e.clientY }
        else tapStart = null // a second finger means camera, never a tap
      }
    }

    let pinchDist = null
    const onMove = (e) => {
      if (e.pointerType === 'mouse') {
        if (!rmb) return
        const dx = e.clientX - lastX, dy = e.clientY - lastY
        lastX = e.clientX; lastY = e.clientY
        rotateCamera(dx * LOOK_SENS) // + = look right (D1)
        pitchCamera(dy * LOOK_SENS * 0.6) // drag up = look up
        return
      }
      if (!touches.has(e.pointerId)) return
      const prev = touches.get(e.pointerId)
      const dx = e.clientX - prev.x, dy = e.clientY - prev.y
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (touches.size === 2) {
        // two fingers: rotate together + kid-safe pinch zoom (v8 1.4)
        const pts = [...touches.values()]
        const gap = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
        if (pinchDist !== null) zoomCamera((pinchDist - gap) * 0.02)
        pinchDist = gap
        rotateCamera((dx / 2) * LOOK_SENS * 1.4)
        pitchCamera((dy / 2) * LOOK_SENS * 0.8)
      } else if (touches.size === 1) {
        // ONE-finger drag on the world looks around (v8 1.4); once the drag
        // is clearly a drag, it stops being a tap
        if (tapStart && tapStart.id === e.pointerId) {
          if (Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) > 10) tapStart = null
        }
        if (!tapStart) {
          rotateCamera(dx * LOOK_SENS * 1.1)
          pitchCamera(dy * LOOK_SENS * 0.6)
        }
      }
    }

    const onUp = (e) => {
      if (e.pointerType === 'mouse' && e.button === 2) { rmb = false; return }
      if (e.pointerType !== 'mouse') { touches.delete(e.pointerId); if (touches.size < 2) pinchDist = null }
      // tap-to-move: a LEFT click / single-finger tap that barely moved
      if (!tapStart || tapStart.id !== e.pointerId) return
      const totalMoved = Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y)
      tapStart = null
      if (totalMoved > 8) return
      groundTap(e.clientX, e.clientY)
    }
    // tap-to-move raycast, shared by canvas taps and the stick zone's quick taps
    const groundTap = (clientX, clientY) => {
      const s = useGame.getState()
      if (isFrozen(s)) return
      const rect = el.getBoundingClientRect()
      const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1)
      ray.current.setFromCamera(ndc, camera)
      const hit = new THREE.Vector3()
      if (ray.current.ray.intersectPlane(GROUND, hit)) {
        const cx = THREE.MathUtils.clamp(hit.x, BOUNDS.xMin, BOUNDS.xMax)
        const cz = THREE.MathUtils.clamp(hit.z, BOUNDS.zMin, BOUNDS.zMax)
        moveTarget.x = cx; moveTarget.z = cz
        useGame.getState().setClickMarker({ x: cx, z: cz, t: 0 })
      }
    }
    const onZoneTap = (e) => groundTap(e.detail.x, e.detail.y)
    const onCancel = (e) => {
      if (e.pointerType !== 'mouse') { touches.delete(e.pointerId); if (touches.size < 2) pinchDist = null }
      if (tapStart && tapStart.id === e.pointerId) tapStart = null
    }

    el.addEventListener('contextmenu', onContextMenu)
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    window.addEventListener('tayu-ground-tap', onZoneTap)
    return () => {
      el.removeEventListener('contextmenu', onContextMenu)
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      window.removeEventListener('tayu-ground-tap', onZoneTap)
    }
  }, [camera, gl])

  // Interact (E) + keyboard camera rotate (comma / period).
  useEffect(() => {
    const doInteract = () => {
      const st = useGame.getState()
      if (st.dialog) { st.advanceDialog(); return }
      if (st.lessons.length > 0) { st.dismissLesson(); return }
      const near = st.near
      if (!near) return
      if (near.id === 'mailbox') st.openMailbox()
      else if (near.id.startsWith('jar:')) st.openPanel(near.id.split(':')[1])
      else if (near.id === 'shopkeeper') st.openDialog(SHOPKEEPER.name, st.bramTalked ? SHOP_LINES_REMIND : SHOP_LINES_INTRO, () => st.setBramTalked())
      else if (near.id === 'checkout') st.confirmCheckout()
      else if (near.id === 'stand') st.standIntro()
      else if (near.id === 'supplies') st.openSupplies()
      else if (near.id === 'stand2') st.openTemplate()
      else if (near.id === 'sprout') st.enterGarden()
      else if (near.id === 'party') {
        if (st.gameComplete) useGame.setState({ enterParty: true })
        else st.setToast('LOCKED! Finish the whole game first - a surprise is waiting.')
      }
      else if (near.id.startsWith('host:')) {
        const host = near.id.split(':')[1]
        const mod = HOST_MODULE[host]
        if (mod > st.week) { st.setToast(LOCKED_LINES[host]); return }
        if (mod < st.week) { st.setToast(DONE_LINES[host] || 'Hello again, friend!'); return }
        // the CURRENT host re-explains the step with a hint (the host rule)
        if (host === 'penny') {
          if (st.lemPhase === 'toMarket') st.showLesson('Buy supplies from Mr. Bram - follow your arrow to the market!')
          else st.showLesson('Set up your stand: pick your hours, your pay, and your price. Tap "How do I pick?" to re-read the price formula!')
        } else if (host === 'keeper') st.enterBudget()
        else if (host === 'bea') st.enterBank()
      }
      else if (near.id.startsWith('item:')) { const it = STORE_ITEMS.find((i) => i.id === near.id.split(':')[1]); if (it) st.openItem(it) }
      else if (near.id.startsWith('npc:')) st.npcChat(near.id.split(':')[1])
    }
    const onKey = (e) => {
      if (e.code === 'KeyE') doInteract()
      else if (e.code === 'Comma') rotKey.current = -1
      else if (e.code === 'Period') rotKey.current = 1
    }
    const onKeyUp = (e) => { if (e.code === 'Comma' || e.code === 'Period') rotKey.current = 0 }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('tayu-interact', doInteract)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('tayu-interact', doInteract)
    }
  }, [])

  useFrame((_, dRaw) => {
    const delta = Math.min(dRaw, 0.05)
    t.current += delta
    const k = keysRef.current
    // E1: arrow keys look around (left/right rotate the camera)
    if (k.lookLeft) rotateCamera(-KEY_ROT * delta)
    if (k.lookRight) rotateCamera(KEY_ROT * delta)
    const st = useGame.getState()
    const frozen = isFrozen(st)

    // keyboard camera rotate
    if (rotKey.current) rotateCamera(rotKey.current * KEY_ROT * delta)
    const az = cameraRig.azimuth
    const cos = Math.cos(az), sin = Math.sin(az)

    // --- build raw stick vector: rx = screen-right, rz = screen-forward (up) ---
    let rx = 0, rz = 0
    const speedMult = st.playerSpeedMult ?? 1
    const manual = k.forward || k.backward || k.left || k.right || Math.abs(joystick.x) > 0.05 || Math.abs(joystick.y) > 0.05
    if (!frozen) {
      if (manual) {
        moveTarget.x = null // manual input cancels click-to-move
        if (k.forward) rz += 1
        if (k.backward) rz -= 1
        if (k.right) rx += 1
        if (k.left) rx -= 1
        rx += joystick.x
        rz += joystick.y // joystick up (+y) = forward
      } else if (moveTarget.x != null) {
        // click-to-move: head toward the world point in WORLD space, then convert
        // into the camera frame so the same rotation math drives it.
        const dx = moveTarget.x - playerPos.x, dz = moveTarget.z - playerPos.z
        if (Math.hypot(dx, dz) < 0.3) { moveTarget.x = null }
        else {
          // inverse-rotate world dir into stick frame so the shared mapping applies
          rx = dx * cos - dz * sin
          rz = dx * -sin - dz * cos // solve V=stick→world for the stick components
          const m = Math.hypot(rx, rz) || 1
          rx /= m; rz /= m
        }
      }
    }

    // --- camera-relative world velocity ---
    // R (screen-right) = (cos, -sin), F (forward/into-scene) = (-sin, -cos)
    const wx = rx * cos - rz * sin
    const wz = -rx * sin - rz * cos
    const len = Math.hypot(wx, wz)
    const moving = len > 0.08

    if (moving) {
      const nx = (wx / len) * WALK_SPEED * speedMult * delta
      const nz = (wz / len) * WALK_SPEED * speedMult * delta
      const [cx, cz] = collide(playerPos.x + nx, playerPos.z + nz)
      playerPos.x = cx; playerPos.z = cz
      const angle = Math.atan2(wx, wz)
      if (mesh.current) {
        let diff = angle - mesh.current.rotation.y
        diff = Math.atan2(Math.sin(diff), Math.cos(diff))
        mesh.current.rotation.y += diff * Math.min(1, TURN_SPEED * delta)
      }
      walk.current += delta * 9 * speedMult
    } else {
      walk.current = THREE.MathUtils.lerp(walk.current % (Math.PI * 2), 0, 0.2)
    }

    // walk-cycle limbs + idle bob
    const swing = Math.sin(walk.current) * (moving ? 0.55 : 0)
    const L = limbs.current
    if (L) {
      if (L.ll) L.ll.rotation.x = swing
      if (L.rl) L.rl.rotation.x = -swing
      if (L.la) L.la.rotation.x = -swing * 0.6
      if (L.ra) L.ra.rotation.x = swing * 0.6
    }
    let bobY = moving ? Math.abs(Math.sin(walk.current)) * 0.05 : Math.sin(t.current * 1.6) * 0.015 + 0.005
    // pose (store day-outcome scenes) overrides idle/walk posture
    const pose = st.playerPose
    if (mesh.current) {
      const m = mesh.current
      const lerp = (a, b) => THREE.MathUtils.lerp(a, b, Math.min(1, 10 * delta))
      if (pose === 'spin') { m.rotation.y += 9 * delta; m.rotation.x = lerp(m.rotation.x, 0, 1) }
      else if (pose === 'droop') { m.rotation.x = lerp(m.rotation.x, 0.32, 1) }
      else if (pose === 'sit') { m.rotation.x = lerp(m.rotation.x, 0.18, 1); bobY -= 0.35 }
      else if (pose === 'flop') { m.rotation.x = lerp(m.rotation.x, -1.25, 1); bobY -= 0.5 }
      else { m.rotation.x = lerp(m.rotation.x, 0, 1) }
      m.position.y = lerp(m.position.y, bobY, 1)
    }
    if (root.current) root.current.position.set(playerPos.x, 0, playerPos.z)

    // R10 v8 1.4: gentle auto-follow - if the child has not steered the
    // camera for 3 seconds and is walking, drift the view behind them
    if (moving && Date.now() - (cameraRig.lastLook || 0) > 3000) {
      const want = Math.atan2(wx ?? 0, wz ?? 0) + Math.PI
      let diff = want - cameraRig.azimuth
      diff = Math.atan2(Math.sin(diff), Math.cos(diff))
      if (Math.abs(diff) > 0.05) cameraRig.azimuth += diff * Math.min(1, 0.8 * delta)
    }
    // --- orbit follow camera (azimuth from cameraRig) ---
    const ox = Math.sin(az) * cameraRig.dist
    const oz = Math.cos(az) * cameraRig.dist
    camera.position.lerp(new THREE.Vector3(playerPos.x + ox, cameraRig.height, playerPos.z + oz), 0.12)
    camera.lookAt(playerPos.x, 1.2, playerPos.z)

    // --- nearest active interactable ---
    let near = null
    // Part J: the party house door - always discoverable, locked until earned
    {
      const dDoor = dist2(playerPos.x, playerPos.z, PARTY_HOUSE[0], PARTY_HOUSE[1] - 2.6)
      if (dDoor < 3.4) near = { id: 'party', label: st.gameComplete ? 'Enter the FINALE!' : 'Finale Area - finish the journey first!' }
    }
    if (!st.weekComplete && !st.scenarioLocked) {
      if (st.objective === 'sprout' && st.mg) {
        // Week 3: the Money Garden is card-driven - the ONLY world interaction
        // is talking to Mr. Sprout (always interactable: the continue-bug fix, G3).
        if (st.mgPhase === 'toGarden' || st.mgPhase === 'rounds') {
          const [sx, sz] = NPC_HOME.sprout
          if (dist2(playerPos.x, playerPos.z, sx, sz) < 3.2) near = { id: 'sprout', label: 'Talk to Mr. Sprout' }
        }
      } else if (st.objective === 'lemonade') {
        // Week 2: the stand and the supply run to the market
        const dStand = dist2(playerPos.x, playerPos.z, LEMONADE[0], LEMONADE[1])
        if (st.lemPhase === 'toStand' && dStand < INTERACT_RADIUS + 0.4) near = { id: 'stand', label: 'Open your Lemonade Stand' }
        else if (st.lemPhase === 'toStand2' && dStand < INTERACT_RADIUS + 0.4) near = { id: 'stand2', label: 'Set up: costs + price' }
        else if (st.lemPhase === 'toMarket') {
          const skx = STORE[0] + SHOPKEEPER.pos[0], skz = STORE[1] + SHOPKEEPER.pos[1]
          if (dist2(playerPos.x, playerPos.z, skx, skz) < NPC_RADIUS + 1.2) near = { id: 'supplies', label: 'Buy lemonade supplies' }
        }
      } else if (st.objective === 'mailbox' && !st.mailboxOpened) {
        if (dist2(playerPos.x, playerPos.z, MAILBOX[0], MAILBOX[1]) < INTERACT_RADIUS) near = { id: 'mailbox', label: 'Collect Allowance' }
      } else if (st.objective === 'kitchen') {
        let best = Infinity
        for (const [jar, pos] of Object.entries(JARS)) {
          const d = dist2(playerPos.x, playerPos.z, pos[0], pos[1])
          if (d < JAR_RADIUS && d < best) { best = d; near = { id: `jar:${jar}`, label: `Add money to ${jar.toUpperCase()} jar` } }
        }
      } else if (st.objective === 'store') {
        let best = Infinity
        const skx = STORE[0] + SHOPKEEPER.pos[0], skz = STORE[1] + SHOPKEEPER.pos[1]
        const dSk = dist2(playerPos.x, playerPos.z, skx, skz)
        if (dSk < NPC_RADIUS + (st.bramTalked ? 0 : 1)) { best = dSk; near = { id: 'shopkeeper', label: `Talk to ${SHOPKEEPER.name}` } }
        // HARD GATE (C3): no buying or checkout until the Mr. Bram talk is done
        if (st.bramTalked) {
          const ckx = STORE[0] + 0, ckz = STORE[1] + 4.2
          const dCk = dist2(playerPos.x, playerPos.z, ckx, ckz)
          if (st.bought.length > 0 && dCk < INTERACT_RADIUS && dCk < best) { best = dCk; near = { id: 'checkout', label: `Checkout (${st.bought.length} in basket)` } }
          for (const it of STORE_ITEMS) {
            if (st.bought.includes(it.id)) continue
            const wx2 = STORE[0] + it.pos[0], wz2 = STORE[1] + it.pos[1]
            const d = dist2(playerPos.x, playerPos.z, wx2, wz2)
            if (d < ITEM_RADIUS && d < best) { best = d; near = { id: `item:${it.id}`, label: `Buy ${it.name} ($${it.price})` } }
          }
        }
      }
    }
    // R9 Part 8.2: crossing into the Finale Area triggers the town party
    if (st.gameComplete && dist2(playerPos.x, playerPos.z, PARTY_HOUSE[0], PARTY_HOUSE[1]) < 12) st.finaleCelebrate()
    // E9: host proximity - every host is approachable in EVERY module (locked
    // ones answer with their friendly not-yet line)
    if (!near) {
      for (const hid of ['penny', 'sprout', 'keeper', 'bea']) {
        if (hid === 'sprout' && st.week === 3) continue // week 3 uses the garden flow
        const a = stage.actors[hid]
        if (a && dist2(playerPos.x, playerPos.z, a.x, a.z) < NPC_RADIUS) {
          near = { id: `host:${hid}`, label: HOST_LABEL[hid] }
          break
        }
      }
    }
    // R9 Part 7: EVERY townsperson is talkable - stage cast and park folk
    if (!near) {
      for (const id of Object.keys(stage.actors)) {
        if (['penny', 'sprout', 'keeper', 'bea', 'bram'].includes(id)) continue // hosts have their own flows
        const a = stage.actors[id]
        if (a && dist2(playerPos.x, playerPos.z, a.x, a.z) < NPC_RADIUS) {
          near = { id: `npc:${id}`, label: `Talk to ${NPC_NAME[id] || 'a friend'}` }
          break
        }
      }
    }
    if (!near) {
      for (const amb of AMBIENT_NPCS) {
        if (dist2(playerPos.x, playerPos.z, amb.pos[0], amb.pos[1]) < NPC_RADIUS) {
          near = { id: `npc:${amb.id}`, label: `Talk to ${amb.name}` }
          break
        }
      }
    }
    setNear(near)
  })

  return (
    <group ref={root} position={[0, 0, 0]}>
      <CharacterMesh ref={mesh} avatar={avatar} />
    </group>
  )
}
