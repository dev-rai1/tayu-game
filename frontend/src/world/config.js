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
// -> Bank -> Money Garden -> ... -> FINALE AREA -> back to spawn.

// The districts need to read as separate places, with landscaped breathing
// room between them. Scale the complete outer route about the park center so
// buildings, entrances, arrows, and blockers preserve their alignment while
// gaining substantially more space between stops.
const CENTER = [30, -6]
export const MAP_SCALE = 1.18
const sc = ([x, z]) => [CENTER[0] + (x - CENTER[0]) * MAP_SCALE, CENTER[1] + (z - CENTER[1]) * MAP_SCALE]
export const worldScale = sc // for decorative scenery to match the tighter map

export const RING = { c: CENTER, r: 30 * MAP_SCALE }
const rad = (deg) => (deg * Math.PI) / 180
export const ringPoint = (deg) => [RING.c[0] + RING.r * Math.cos(rad(deg)), RING.c[1] - RING.r * Math.sin(rad(deg))]
// the ring angle of every stop, in STORY order (θ decreases as you walk it).
// R14: the finale is pulled MUCH closer (was -108) so the last leg is short.
export const STOP_ANGLES = { spawn: 180, allowance: 152, home: 131, market: 110, lemonade: 88, budget: 64, bank: 40, garden: 14, party: -46 }

// Landscaped transition zones centered in the empty arcs BETWEEN module stops.
// These deliberately live around the outside route, not in the central park.
export const DISTRICT_GAP_ANGLES = [166, 141.5, 120.5, 99, 76, 52, 27, 2, -18]
// closed loop polyline (θ 180 -> -180, the story direction)
export const RING_POINTS = Array.from({ length: 49 }, (_, i) => ringPoint(180 - i * 7.5))

export const SPAWN = sc([0, -6]) // west point of the ring
export const MAILBOX = sc([-1, -22.4]) // the ALLOWANCE BANK kiosk (interaction id 'mailbox')
export const KITCHEN = sc([8.6, -31.6]) // jar table, in front of the house
export const JARS = {
  // Give each jar its own interaction space. In the first usability session,
  // players repeatedly selected SAVE while trying to move to another jar.
  spend: sc([6.4, -31.8]),
  save: sc([8.6, -31.8]),
  give: sc([10.8, -31.8]),
}
export const HOME = sc([4.6, -35]) // the house, behind the jar table
export const STORE = sc([16.7, -42.6]) // TAYU MARKET - open front faces the ring
export const LEMONADE = sc([31.3, -43]) // the lemonade stand
export const BUDGET_TOWN = sc([48, -42.5]) // Budget Town - now a single indoor house
export const BANK_DISTRICT = sc([59.1, -30.4]) // the Bank of TAYU (door faces the ring)
export const SPROUT = sc([69, -15.7]) // the Money Garden plaza
// The finale sits outside the road with a landscaped buffer between its front
// door and the walking lane. The previous inside-ring placement overlapped the
// road and made the final approach look like it ran through the building.
export const PARTY_HOUSE = (() => {
  const [px, pz] = ringPoint(STOP_ANGLES.party)
  const dx = px - CENTER[0], dz = pz - CENTER[1]
  const d = Math.hypot(dx, dz)
  return [px + (dx / d) * 7.2, pz + (dz / d) * 7.2]
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

export const ROYAL_APPROACH = {
  leftGate: ringPoint(STOP_ANGLES.party + 14),
  rightGate: ringPoint(STOP_ANGLES.party - 14),
  leftForecourt: [partyForecourt[0] - partyTangent[0] * 1.8, partyForecourt[1] - partyTangent[1] * 1.8],
  rightForecourt: [partyForecourt[0] + partyTangent[0] * 1.8, partyForecourt[1] + partyTangent[1] * 1.8],
  entrance: partyEntrance,
}

// The ring road + a clean spur to every module entrance. The Finale Area is
// different on purpose: both directions around the ring branch into matching
// royal paths, then converge at a shared forecourt and central entrance.
export const PATHS = {
  ring: RING_POINTS,
  spurAllowance: [ringPoint(152), sc([-0.2, -21.5])],
  spurJars: [ringPoint(131), sc([8.6, -30.6])],
  spurMarket: [ringPoint(110), sc([16.7, -38.4])],
  spurLemonade: [ringPoint(88), sc([31.3, -40])],
  spurBudget: [ringPoint(64), sc([48, -37.6])],
  spurBank: [ringPoint(40), sc([59.1, -27.2])],
  spurGarden: [ringPoint(14), sc([64.6, -15.2])],
  royalPartyLeft: [ROYAL_APPROACH.leftGate, ROYAL_APPROACH.leftForecourt, ROYAL_APPROACH.entrance],
  royalPartyRight: [ROYAL_APPROACH.rightGate, ROYAL_APPROACH.rightForecourt, ROYAL_APPROACH.entrance],
}

const pointToSegmentDistance = ([px, pz], [ax, az], [bx, bz]) => {
  const dx = bx - ax, dz = bz - az
  const lengthSq = dx * dx + dz * dz
  if (!lengthSq) return Math.hypot(px - ax, pz - az)
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / lengthSq))
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz))
}

