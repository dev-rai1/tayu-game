// Avatar customization options for the 3D character creator.

export const GENDERS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'neutral', label: 'Neutral' },
]

// Per-gender silhouette (full widths) + sensible defaults when gender is picked.
// male = V-taper (broad shoulders), female = hourglass (bust+hips > waist).
export const GENDER_BUILD = {
  male: { shoulder: 0.74, bust: 0.66, waist: 0.56, hip: 0.56, defaultHair: 'short', defaultBottom: 'pants' },
  female: { shoulder: 0.5, bust: 0.56, waist: 0.4, hip: 0.66, defaultHair: 'long', defaultBottom: 'skirt' },
  neutral: { shoulder: 0.58, bust: 0.54, waist: 0.5, hip: 0.56, defaultHair: 'medium', defaultBottom: 'pants' },
}

// Per-body-type multipliers on each dimension (sh=shoulder, bu=bust, wa=waist, hi=hip).
const BODY_DIM = {
  thin: { sh: 0.84, bu: 0.82, wa: 0.8, hi: 0.84, limb: 0.82 },
  athletic: { sh: 1.08, bu: 1.0, wa: 0.86, hi: 0.94, limb: 0.96 },
  average: { sh: 1.0, bu: 1.0, wa: 1.0, hi: 1.0, limb: 1.0 },
  muscular: { sh: 1.22, bu: 1.16, wa: 0.92, hi: 1.0, limb: 1.24 },
  curvy: { sh: 0.98, bu: 1.18, wa: 0.82, hi: 1.34, limb: 1.06 }, // strong hourglass
}

export const TOP_STYLES = [
  { id: 'tee', label: 'T-Shirt' },
  { id: 'hoodie', label: 'Hoodie' },
  { id: 'tank', label: 'Tank Top' },
]
export const BOTTOM_STYLES = [
  { id: 'pants', label: 'Pants' },
  { id: 'shorts', label: 'Shorts' },
  { id: 'skirt', label: 'Skirt' },
]

export const BODY_TYPES = [
  { id: 'thin', label: 'Thin', mul: 0.82 },
  { id: 'athletic', label: 'Athletic', mul: 0.94 },
  { id: 'average', label: 'Average', mul: 1.0 },
  { id: 'muscular', label: 'Muscular', mul: 1.16 },
  { id: 'curvy', label: 'Curvy', mul: 1.12 },
]
export const BODY_MUL = Object.fromEntries(BODY_TYPES.map((b) => [b.id, b.mul]))

// Resolve the full parametric build (widths, depth, limb thickness) for a mesh.
export function resolveBuild(avatar = {}) {
  const g = GENDER_BUILD[avatar.gender] || GENDER_BUILD.neutral
  const m = BODY_DIM[avatar.bodyType] || BODY_DIM.average
  return {
    shoulder: g.shoulder * m.sh,
    bust: g.bust * m.bu,
    waist: g.waist * m.wa,
    hip: g.hip * m.hi,
    depth: 0.34,
    limb: m.limb,
  }
}

export const SKIN_TONES = [
  { id: 'light', label: 'Light', hex: '#ffe0bd' },
  { id: 'cream', label: 'Cream', hex: '#f5cfa0' },
  { id: 'warm_beige', label: 'Warm Beige', hex: '#e8b486' },
  { id: 'light_tan', label: 'Light Tan', hex: '#d59a6a' },
  { id: 'medium_brown', label: 'Medium Brown', hex: '#a9714b' },
  { id: 'deep_brown', label: 'Deep Brown', hex: '#7d4f33' },
  { id: 'dark_brown', label: 'Dark Brown', hex: '#5a3825' },
  { id: 'ebony', label: 'Ebony', hex: '#3d271a' },
]

export const EYE_SHAPES = [
  { id: 'round', label: 'Round' },
  { id: 'almond', label: 'Almond' },
  { id: 'hooded', label: 'Hooded' },
]

