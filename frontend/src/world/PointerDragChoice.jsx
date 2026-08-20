export function PointerDragChoice({ step, onPick }) {
  return (
    <div className="mt-5">
      <div className="mb-3 text-sm font-extrabold text-navy/60">Select the answer you think is best.</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {step.choices.map((choice, index) => (
          <button
            type="button"
            key={choice.label}
            onClick={() => onPick(index)}
            className="min-h-[58px] rounded-2xl border-2 border-navy/12 bg-[#fffaf0] px-4 py-3 text-left font-bold text-navy shadow-sm transition hover:-translate-y-0.5 hover:border-navy/25 hover:bg-white hover:shadow-md focus:outline-none focus:ring-4 focus:ring-navy/10 active:scale-[.98]"
          >
            {choice.label}
          </button>
        ))}
      </div>
      <div className="mt-3 text-xs font-bold text-navy/40">All choices use the same neutral style so the correct answer is not visually revealed.</div>
    </div>
  )
}
