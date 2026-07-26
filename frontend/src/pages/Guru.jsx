// Round 5 Part K: entering the unlocked party house lands HERE directly -
// the certificate screen, with the party (dancers, disco beams, money rain)
// animating dimly BEHIND it. No dance button, no exit-door step. Party music
// plays; the certificate stays readable.
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { loadProfile } from '../services/walletStore.js'
import { MuteButton } from '../components/MuteButton.jsx'
import { crossfadeTo } from '../services/audio.js'

const CAST = [
  { name: 'Penny', color: '#1464F0' }, { name: 'Theo', color: '#00DCA0' },
  { name: 'Mia', color: '#7850F0' }, { name: 'Mr. Bram', color: '#e23b3b' },
  { name: 'Mr. Sprout', color: '#3f9a42' }, { name: 'Milo', color: '#f0822e' },
  { name: 'Banker Bea', color: '#071748' }, { name: 'Mayor Penny-Wise', color: '#FFD700' },
]

// The party backdrop: disco beams, the dancing cast, continuous money rain -
// dialed down behind the certificate so it stays readable.
function PartyBackdrop() {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    let raf
    const bills = Array.from({ length: 34 }, () => ({
      x: Math.random(), y: Math.random(), spin: Math.random() * Math.PI, vy: 0.06 + Math.random() * 0.1, vs: (Math.random() - 0.5) * 2,
    }))
    const resize = () => { cv.width = cv.clientWidth; cv.height = cv.clientHeight }
    resize()
    window.addEventListener('resize', resize)
    const drawDancer = (x, y, sc, color, t) => {
      const bounce = Math.abs(Math.sin(t * 6)) * 10 * sc
      const sway = Math.sin(t * 6) * 8 * sc
      ctx.save()
      ctx.translate(x + sway, y - bounce)
      ctx.strokeStyle = '#0a1030'; ctx.lineWidth = 7 * sc; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(-6 * sc, 26 * sc); ctx.lineTo(-9 * sc, 46 * sc); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(6 * sc, 26 * sc); ctx.lineTo(9 * sc, 46 * sc); ctx.stroke()
      ctx.fillStyle = color
      ctx.beginPath(); ctx.roundRect(-13 * sc, -6 * sc, 26 * sc, 34 * sc, 10 * sc); ctx.fill()
      ctx.strokeStyle = color
      ctx.beginPath(); ctx.moveTo(-13 * sc, 2 * sc); ctx.lineTo(-24 * sc, -14 * sc - Math.sin(t * 6) * 8 * sc); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(13 * sc, 2 * sc); ctx.lineTo(24 * sc, -14 * sc + Math.sin(t * 6) * 8 * sc); ctx.stroke()
      ctx.fillStyle = '#e8b486'
      ctx.beginPath(); ctx.arc(0, -18 * sc, 11 * sc, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }
    let last = 0
    const draw = (now) => {
      raf = requestAnimationFrame(draw)
      if (now - last < 50) return
      last = now
      const t = now / 1000
      const W = cv.width, H = cv.height
      ctx.clearRect(0, 0, W, H)
      const g = ctx.createRadialGradient(W / 2, H * 0.75, 40, W / 2, H * 0.75, W * 0.7)
      g.addColorStop(0, '#141043'); g.addColorStop(1, '#080a24')
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
      const cols = ['#1464F0', '#00DCA0', '#7850F0', '#FFD700', '#e23b7a']
      for (let i = 0; i < 5; i++) {
        ctx.save()
        ctx.translate(W / 2, -40)
        ctx.rotate(Math.sin(t * 0.8 + i * 1.3) * 0.9)
        const bg = ctx.createLinearGradient(0, 0, 0, H)
        bg.addColorStop(0, cols[i] + '66'); bg.addColorStop(1, cols[i] + '00')
        ctx.fillStyle = bg
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-70, H); ctx.lineTo(70, H); ctx.closePath(); ctx.fill()
        ctx.restore()
      }
      CAST.forEach((c, i) => {
        const x = W * (0.08 + (i * 0.84) / (CAST.length - 1))
        const y = H * (0.72 + (i % 2) * 0.12)
        drawDancer(x, y, 1.7, c.color, t + i * 0.7)
      })
      for (const b of bills) {
        b.y += b.vy / 100
        b.spin += b.vs / 60
        if (b.y > 1.05) { b.y = -0.05; b.x = Math.random() }
        ctx.save()
        ctx.translate(b.x * W, b.y * H)
        ctx.rotate(Math.sin(b.spin) * 0.6)
        ctx.globalAlpha = 0.8
        ctx.fillStyle = '#3f9a42'
        ctx.fillRect(-14, -8, 28, 16)
        ctx.fillStyle = '#bef2c8'
        ctx.font = 'bold 13px sans-serif'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('$', 0, 1)
        ctx.restore()
      }
    }
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} className="fixed inset-0 h-full w-full opacity-60 print:hidden" />
}