export const EYE_COLORS = [
  { id: 'blue', label: 'Blue', hex: '#3b82f6' },
  { id: 'green', label: 'Green', hex: '#22c55e' },
  { id: 'brown', label: 'Brown', hex: '#6b4423' },
  { id: 'hazel', label: 'Hazel', hex: '#a67b5b' },
  { id: 'black', label: 'Black', hex: '#1a1a1a' },
]

export const HAIR_STYLES = [
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
  { id: 'curly', label: 'Curly' },
]

export const HAIR_COLORS = [
  { id: 'black', label: 'Black', hex: '#1c1c1c' },
  { id: 'brown', label: 'Brown', hex: '#5a3a22' },
  { id: 'blonde', label: 'Blonde', hex: '#e3c277' },
  { id: 'red', label: 'Red', hex: '#a83a22' },
  { id: 'purple', label: 'Purple', hex: '#7850f0' },
  { id: 'blue', label: 'Blue', hex: '#1464f0' },
]

export const SHIRT_COLORS = [
  { id: 'red', label: 'Red', hex: '#e23b3b' },
  { id: 'blue', label: 'Blue', hex: '#1464f0' },
  { id: 'green', label: 'Green', hex: '#22b07d' },
  { id: 'yellow', label: 'Yellow', hex: '#f5c542' },
  { id: 'orange', label: 'Orange', hex: '#f0822e' },
]

export const PANTS_COLORS = [
  { id: 'black', label: 'Black', hex: '#22262e' },
  { id: 'blue', label: 'Blue', hex: '#2b3a67' },
  { id: 'gray', label: 'Gray', hex: '#6b7280' },
]

export const SHOE_COLORS = [
  { id: 'black', label: 'Black', hex: '#1a1a1a' },
  { id: 'white', label: 'White', hex: '#f5f5f5' },
  { id: 'red', label: 'Red', hex: '#d83a3a' },
]

export const ACCESSORIES = [
  { id: 'backpack', label: 'Backpack', hex: '#7a4a25' },
  { id: 'hat', label: 'Cap' },
  { id: 'necklace', label: 'Necklace' },
]

// Default avatar used when nothing chosen yet.
export const DEFAULT_AVATAR = {
  gender: 'neutral',
  bodyType: 'average',
  skinTone: 'warm_beige',
  eyeShape: 'round',
  eyeColor: 'brown',
  hairStyle: 'medium',
  hairColor: 'brown',
  topStyle: 'tee',
  bottomStyle: 'pants',
  shirtColor: 'blue',
  pantsColor: 'black',
  shoeColor: 'white',
  accessories: ['backpack'],
}

// Pick a random option id from a list.
const rid = (list, rng = Math.random) => list[Math.floor(rng() * list.length)].id

export function randomAvatar(rng = Math.random) {
  const gender = rid(GENDERS, rng)
  return {
    gender,
    bodyType: rid(BODY_TYPES, rng),
    skinTone: rid(SKIN_TONES, rng),
    eyeShape: rid(EYE_SHAPES, rng),
    eyeColor: rid(EYE_COLORS, rng),
    hairStyle: rng() > 0.5 ? GENDER_BUILD[gender].defaultHair : rid(HAIR_STYLES, rng),
    hairColor: rid(HAIR_COLORS, rng),
    topStyle: rid(TOP_STYLES, rng),
    bottomStyle: rng() > 0.5 ? GENDER_BUILD[gender].defaultBottom : rid(BOTTOM_STYLES, rng),
    shirtColor: rid(SHIRT_COLORS, rng),
    pantsColor: rid(PANTS_COLORS, rng),
    shoeColor: rid(SHOE_COLORS, rng),
    accessories: rng() > 0.5 ? ['backpack'] : ['backpack', 'hat'],
  }
}

// Lookup helpers: id -> hex
const hexMap = (list) => Object.fromEntries(list.map((o) => [o.id, o.hex]))
export const SKIN_HEX = hexMap(SKIN_TONES)
export const EYE_HEX = hexMap(EYE_COLORS)
export const HAIR_HEX = hexMap(HAIR_COLORS)
export const SHIRT_HEX = hexMap(SHIRT_COLORS)
export const PANTS_HEX = hexMap(PANTS_COLORS)
export const SHOE_HEX = hexMap(SHOE_COLORS)
