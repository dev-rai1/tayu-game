export const CAPTION_BASE_MS = 2600
export const CAPTION_PER_WORD_MS = Object.freeze({ younger: 380, older: 260 })

export const TUTORIAL_COIN_OFFSET = Object.freeze([3.2, -1.2])
export const TUTORIAL_GREETER_OFFSET = Object.freeze([4.7, -1.2])

export function countCaptionWords(text = '') {
  return String(text).trim().split(/\s+/).filter(Boolean).length
}

export function normalizeReadingBand(value) {
  return value === 'younger' ? 'younger' : 'older'
}

export function inferReadingBand(gradeLevels = '') {
  return String(gradeLevels).trim() === 'K-2' ? 'younger' : 'older'
}

export function captionDwellMs(text, readingBand = 'older', requestedMs = 0) {
  const band = normalizeReadingBand(readingBand)
  const scaled = countCaptionWords(text) * CAPTION_PER_WORD_MS[band]
  return Math.max(CAPTION_BASE_MS, scaled, Number(requestedMs) || 0)
}

export function copyForBand(readingBand, younger, older) {
  return normalizeReadingBand(readingBand) === 'younger' ? younger : older
}

export function titleCaseObjective(title = '') {
  return String(title)
    .toLowerCase()
    .replace(/(^|\s)([a-z])/g, (_, gap, letter) => `${gap}${letter.toUpperCase()}`)
}

export function normalizeLemonadeFocus(lever = '') {
  if (lever === 'supplyMore' || lever === 'supplyLess') return 'supplies'
  if (lever === 'priceHigh' || lever === 'priceLow') return 'price'
  if (lever === 'hoursMore' || lever === 'hoursLess') return 'hours'
  if (lever === 'quality') return 'quality'
  if (lever === 'sign') return 'sign'
  return null
}

export function isInstructionalCaption(text = '') {
  const line = String(text).toLowerCase()
  return [
    'try', 'follow', 'save', 'spend', 'give', 'need', 'want', 'price', 'profit',
    'tax', 'budget', 'checking', 'savings', 'credit', 'debit', 'plant', 'sell',
    'buy', 'keep', 'change', 'next', 'lesson', 'money',
  ].some((word) => line.includes(word))
}