export const PATH_CLEARANCE = { ring: 4.0, spur: 2.7 }

export function distanceToPaths(point) {
  let closest = Infinity
  Object.entries(PATHS).forEach(([name, points]) => {
    const required = name === 'ring' ? PATH_CLEARANCE.ring : PATH_CLEARANCE.spur
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

// Decorations must stop well before every module spur. This leaves a readable,
// calm gateway around each entrance even when the spaces between modules are lush.
export const MODULE_GATE_CLEAR_DEGREES = 7.5
export function isClearOfModuleGates(point, extraDegrees = 0) {
  const angle = pointAngle(point)
  return approachAngles.every((stop) => Math.abs(normalizeAngle(angle - stop)) >= MODULE_GATE_CLEAR_DEGREES + extraDegrees)
}


export const PLAY_BOUNDS = 96 // legacy import
// R14 P3: bounds scaled about the center to match the tighter map
export const BOUNDS = { xMin: sc([-18, 0])[0], xMax: sc([82, 0])[0], zMin: sc([0, -54])[1], zMax: sc([0, 38])[1] }
export const INTERACT_RADIUS = 2.6
export const JAR_RADIUS = 2.4
export const ITEM_RADIUS = 2.0
export const NPC_RADIUS = 2.6

// Solid blockers as circles {x,z,r} (cheap collision). None may touch a path.
// R14 P3: the central LAKE is MUCH smaller now (was r 8.6) so the middle no
// longer reads as a big empty pond; park life is woven in closer around it.
export const LAKE = { x: 30, z: -6, r: 5.2 }
export const BLOCKERS = [
  { x: LAKE.x, z: LAKE.z, r: LAKE.r + 0.6 }, // the lake itself
  ...[
    [20, -14], [40, -16], [23, 1], [39, 2], [30, -20], [11, -10], [51, 6],
  ].map(([x, z]) => { const [sx, sz] = sc([x, z]); return { x: sx, z: sz, r: 1 } }), // park + arc trees
]

// Ambient townsfolk enjoying the park (Round 9 Part 1.2/7): they dance, sit
// by the water, and picnic - and every one of them is talkable and will point
// a lost child to the arrow. kind drives the idle animation in Ambient.jsx.
// R14 P3: pulled in closer around the smaller pond so the middle feels alive.
export const AMBIENT_NPCS = [
  { id: 'amb-dana', name: 'Dana', kind: 'dance', pos: sc([24.5, -14.5]), color: '#e05252' },
  { id: 'amb-rio', name: 'Rio', kind: 'dance', pos: sc([26, -13.4]), color: '#3f9a42' },
  { id: 'amb-lulu', name: 'Lulu', kind: 'sit', pos: sc([35.4, -12.8]), color: '#7850F0' },
  { id: 'amb-finn', name: 'Finn', kind: 'sit', pos: sc([37, -12]), color: '#1464F0' },
  { id: 'amb-pip', name: 'Pip', kind: 'picnic', pos: sc([25, 0.5]), color: '#f5a623' },
  { id: 'amb-momo', name: 'Momo', kind: 'dance', pos: sc([36, 2.5]), color: '#00b37f' },
]

// TAYU Mart shopkeeper + shelf items. `pos` is LOCAL to STORE; world = STORE + pos.
// tags drive the lunchbox day-outcome: 'food' + 'drink' = a GOOD_DAY; 'junk'
// (soda/candy/cookie) alone = JUNK_DAY. 'toy' is a harmless want, not junk.
// Names are grade 1–3 words; they appear as big NAME + $PRICE cards in-world.
export const SHOPKEEPER = { id: 'shopkeeper', name: 'Mr. Bram', pos: [0, -3.2] }
export const STORE_ITEMS = [
  // Shelf 1 (front, z=-1): real food + healthy drinks
  { id: 'apple', name: 'Apple', emoji: '🍎', price: 2, type: 'need', tags: ['food'], color: '#e23b3b', pos: [-3.4, -1] },
  { id: 'bread', name: 'Bread', emoji: '🍞', price: 3, type: 'need', tags: ['food'], color: '#d9a441', pos: [-1.7, -1] },
  { id: 'carrots', name: 'Carrots', emoji: '🥕', price: 4, type: 'need', tags: ['food'], color: '#f0822e', pos: [0, -1] },
  { id: 'water', name: 'Water', emoji: '💧', price: 2, type: 'need', tags: ['drink'], color: '#7fd0ff', pos: [1.7, -1] },
  { id: 'juice', name: 'Juice', emoji: '🧃', price: 3, type: 'need', tags: ['drink'], color: '#ffb347', pos: [3.4, -1] },
  // Shelf 2 (back, z=2.6): treats (wants / junk)
  { id: 'soda', name: 'Soda', emoji: '🥤', price: 3, type: 'want', tags: ['junk'], color: '#6a4fb0', pos: [-3.0, 2.6] },
  { id: 'candy', name: 'Candy', emoji: '🍬', price: 3, type: 'want', tags: ['junk'], color: '#ff5fa2', pos: [-1.2, 2.6] },
  { id: 'cookie', name: 'Cookie', emoji: '🍪', price: 3, type: 'want', tags: ['junk'], color: '#b07a3f', pos: [0.6, 2.6] },
  { id: 'toy', name: 'Toy', emoji: '🧸', price: 5, type: 'want', tags: ['toy'], color: '#8b5a2b', pos: [2.6, 2.6] },
]

// R14: Budget Town is now a SINGLE STATIONARY cutaway household (no walking).
// Each spending decision animates one ROOM of this one house. Anchors are
// LOCAL [x, y, z] offsets from BUDGET_TOWN; the cutaway front faces +z (the
// child stands to the north and looks into the open house). Coins/sparkles
// fly from the child's wallet into these room anchors - nobody walks anywhere.
export const BT_ROOMS = {
  home:    [-1.85, 3.05, 0.35], // upstairs-left: shelter (lights on, family in)
  health:  [ 1.85, 3.05, 0.35], // upstairs-right: the clinic visit
  kitchen: [-1.85, 0.95, 0.35], // downstairs-left: groceries + the family eats
  living:  [ 1.85, 0.95, 0.35], // downstairs-right: the fun celebration
  door:    [ 0.00, 0.60, 1.00], // center porch: the school run (bus out front)
  bank:    [-3.40, 0.55, 2.90], // front-lawn slot: bank deposit lands here
  garden:  [ 3.40, 0.55, 2.90], // front-lawn slot: garden deposit sprouts here
}
// full 3D world point of a room anchor (for coin batches + sparkles)
export const btRoom3 = (k) => ({ x: BUDGET_TOWN[0] + BT_ROOMS[k][0], y: BT_ROOMS[k][1], z: BUDGET_TOWN[1] + BT_ROOMS[k][2] })
export const btRoom = (k) => [BUDGET_TOWN[0] + BT_ROOMS[k][0], BUDGET_TOWN[1] + BT_ROOMS[k][2]]

export const TAYU = { electric: '#1464F0', navy: '#071748', teal: '#00DCA0', purple: '#7850F0', gold: '#FFD700' }
