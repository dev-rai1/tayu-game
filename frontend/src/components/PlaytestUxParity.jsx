import { useEffect, useMemo, useState } from 'react'
import { useGame } from '../world/store.js'
import {
  HOURS_OPTIONS, QUALITY, SIGNS, WAGE_RATES,
  PRICE_MIN, PRICE_MAX, PRICE_STEP, PRICE_STEP_BIG,
} from '../scenarios/lemonade.js'

const MAX_CARD_WORDS = 25

function words(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean)
}

function shortenStoryCopy(root = document) {
  const candidates = [...root.querySelectorAll('div')].filter((node) => {
    if (!(node instanceof HTMLElement)) return false
    const text = node.textContent || ''
    return text.includes('STORY QUEST') || text.includes('READ THIS')
  })

  candidates.forEach((surface) => {
    const paragraph = surface.querySelector('p')
    if (!(paragraph instanceof HTMLElement) || paragraph.dataset.tayuStoryGuard === 'true') return
    const original = paragraph.textContent || ''
    const all = words(original)
    if (all.length <= MAX_CARD_WORDS) return

    paragraph.dataset.tayuStoryGuard = 'true'
    paragraph.dataset.tayuFullCopy = original
    paragraph.textContent = `${all.slice(0, MAX_CARD_WORDS).join(' ')}…`

    const toggle = document.createElement('button')
    toggle.type = 'button'
    toggle.textContent = 'Tell me more'
    toggle.className = 'mt-2 min-h-[44px] rounded-xl bg-navy/10 px-3 py-2 text-sm font-extrabold text-navy'
    toggle.dataset.tayuStoryToggle = 'true'
    toggle.addEventListener('click', () => {
      const expanded = toggle.dataset.expanded === 'true'
      toggle.dataset.expanded = expanded ? 'false' : 'true'
      paragraph.textContent = expanded ? `${all.slice(0, MAX_CARD_WORDS).join(' ')}…` : original
      toggle.textContent = expanded ? 'Tell me more' : 'Show less'
    })
    paragraph.insertAdjacentElement('afterend', toggle)
  })
}

function modalSurface(node) {
  if (!(node instanceof HTMLElement)) return false
  if (node.matches('[role="dialog"][aria-modal="true"]')) return true
  const cls = typeof node.className === 'string' ? node.className : ''
  return cls.includes('pointer-events-auto') &&
    (cls.includes('absolute') || cls.includes('fixed')) &&
    cls.includes('z-[') && Boolean(node.querySelector('.pop-in'))
}

function queueModalSurfaces() {
  const surfaces = [...document.querySelectorAll('[role="dialog"][aria-modal="true"], div')]
    .filter(modalSurface)
    .filter((node) => node.isConnected)

  if (surfaces.length <= 1) {
    surfaces.forEach((surface) => {
      if (surface.dataset.tayuQueuedHidden === 'true') {
        surface.style.removeProperty('visibility')
        surface.style.removeProperty('pointer-events')
        surface.removeAttribute('aria-hidden')
        delete surface.dataset.tayuQueuedHidden
      }
    })
    return
  }

  const ranked = surfaces.map((node, index) => {
    const z = Number.parseInt(getComputedStyle(node).zIndex, 10)
    return { node, index, z: Number.isFinite(z) ? z : 0 }
  }).sort((a, b) => a.z - b.z || a.index - b.index)
  const active = ranked.at(-1)?.node

  ranked.forEach(({ node }) => {
    if (node === active) {
      if (node.dataset.tayuQueuedHidden === 'true') {
        node.style.removeProperty('visibility')
        node.style.removeProperty('pointer-events')
        node.removeAttribute('aria-hidden')
        delete node.dataset.tayuQueuedHidden
      }
      return
    }
    node.dataset.tayuQueuedHidden = 'true'
    node.style.visibility = 'hidden'
    node.style.pointerEvents = 'none'
    node.setAttribute('aria-hidden', 'true')
  })
}

