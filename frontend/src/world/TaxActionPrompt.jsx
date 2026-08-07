import { useTaxLab } from './taxLabStore.js'

export function TaxActionPrompt() {
  const nearbyAction = useTaxLab((state) => state.nearbyAction)
  const panel = useTaxLab((state) => state.panel)
  if (!nearbyAction || panel) return null

  return (
    <div
      data-tax-action-prompt="true"
      className="pointer-events-none fixed bottom-5 left-1/2 z-[760] -translate-x-1/2 rounded-full border border-white/60 bg-navy/92 px-4 py-2 text-center text-sm font-extrabold text-white shadow-xl backdrop-blur-sm"
    >
      <span className="mr-2 rounded-full bg-teal px-2 py-0.5 text-[11px] font-black text-navy">E / ACTION</span>
      {nearbyAction.label}
    </div>
  )
}
