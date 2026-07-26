// Mutable "stage" for consequence animations. Like playerPos, these are plain
// module objects mutated in place and read inside useFrame - never React state,
// so animating them costs zero re-renders. ConsequenceStage.jsx renders from it.
import { STORE, SPROUT, BUDGET_TOWN, BANK_DISTRICT, KITCHEN } from '../world/config.js'

// Where each NPC idles when no scene is playing. v6 Section 1.3: Penny/Theo/Mia
// stand TOGETHER as a group BESIDE the route (paths run at z=2.8, z=-2.7 and
// x=4) - visible and approachable, never blocking a walkway.
export const NPC_HOME = {
  // Keep the home audience well outside the jar-selection area so character
  // prompts and name tags never compete with SPEND / SAVE / GIVE.
  penny: [KITCHEN[0] - 6.5, KITCHEN[1] + 5.8],
  theo: [KITCHEN[0] + 6.5, KITCHEN[1] + 5.8],
  mia: [KITCHEN[0] + 0.2, KITCHEN[1] + 8.2],
  bram: [STORE[0] + 0, STORE[1] - 3.0], // shopkeeper, behind the store counter
  sprout: [SPROUT[0] - 6.2, SPROUT[1] + 4.6], // Mr. Sprout - front-left of the plaza, visible on approach (E-I.4)
  scoop: [SPROUT[0] + 6, SPROUT[1] + 8], // Scoop the newsboy, off by the garden street
  wanderer: [0, -6], // Milo - walks the ring road clockwise
  nea: [60, -6], // Nea - walks the ring the other way (E5)
  keeper: [BUDGET_TOWN[0] + 3.6, BUDGET_TOWN[1] + 4.4], // R14: front-right of the cutaway house, clear of the room labels
  bea: [BANK_DISTRICT[0] + 0.5, BANK_DISTRICT[1] + 3.2], // Banker Bea by the teller counter, road side
  // R9 Part 6: the Bank of TAYU acting cast
  teller: [BANK_DISTRICT[0] - 1.5, BANK_DISTRICT[1] + 2.2], // Teller Tom behind the counter
  clerk: [BANK_DISTRICT[0] - 6.5, BANK_DISTRICT[1] + 4.8], // Clerk Cleo at the snack stall
  mailer: [BANK_DISTRICT[0] + 11, BANK_DISTRICT[1] + 9], // Postal Pat, waits off-stage
  scammer: [BANK_DISTRICT[0] - 11, BANK_DISTRICT[1] + 10], // Sneaky Sam, lurks off-stage
  helper: [BANK_DISTRICT[0] + 9, BANK_DISTRICT[1] + 1], // Helper Hana of the nonprofit
}

function mkActor(id) {
  const [x, z] = NPC_HOME[id]
  return {
    id, x, z, tx: x, tz: z, homeX: x, homeZ: z,
    moving: false, walk: 0, rotY: 0, speed: 2.6,
    pose: 'idle', poseT: 0, onArrive: null, prop: null,
  }
}

export const stage = {
  actors: {
    penny: mkActor('penny'), theo: mkActor('theo'), mia: mkActor('mia'), bram: mkActor('bram'),
    sprout: mkActor('sprout'), scoop: mkActor('scoop'), wanderer: mkActor('wanderer'), nea: mkActor('nea'),
    keeper: mkActor('keeper'), bea: mkActor('bea'),
    teller: mkActor('teller'), clerk: mkActor('clerk'), mailer: mkActor('mailer'),
    scammer: mkActor('scammer'), helper: mkActor('helper'),
  },
  bubbles: [], // { id, actor, text, t, dur } - speech over an acting NPC's head
  emotes: [], // { id, actor, symbol, t, dur, dx }
  sparkles: [], // { id, x, y, z, t, dur, a }
  toy: { visible: false, fx: 0, fy: 0, fz: 0, tx: 0, ty: 0, tz: 0, t: 0, dur: 1, scale: 1, land: false },
  _eid: 0, _sid: 0,
}

export function resetStage() {
  for (const id in stage.actors) {
    const a = stage.actors[id]
    a.x = a.tx = a.homeX; a.z = a.tz = a.homeZ
    a.moving = false; a.pose = 'idle'; a.poseT = 0; a.rotY = 0; a.onArrive = null; a.prop = null
  }
  stage.emotes.length = 0
  stage.sparkles.length = 0
  stage.toy.visible = false
}
