import { useEffect, useRef } from 'react'

// ONE animated-background engine, themed per screen (Round 2, B3).
//  theme='play'    - landing: walking, ball, balloon, bench, waving pairs
//  theme='greet'   - About: NPCs saying hi - wave-at-camera, bows, group waves
//  theme='excited' - Avatar Builder: running, jumping, cheering
// Same sprites, palette, sky and ~30fps budget everywhere; pauses when the
// tab is hidden. No names, no text, ever.

const SKINS = ['#ffe0bd', '#e8b486', '#d59a6a', '#a9714b', '#7d4f33']
const SHIRTS = ['#1464F0', '#00DCA0', '#7850F0', '#f0822e', '#e23b3b', '#f5c542']

function makeNPCs(W, H, theme) {
  const ground = H * 0.78
  const rnd = (a, b) => a + Math.random() * (b - a)
  const npc = (over = {}) => ({
    x: rnd(0, W), y: ground + rnd(-8, 26), dir: Math.random() > 0.5 ? 1 : -1,
    speed: rnd(18, 34), size: rnd(0.8, 1.15), phase: rnd(0, 10),
    skin: SKINS[(Math.random() * SKINS.length) | 0],
    shirt: SHIRTS[(Math.random() * SHIRTS.length) | 0],
    kind: 'walk', ...over,
  })
  const list = []
  if (theme === 'greet') {
    // a friendly line-up saying hi to the reader - three distinct loops
    for (let i = 0; i < 7; i++) {
      const kinds = ['waveCam', 'bow', 'groupWave']
      list.push(npc({ kind: kinds[i % 3], x: W * (0.1 + i * 0.13), dir: 1, speed: 0, phase: i * 0.9 }))
    }
  } else if (theme === 'excited') {
    // calmer count, but bursting with energy - run, jump, cheer
    for (let i = 0; i < 3; i++) list.push(npc({ kind: 'run', speed: rnd(55, 80) }))
    for (let i = 0; i < 2; i++) list.push(npc({ kind: 'jump', x: W * rnd(0.15, 0.85), speed: 0 }))
    for (let i = 0; i < 2; i++) list.push(npc({ kind: 'cheer', x: W * rnd(0.1, 0.9), speed: 0 }))
  } else {
    // 'play' - the landing behavior
    for (let i = 0; i < 4; i++) list.push(npc())
    list.push(npc({ kind: 'balloon', speed: 22 }))
    list.push(npc({ kind: 'wave', x: W * 0.18, dir: 1, speed: 0 }))
    list.push(npc({ kind: 'wave', x: W * 0.18 + 46, dir: -1, speed: 0 }))
    list.push(npc({ kind: 'kick', x: W * 0.62, dir: 1, speed: 0 }))
    list.push(npc({ kind: 'kick', x: W * 0.62 + 120, dir: -1, speed: 0 }))
    list.push(npc({ kind: 'bench', x: W * 0.84, speed: 0 }))
  }
  return { list, ground }
}

