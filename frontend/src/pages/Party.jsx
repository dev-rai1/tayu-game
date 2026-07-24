// Part J: THE MONEY GURU PARTY - the reward room behind the mystery door.
// A disco floor with the whole NPC cast dancing, sweeping colored lights,
// continuous money rain, "MONEY GURU!" chants, a personalized banner, its own
// party song, and a [DANCE!] button. No timers, no popups - the player leaves
// through the exit door whenever they want.
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadProfile } from '../services/walletStore.js'
import { crossfadeTo } from '../services/audio.js'

const CAST = [
  { name: 'Penny', color: '#1464F0' },
  { name: 'Theo', color: '#00DCA0' },
  { name: 'Mia', color: '#7850F0' },
  { name: 'Mr. Bram', color: '#e23b3b' },
  { name: 'Mr. Sprout', color: '#3f9a42' },
  { name: 'Milo', color: '#f0822e' },
]

export default function Party() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const dancingRef = useRef(false)
  const [dancing, setDancing] = useState(false)
  const [chant, setChant] = useState(null)
  const name = loadProfile()?.name || 'Friend'

  // guests without the badge get sent back to town, no exceptions
  useEffect(() => {
    if (!loadProfile()?.guru) navigate('/world', { replace: true })
  }, [navigate])

  useEffect(() => { crossfadeTo('party') }, [])
  useEffect(() => { dancingRef.current = dancing }, [dancing])

  // periodic MONEY GURU! chant bubbles from random dancers
  useEffect(() => {
    const t = setInterval(() => {
      const who = CAST[(Math.random() * CAST.length) | 0]
      setChant({ who: who.name, key: Date.now() })
      setTimeout(() => setChant(null), 1900)
    }, 2600)
    return () => clearInterval(t)
  }, [])

  // one canvas draws everything: beams, dancers, money rain
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    let raf
    const bills = Array.from({ length: 46 }, () => ({
      x: Math.random(), y: Math.random(), spin: Math.random() * Math.PI, vy: 0.06 + Math.random() * 0.12, vs: (Math.random() - 0.5) * 2,
    }))
    const resize = () => { cv.width = cv.clientWidth * 2; cv.height = cv.clientHeight * 2 }
    resize()
    window.addEventListener('resize', resize)

    const drawDancer = (x, y, s, color, t, big = false) => {
      const bounce = Math.abs(Math.sin(t * 6)) * 10 * s
      const sway = Math.sin(t * 6) * 8 * s
      ctx.save()
      ctx.translate(x + sway, y - bounce)
      // legs
      ctx.strokeStyle = '#0a1030'
      ctx.lineWidth = 7 * s
      ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(-6 * s, 26 * s); ctx.lineTo(-9 * s + sway * 0.4, 46 * s); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(6 * s, 26 * s); ctx.lineTo(9 * s - sway * 0.4, 46 * s); ctx.stroke()
      // body
      ctx.fillStyle = color
      ctx.beginPath(); ctx.roundRect(-13 * s, -6 * s, 26 * s, 34 * s, 10 * s); ctx.fill()
      // arms up, waving opposite phases
      ctx.strokeStyle = color
      ctx.beginPath(); ctx.moveTo(-13 * s, 2 * s); ctx.lineTo(-24 * s, -14 * s - Math.sin(t * 6) * 8 * s); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(13 * s, 2 * s); ctx.lineTo(24 * s, -14 * s + Math.sin(t * 6) * 8 * s); ctx.stroke()
      // head
      ctx.fillStyle = '#e8b486'
      ctx.beginPath(); ctx.arc(0, -18 * s, 11 * s, 0, Math.PI * 2); ctx.fill()
      // smile
      ctx.strokeStyle = '#071748'; ctx.lineWidth = 2.4 * s
      ctx.beginPath(); ctx.arc(0, -16 * s, 5.5 * s, 0.25 * Math.PI, 0.75 * Math.PI); ctx.stroke()
      if (big) {
        ctx.fillStyle = '#FFD700'
        ctx.font = `${14 * s}px sans-serif`
      }
      ctx.restore()
    }

    const draw = (now) => {
      const t = now / 1000
      const W = cv.width, H = cv.height
      ctx.clearRect(0, 0, W, H)
      // dark floor glow
      const g = ctx.createRadialGradient(W / 2, H * 0.75, 40, W / 2, H * 0.75, W * 0.7)
      g.addColorStop(0, '#1b1040'); g.addColorStop(1, '#0a0620')
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
      // sweeping disco beams
      const cols = ['#1464F0', '#00DCA0', '#7850F0', '#FFD700', '#e23b7a']
      for (let i = 0; i < 5; i++) {
        ctx.save()
        ctx.translate(W / 2, -40)
        ctx.rotate(Math.sin(t * 0.8 + i * 1.3) * 0.9)
        const bg = ctx.createLinearGradient(0, 0, 0, H)
        bg.addColorStop(0, cols[i] + 'aa'); bg.addColorStop(1, cols[i] + '00')
        ctx.fillStyle = bg
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-70, H); ctx.lineTo(70, H); ctx.closePath(); ctx.fill()
        ctx.restore()
      }
      // mirror ball
      ctx.fillStyle = '#cdd6e4'
      ctx.beginPath(); ctx.arc(W / 2, 90, 34, 0, Math.PI * 2); ctx.fill()
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = i % 2 ? '#ffffffcc' : '#9fb2d466'
        ctx.beginPath(); ctx.arc(W / 2 + Math.cos(t * 2 + i) * 26, 90 + Math.sin(t * 3 + i * 2) * 22, 4, 0, Math.PI * 2); ctx.fill()
      }
      // dancers: the whole cast in a loose arc
      CAST.forEach((c, i) => {
        const x = W * (0.14 + (i * 0.72) / (CAST.length - 1))
        const y = H * (0.62 + (i % 2) * 0.1)
        drawDancer(x, y, 2.1, c.color, t + i * 0.7)
      })
      // the player, front and center, dances when [DANCE!] is on
      if (dancingRef.current) drawDancer(W / 2, H * 0.8, 3, '#FFD700', t * 1.2, true)
      // money rain - continuous, always
      ctx.font = `${26}px sans-serif`
      for (const b of bills) {
        b.y += b.vy / 100
        b.spin += b.vs / 60
        if (b.y > 1.05) { b.y = -0.05; b.x = Math.random() }
        const x = b.x * W, y = b.y * H
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(Math.sin(b.spin) * 0.6)
        ctx.fillStyle = '#3f9a42'
        ctx.fillRect(-16, -9, 32, 18)
        ctx.fillStyle = '#bef2c8'
        ctx.font = 'bold 15px sans-serif'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('$', 0, 1)
        ctx.restore()
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0a0620] font-body text-white">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* personalized banner */}
      <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-center px-4">
        <div className="rounded-3xl border-4 border-[#FFD700] bg-navy/85 px-8 py-4 text-center shadow-2xl">
          <div className="font-display text-2xl font-extrabold sm:text-4xl" style={{ color: '#FFD700' }}>
            CONGRATULATIONS, {name.toUpperCase()}!
          </div>
          <div className="mt-1 font-display text-lg font-extrabold text-teal sm:text-xl">YOU ARE A MONEY GURU!</div>
        </div>
      </div>

      {/* chant bubbles */}
      {chant && (
        <div key={chant.key} className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 animate-bounce rounded-2xl bg-white px-5 py-2 text-lg font-extrabold text-navy shadow-xl">
          {chant.who}: "MONEY GURU!"
        </div>
      )}

      {/* controls: dance + the exit door. No timers, no popups. */}
      <div className="absolute inset-x-0 bottom-6 flex items-end justify-center gap-4 px-4">
        <button
          onClick={() => setDancing((d) => !d)}
          className={`min-h-[64px] rounded-2xl px-8 font-display text-xl font-extrabold shadow-2xl transition active:scale-95 ${dancing ? 'bg-[#FFD700] text-navy' : 'bg-electric text-white hover:bg-teal hover:text-navy'}`}
        >
          {dancing ? 'DANCING!' : 'DANCE!'}
        </button>
        <button
          onClick={() => navigate('/guru')}
          className="flex min-h-[64px] flex-col items-center justify-center rounded-t-2xl border-4 border-b-0 border-[#7a4a2e] bg-[#5a3a22] px-6 font-display text-base font-extrabold text-white shadow-2xl transition hover:bg-[#6a4a2e] active:scale-95"
        >
          <span className="text-xs text-white/70">EXIT</span>
          Leave the Party
        </button>
      </div>
    </div>
  )
}
