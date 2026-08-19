// Shared world layout (Three.js world coords; y=0 ground). Single source of truth
// for player, guidance arrows, paths, and interactive objects.
// Camera sits to the south (+z) looking north (−z).
//
// ROUND 9 PART 1: THE CIRCULAR TOWN. A two-way RING ROAD loops the town;
// every module district sits AROUND the circle in story order, entrance
// facing the ring, and the FINALE AREA closes the loop. The center of the
// circle is a park: lake, palms, forests, animals, and ambient townsfolk.
// Story order around the loop (walking clockwise from spawn):
// spawn -> Allowance Bank -> Home/Jars -> Market -> Lemonade -> Budget Town
// -> Bank -> Money Garden -> Paycheck Planet -> FINALE AREA -> back to spawn.

// Keep the boulevard visibly longer than the original town, but keep every
// required destination inside the playable island. The late-game stretch gets
// its extra room from wider angular gaps instead of pushing buildings off-map.
const CENTER = [30, -6]
export const MAP_SCALE = 1.24
const sc = ([x, z]) => [CENTER[0] + (x - CENTER[0]) * MAP_SCALE, CENTER[1] + (z - CENTER[1]) * MAP_SCALE]
export const worldScale = sc

export const RING = { c: CENTER, r: 30 * MAP_SCALE }
const rad = (deg) => (deg * Math.PI) / 180
export const ringPoint = (deg) => [RING.c[0] + RING.r * Math.cos(rad(deg)), RING.c[1] - RING.r * Math.sin(rad(deg))]
const outerStopPoint = (deg, outward = 0) => {
  const [x, z] = ringPoint(deg)
  const dx = x - CENTER[0], dz = z - CENTER[1]
  const d = Math.hypot(dx, dz) || 1
  return [x + (dx / d) * outward, z + (dz / d) * outward]
}

// Bank -> Money Garden -> Tax Office -> Finale now has real breathing room.
// These angles deliberately create long frontage while staying inside the map.
export const STOP_ANGLES = { spawn: 180, allowance: 152, home: 131, market: 110, lemonade: 88, budget: 64, bank: 44, garden: 22, bond: -6, tax: -34, party: -84 }

export const SCENERY_ZONES = [
  { angle: 166, theme: 'orchard', density: 3, accent: '#e05252' },
  { angle: 141.5, theme: 'butterfly-meadow', density: 2, accent: '#ff8fb3' },
  { angle: 120.5, theme: 'rock-garden', density: 1, accent: '#9aa0a6' },
  { angle: 99, theme: 'sunflower-field', density: 3, accent: '#FFD700' },
  { angle: 76, theme: 'birdhouse-grove', density: 2, accent: '#5aa6ff' },
  { angle: 55, theme: 'mushroom-woods', density: 3, accent: '#e8626f' },
  { angle: 33, theme: 'lantern-garden', density: 1, accent: '#fff0a8' },
  { angle: 6, theme: 'reeds-and-pond', density: 2, accent: '#5aa6d8' },
  { angle: -31, theme: 'picnic-grove', density: 2, accent: '#e8626f' },
  { angle: -72, theme: 'pine-trail', density: 3, accent: '#4e9440' },
  { angle: -103, theme: 'sculpture-garden', density: 1, accent: '#c9a46a' },
  { angle: -133, theme: 'autumn-grove', density: 3, accent: '#e8893a' },
  { angle: -162, theme: 'wildflower-hill', density: 2, accent: '#c77dff' },
]
export const DISTRICT_GAP_ANGLES = SCENERY_ZONES.map((zone) => zone.angle)

// More samples keep the longer road smooth through the final module gate.
// The ring now runs all the way to the Tax stop (-34) so Bond Street and the
// Tax Office both sit ON the main loop, spaced apart with room between them.
export const RING_POINTS = [
  ...Array.from({ length: 44 }, (_, i) => ringPoint(180 - i * 5)),
  ringPoint(STOP_ANGLES.tax),
]

export const SPAWN = sc([0, -6])
export const MAILBOX = sc([-1, -22.4])
export const KITCHEN = sc([8.6, -31.6])
export const JARS = {
  spend: sc([6.4, -31.8]),
  save: sc([8.6, -31.8]),
  give: sc([10.8, -31.8]),
}
export const HOME = sc([4.6, -35])
export const STORE = sc([16.7, -42.6])
export const LEMONADE = sc([31.3, -43])
export const BUDGET_TOWN = sc([48, -42.5])
export const BANK_DISTRICT = outerStopPoint(STOP_ANGLES.bank, 10)
export const SPROUT = outerStopPoint(STOP_ANGLES.garden, 12)
export const TAX_DISTRICT = outerStopPoint(STOP_ANGLES.tax, 12)
export const BOND_DISTRICT = outerStopPoint(STOP_ANGLES.bond, 12)
export const PARTY_HOUSE = (() => {
  const [px, pz] = ringPoint(STOP_ANGLES.party)
  const dx = px - CENTER[0], dz = pz - CENTER[1]
  const d = Math.hypot(dx, dz)
  return [px + (dx / d) * 9.5, pz + (dz / d) * 9.5]
})()

