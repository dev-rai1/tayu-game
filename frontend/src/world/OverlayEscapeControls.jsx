import { useGame } from './store.js'

export function OverlayEscapeControls() {
  const dialog = useGame((state) => state.dialog)
  const closeDialog = useGame((state) => state.closeDialog)

  if (!dialog || dialog.lines?.length <= 1) return null

  return (
    <button
      type="button"
      onClick={closeDialog}
      className="pointer-events-auto fixed right-4 top-[5.5rem] z-[540] min-h-[42px] rounded-xl border-2 border-white/25 bg-navy/95 px-3 text-xs font-extrabold text-white shadow-xl active:scale-95"
    >
      Skip this talk
    </button>
  )
}
