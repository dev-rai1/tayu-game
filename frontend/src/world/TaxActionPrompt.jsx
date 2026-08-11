import { TAX_CASES } from '../scenarios/paycheckPlanet.js'
import { useTaxLab } from './taxLabStore.js'
import './taxWorkbench.css'

function shortLabel(phase, nearbyAction) {
  if (nearbyAction) return 'Interact'
  if (phase === 'intro') return 'Start Module 6'
  if (phase === 'case') return 'Walk closer'
  if (phase === 'steps') return 'Walk closer'
  if (phase === 'complete') return 'Talk to Maya'
  return 'Interact'
}

function runVisibleTaxAction(nearbyAction) {
  const lab = useTaxLab.getState()
  if (lab.panel) return false

  // The visible HUD button is already only mounted while Module 6 is active, so
  // do not make its click path depend on a second global-mode flag. That extra
  // guard could briefly be stale and made the on-screen E button look clickable
  // while doing nothing. Intro must always open Maya immediately.
  if (lab.phase === 'intro') {
    lab.openGuide()
    return true
  }

  if (!nearbyAction) return false

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

  // Keep the E affordance visible anywhere in Module 6. It becomes actionable
  // when the player reaches the current glowing target; during a decision panel
  // it stays visible but subdued so the control never appears to disappear.
  const canActivate = !panel && (Boolean(nearbyAction) || phase === 'intro')
  const label = panel ? 'Finish this step' : shortLabel(phase, nearbyAction)

  const activate = () => {
    if (!canActivate) return
    runVisibleTaxAction(nearbyAction)
  }

  return (
    <div
      data-tax-action-prompt="true"
      className="pointer-events-none fixed inset-x-0 bottom-[max(0.9rem,env(safe-area-inset-bottom))] z-[960] flex justify-center px-3"
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        onClick={activate}
        disabled={!canActivate}
        className={`tax-workbench-enter pointer-events-auto flex min-h-12 items-center gap-2 rounded-full border-2 border-white/80 bg-navy/95 px-3 py-2 text-white shadow-2xl backdrop-blur-md transition ${canActivate ? 'hover:scale-[1.03] active:scale-[0.98]' : 'cursor-default opacity-75'}`}
        aria-label={canActivate ? `Press E to ${label}` : 'E interaction is available in the Tax Lab when you reach the active target'}
      >
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-black text-white shadow-md ${canActivate ? 'bg-electric' : 'bg-white/20'}`} aria-hidden="true">E</span>
        <span className="pr-1 text-xs font-black uppercase tracking-[0.12em] sm:text-sm">{label}</span>
      </button>
    </div>
  )
}
