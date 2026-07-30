export const READING_BAND_KEY = 'tayu-reading-band-v1'
export const READING_BANDS = Object.freeze({ YOUNGER: 'younger', OLDER: 'older' })
export const CAPTION_BASE_MS = 2600
export const YOUNGER_PER_WORD_MS = 380
export const OLDER_PER_WORD_MS = 260

const YOUNGER_GRADES = new Set(['K-2', '3-5', 'early-elementary', 'upper-elementary'])
const OLDER_GRADES = new Set(['6-8', '9-12', 'middle-school', 'high-school'])

export function normalizeReadingBand(value) {
  return value === READING_BANDS.YOUNGER || value === READING_BANDS.OLDER ? value : null
}

export function readingBandForGrade(value) {
  if (YOUNGER_GRADES.has(value)) return READING_BANDS.YOUNGER
  if (OLDER_GRADES.has(value)) return READING_BANDS.OLDER
  return null
}

function storedActivePathId() {
  if (typeof localStorage === 'undefined') return null
  try {
    return JSON.parse(localStorage.getItem('tayu-active-learning-path-v1') || 'null')?.id || null
  } catch {
    return null
  }
}

export function getReadingBand() {
  if (typeof localStorage === 'undefined') return READING_BANDS.OLDER
  const saved = normalizeReadingBand(localStorage.getItem(READING_BAND_KEY))
  if (saved) return saved
  return readingBandForGrade(storedActivePathId()) || READING_BANDS.OLDER
}

export function setReadingBand(value) {
  const band = normalizeReadingBand(value)
  if (!band) throw new Error('Reading band must be younger or older.')
  if (typeof localStorage !== 'undefined') localStorage.setItem(READING_BAND_KEY, band)
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tayu-reading-band-changed', { detail: band }))
  return band
}

export function setDefaultReadingBandForGrade(grade) {
  if (typeof localStorage === 'undefined' || localStorage.getItem(READING_BAND_KEY)) return getReadingBand()
  const band = readingBandForGrade(grade)
  return band ? setReadingBand(band) : getReadingBand()
}

export function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length
}

export function captionDwellMs(text, requestedMs = 0, band = getReadingBand()) {
  const perWord = band === READING_BANDS.YOUNGER ? YOUNGER_PER_WORD_MS : OLDER_PER_WORD_MS
  return Math.max(CAPTION_BASE_MS, Number(requestedMs) || 0, wordCount(text) * perWord)
}
