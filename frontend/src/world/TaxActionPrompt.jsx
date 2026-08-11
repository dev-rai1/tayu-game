import { runTaxInteraction } from './TaxWorldInteractionBridge.jsx'
import { useTaxLab } from './taxLabStore.js'
import './taxWorkbench.css'

function fallbackForPhase(phase, stepNumber) {
  if (phase === 'intro') return 'Talk to Maya to begin the Tax Lab'
  if (phase === 'case') return 'Walk to a glowing taxpayer · press E when you are close'
  if (phase === 'steps') return `Walk to the glowing station${stepNumber ? ` · step ${stepNumber}` : ''} · press E when you are close`
  if (phase === 'complete') return 'Return to Maya · press E when you are close'
  return 'Press E to interact in the Tax Lab'
}

export function TaxActionPrompt() {
  const nearbyAction = useTaxLab((state) => state.nearbyAction)
  const panel = useTaxLab((state) => state.panel)
  const phase = useTaxLab((state) => state.phase)
  const stepNumber = useTaxLab((state) => state.stepNumber)

  // Decision panels temporarily replace the world prompt. As soon as the learner
  // returns to the map, the bottom prompt comes back automatically.
  if (panel) return null

  const instruction = nearbyAction?.label || fallbackForPhase(phase, stepNumber)
  const canActivate = Boolean(nearbyAction) || phase === 'intro'

  const activate = () => {
    if (!canActivate) return
    runTaxInteraction()
  }

  return (
    <div
      key={`${phase}:${stepNumber || 0}:${instruction}`}
      data-tax-action-prompt="true"
      className="tax-workbench-enter pointer-events-none fixed inset-x-0 bottom-4 z-[900] flex justify-center px-3 sm:bottom-5"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex w-full max-w-[38rem] items-center gap-3 rounded-2xl border-2 border-white/80 bg-navy/95 p-3 text-white shadow-2xl backdrop-blur-md sm:p-4">
        <button
          type="button"
          onClick={activate}
          disabled={!canActivate}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-electric text-xl font-black text-white shadow-lg transition hover:scale-105 active:scale-95 disabled:cursor-default disabled:opacity-80 sm:h-14 sm:w-14"
          aria-label={canActivate ? `Interact: ${instruction}` : 'Press E when you reach the glowing target'}
        >
          E
        </button>

        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-black uppercase tracking-[0.17em] text-teal">
            {canActivate ? 'Press E or tap the button' : 'E interaction available in this tax area'}
          </div>
          <div className="mt-0.5 text-sm font-black leading-snug sm:text-base">{instruction}</div>
        </div>
      </div>
    </div>
  )
}