const partyDx = PARTY_HOUSE[0] - CENTER[0]
const partyDz = PARTY_HOUSE[1] - CENTER[1]
const partyDistance = Math.hypot(partyDx, partyDz)
const partyRadial = [partyDx / partyDistance, partyDz / partyDistance]
const partyTangent = [-partyRadial[1], partyRadial[0]]
const partyEntrance = [
  PARTY_HOUSE[0] - partyRadial[0] * 2.7,
  PARTY_HOUSE[1] - partyRadial[1] * 2.7,
]
const partyForecourt = [
  PARTY_HOUSE[0] - partyRadial[0] * 5.0,
  PARTY_HOUSE[1] - partyRadial[1] * 5.0,
]

const royalArcPoint = (angle, outward = 0) => {
  const [x, z] = ringPoint(angle)
  const dx = x - CENTER[0], dz = z - CENTER[1]
  const d = Math.hypot(dx, dz)
  return [x + (dx / d) * outward, z + (dz / d) * outward]
}

export const ROYAL_APPROACH = {
  gate: ringPoint(STOP_ANGLES.tax),
  forecourt: partyForecourt,
  entrance: partyEntrance,
}

export const PATHS = {
  ring: RING_POINTS,
  spurAllowance: [ringPoint(152), sc([-0.2, -21.5])],
  spurJars: [ringPoint(131), sc([8.6, -30.6])],
  spurMarket: [ringPoint(110), sc([16.7, -38.4])],
  spurLemonade: [ringPoint(STOP_ANGLES.lemonade), LEMONADE],
  spurBudget: [ringPoint(STOP_ANGLES.budget), [BUDGET_TOWN[0] + 3.6, BUDGET_TOWN[1] + 4.4]],
  spurBank: [ringPoint(STOP_ANGLES.bank), [BANK_DISTRICT[0] + 0.5, BANK_DISTRICT[1] + 3.2]],
  spurGarden: [ringPoint(STOP_ANGLES.garden), [SPROUT[0] - 6.2, SPROUT[1] + 4.6]],
  spurBond: [ringPoint(STOP_ANGLES.bond), [BOND_DISTRICT[0], BOND_DISTRICT[1] + 3.4]],
  spurTax: [ringPoint(STOP_ANGLES.tax), [TAX_DISTRICT[0], TAX_DISTRICT[1] + 3.4]],
  // Finale approach: a normal path (no gold pads) that leans inward from the Tax
  // stop to the finale, which now sits further back.
  royalParty: [
    ringPoint(STOP_ANGLES.tax),
    royalArcPoint(-46, 2.0),
    royalArcPoint(-58, 3.2),
    royalArcPoint(-70, 4.0),
    ROYAL_APPROACH.forecourt,
    ROYAL_APPROACH.entrance,
  ],
}

const pointToSegmentDistance = ([px, pz], [ax, az], [bx, bz]) => {
  const dx = bx - ax, dz = bz - az
  const lengthSq = dx * dx + dz * dz
  if (!lengthSq) return Math.hypot(px - ax, pz - az)
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / lengthSq))
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz))
}

export const PATH_CLEARANCE = { ring: 4.0, spur: 2.7, royal: 3.5 }

export function distanceToPaths(point) {
  let closest = Infinity
  Object.entries(PATHS).forEach(([name, points]) => {
    const required = name === 'ring'
      ? PATH_CLEARANCE.ring
      : name === 'royalParty'
        ? PATH_CLEARANCE.royal
        : PATH_CLEARANCE.spur
    for (let i = 0; i < points.length - 1; i += 1) {
      closest = Math.min(closest, pointToSegmentDistance(point, points[i], points[i + 1]) - required)
    }
  })
  return closest
}

export const isClearOfPaths = (point, radius = 0) => distanceToPaths(point) >= radius

const normalizeAngle = (angle) => ((angle + 180) % 360 + 360) % 360 - 180
const pointAngle = ([x, z]) => (Math.atan2(-(z - CENTER[1]), x - CENTER[0]) * 180) / Math.PI
const approachAngles = Object.values(STOP_ANGLES)

export const MODULE_GATE_CLEAR_DEGREES = 7.5
export function isClearOfModuleGates(point, extraDegrees = 0) {
  const angle = pointAngle(point)
  return approachAngles.every((stop) => Math.abs(normalizeAngle(angle - stop)) >= MODULE_GATE_CLEAR_DEGREES + extraDegrees)
}

export const PLAY_BOUNDS = 120
export const BOUNDS = { xMin: sc([-24, 0])[0], xMax: sc([92, 0])[0], zMin: sc([0, -62])[1], zMax: sc([0, 48])[1] }
export const INTERACT_RADIUS = 2.6
export const JAR_RADIUS = 2.4
export const ITEM_RADIUS = 2.0
export const NPC_RADIUS = 2.6

