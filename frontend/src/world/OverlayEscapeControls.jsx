import { useGame } from './store.js'

export function OverlayEscapeControls() {
  const dialog = useGame((state) => state.dialog)
  const closeDialog = useGame((state) => state.closeDialog)

  if (!dialog || dialog.lines?.length <= 1) return null

  return (
    <button
      type="button"
      aria-label="Skip this talk"
      onClick={closeDialog}
      className="pointer-events-auto fixed right-[max(0.75rem,env(safe-area-inset-right,0px))] top-[5.5rem] z-[540] min-h-[42px] max-w-[6rem] rounded-xl border-2 border-white/25 bg-navy/95 px-3 text-xs font-extrabold text-white shadow-xl active:scale-95"
    >
      Skip
    </button>
  )
}