function PlaytestDomGuard() {
  useEffect(() => {
    const refresh = () => {
      shortenStoryCopy()
      queueModalSurfaces()
    }
    refresh()
    const observer = new MutationObserver(refresh)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [])
  return null
}

function ChoiceRow({ label, options, value, onPick, render }) {
  return (
    <div>
      <div className="mb-2 text-sm font-extrabold text-white">{label}</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((option) => {
          const id = option.id ?? option
          const selected = (value?.id ?? value) === id
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              onClick={() => onPick(id)}
              className={`min-h-[48px] rounded-xl border-2 px-3 py-2 text-sm font-extrabold transition ${selected ? 'border-teal bg-teal text-navy' : 'border-white/20 bg-white/10 text-white'}`}
            >
              {render(option)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function GuidedLemonadeConfig() {
  const lemPhase = useGame((s) => s.lemPhase)
  const bundle = useGame((s) => s.lemBundle)
  const price = useGame((s) => s.lemPrice)
  const hours = useGame((s) => s.lemHours)
  const quality = useGame((s) => s.lemQuality)
  const sign = useGame((s) => s.lemSign)
  const wageRate = useGame((s) => s.lemWageRate)
  const features = useGame((s) => s.lemFeatures)
  const save = useGame((s) => s.allocations.save)
  const setPrice = useGame((s) => s.setLemPrice)
  const setHours = useGame((s) => s.setLemHours)
  const setQuality = useGame((s) => s.setLemQuality)
  const setSign = useGame((s) => s.setLemSign)
  const setWageRate = useGame((s) => s.setLemWageRate)
  const showFormula = useGame((s) => s.showFormula)
  const confirm = useGame((s) => s.confirmPrice)
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (lemPhase !== 'template') setStep(1)
  }, [lemPhase])

  const economics = useMemo(() => {
    if (!bundle) return null
    const suppliesCost = bundle.cost + quality.addPerCup * bundle.cups + sign.cost
    const wages = wageRate * hours
    const totalCost = suppliesCost + wages
    const cpc = totalCost / bundle.cups
    const extras = quality.addPerCup * bundle.cups + sign.cost
    return { suppliesCost, wages, totalCost, cpc, canAfford: save >= Math.max(0, extras) }
  }, [bundle, quality, sign, wageRate, hours, save])

  if (lemPhase !== 'template' || !bundle || !economics) return null

  const bump = (delta) => setPrice(price === null ? 1 : Math.max(PRICE_MIN, Math.min(PRICE_MAX, price + delta)))
  const totalSteps = features >= 1 ? 3 : 2
  const priceStep = totalSteps

  return (
    <div className="pointer-events-auto absolute inset-0 z-[390] flex items-center justify-center bg-navy/85 p-4 backdrop-blur-sm">
      <section role="dialog" aria-modal="true" aria-labelledby="guided-lemonade-title" className="pop-in max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border-2 border-teal/40 bg-navy p-5 text-white shadow-2xl">
        <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-teal">Lemonade Stand · Step {step} of {totalSteps}</div>
        <h2 id="guided-lemonade-title" className="mt-1 font-display text-2xl font-extrabold">Build your stand</h2>

        {step === 1 && (
          <div className="mt-4 grid gap-5">
            <div className="rounded-2xl bg-white/5 p-3">
              <div className="mb-3 font-extrabold text-teal">⏱ Time & your pay</div>
              <ChoiceRow label="Open hours" options={HOURS_OPTIONS} value={hours} onPick={setHours} render={(h) => `${h} hours`} />
              <div className="mt-4"><ChoiceRow label="Your pay" options={WAGE_RATES} value={wageRate} onPick={setWageRate} render={(w) => `$${w}/hour`} /></div>
            </div>
            <button type="button" onClick={() => setStep(2)} className="min-h-[56px] w-full rounded-2xl bg-electric px-4 text-lg font-extrabold text-white">Next</button>
          </div>
        )}

        {step === 2 && features >= 1 && (
          <div className="mt-4 grid gap-5">
            <div className="rounded-2xl bg-white/5 p-3">
              <div className="mb-3 font-extrabold text-teal">🍋 Stand choices</div>
              <ChoiceRow label="Recipe" options={QUALITY} value={quality} onPick={setQuality} render={(q) => q.label} />
              {features >= 2 && <div className="mt-4"><ChoiceRow label="Sign" options={SIGNS} value={sign} onPick={setSign} render={(s) => s.cost ? `${s.label} · $${s.cost}` : s.label} /></div>}
            </div>
            {!economics.canAfford && <div role="status" className="rounded-2xl bg-red-950/50 p-3 text-sm font-bold text-red-100">Those extras cost more than your available money. Choose a cheaper recipe or sign.</div>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(1)} className="min-h-[52px] flex-1 rounded-2xl bg-white/10 font-extrabold">Back</button>
              <button type="button" disabled={!economics.canAfford} onClick={() => setStep(3)} className="min-h-[52px] flex-[2] rounded-2xl bg-electric font-extrabold disabled:cursor-not-allowed disabled:opacity-40">Next: set price</button>
            </div>
          </div>
        )}

        {step === priceStep && (
          <div className="mt-4 grid gap-4">
            <div className="rounded-2xl bg-white/5 p-3">
              <div className="font-extrabold text-teal">💵 Cost & price</div>
              <div className="mt-2 grid gap-1 text-sm font-bold text-white/85">
                <div className="flex justify-between"><span>Supplies</span><span>${economics.suppliesCost.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Your work</span><span>${economics.wages.toFixed(2)}</span></div>
                <div className="flex justify-between text-white"><span>Total cost</span><span>${economics.totalCost.toFixed(2)}</span></div>
                <div className="flex justify-between text-sun"><span>Cost per cup</span><span>${economics.cpc.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Town tax</span><span>10% of profit</span></div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 p-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="font-extrabold">Price per cup</span>
                <button type="button" onClick={showFormula} className="rounded-xl bg-teal px-3 py-2 text-xs font-extrabold text-navy">How do I pick?</button>
              </div>
              <div className="mt-3 flex items-center justify-center gap-2">
                <button type="button" onClick={() => bump(-PRICE_STEP_BIG)} className="h-12 w-14 rounded-xl bg-white/10 font-bold">−25¢</button>
                <button type="button" onClick={() => bump(-PRICE_STEP)} className="h-12 w-12 rounded-xl bg-white/10 font-bold">−5¢</button>
                <div className="w-24 text-3xl font-extrabold text-sun">{price === null ? '$ —' : `$${price.toFixed(2)}`}</div>
                <button type="button" onClick={() => bump(PRICE_STEP)} className="h-12 w-12 rounded-xl bg-white/10 font-bold">+5¢</button>
                <button type="button" onClick={() => bump(PRICE_STEP_BIG)} className="h-12 w-14 rounded-xl bg-white/10 font-bold">+25¢</button>
              </div>
              {price === null && <div id="lemonade-price-help" role="status" className="mt-2 text-sm font-bold text-teal">Set a price to open your stand.</div>}
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(Math.max(1, priceStep - 1))} className="min-h-[56px] flex-1 rounded-2xl bg-white/10 font-extrabold">Back</button>
              <button type="button" aria-describedby={price === null ? 'lemonade-price-help' : undefined} disabled={!economics.canAfford || price === null} onClick={confirm} className="min-h-[56px] flex-[2] rounded-2xl bg-electric px-4 text-lg font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40">Open for business!</button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export function PlaytestUxParity() {
  return (
    <>
      <PlaytestDomGuard />
      <GuidedLemonadeConfig />
    </>
  )
}
