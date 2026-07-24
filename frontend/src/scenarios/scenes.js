// Beat-by-beat consequence scenes (Section 2.2 + 3.3). Each scene is a list of
// timeline beats built from the shared world-action vocabulary. playConsequence
// (jars) and playDayScene (store) both feed the ONE timeline engine.
import { playTimeline } from '../anim/timeline.js'
import { playerPos } from '../world/store.js'
import { JARS } from '../world/config.js'
import {
  npcWalkTo, npcEmote, npcPose, placeNpc, arcItem, hideToy, sparkleBurst,
  playerEmote, bellyShake, setPlayerSpeed, playerPose, walletPoof, jarChime,
  guideSay, banner, tintWorld, sunArc,
} from '../anim/worldActions.js'

const P = () => [playerPos.x, playerPos.z]
const GIVE_JAR = () => [JARS.give[0], JARS.give[1]]
const SAVE_JAR = () => [JARS.save[0], JARS.save[1]]

// ---------- JAR CONSEQUENCES ----------
const JAR_SCENES = {
  // Fun toy... but nothing for Theo or the shelter.
  SPENT_ALL: (ctx) => [
    { at: 0, run: () => { arcItem(GIVE_JAR(), P(), 1100); sparkleBurst(P()); playerEmote('🧸', 3) } },
    { at: 1200, run: () => { hideToy(); npcWalkTo('theo', P(), { emote: '😢', pose: 'droop', prop: 'gift', face: true }) } },
    { at: 2800, run: () => { npcWalkTo('mia', GIVE_JAR(), { emote: '💧', face: true, onArrive: () => npcPose('mia', 'droop') }) } },
    { at: 4600, run: () => walletPoof(0) },
    { at: 5500, run: () => guideSay(ctx.hint, 3000), hold: 3000 },
  ],
  // Great saving! But Theo got nothing and the shelter is empty-handed.
  SAVED_ALL: (ctx) => [
    { at: 0, run: () => { jarChime('save'); sparkleBurst(SAVE_JAR()) } },
    { at: 1200, run: () => { playerEmote('🔒', 2); npcEmote('penny', '🤔', 2) } },
    { at: 1800, run: () => { npcWalkTo('theo', [P()[0] - 1.2, P()[1]], { emote: '🤷', face: true }); npcWalkTo('mia', [P()[0] + 1.2, P()[1]], { emote: '🤷', face: true }) } },
    { at: 4000, run: () => guideSay(ctx.hint, 3000), hold: 3000 },
  ],
  // So generous! But nothing left for you.
  GAVE_ALL: (ctx) => [
    { at: 0, run: () => { npcWalkTo('mia', P(), { emote: '❤️', face: true }); jarChime('give') } },
    { at: 1500, run: () => { playerPose('droop'); playerEmote('😔', 3) } },
    { at: 3000, run: () => { npcWalkTo('theo', P(), { emote: '🫂', face: true, onArrive: () => { playerPose('idle') } }) } },
    { at: 4500, run: () => guideSay(ctx.hint, 3000), hold: 3000 },
  ],
  // Close, but off-balance.
  UNBALANCED: (ctx) => [
    { at: 0, run: () => { npcWalkTo('theo', [P()[0] - 1.2, P()[1]], { emote: '🤔', face: true }); npcWalkTo('mia', [P()[0] + 1.2, P()[1]], { emote: '🤔', face: true }) } },
    { at: 1800, run: () => { npcEmote('penny', '⚖️', 2) } },
    { at: 2600, run: () => guideSay(ctx.hint, 3000), hold: 3000 },
  ],
  // Perfect split - celebrate!
  BALANCED: (ctx) => [
    { at: 0, run: () => { arcItem(GIVE_JAR(), P(), 1000); sparkleBurst(P()); playerEmote('🎉', 4) } },
    { at: 1000, run: () => { hideToy(); jarChime('save'); sparkleBurst(SAVE_JAR()) } },
    { at: 1800, run: () => { npcWalkTo('mia', [P()[0] + 1.3, P()[1]], { emote: '❤️', face: true }); npcWalkTo('theo', [P()[0] - 1.3, P()[1]], { emote: '🎉', face: true }) } },
    { at: 3600, run: () => { banner('BALANCED! 🎉', 3000); sparkleBurst(P(), 2.0, 14) } },
    { at: 5200, run: () => guideSay(ctx.recap, 3200), hold: 3200 },
  ],
}

