// Single source of truth for "where should the player go RIGHT NOW".
// Read every frame by CompassBeam (neck arrow + breadcrumbs) and GuidanceArrow
// (overhead marker). Returns [x, z] or null when there is no destination.
//
// Master Adjustment C4/E1: the target is always the EXACT person or object of
// the current instruction - Mr. Bram himself when the step is "talk to Mr.
// Bram", Mr. Sprout herself for the garden, never just "the building".
import { MAILBOX, KITCHEN, STORE, STORE_ITEMS, LEMONADE, SHOPKEEPER, PARTY_HOUSE, RING } from './config.js'
import { stage } from '../anim/stage.js'
import { isPaycheckWorldActive } from './paycheckMode.js'
import { useTaxLab } from './taxLabStore.js'
import { TAX_POINTS, taxStationForStep } from './taxDistrictLayout.js'

const BRAM = [STORE[0] + SHOPKEEPER.pos[0], STORE[1] + SHOPKEEPER.pos[1]]
const MARKET_SHELVES = [STORE[0], STORE[1] - 1]
const MARKET_CHECKOUT = [STORE[0], STORE[1] + 4.2]

export function getObjectiveTarget(st) {
  if (st.adminHideArrows) return null // Part 0: presenter toggle
  if (st.weekComplete || st.scenarioLocked) return null
  // When the next action is already on screen, remove the world arrow so it
  // never competes with the card or panel the player must use.
  if (st.dialog || st.lessons?.length || st.cards?.length || st.panelJar || st.panelItem || st.btPanel || st.bkPanel || st.panelPortfolio) return null

  // Module 5 remains in the persistent town. Guidance now walks the player to
  // Maya, then the taxpayer cluster, then the exact physical station for each
  // filing step. While a station panel is open, the arrow gets out of the way.
  if (isPaycheckWorldActive()) {
    const tax = useTaxLab.getState()
    if (tax.panel) return null
    if (tax.phase === 'intro') return TAX_POINTS.guide
    if (tax.phase === 'case') return TAX_POINTS.caseCenter
    if (tax.phase === 'steps') return taxStationForStep(tax.stepNumber).point
    return TAX_POINTS.guide
  }

  // Part J: everything is done - the arrow leads to the party house door
  if (st.gameComplete) return [PARTY_HOUSE[0], PARTY_HOUSE[1] - 3]
  // Round 8 order: 3 = Budget Town, 4 = the Bank, 5 = the Money Garden
  if (st.week === 5) {
    // the arrow targets Mr. Sprout the PERSON, tracked live (E-I.6)
    if (st.mgPhase === 'toGarden') { const a = stage.actors.sprout; return [a.x, a.z] }
    return null // during rounds the module is fully guided - no free-roam arrow
  }
  if (st.week === 4) { const a = stage.actors.bea; return st.bkPanel ? null : [a.x, a.z] }
  if (st.week === 3) {
    // R14: Budget Town is a STATIONARY scene. The arrow only leads to the
    // Budget Keeper to START; after that the day is fully card-driven (no walk).
    const b = st.bt
    if (b && b.stage !== 'intro') return null
    const a = stage.actors.keeper
    return st.btPanel ? null : [a.x, a.z]
  }
  if (st.week === 2) {
    if (st.lemPhase === 'toMarket') return BRAM // the supply contact himself
    if (st.lemPhase === 'toStand' || st.lemPhase === 'toStand2') return LEMONADE
    return null
  }
  if (st.objective === 'mailbox') return MAILBOX
  if (st.objective === 'kitchen') return KITCHEN
  if (st.objective === 'store') {
    // sequence: talk to Mr. Bram FIRST (arrow at the person), then shop
    if (!st.bramTalked) return BRAM
    const basket = st.bought.map((id) => STORE_ITEMS.find((item) => item.id === id)).filter(Boolean)
    const ready = basket.some((item) => item.tags?.includes('food'))
      && basket.some((item) => item.tags?.includes('drink'))
    return ready ? MARKET_CHECKOUT : MARKET_SHELVES
  }
  return null
}

// How close counts as "arrived" - both the neck arrow and the overhead marker
// hide inside this radius (comment 14: stop on arrival).
export function arriveRadius(st) {
  if (isPaycheckWorldActive()) return 2.8
  if (st.week === 5) return 3.2
  if (st.week === 1 && st.objective === 'store') return 3
  return 2.5
}

// R9 1.3: the arrow FOLLOWS THE RING ROAD. When the next stop is a real turn
// around the circle, the guide path walks the arc (never a chord through the
// park); tiny turns or off-ring positions fall back to a straight line.
export function guidePath(px, pz, target) {
  const [cx, cz] = RING.c
  const R = RING.r
  const aP = Math.atan2(-(pz - cz), px - cx)
  const aT = Math.atan2(-(target[1] - cz), target[0] - cx)
  let d = aT - aP
  while (d > Math.PI) d -= 2 * Math.PI
  while (d < -Math.PI) d += 2 * Math.PI
  const playerR = Math.hypot(px - cx, pz - cz)
  if (Math.abs(d) < 0.5 || playerR < R - 12 || playerR > R + 16) return [target]
  const steps = Math.max(1, Math.floor(Math.abs(d) / 0.2))
  const pts = []
  for (let i = 1; i <= steps; i++) {
    const a = aP + (d * i) / steps
    pts.push([cx + Math.cos(a) * R, cz - Math.sin(a) * R])
  }
  pts.push(target)
  return pts
}