const SITE = 'https://tayu-rho.vercel.app'
const LOGO = '/assets/tayu-logo.webp'
const LINKS = [
  { label: 'Email', href: 'mailto:tayu.finance@gmail.com' },
  { label: 'Instagram', href: 'https://www.instagram.com/tayu.finance' },
  { label: 'Facebook', href: 'https://www.facebook.com/share/1BmGNEpdrV/' },
]

// jsPDF cannot embed webp - rasterize the logo to a PNG data URL first.
function logoPng() {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.width; c.height = img.height
      c.getContext('2d').drawImage(img, 0, 0)
      resolve(c.toDataURL('image/png'))
    }
    img.onerror = () => resolve(null)
    img.src = LOGO
  })
}

async function buildPdf(name, dateStr) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' }) // 792 x 612
  const W = 792, H = 612, CX = W / 2
  // background + navy border frame
  doc.setFillColor(255, 253, 246); doc.rect(0, 0, W, H, 'F')
  doc.setDrawColor(7, 23, 72); doc.setLineWidth(10); doc.rect(24, 24, W - 48, H - 48)
  // inner blue rule
  doc.setDrawColor(20, 100, 240); doc.setLineWidth(2); doc.rect(40, 40, W - 80, H - 80)
  // teal corner accents
  doc.setFillColor(0, 220, 160)
  const c = 26
  doc.rect(40, 40, c, c, 'F'); doc.rect(W - 40 - c, 40, c, c, 'F')
  doc.rect(40, H - 40 - c, c, c, 'F'); doc.rect(W - 40 - c, H - 40 - c, c, c, 'F')
  // logo
  const png = await logoPng()
  if (png) doc.addImage(png, 'PNG', CX - 32, 60, 64, 64)
  // headings
  doc.setFont('helvetica', 'bold'); doc.setTextColor(7, 23, 72)
  doc.setFontSize(30); doc.text('CERTIFICATE OF ACHIEVEMENT', CX, 168, { align: 'center' })
  doc.setFont('helvetica', 'normal'); doc.setFontSize(15); doc.setTextColor(90, 98, 120)
  doc.text('proudly presented to', CX, 200, { align: 'center' })
  // the player's real name - huge, blue
  doc.setFont('helvetica', 'bold'); doc.setFontSize(56); doc.setTextColor(20, 100, 240)
  doc.text(name, CX, 268, { align: 'center' })
  // MONEY GURU in gold
  doc.setFontSize(34); doc.setTextColor(255, 215, 0)
  doc.text('MONEY GURU', CX, 322, { align: 'center' })
  // achievement line
  doc.setFont('helvetica', 'normal'); doc.setFontSize(14); doc.setTextColor(60, 68, 90)
  doc.text('Mastered saving, smart spending, giving, running a business,', CX, 362, { align: 'center' })
  doc.text('investing, budgeting, and banking.', CX, 382, { align: 'center' })
  // date + site + signature
  doc.setFontSize(13); doc.setTextColor(7, 23, 72)
  doc.text(dateStr, 120, 480, { align: 'center' })
  doc.setDrawColor(7, 23, 72); doc.setLineWidth(1)
  doc.line(60, 466, 180, 466)
  doc.setTextColor(90, 98, 120); doc.text('Date', 120, 496, { align: 'center' })
  doc.setTextColor(7, 23, 72); doc.text('The TAYU Team', W - 120, 480, { align: 'center' })
  doc.line(W - 180, 466, W - 60, 466)
  doc.setTextColor(90, 98, 120); doc.text('Signed', W - 120, 496, { align: 'center' })
  doc.setFontSize(12); doc.setTextColor(0, 150, 120)
  doc.text('tayu-rho.vercel.app', CX, 540, { align: 'center' })
  return doc
}