// ---------- STORE DAY OUTCOMES ----------
const DAY_SCENES = {
  DEHYDRATED: (ctx) => [
    { at: 0, run: () => { sunArc(1500); tintWorld('#ff8a3a', 1500) } },
    { at: 1500, run: () => { setPlayerSpeed(0.6); playerPose('droop') } },
    { at: 3000, run: () => { playerEmote('💧', 4); tintWorld('#ffd0a0', 1200) } },
    { at: 4500, run: () => { playerPose('sit'); playerEmote('💫', 3) } },
    { at: 6500, run: () => { placeNpc('mia', [playerPos.x + 5, playerPos.z + 3]); npcWalkTo('mia', P(), { prop: 'water', emote: '💧', face: true, onArrive: () => { setPlayerSpeed(1); playerPose('idle'); playerEmote('😊', 3) } }) } },
    { at: 8200, run: () => guideSay(ctx.lesson, 3200), hold: 3200 },
  ],
  HUNGRY: (ctx) => [
    { at: 0, run: () => { sunArc(1500); tintWorld('#ffce8a', 1400) } },
    { at: 1500, run: () => bellyShake() },
    { at: 2700, run: () => { playerEmote('🍞', 3); playerPose('droop') } },
    { at: 4200, run: () => { playerEmote('😞', 2) } },
    { at: 5000, run: () => { playerPose('idle'); guideSay(ctx.lesson, 3200) }, hold: 3200 },
  ],
  JUNK_DAY: (ctx) => [
    { at: 0, run: () => { playerPose('spin'); playerEmote('🍬', 4) } },
    { at: 2000, run: () => { playerPose('flop'); tintWorld('#9aa0a6', 1600); playerEmote('💫', 3) } },
    { at: 3900, run: () => walletPoof(0) },
    { at: 5000, run: () => { playerPose('idle'); guideSay(ctx.lesson, 3200) }, hold: 3200 },
  ],
  EMPTY_HANDED: (ctx) => [
    { at: 0, run: () => { sunArc(1500); tintWorld('#6b7280', 1500) } },
    { at: 1500, run: () => { playerPose('droop') } },
    { at: 3000, run: () => { bellyShake(); playerEmote('💧', 2) } },
    { at: 4500, run: () => { playerPose('idle'); guideSay(ctx.lesson, 3200) }, hold: 3200 },
  ],
  GOOD_DAY: (ctx) => [
    { at: 0, run: () => { playerPose('sit'); playerEmote('😋', 3) } },
    { at: 2000, run: () => { playerPose('idle'); sparkleBurst(P(), 1.6, 12); playerEmote('⭐', 5) } },
    { at: 3400, run: () => { if (ctx.hasWant) { sparkleBurst(P(), 1.4, 8); playerEmote('🧸', 2) } } },
    { at: 3600, run: () => { banner('SMART SHOPPER! 🌟', 3000); npcEmote('bram', '👍', 3) } },
    { at: 5200, run: () => guideSay(ctx.lesson, 3200), hold: 3200 },
  ],
}

export function playConsequence(scene, ctx, onDone) {
  const build = JAR_SCENES[scene] || JAR_SCENES.UNBALANCED
  playTimeline(build(ctx), onDone)
}

export function playDayScene(scene, ctx, onDone) {
  const build = DAY_SCENES[scene] || DAY_SCENES.HUNGRY
  playTimeline(build(ctx), onDone)
}
