import { TAX_DISTRICT } from './config.js'

const worldPoint = (x, z) => [TAX_DISTRICT[0] + x, TAX_DISTRICT[1] + z]

export const TAX_POINTS = {
  guide: worldPoint(0, 6.1),
  clientLeft: worldPoint(-4.4, 4.4),
  clientMiddle: worldPoint(0, 4.55),
  clientRight: worldPoint(4.4, 4.4),
  caseCenter: worldPoint(0, 4.45),
  w2: worldPoint(-4.7, 1.45),
  deduction: worldPoint(-2.55, -1.55),
  brackets: worldPoint(0, -2.35),
  credit: worldPoint(2.55, -1.55),
  reconcile: worldPoint(4.7, 1.45),
  filing: worldPoint(0, 2.15),
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
  4: { key: 'credit', label: 'CREDIT COUNTER', point: TAX_POINTS.credit },
  5: { key: 'reconcile', label: 'REFUND SCALE', point: TAX_POINTS.reconcile },
  6: { key: 'filing', label: 'E-FILE DESK', point: TAX_POINTS.filing },
}

export function taxStationForStep(stepNumber) {
  return TAX_STEP_STATIONS[Math.max(1, Math.min(6, Number(stepNumber || 1)))]
}

export function toTaxLocal(point) {
  return [point[0] - TAX_DISTRICT[0], 0, point[1] - TAX_DISTRICT[1]]
}
