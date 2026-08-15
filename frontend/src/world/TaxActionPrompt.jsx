import { TAX_CASES } from '../scenarios/paycheckPlanet.js'
import { useTaxLab } from './taxLabStore.js'
import './taxWorkbench.css'

function shortLabel(phase, nearbyAction) {
  if (nearbyAction) return nearbyAction.label || 'Interact'
  if (phase === 'intro') return 'Talk to Rex · start the TAYU Tax Office'
  if (phase === 'complete') return 'Talk to Rex · review the TAYU Tax Office'
  return 'Interact'
}

function runVisibleTaxAction(nearbyAction) {
  const lab = useTaxLab.getState()
  if (lab.panel || !nearbyAction) return false

  if (nearbyAction.kind === 'guide') {
    lab.openGuide()
    return true
  }

  if (nearbyAction.kind === 'client') {
    const taxCase = TAX_CASES.find((item) => item.id === nearbyAction.caseId)
    if (!taxCase) return false
    lab.previewClient(taxCase)
    return true
  }

  if (nearbyAction.kind === 'station') {
    return Boolean(lab.openStation(nearbyAction.stepNumber))
  }

  return false
}

export function TaxActionPrompt() {
  const nearbyAction = useTaxLab((state) => state.nearbyAction)
  const panel = useTaxLab((state) => state.panel)
  const phase = useTaxLab((state) => state.phase)

  const canActivate = !panel && Boolean(nearbyAction)
  if (!canActivate) return null

  const label = shortLabel(phase, nearbyAction)

  return (
    <div
      data-tax-action-prompt="true"
      className="pointer-events-none fixed inset-x-0 bottom-[max(6.5rem,calc(env(safe-area-inset-bottom)+5rem))] z-[960] flex justify-center px-3 sm:bottom-[max(2rem,env(safe-area-inset-bottom))]"
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        onClick={() => runVisibleTaxAction(nearbyAction)}
        className="tax-workbench-enter pointer-events-auto flex min-h-[76px] max-w-[min(92vw,34rem)] items-center gap-4 rounded-2xl border-4 border-white bg-navy/95 px-5 py-3 text-white shadow-2xl backdrop-blur-md transition hover:scale-[1.03] active:scale-[0.98]"
        aria-label={`Press E or click here; tap on mobile to ${label}`}
      >
        <span className="grid h-14 min-w-14 shrink-0 place-items-center rounded-xl border-2 border-white bg-electric px-4 font-display text-3xl font-black text-white shadow-lg" aria-hidden="true">E</span>
        <span className="min-w-0 text-left leading-tight">
          <span className="block text-xs font-black uppercase tracking-[0.14em] text-white/75">Press E or click here · tap on mobile</span>
          <span className="mt-0.5 block text-lg font-black sm:text-xl">{label}</span>
        </span>
      </button>
    </div>
  )
}
