import { useEffect, useMemo, useState } from 'react'
import { loadProfile, loadWallet, saveProfile } from '../services/walletStore.js'
import { useGame } from '../world/store.js'
import { useTaxLab } from '../world/taxLabStore.js'
import {
  bondCompletionSummary,
  journeyIncomeCarryover,
  moneyGardenHarvestSummary,
} from '../scenarios/curriculumCarryover.js'

const money = (value) => `$${Number(value || 0).toFixed(2).replace(/\.00$/, '')}`
const pct = (value) => `${Number(value || 0).toFixed(1).replace(/\.0$/, '')}%`

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-3 text-center">
      <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-navy/45">{label}</div>
      <div className="mt-1 font-display text-xl font-extrabold text-navy">{value}</div>
    </div>
  )
}

export function CurriculumCarryoverBridge() {
  const mg = useGame((state) => state.mg)
  const mgPhase = useGame((state) => state.mgPhase)
  const cards = useGame((state) => state.cards)
  const persist = useGame((state) => state.persist)
  const taxPhase = useTaxLab((state) => state.phase)
  const taxPanel = useTaxLab((state) => state.panel)
  const taxCase = useTaxLab((state) => state.taxCase)
  const [harvestOpen, setHarvestOpen] = useState(false)
  const [bondSummary, setBondSummary] = useState(null)
  const [progressVersion, setProgressVersion] = useState(0)

  const harvest = useMemo(() => moneyGardenHarvestSummary(mg), [mg])
  const carryover = useMemo(() => journeyIncomeCarryover(loadWallet() || {}, loadProfile() || {}), [progressVersion, mg?.harvest, bondSummary])

  useEffect(() => {
    const refresh = () => setProgressVersion((version) => version + 1)
    window.addEventListener('tayu-progress-saved', refresh)
    return () => window.removeEventListener('tayu-progress-saved', refresh)
  }, [])

  useEffect(() => {
    if (mgPhase !== 'done' || mg?.harvest?.confirmed) return
    if (!cards.some((card) => card.id === 'cele' || card.id === 'bridge')) return
    setHarvestOpen(true)
    useGame.setState((state) => ({
      cards: state.cards.filter((card) => card.id !== 'cele' && card.id !== 'bridge'),
    }))
  }, [cards, mg?.harvest?.confirmed, mgPhase])

  useEffect(() => {
    const onBondComplete = () => {
      const profile = loadProfile() || {}
      const summary = bondCompletionSummary(profile.bondStreet || {})
      saveProfile({
        bondStreet: {
          ...(profile.bondStreet || {}),
          profit: summary.profit,
          roiPercent: summary.roiPercent,
          practiceInterestIncome: summary.interest,
        },
      })
      setBondSummary(summary)
      setProgressVersion((version) => version + 1)
    }
    window.addEventListener('tayu-bond-street-complete', onBondComplete)
    return () => window.removeEventListener('tayu-bond-street-complete', onBondComplete)
  }, [])

  const finishGarden = (decision) => {
    const state = useGame.getState()
    const current = state.mg
    if (!current) return

    const summary = moneyGardenHarvestSummary(current)
    const companies = Object.fromEntries(Object.entries(current.companies || {}).map(([id, company]) => [
      id,
      decision === 'sell' ? { ...company, owned: 0 } : company,
    ]))
    const nextCash = decision === 'sell'
      ? Math.round((Number(current.cash || 0) + summary.stockValue) * 100) / 100
      : Number(current.cash || 0)

    useGame.setState({
      mg: {
        ...current,
        cash: nextCash,
        companies,
        harvest: {
          confirmed: true,
          decision,
          startingInvestment: summary.startingInvestment,
          endingInvestmentValue: summary.endingInvestmentValue,
          stockSaleProceeds: decision === 'sell' ? summary.stockValue : 0,
          profit: summary.profit,
          roiPercent: summary.roiPercent,
          realizedCapitalGain: decision === 'sell' ? Math.max(0, summary.profit) : 0,
          completedAt: new Date().toISOString(),
        },
      },
      cards: [],
    })
    persist()
    setHarvestOpen(false)
    setProgressVersion((version) => version + 1)
    setTimeout(() => useGame.getState().mgAct('mg.bridge'), 0)
  }

  const showTaxCarryover = Boolean(taxPanel === 'guide' || taxPhase === 'case' || taxPhase === 'steps' || taxPhase === 'complete')

  return (
    <>
      {harvestOpen && mgPhase === 'done' && (
        <div className="fixed inset-0 z-[1500] flex items-end justify-center bg-navy/25 p-4 backdrop-blur-[2px] sm:items-center" data-garden-harvest-handoff="true">
          <section className="w-full max-w-2xl rounded-[2rem] border-2 border-white/70 bg-[#fffdf8] p-5 text-navy shadow-2xl sm:p-6">
            <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#00a77a]">Module 5B · Harvest &amp; handoff</div>
            <h2 className="mt-2 font-display text-3xl font-extrabold">See what your investing decisions actually produced</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-navy/70">You started with an investing stake, watched the portfolio change, and now have to decide whether to sell the stocks or keep them invested before moving to Bond Street.</p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Started with" value={money(harvest.startingInvestment)} />
              <Stat label="Value now" value={money(harvest.endingInvestmentValue)} />
              <Stat label="Profit / loss" value={money(harvest.profit)} />
              <Stat label="Return" value={pct(harvest.roiPercent)} />
            </div>

            <div className="mt-4 rounded-2xl border border-brandpurple/20 bg-brandpurple/10 p-4 text-sm font-semibold leading-relaxed">
              <strong>Tax connection:</strong> if you sell, the practice Tax Office carries only the investment profit as a capital gain — not the full amount you receive from selling the stocks.
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => finishGarden('sell')} className="min-h-[58px] rounded-2xl bg-[#00a77a] px-5 text-base font-extrabold text-white shadow-lg">
                Sell stocks &amp; carry cash to Bond Street
              </button>
              <button type="button" onClick={() => finishGarden('hold')} className="min-h-[58px] rounded-2xl border-2 border-navy/15 bg-white px-5 text-base font-extrabold text-navy">
                Keep stocks invested &amp; continue
              </button>
            </div>
          </section>
        </div>
      )}

      {bondSummary && (
        <div className="fixed inset-0 z-[1550] flex items-end justify-center bg-navy/30 p-4 backdrop-blur-[2px] sm:items-center" data-bond-completion-summary="true">
          <section className="w-full max-w-2xl rounded-[2rem] border-2 border-white/70 bg-[#fffdf8] p-5 text-navy shadow-2xl sm:p-6">
            <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#5d8b3d]">Bond Street · investment summary</div>
            <h2 className="mt-2 font-display text-3xl font-extrabold">Your bonds paid — now calculate the result</h2>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Invested" value={money(bondSummary.principal)} />
              <Stat label="Interest earned" value={money(bondSummary.interest)} />
              <Stat label="Ending balance" value={money(bondSummary.ending)} />
              <Stat label="Return" value={pct(bondSummary.roiPercent)} />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <Stat label="Treasury" value={money(bondSummary.allocations.treasury || 0)} />
              <Stat label="Municipal" value={money(bondSummary.allocations.muni || 0)} />
              <Stat label="Corporate" value={money(bondSummary.allocations.corporate || 0)} />
            </div>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-navy/70">The practice Tax Office will carry your bond interest forward as investment income. {bondSummary.investedInMuni ? 'Because you used a municipal bond, Rex will also remind you that municipal-bond interest can receive special tax treatment.' : ''}</p>
            <button type="button" onClick={() => setBondSummary(null)} className="mt-4 min-h-[54px] w-full rounded-2xl bg-[#5d8b3d] px-5 font-extrabold text-white">Continue to the TAYU Tax Office →</button>
          </section>
        </div>
      )}

      {showTaxCarryover && (
        <aside className="pointer-events-none fixed right-3 top-[7.5rem] z-[890] hidden w-[min(29vw,20rem)] rounded-2xl border border-white/70 bg-white/95 p-4 text-navy shadow-xl backdrop-blur-md lg:block" data-tax-income-carryover="true">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#ff8a3d]">Module 7 · income carried from your journey</div>
          <div className="mt-2 font-display text-lg font-extrabold">Your earlier decisions now connect to taxes</div>
          <div className="mt-3 space-y-2 text-xs font-semibold">
            {taxCase && <div className="rounded-xl bg-navy/5 p-2"><strong>W-2 wages:</strong> {money(taxCase.wages)}</div>}
            <div className="rounded-xl bg-navy/5 p-2"><strong>Lemonade Stand profit:</strong> {money(carryover.lemonadeProfit)} <span className="text-navy/55">· business/ordinary-income bucket</span></div>
            <div className="rounded-xl bg-brandpurple/10 p-2"><strong>Money Garden realized profit:</strong> {money(carryover.realizedCapitalGain)} <span className="text-navy/55">· capital-gain bucket</span></div>
            <div className="rounded-xl bg-[#5d8b3d]/10 p-2"><strong>Bond Street interest:</strong> {money(carryover.bondInterest)} <span className="text-navy/55">· investment-interest bucket</span></div>
          </div>
          <p className="mt-3 text-[11px] font-bold leading-relaxed text-navy/60">Only profit carries forward from a stock sale — never the full sale proceeds. TAYU uses simplified practice values and does not represent current tax-law rates.</p>
        </aside>
      )}
    </>
  )
}
