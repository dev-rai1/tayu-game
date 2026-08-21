export function PointerDragChoice({ step, onPick }) {
  const choose = (event, index) => {
    // Keep the 3D world/canvas from receiving the same click. These are normal
    // DOM buttons, just like the working decision buttons used elsewhere.
    event.preventDefault()
    event.stopPropagation()
    onPick(index)
  }

  return (
    <div className="mt-5 rounded-3xl border-2 border-navy/10 bg-white/90 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[.16em] text-navy/45">Choose one</div>
          <div className="mt-1 text-sm font-bold text-navy/65">Tap or click an answer. No dragging.</div>
        </div>
        <div className="rounded-full bg-navy/5 px-3 py-1 text-xs font-extrabold text-navy/50">DECISION</div>
      </div>

      <div className="flex flex-col gap-2">
        {step.choices.map((choice, index) => (
          <button
            type="button"
            key={`${index}-${choice.label}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => choose(event, index)}
            className="min-h-[64px] w-full rounded-2xl border-2 border-navy/15 bg-white px-5 py-3 text-left text-lg font-extrabold text-navy shadow-sm transition hover:-translate-y-0.5 hover:border-navy/30 hover:bg-[#f8fbff] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-navy/10 active:translate-y-0 active:scale-[.985]"
          >
            {choice.label}
          </button>
        ))}
      </div>

      <div className="mt-3 text-xs font-bold text-navy/40">Every answer uses the same style. The game gives feedback after you choose.</div>
    </div>
  )
}