function drawNPC(ctx, n, t) {
  const s = n.size
  const moving = n.kind === 'walk' || n.kind === 'balloon' || n.kind === 'run'
  const runFast = n.kind === 'run'
  const step = moving ? Math.sin(t * (runFast ? 11 : 6) + n.phase) : 0
  let bob = moving ? Math.abs(Math.sin(t * (runFast ? 11 : 6) + n.phase)) * (runFast ? 4 : 2.2) : Math.sin(t * 1.8 + n.phase) * 1.2
  if (n.kind === 'jump') bob = Math.max(0, Math.sin(t * 3 + n.phase)) * 16
  if (n.kind === 'cheer') bob = Math.max(0, Math.sin(t * 5 + n.phase)) * 6
  // bow: the whole body tilts forward periodically (our "hat tip")
  const bowT = n.kind === 'bow' ? Math.max(0, Math.sin(t * 1.4 + n.phase)) * 0.5 : 0
  const x = n.x, y = n.y - bob * s
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(s * (n.dir < 0 ? -1 : 1), s)
  if (bowT) ctx.rotate(bowT * 0.5)
  const sitting = n.kind === 'bench'
  const legLen = sitting ? 7 : 13
  ctx.strokeStyle = '#22262e'
  ctx.lineCap = 'round'
  ctx.lineWidth = 5
  ctx.beginPath(); ctx.moveTo(-3, -14); ctx.lineTo(-3 + step * 5, -14 + legLen); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(3, -14); ctx.lineTo(3 - step * 5, -14 + legLen); ctx.stroke()
  ctx.fillStyle = n.shirt
  ctx.beginPath(); ctx.roundRect(-8, -34, 16, 22, 7); ctx.fill()
  // arms per behavior
  ctx.strokeStyle = n.shirt
  ctx.lineWidth = 5
  const wave1 = Math.sin(t * 4 + n.phase) > 0
  const groupWave = n.kind === 'groupWave' ? Math.sin(t * 3 + n.phase * 2) : 0
  const bothUp = n.kind === 'cheer' || n.kind === 'jump'
  const camWave = n.kind === 'waveCam'
  if (bothUp) {
    const lift = 6 * Math.sin(t * 5 + n.phase)
    ctx.beginPath(); ctx.moveTo(-7, -30); ctx.lineTo(-13, -46 - lift); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(7, -30); ctx.lineTo(13, -46 + lift); ctx.stroke()
  } else if (camWave || n.kind === 'wave' || (n.kind === 'groupWave' && groupWave > 0)) {
    ctx.beginPath(); ctx.moveTo(-7, -30); ctx.lineTo(-12, wave1 ? -46 : -40); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(7, -30); ctx.lineTo(12, -20 - step * 3); ctx.stroke()
  } else {
    ctx.beginPath(); ctx.moveTo(-7, -30); ctx.lineTo(-12, -20 + step * 3); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(7, -30); ctx.lineTo(12, -20 - step * 3); ctx.stroke()
  }
  // head + face
  ctx.fillStyle = n.skin
  ctx.beginPath(); ctx.arc(0, -42, 8.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#3c2a1a'
  ctx.beginPath(); ctx.arc(0, -44, 8.5, Math.PI, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#5a3a22'
  ctx.lineWidth = 1.4
  ctx.beginPath(); ctx.arc(1.5, -40, 3.2, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke()
  if (n.kind === 'balloon') {
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(10, -26); ctx.lineTo(16, -58 + Math.sin(t * 2 + n.phase) * 3); ctx.stroke()
    ctx.fillStyle = '#e2564f'
    ctx.beginPath(); ctx.ellipse(16, -66 + Math.sin(t * 2 + n.phase) * 3, 8, 10, 0, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
}

export function TownBackground({ theme = 'play', scrim = 0 }) {
  const ref = useRef()
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let raf, paused = false, last = 0
    let W = (canvas.width = canvas.offsetWidth)
    let H = (canvas.height = canvas.offsetHeight)
    let world = makeNPCs(W, H, theme)
    let ball = { t: 0 }

    const onResize = () => {
      W = canvas.width = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
      world = makeNPCs(W, H, theme)
    }
    const onVis = () => { paused = document.hidden }
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVis)

    const BUILDINGS = [
      { x: 0.06, w: 90, h: 110, c: '#b7c8f5' }, { x: 0.2, w: 70, h: 80, c: '#f3d9a8' },
      { x: 0.35, w: 110, h: 95, c: '#c9b8ef' }, { x: 0.55, w: 80, h: 120, c: '#a8ddc8' },
      { x: 0.72, w: 100, h: 90, c: '#f5bcae' }, { x: 0.88, w: 75, h: 105, c: '#bcd8f0' },
    ]

    function frame(ts) {
      raf = requestAnimationFrame(frame)
      if (paused) return
      if (ts - last < 50) return // Decorative canvas is smooth enough at 20fps and leaves time for the UI.
      const dt = Math.min((ts - last) / 1000, 0.1)
      last = ts
      const t = ts / 1000
      const ground = world.ground

      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, '#aee2ff'); sky.addColorStop(0.7, '#e8f6ff'); sky.addColorStop(1, '#d1efdc')
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H)
      const sx = W * 0.82 + Math.sin(t * 0.05) * 20, sy = H * 0.16
      const glow = ctx.createRadialGradient(sx, sy, 10, sx, sy, 90)
      glow.addColorStop(0, 'rgba(255,220,110,0.95)'); glow.addColorStop(1, 'rgba(255,220,110,0)')
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(sx, sy, 90, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#ffd24a'; ctx.beginPath(); ctx.arc(sx, sy, 34, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#e0a92e'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(sx, sy + 4, 14, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke()
      ctx.fillStyle = '#e0a92e'
      ctx.beginPath(); ctx.arc(sx - 10, sy - 4, 3, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(sx + 10, sy - 4, 3, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.92)'
      for (let i = 0; i < 3; i++) {
        const cx = ((t * (8 + i * 4) + i * 340) % (W + 260)) - 130
        const cy = H * (0.12 + i * 0.07)
        for (const [ox, oy, r] of [[0, 0, 26], [24, 6, 20], [-24, 8, 18]]) {
          ctx.beginPath(); ctx.arc(cx + ox, cy + oy, r, 0, Math.PI * 2); ctx.fill()
        }
      }
      const par = Math.sin(t * 0.07) * 6
      for (const b of BUILDINGS) {
        const bx = b.x * W + par
        ctx.fillStyle = b.c
        ctx.fillRect(bx, ground - b.h, b.w, b.h)
        ctx.fillStyle = 'rgba(7,23,72,0.18)'
        ctx.beginPath(); ctx.moveTo(bx - 6, ground - b.h); ctx.lineTo(bx + b.w / 2, ground - b.h - 26); ctx.lineTo(bx + b.w + 6, ground - b.h); ctx.closePath(); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.55)'
        for (let wy = ground - b.h + 16; wy < ground - 18; wy += 26)
          for (let wx = bx + 12; wx < bx + b.w - 14; wx += 26) ctx.fillRect(wx, wy, 12, 14)
      }
      for (const tx of [0.14, 0.47, 0.66, 0.95]) {
        const x = tx * W + par * 1.4
        ctx.fillStyle = '#8a5a36'; ctx.fillRect(x - 3, ground - 34, 6, 34)
        ctx.fillStyle = '#5fa84a'
        ctx.beginPath(); ctx.arc(x, ground - 46, 20, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#7cc25c'
        ctx.beginPath(); ctx.arc(x - 10, ground - 38, 13, 0, Math.PI * 2); ctx.fill()
      }
      const g = ctx.createLinearGradient(0, ground - 6, 0, H)
      g.addColorStop(0, '#8cbf6a'); g.addColorStop(1, '#7aad59')
      ctx.fillStyle = g; ctx.fillRect(0, ground - 6, W, H - ground + 6)
      ctx.fillStyle = '#e3cfa0'
      ctx.beginPath(); ctx.ellipse(W / 2, ground + 40, W * 0.42, 26, 0, 0, Math.PI * 2); ctx.fill()

      if (theme === 'play') {
        const benchX = W * 0.84
        ctx.fillStyle = '#a9743f'
        ctx.fillRect(benchX - 26, world.ground - 12, 52, 6)
        ctx.fillRect(benchX - 24, world.ground - 6, 5, 10)
        ctx.fillRect(benchX + 19, world.ground - 6, 5, 10)
        ball.t += dt
        const k1 = world.list.find((n) => n.kind === 'kick')
        const k2 = [...world.list].reverse().find((n) => n.kind === 'kick')
        if (k1 && k2) {
          const p = (Math.sin(ball.t * 1.6) + 1) / 2
          const bx = k1.x + (k2.x - k1.x) * p
          const by = world.ground + 8 - Math.sin(p * Math.PI) * 34
          ctx.fillStyle = '#ffffff'
          ctx.beginPath(); ctx.arc(bx, by, 7, 0, Math.PI * 2); ctx.fill()
          ctx.strokeStyle = '#e2564f'; ctx.lineWidth = 2
          ctx.beginPath(); ctx.arc(bx, by, 7, 0.2, 2.4); ctx.stroke()
        }
      }

      for (const n of world.list) {
        if (n.kind === 'walk' || n.kind === 'balloon' || n.kind === 'run') {
          n.x += n.dir * n.speed * dt
          if (n.x > W + 30) { n.x = -30 }
          if (n.x < -30) { n.x = W + 30 }
        }
        drawNPC(ctx, n, t)
      }

      // readability scrim (A6/B4): soft white wash over the whole scene
      if (scrim > 0) {
        ctx.fillStyle = `rgba(255,255,255,${scrim})`
        ctx.fillRect(0, 0, W, H)
      }
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [theme, scrim])
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}
