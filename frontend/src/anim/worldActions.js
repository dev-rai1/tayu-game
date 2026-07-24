// The animation VOCABULARY (Section 2.3 / 3.3). Every consequence scene is built
// from these helpers - implemented ONCE, reused by both loops (Rule 5). They
// mutate `stage` (for 3D actors/props) and call the game store (for HUD/tint/
// wallet/guide). Called from timeline beats, never directly on a timer.
import { stage } from './stage.js'
import { useGame } from '../world/store.js'
import { playerPos } from '../world/store.js'

const g = () => useGame.getState()

// ---- NPC motion + emotes ----
export function placeNpc(id, xz) { const a = stage.actors[id]; if (a) { a.x = a.tx = xz[0]; a.z = a.tz = xz[1]; a.moving = false } }

export function npcWalkTo(id, target, opts = {}) {
  const a = stage.actors[id]; if (!a) return
  const [tx, tz] = Array.isArray(target) ? target : [playerPos.x, playerPos.z]
  // stop a little short so NPCs don't stand exactly on the target
  const dx = tx - a.x, dz = tz - a.z, d = Math.hypot(dx, dz) || 1
  const stop = opts.stop ?? 1.4
  a.tx = tx - (dx / d) * stop
  a.tz = tz - (dz / d) * stop
  a.moving = true
  a.prop = opts.prop || null
  a.onArrive = () => {
    a.moving = false
    if (opts.emote) npcEmote(id, opts.emote, opts.emoteCount || 4)
    if (opts.pose) npcPose(id, opts.pose)
    if (opts.face) npcFace(id, [tx, tz])
    opts.onArrive?.()
  }
}

export function npcEmote(actor, symbol, count = 4) {
  for (let i = 0; i < count; i++) stage.emotes.push({ id: ++stage._eid, actor, symbol, t: -i * 0.14, dur: 1.3, dx: (i - (count - 1) / 2) * 0.22 })
}
export function npcPose(id, pose) { const a = stage.actors[id]; if (a) { a.pose = pose; a.poseT = 0 } }
// R9 Part 6: a speech bubble over an acting NPC's head (tiny in-animation
// pop-up - the learning happens in the world, not in a text block).
export function npcSay(id, text, dur = 3.4) {
  stage.bubbles = stage.bubbles.filter((b) => b.actor !== id)
  stage.bubbles.push({ id: ++stage._eid, actor: id, text, t: 0, dur })
}
export function npcFace(id, target) { const a = stage.actors[id]; if (a) a.rotY = Math.atan2(target[0] - a.x, target[1] - a.z) }
export function npcHome(id) { const a = stage.actors[id]; if (a) { a.tx = a.homeX; a.tz = a.homeZ; a.moving = true; a.pose = 'idle'; a.onArrive = () => { a.moving = false } } }
export function allNpcsHome() { for (const id in stage.actors) npcHome(id) }

// ---- props / particles ----
export function arcItem(fromXZ, toXZ, ms = 1200) {
  const toy = stage.toy
  toy.visible = true
  toy.fx = fromXZ[0]; toy.fy = 1.3; toy.fz = fromXZ[1]
  toy.tx = toXZ[0]; toy.ty = 1.3; toy.tz = toXZ[1]
  toy.t = 0; toy.dur = ms / 1000; toy.scale = 1; toy.land = false
}
export function hideToy() { stage.toy.visible = false }
export function sparkleBurst(xz, y = 1.5, n = 10) {
  for (let i = 0; i < n; i++) stage.sparkles.push({ id: ++stage._sid, x: xz[0], y, z: xz[1], t: -i * 0.02, dur: 0.9, a: (i / n) * Math.PI * 2 })
}

// ---- player-anchored ----
export function playerEmote(symbol, count = 4) { npcEmote('player', symbol, count) }
export function bellyShake() { g().hudShake(); playerEmote('😖', 3) }
export function setPlayerSpeed(mult) { g().setPlayerSpeed(mult) }
export function playerPose(pose) { g().setPlayerPose(pose) }

// ---- HUD / world FX (DOM overlays in Hud.jsx) ----
export function walletPoof(to = 0) { g().setWallet(to); g().hudShake() }
export function jarChime(jar) { g().pulseJar(jar) }
export function guideSay(line, ms = 2800) { g().sayGuide(line, ms) }
export function banner(text, ms = 2600) { g().setBanner(text, ms) }
export function tintWorld(color, ms = 1500) { g().setTint(color, ms) }
export function sunArc(ms = 1500) { g().triggerSun(ms) }
export function resetJars() { g().resetJarsAnim() }
