import { create } from 'zustand'
import { loadProfile, saveProfile } from '../services/walletStore.js'

export const BOND_TYPES = [
  { id: 'treasury', title: 'U.S. Treasury', safety: 3, rate: 0.03, borrower: 'federal government' },
  { id: 'muni', title: 'Muni Bond', safety: 3, rate: 0.04, borrower: 'state or local government' },
  { id: 'corporate', title: 'Corporate Bond', safety: 2, rate: 0.06, borrower: 'company' },
]
const r2 = (value) => Math.round(Number(value || 0) * 100) / 100
const blankAllocation = () => ({ treasury: 0, muni: 0, corporate: 0 })
const normalizeStake = (value) => Math.max(12, Math.round(Number(value || 0)))
export function bondOutcome(stake, allocation) {
  const principal = BOND_TYPES.reduce((sum, bond) => sum + Number(allocation?.[bond.id] || 0), 0)
  const interest = BOND_TYPES.reduce((sum, bond) => sum + Number(allocation?.[bond.id] || 0) * bond.rate, 0)
  return { stake: r2(stake), principal: r2(principal), interest: r2(interest), finish: r2(principal + interest), muniInvested: Number(allocation?.muni || 0) > 0 }
}
export const useBondStreet = create((set, get) => ({
  phase: 'intro', panelOpen: false, nearby: false, stake: 30, allocation: blankAllocation(), result: null,
  begin: (stake) => {
    const saved = loadProfile()?.bondStreetProgress
    const nextStake = normalizeStake(stake)
    if (saved && saved.completed !== true && Number(saved.stake) === nextStake) {
      set({ phase: saved.phase || 'intro', panelOpen: false, nearby: false, stake: nextStake, allocation: { ...blankAllocation(), ...(saved.allocation || {}) }, result: saved.result || null })
      return
    }
    set({ phase: 'intro', panelOpen: false, nearby: false, stake: nextStake, allocation: blankAllocation(), result: null })
    saveProfile({ bondStreetProgress: { stake: nextStake, phase: 'intro', allocation: blankAllocation(), completed: false } })
  },
  open: () => set({ panelOpen: true }), close: () => set({ panelOpen: false }), setNearby: (nearby) => set({ nearby: Boolean(nearby) }),
  startAllocation: () => { set({ phase: 'allocate', panelOpen: true }); const s = get(); saveProfile({ bondStreetProgress: { stake: s.stake, phase: 'allocate', allocation: s.allocation, completed: false } }) },
  setAllocation: (id, rawValue) => {
    if (!BOND_TYPES.some((bond) => bond.id === id)) return
    const s = get(), stake = s.stake, value = Math.max(0, Math.min(stake, Math.round(Number(rawValue || 0))))
    const others = BOND_TYPES.map((bond) => bond.id).filter((bondId) => bondId !== id), rest = stake - value
    const priorTotal = Number(s.allocation[others[0]] || 0) + Number(s.allocation[others[1]] || 0)
    const first = priorTotal > 0 ? Math.round(rest * (Number(s.allocation[others[0]] || 0) / priorTotal)) : Math.floor(rest / 2)
    const allocation = { ...s.allocation, [id]: value, [others[0]]: first, [others[1]]: rest - first }
    set({ allocation }); saveProfile({ bondStreetProgress: { stake, phase: s.phase, allocation, completed: false } })
  },
  autoSplit: () => { const stake = get().stake, treasury = Math.round(stake * 0.4), muni = Math.round(stake * 0.3); set({ allocation: { treasury, muni, corporate: stake - treasury - muni } }) },
  confirmAllocation: () => {
    const s = get(), total = Object.values(s.allocation).reduce((sum, value) => sum + Number(value || 0), 0)
    if (Math.round(total) !== Math.round(s.stake)) return false
    const result = bondOutcome(s.stake, s.allocation)
    set({ phase: 'results', result, panelOpen: true })
    saveProfile({ bondStreetProgress: { stake: s.stake, phase: 'results', allocation: s.allocation, result, completed: false }, muniBondInvested: result.muniInvested, bondAllocation: s.allocation })
    return true
  },
  showHarvest: () => { const s = get(); set({ phase: 'harvest', panelOpen: true }); saveProfile({ bondStreetProgress: { stake: s.stake, phase: 'harvest', allocation: s.allocation, result: s.result, completed: false } }) },
  complete: () => {
    const s = get(), profile = loadProfile() || {}, badges = [...new Set([...(profile.badges || []), 'bond'])]
    saveProfile({ badges, muniBondInvested: Boolean(s.result?.muniInvested), bondAllocation: s.allocation, bondStreetResult: s.result, bondStreetProgress: { stake: s.stake, phase: 'complete', allocation: s.allocation, result: s.result, completed: true } })
    set({ phase: 'complete', panelOpen: false })
  },
  reset: () => { set({ phase: 'intro', panelOpen: false, nearby: false, stake: 30, allocation: blankAllocation(), result: null }); saveProfile({ bondStreetProgress: null, bondStreetResult: null, bondAllocation: null, muniBondInvested: false }) },
}))
