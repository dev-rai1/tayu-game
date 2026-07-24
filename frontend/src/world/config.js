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

export const RING = { c: [30, -6], r: 30 }
const rad = (deg) => (deg * Math.PI) / 180
export const ringPoint = (deg) => [RING.c[0] + RING.r * Math.cos(rad(deg)), RING.c[1] - RING.r * Math.sin(rad(deg))]
// the ring angle of every stop, in STORY order (θ decreases as you walk it)
export const STOP_ANGLES = { spawn: 180, allowance: 152, home: 131, market: 110, lemonade: 88, budget: 64, bank: 40, garden: 14, party: -108 }
// closed loop polyline (θ 180 -> -180, the story direction)
export const RING_POINTS = Array.from({ length: 49 }, (_, i) => ringPoint(180 - i * 7.5))

export const SPAWN = [0, -6] // west point of the ring
export const MAILBOX = [-1, -22.4] // the ALLOWANCE BANK kiosk (interaction id 'mailbox')
export const KITCHEN = [8.6, -31.6] // jar table, in front of the house
export const JARS = {
  spend: [7.6, -31.8],
  save: [8.6, -31.8],
  give: [9.6, -31.8],
}
export const HOME = [4.6, -35] // the house, behind the jar table
export const STORE = [16.7, -42.6] // TAYU MARKET - open front faces the ring
export const LEMONADE = [31.3, -43] // the lemonade stand
export const BUDGET_TOWN = [48, -42.5] // Budget Town cul-de-sac
export const BANK_DISTRICT = [59.1, -30.4] // the Bank of TAYU (door faces the ring)
export const SPROUT = [69, -15.7] // the Money Garden plaza
export const PARTY_HOUSE = [18, 31] // the FINALE AREA - closes the loop (door faces the ring)

// The ring road + a short spur to every ENTRANCE. No segment ever ends at a
// wall or runs through a building; the ring itself is continuous (closed).
export const PATHS = {
  ring: RING_POINTS,
  spurAllowance: [ringPoint(152), [-0.2, -21.5]],
  spurJars: [ringPoint(131), [8.6, -30.6]],
  spurMarket: [ringPoint(110), [16.7, -38.4]],
  spurLemonade: [ringPoint(88), [31.3, -40]],
  spurBudget: [ringPoint(64), [48, -37.6]],
  spurBank: [ringPoint(40), [59.1, -27.2]],
  spurGarden: [ringPoint(14), [64.6, -15.2]],
  spurParty: [ringPoint(-108), [18, 27.2]],
}

export const PLAY_BOUNDS = 96 // legacy import
export const BOUNDS = { xMin: -18, xMax: 82, zMin: -54, zMax: 38 }
export const INTERACT_RADIUS = 2.6
export const JAR_RADIUS = 2.4
export const ITEM_RADIUS = 2.0
export const NPC_RADIUS = 2.6

// Solid blockers as circles {x,z,r} (cheap collision). None may touch a path.
// The big one is the central LAKE - you walk around the park, not through it.
export const LAKE = { x: 30, z: -6, r: 8.6 }
export const BLOCKERS = [
  { x: LAKE.x, z: LAKE.z, r: LAKE.r + 0.6 }, // the lake itself
  { x: 18, z: -17, r: 1 }, // park trees, inside the ring, off the road
  { x: 42, z: -19, r: 1 },
  { x: 22, z: 3, r: 1 },
  { x: 41, z: 5, r: 1 },
  { x: 30, z: -23.5, r: 1 },
  { x: 8, z: -12, r: 1 }, // outside-the-ring trees near the west arc
  { x: 55, z: 8, r: 1 },
]

// Ambient townsfolk enjoying the park (Round 9 Part 1.2/7): they dance, sit
// by the water, and picnic - and every one of them is talkable and will point
// a lost child to the arrow. kind drives the idle animation in Ambient.jsx.
export const AMBIENT_NPCS = [
  { id: 'amb-dana', name: 'Dana', kind: 'dance', pos: [23.5, -15.5], color: '#e05252' },
  { id: 'amb-rio', name: 'Rio', kind: 'dance', pos: [25.5, -14.2], color: '#3f9a42' },
  { id: 'amb-lulu', name: 'Lulu', kind: 'sit', pos: [36.6, -13.4], color: '#7850F0' },
  { id: 'amb-finn', name: 'Finn', kind: 'sit', pos: [38, -12.6], color: '#1464F0' },
  { id: 'amb-pip', name: 'Pip', kind: 'picnic', pos: [24, 1.5], color: '#f5a623' },
  { id: 'amb-momo', name: 'Momo', kind: 'dance', pos: [37, 3.5], color: '#00b37f' },
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

// ROUND 9 PART 5: Budget Town's lived-in stops. LOCAL offsets from
// BUDGET_TOWN; the cul-de-sac opens north (+z) toward the ring road.
export const BT_SPOTS = {
  board: [0, 3.2], // the Keeper's welcome board by the entrance
  house: [-7.2, 0.6],
  grocery: [-4.6, -4.2],
  bus: [0.2, -6.2],
  clinic: [4.8, -4.2],
  fun: [7.4, 0.6],
  kiosk: [-4.6, 5.4], // bank kiosk flanks the entrance (bank side of the loop)
  gate: [4.6, 5.4], // garden gate flanks the other side
}
export const btWorld = (k) => [BUDGET_TOWN[0] + BT_SPOTS[k][0], BUDGET_TOWN[1] + BT_SPOTS[k][1]]

export const TAYU = { electric: '#1464F0', navy: '#071748', teal: '#00DCA0', purple: '#7850F0', gold: '#FFD700' }
