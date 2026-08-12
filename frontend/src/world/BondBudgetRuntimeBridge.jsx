import { useEffect } from 'react'
import { useGame } from './store.js'
import { defaultSplit, SPLIT_CONFIRM } from '../scenarios/budgetTown.js'

const IDS = ['pocket', 'bank', 'bond', 'garden']
const r2 = (value) => Math.round(Number(value || 0) * 100) / 100
const fmt = (value) => r2(value).toLocaleString('en-US', { maximumFractionDigits: 2 })
function normalizeSplit(split, total) {
  if (split && Number.isFinite(Number(split.bond))) return split
  const fallback = defaultSplit(total)
  if (!split) return fallback
  const pocket = Math.max(0, Math.round(Number(split.pocket || fallback.pocket))), bank = Math.max(0, Math.round(Number(split.bank || fallback.bank))), bond = Math.max(0, Math.round(Number(fallback.bond || 0))), garden = Math.max(0, total - pocket - bank - bond)
  return { pocket, bank, bond, garden }
}
export function BondBudgetRuntimeBridge() {
  useEffect(() => {
    const current = useGame.getState()
    if (current.__bondBudgetPatched) return undefined
    useGame.setState({
      __bondBudgetPatched: true,
      btSetSplit: (id, rawValue) => {
        if (!IDS.includes(id)) return
        const state = useGame.getState(), bt = state.bt
        if (!bt) return
        const total = Math.max(0, Math.round(Number(bt.leftover || 0))), split = normalizeSplit(bt.split, total), value = Math.max(0, Math.min(total, Math.round(Number(rawValue || 0)))), others = IDS.filter((key) => key !== id), rest = total - value, oldOtherTotal = others.reduce((sum, key) => sum + Number(split[key] || 0), 0)
        let remaining = rest; const next = { ...split, [id]: value }
        others.forEach((key, index) => { if (index === others.length - 1) next[key] = remaining; else { const portion = oldOtherTotal > 0 ? Math.round(rest * (Number(split[key] || 0) / oldOtherTotal)) : Math.floor(rest / others.length); next[key] = Math.max(0, Math.min(remaining, portion)); remaining -= next[key] } })
        useGame.setState((x) => ({ bt: x.bt ? { ...x.bt, split: next } : x.bt }))
      },
      btConfirmSplit: () => {
        const game = useGame.getState(), bt = game.bt
        if (!bt) return
        const split = normalizeSplit(bt.split, Math.round(Number(bt.leftover || 0)))
        useGame.setState((x) => ({ split: { ...split }, btPanel: null, bt: x.bt ? { ...x.bt, stage: 'split', split } : x.bt }))
        game.persist(); game.pushCards([{ id: 'btplan', speaker: 'The Budget Keeper', text: `${SPLIT_CONFIRM} Pocket $${fmt(split.pocket)} | Bank $${fmt(split.bank)} | Bonds $${fmt(split.bond)} | Garden $${fmt(split.garden)}.`, pie: { ...split }, learn: 'allocation', buttons: [{ label: 'Send it to its homes!', act: 'bt.deposit' }] }])
      },
    })
    const repair = () => { const state = useGame.getState(); if (!state.bt?.split || Number.isFinite(Number(state.bt.split.bond))) return; const total = Math.max(0, Math.round(Number(state.bt.leftover || 0))), split = normalizeSplit(state.bt.split, total); useGame.setState((x) => ({ bt: x.bt ? { ...x.bt, split } : x.bt, split: x.split ? { ...x.split, bond: x.split.bond ?? split.bond } : x.split })) }
    repair(); const unsub = useGame.subscribe(repair); return unsub
  }, [])
  return null
}
