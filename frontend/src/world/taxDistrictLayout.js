import { STOP_ANGLES, TAX_DISTRICT, ringPoint } from './config.js'

// Module 7 sits on a curved part of the ring. Build a local coordinate frame
// from the real road, then pull the whole playable district slightly RIGHT and
// INWARD toward the walkable ring. This keeps the facade/path relationship but
// prevents the far edge of the Tax Office from drifting into the map boundary.
const TAX_ROAD = ringPoint(STOP_ANGLES.tax)
const roadDx = TAX_ROAD[0] - TAX_DISTRICT[0]
const roadDz = TAX_ROAD[1] - TAX_DISTRICT[1]
const roadLen = Math.hypot(roadDx, roadDz) || 1
export const TAX_FORWARD = [roadDx / roadLen, roadDz / roadLen]
export const TAX_RIGHT = [TAX_FORWARD[1], -TAX_FORWARD[0]]
export const TAX_SITE_SHIFT = { right: 5.2, forward: 1.8 }
export const TAX_SITE = [
  TAX_DISTRICT[0] + TAX_RIGHT[0] * TAX_SITE_SHIFT.right + TAX_FORWARD[0] * TAX_SITE_SHIFT.forward,
  TAX_DISTRICT[1] + TAX_RIGHT[1] * TAX_SITE_SHIFT.right + TAX_FORWARD[1] * TAX_SITE_SHIFT.forward,
]

const worldPoint = (x, z) => [
  TAX_SITE[0] + TAX_RIGHT[0] * x + TAX_FORWARD[0] * z,
  TAX_SITE[1] + TAX_RIGHT[1] * x + TAX_FORWARD[1] * z,
]

export const TAX_POINTS = {
  guide: worldPoint(0, 5.7),
  clientLeft: worldPoint(-4.0, 4.15),
  clientMiddle: worldPoint(0, 4.35),
  clientRight: worldPoint(4.0, 4.15),
  caseCenter: worldPoint(0, 4.25),
  w2: worldPoint(-4.35, 1.35),
  deduction: worldPoint(-2.35, -1.45),
  brackets: worldPoint(0, -2.15),
  credit: worldPoint(2.35, -1.45),
  reconcile: worldPoint(4.35, 1.35),
  filing: worldPoint(0, 2.05),
}

export const TAX_CLIENTS = [
  {
    caseId: 'library',
    name: 'Ari',
    point: TAX_POINTS.clientLeft,
    line: 'I worked at the library after school. Can you help me figure out what my W-2 means?',
    avatar: { skinTone: 'tan', hairColor: 'brown', hairStyle: 'curly', shirtColor: 'teal', pantsColor: 'navy', topStyle: 'tee', bottomStyle: 'pants' },
  },
  {
    caseId: 'camp',
    name: 'Sam',
    point: TAX_POINTS.clientMiddle,
    line: 'I had a summer camp job. I know money was withheld, but I do not know if that means I get it all back.',
    avatar: { skinTone: 'medium', hairColor: 'black', hairStyle: 'short', shirtColor: 'blue', pantsColor: 'gray', topStyle: 'hoodie', bottomStyle: 'pants' },
  },
  {
    caseId: 'design',
    name: 'Jordan',
    point: TAX_POINTS.clientRight,
    line: 'My design job paid more, and I am not sure whether I already paid enough tax during the year.',
    avatar: { skinTone: 'light', hairColor: 'darkBrown', hairStyle: 'long', shirtColor: 'purple', pantsColor: 'black', topStyle: 'tee', bottomStyle: 'pants' },
  },
]

export const TAX_STEP_STATIONS = {
  1: { key: 'w2', label: 'W-2 SCANNER', point: TAX_POINTS.w2 },
  2: { key: 'deduction', label: 'DEDUCTION DESK', point: TAX_POINTS.deduction },
  3: { key: 'brackets', label: 'BRACKET MACHINE', point: TAX_POINTS.brackets },
  4: { key: 'credit', label: 'CAPITAL GAINS', point: TAX_POINTS.credit },
  5: { key: 'reconcile', label: 'REFUND SCALE', point: TAX_POINTS.reconcile },
  6: { key: 'filing', label: 'E-FILE DESK', point: TAX_POINTS.filing },
}

export function taxStationForStep(stepNumber) {
  return TAX_STEP_STATIONS[Math.max(1, Math.min(6, Number(stepNumber || 1)))]
}

export function toTaxLocal(point) {
  return [point[0] - TAX_DISTRICT[0], 0, point[1] - TAX_DISTRICT[1]]
}

try{ if(typeof window!=='undefined'){ window.__taxpts=TAX_POINTS } }catch{}