export const LAKE = { x: 30, z: -6, r: 5.2 }
export const CENTER_BUILDINGS = [
  { id: 'rest-pavilion', type: 'rest', x: 19, z: 14, r: 1.7, wall: '#d9f0dc', roof: '#5d8f5a' },
  { id: 'help-kiosk', type: 'help', x: 41, z: 14, r: 1.7, wall: '#d9e8f5', roof: '#557db5' },
  { id: 'water-station', type: 'water', x: 17, z: -21, r: 1.6, wall: '#d5eff5', roof: '#4f9ead' },
  { id: 'quiet-garden', type: 'calm', x: 43, z: -21, r: 1.6, wall: '#eadcf4', roof: '#8b64ad' },
]

export const BLOCKERS = [
  { x: LAKE.x, z: LAKE.z, r: LAKE.r + 0.6 },
  ...CENTER_BUILDINGS.map(({ x, z, r }) => ({ x, z, r })),
  ...[
    [20, -14], [40, -16], [23, 1], [39, 2], [30, -20], [11, -10], [51, 6],
  ].map(([x, z]) => { const [sx, sz] = sc([x, z]); return { x: sx, z: sz, r: 1 } }),
]

export const AMBIENT_NPCS = [
  { id: 'amb-dana', name: 'Dana', kind: 'dance', pos: sc([24.5, -14.5]), color: '#e05252' },
  { id: 'amb-rio', name: 'Rio', kind: 'dance', pos: sc([26, -13.4]), color: '#3f9a42' },
  { id: 'amb-lulu', name: 'Lulu', kind: 'sit', pos: sc([35.4, -12.8]), color: '#7850F0' },
  { id: 'amb-finn', name: 'Finn', kind: 'sit', pos: sc([37, -12]), color: '#1464F0' },
  { id: 'amb-pip', name: 'Pip', kind: 'picnic', pos: sc([25, 0.5]), color: '#f5a623' },
  { id: 'amb-momo', name: 'Momo', kind: 'dance', pos: sc([36, 2.5]), color: '#00b37f' },
]

export const SHOPKEEPER = { id: 'shopkeeper', name: 'Mr. Bram', pos: [0, -3.2] }
export const STORE_ITEMS = [
  { id: 'apple', name: 'Apple', emoji: '🍎', price: 2, type: 'need', tags: ['food'], color: '#e23b3b', pos: [-3.4, -1] },
  { id: 'bread', name: 'Bread', emoji: '🍞', price: 3, type: 'need', tags: ['food'], color: '#d9a441', pos: [-1.7, -1] },
  { id: 'carrots', name: 'Carrots', emoji: '🥕', price: 4, type: 'need', tags: ['food'], color: '#f0822e', pos: [0, -1] },
  { id: 'water', name: 'Water', emoji: '💧', price: 2, type: 'need', tags: ['drink'], color: '#7fd0ff', pos: [1.7, -1] },
  { id: 'juice', name: 'Juice', emoji: '🧃', price: 3, type: 'need', tags: ['drink'], color: '#ffb347', pos: [3.4, -1] },
  { id: 'soda', name: 'Soda', emoji: '🥤', price: 3, type: 'want', tags: ['junk'], color: '#6a4fb0', pos: [-3.0, 2.6] },
  { id: 'candy', name: 'Candy', emoji: '🍬', price: 3, type: 'want', tags: ['junk'], color: '#ff5fa2', pos: [-1.2, 2.6] },
  { id: 'cookie', name: 'Cookie', emoji: '🍪', price: 3, type: 'want', tags: ['junk'], color: '#b07a3f', pos: [0.6, 2.6] },
  { id: 'toy', name: 'Toy', emoji: '🧸', price: 5, type: 'want', tags: ['toy'], color: '#8b5a2b', pos: [2.6, 2.6] },
]

export const BT_ROOMS = {
  home:    [-1.85, 3.05, 0.35],
  health:  [ 1.85, 3.05, 0.35],
  kitchen: [-1.85, 0.95, 0.35],
  living:  [ 1.85, 0.95, 0.35],
  door:    [ 0.00, 0.60, 1.00],
  bank:    [-3.40, 0.55, 2.90],
  garden:  [ 3.40, 0.55, 2.90],
}
export const btRoom3 = (k) => ({ x: BUDGET_TOWN[0] + BT_ROOMS[k][0], y: BT_ROOMS[k][1], z: BUDGET_TOWN[1] + BT_ROOMS[k][2] })
export const btRoom = (k) => [BUDGET_TOWN[0] + BT_ROOMS[k][0], BUDGET_TOWN[1] + BT_ROOMS[k][2]]

export const TAYU = { electric: '#1464F0', navy: '#071748', teal: '#00DCA0', purple: '#7850F0', gold: '#FFD700' }