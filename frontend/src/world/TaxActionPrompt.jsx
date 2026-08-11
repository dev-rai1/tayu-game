import { useTaxLab } from './taxLabStore.js'

export function TaxActionPrompt() {
  const nearbyAction = useTaxLab((state) => state.nearbyAction)
  const panel = useTaxLab((state) => state.panel)
  if (!nearbyAction || panel) return null

  const activate = () => window.dispatchEvent(new Event('tayu-interact'))

  return (
    <button
      type="button"
      data-tax-action-prompt="true"
      onClick={activate}
      className="pointer-events-auto fixed bottom-5 left-1/2 z-[760] flex min-h-[58px] max-w-[min(92vw,34rem)] -translate-x-1/2 items-center gap-3 rounded-2xl border-2 border-white/70 bg-navy/95 px-5 py-3 text-left text-white shadow-2xl backdrop-blur-sm transition hover:scale-[1.02] active:scale-[0.98]"
      aria-label={`Interact: ${nearbyAction.label}`}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-electric font-black text-white" aria-hidden="true">E</span>
      <span>
        <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-teal">Click here or press E</span>
        <span className="mt-0.5 block text-sm font-black leading-tight sm:text-base">{nearbyAction.label}</span>
      </span>
    </button>
  )
}