export default function Guru() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const name = loadProfile()?.name || 'Friend'
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  useEffect(() => {
    const profile = loadProfile()
    if (!profile?.guru) navigate('/world', { replace: true })
    else if (!profile.assessment?.post) navigate('/assessment/post', { replace: true })
  }, [navigate])

  useEffect(() => { crossfadeTo('party') }, []) // K: the party plays behind the certificate

  const download = async () => {
    const doc = await buildPdf(name, dateStr)
    doc.save(`TAYU_Money_Guru_${name.replace(/\s+/g, '_')}.pdf`)
  }
  const share = async () => {
    const data = { title: 'TAYU Money Guru', text: `${name} just became a TAYU Money Guru!`, url: SITE }
    if (navigator.share) {
      try { await navigator.share(data) } catch { /* user closed the sheet */ }
    } else {
      try {
        await navigator.clipboard.writeText(SITE)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch { /* clipboard unavailable */ }
    }
  }

  return (
    <div className="relative min-h-screen overflow-y-auto bg-navy py-10 font-body text-white print:bg-white">
      <PartyBackdrop />
      <div className="fixed left-4 top-4 z-20 flex items-center gap-2 print:hidden">
        <img src={LOGO} alt="TAYU" className="h-11 w-11 rounded-2xl shadow-lg" />
        <MuteButton />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        {/* badge reveal */}
        <div className="pop-in mx-auto grid h-32 w-32 place-items-center rounded-full border-8 shadow-2xl print:hidden" style={{ borderColor: '#FFD700', background: 'radial-gradient(circle at 35% 30%, #1e3aa8, #071748)' }}>
          <img src={LOGO} alt="TAYU" className="h-16 w-16 rounded-2xl" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl print:hidden" style={{ color: '#FFD700' }}>
          CONGRATULATIONS, {name.toUpperCase()}!
        </h1>
        <p className="mt-2 text-lg text-white/85 print:hidden">
          You saved, you shopped smart, you gave, you ran a business, you invested, you budgeted, and you banked. That makes you a true MONEY GURU.
        </p>

        {/* the live certificate - printable as-is */}
        <div className="mx-auto mt-8 rounded-lg bg-[#fffdf6] p-3 text-navy shadow-2xl" style={{ aspectRatio: '792/612' }}>
          <div className="relative flex h-full flex-col items-center justify-center border-[6px] border-navy p-4">
            <div className="absolute inset-3 border-2 border-electric" />
            {['left-3 top-3', 'right-3 top-3', 'left-3 bottom-3', 'right-3 bottom-3'].map((pos) => (
              <div key={pos} className={`absolute ${pos} h-5 w-5 bg-teal`} />
            ))}
            <img src={LOGO} alt="" className="h-12 w-12 rounded-xl sm:h-16 sm:w-16" />
            <div className="mt-2 font-display text-lg font-extrabold tracking-wide sm:text-2xl">CERTIFICATE OF ACHIEVEMENT</div>
            <div className="mt-1 text-xs text-navy/60 sm:text-sm">proudly presented to</div>
            <div className="mt-1 font-display text-3xl font-extrabold text-electric sm:text-5xl">{name}</div>
            <div className="mt-1 font-display text-xl font-extrabold sm:text-3xl" style={{ color: '#FFD700', textShadow: '0 1px 0 #b8860b' }}>MONEY GURU</div>
            <div className="mt-2 max-w-md text-[10px] text-navy/70 sm:text-xs">
              Mastered saving, smart spending, giving, running a business, investing, budgeting, and banking.
            </div>
            <div className="mt-3 flex w-full justify-between px-6 text-[10px] text-navy/70 sm:px-10 sm:text-xs">
              <span className="border-t border-navy pt-1">{dateStr}</span>
              <span className="text-teal">tayu-rho.vercel.app</span>
              <span className="border-t border-navy pt-1">The TAYU Team</span>
            </div>
          </div>
        </div>

        {/* v9 3.2: the trophy shelf - one collectible badge per module */}
        <div className="mx-auto mt-6 max-w-md rounded-3xl bg-white/10 p-5 print:hidden">
          <div className="text-center text-sm font-extrabold uppercase tracking-wide text-teal">My badge shelf</div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {[
              ['jars', 'JAR MASTER', '#1464F0'],
              ['lemonade', 'LEMONADE TYCOON', '#FFD700'],
              ['budget', 'BUDGET BOSS', '#00DCA0'],
              ['bank', 'BANK BUILDER', '#7850F0'],
              ['garden', 'MONEY GARDENER', '#00b37f'],
            ].map(([id, label, color]) => {
              const earned = (loadProfile()?.badges || []).includes(id)
              return (
                <div key={id} className="grid place-items-center gap-1" style={{ opacity: earned ? 1 : 0.3 }}>
                  <div className="grid h-14 w-14 place-items-center rounded-full border-4" style={{ borderColor: color, background: earned ? color + '33' : 'transparent' }}>
                    <div className="h-6 w-6 rounded-full" style={{ background: color }} />
                  </div>
                  <div className="max-w-[76px] text-center text-[9px] font-extrabold leading-tight text-white/80">{label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* R10 v8 Finale: the five skills, one plain line each - something a
            kid can read to a grown-up. Then a guilt-free stop. */}
        <div className="mx-auto mt-6 max-w-md rounded-3xl bg-white/10 p-5 text-left print:hidden">
          <div className="text-center text-sm font-extrabold uppercase tracking-wide text-teal">What I can do now</div>
          <ul className="mt-2 space-y-1.5 text-sm font-bold text-white/90">
            <li>I can split my money to spend, save, and give.</li>
            <li>I can set a fair price and earn a real profit.</li>
            <li>I can budget my week - needs first, wants after.</li>
            <li>I can use a bank and know what borrowing costs.</li>
            <li>I can grow money with patience in the garden.</li>
          </ul>
          <p className="mt-3 text-center text-xs font-bold text-white/60">
            You finished the whole journey - stopping here is a WIN. Come back any time to replay a favorite part.
          </p>
        </div>

        {/* actions */}
        <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
          <button onClick={download} className="btn-primary min-h-[56px] px-6">Download PDF</button>
          <button onClick={() => window.print()} className="min-h-[56px] rounded-2xl bg-white px-6 font-bold text-navy transition active:scale-95">Print</button>
          <button onClick={share} className="min-h-[56px] rounded-2xl bg-white px-6 font-bold text-navy transition active:scale-95">{copied ? 'Link copied!' : 'Share'}</button>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSc4IgEETBk_Serp_OM0FQNH0o91OAOvbsjWK_DAGMVtz64aEw/viewform" target="_blank" rel="noopener" className="grid min-h-[56px] place-items-center rounded-2xl bg-white px-6 font-bold text-navy transition active:scale-95">
            Teacher Feedback
          </a>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSdfko_Uc7k7xuMRDY_ZO1mzOrqK72cgybKUjy5Mk7OkS-9w_w/viewform" target="_blank" rel="noopener" className="grid min-h-[56px] place-items-center rounded-2xl bg-white px-6 font-bold text-navy transition active:scale-95">
            Student Feedback
          </a>
        </div>

        {/* borderless links row (A3 style) */}
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-1 print:hidden">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener" className="text-sm font-bold text-teal underline-offset-4 hover:underline">
              {l.label}
            </a>
          ))}
        </div>

        <button onClick={() => navigate('/world')} className="mt-8 min-h-[56px] rounded-2xl bg-white/10 px-8 font-bold text-white transition hover:bg-white/20 active:scale-95 print:hidden">
          Return to Town
        </button>
      </div>
    </div>
  )
}
