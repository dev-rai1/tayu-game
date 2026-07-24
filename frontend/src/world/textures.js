import * as THREE from 'three'

// Canvas-drawn textures - used for in-world text/emoji so we never depend on a
// CDN font (troika/drei <Text> fetches one). Cached by key to avoid re-creating.
const cache = new Map()

export function emojiTexture(emoji) {
  const key = `e:${emoji}`
  if (cache.has(key)) return cache.get(key)
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const x = c.getContext('2d')
  x.clearRect(0, 0, 128, 128)
  x.font = '96px "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  x.fillText(emoji, 64, 70)
  const t = new THREE.CanvasTexture(c)
  t.anisotropy = 4
  cache.set(key, t)
  return t
}

// Shrink-to-fit: measure the text and scale the font down until it fits the
// canvas (padding-aware). Without this, long words ("LEMONADE", "SPROUT
// STREET", headlines) overflow the 512px canvas and get CLIPPED at the edges.
function fitText(ctx, text, basePx, maxWidth, family) {
  let px = basePx
  ctx.font = `bold ${px}px ${family}`
  const w = ctx.measureText(text).width
  if (w > maxWidth) {
    px = Math.max(20, Math.floor((px * maxWidth) / w))
    ctx.font = `bold ${px}px ${family}`
  }
  return px
}
const POPPINS = 'Poppins, "Trebuchet MS", sans-serif'
const MONTSERRAT = 'Montserrat, Poppins, "Trebuchet MS", sans-serif'

export function labelTexture(text, { bg = '#071748', color = '#ffffff', accent = '#00DCA0' } = {}) {
  const key = `l:${text}:${bg}:${color}`
  if (cache.has(key)) return cache.get(key)
  const c = document.createElement('canvas')
  c.width = 512; c.height = 160
  const x = c.getContext('2d')
  x.clearRect(0, 0, 512, 160)
  // rounded pill
  const r = 60
  x.fillStyle = bg
  x.beginPath()
  x.moveTo(r, 8); x.arcTo(504, 8, 504, 152, r); x.arcTo(504, 152, 8, 152, r)
  x.arcTo(8, 152, 8, 8, r); x.arcTo(8, 8, 504, 8, r); x.closePath(); x.fill()
  x.lineWidth = 8; x.strokeStyle = accent; x.stroke()
  x.fillStyle = color
  x.textAlign = 'center'; x.textBaseline = 'middle'
  fitText(x, text, 74, 420, POPPINS) // 420 keeps clear of the pill's round ends
  x.fillText(text, 256, 84)
  const t = new THREE.CanvasTexture(c)
  t.anisotropy = 4
  cache.set(key, t)
  return t
}

// White rounded card, Deep Navy text - the universal "label everything" style
// (Section 2): item name on line one, price on line two; or a single big word
// for building signs. High contrast, grade 1–3 readable.
export function cardTexture(line1, line2 = null, { bg = '#ffffff', color = '#071748', accent = '#1464F0' } = {}) {
  const key = `c:${line1}:${line2}:${bg}:${color}:${accent}`
  if (cache.has(key)) return cache.get(key)
  const c = document.createElement('canvas')
  c.width = 512; c.height = line2 ? 256 : 176
  const x = c.getContext('2d')
  x.clearRect(0, 0, c.width, c.height)
  const r = 44
  x.fillStyle = bg
  x.beginPath()
  x.moveTo(r, 8); x.arcTo(c.width - 8, 8, c.width - 8, c.height - 8, r)
  x.arcTo(c.width - 8, c.height - 8, 8, c.height - 8, r)
  x.arcTo(8, c.height - 8, 8, 8, r); x.arcTo(8, 8, c.width - 8, 8, r)
  x.closePath(); x.fill()
  x.lineWidth = 10; x.strokeStyle = accent; x.stroke()
  x.textAlign = 'center'; x.textBaseline = 'middle'
  x.fillStyle = color
  if (line2) {
    fitText(x, line1, 78, 430, MONTSERRAT) // 430 = card width minus corner padding
    x.fillText(line1, 256, 88)
    x.fillStyle = accent
    fitText(x, line2, 84, 430, POPPINS)
    x.fillText(line2, 256, 184)
  } else {
    fitText(x, line1, 104, 430, MONTSERRAT)
    x.fillText(line1, 256, 94)
  }
  const t = new THREE.CanvasTexture(c)
  t.anisotropy = 4
  cache.set(key, t)
  return t
}

export function dollarTexture() {
  const key = 'dollar'
  if (cache.has(key)) return cache.get(key)
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const x = c.getContext('2d')
  x.clearRect(0, 0, 256, 256)
  x.fillStyle = '#FFD24A'; x.beginPath(); x.arc(128, 128, 118, 0, Math.PI * 2); x.fill()
  x.lineWidth = 16; x.strokeStyle = '#E0A92E'; x.beginPath(); x.arc(128, 128, 110, 0, Math.PI * 2); x.stroke()
  x.fillStyle = '#0f6b3a'; x.font = 'bold 180px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'
  x.fillText('$', 128, 142)
  const t = new THREE.CanvasTexture(c)
  t.anisotropy = 4
  cache.set(key, t)
  return t
}
