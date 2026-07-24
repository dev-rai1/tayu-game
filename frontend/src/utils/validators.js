// validators.js
// Input guards shared across screens.

/** Stage 1: the three jars must sum exactly to the allowance. */
export const jarsSumValid = (jars, total = 20) => {
  const sum = (jars.spend ?? 0) + (jars.save ?? 0) + (jars.give ?? 0)
  return Math.abs(sum - total) < 0.001
}

/** Stage 3: the five buckets must sum exactly to take-home. */
export const allocationValid = (buckets, total) => {
  const sum = Object.values(buckets).reduce((a, b) => a + (b ?? 0), 0)
  return Math.abs(sum - total) < 0.01
}

/** Session code: 4 uppercase alphanumerics. */
export const isValidSessionCode = (code) => /^[A-Z0-9]{4}$/.test(code ?? '')

/** Player name: 1–16 chars, no angle brackets (display-only, but sanitize). */
export const isValidName = (name) =>
  typeof name === 'string' && name.trim().length >= 1 && name.trim().length <= 16 && !/[<>]/.test(name)

/** Clamp a slider value into [min, max]. */
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n))
