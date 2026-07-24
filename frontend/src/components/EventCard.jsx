// Reusable random-event card. Used by all three stages.
// Props: event { text, concept?, prompt? }, onChoose(choice: 'yes' | 'no' | 'ok')
export default function EventCard({ event, onChoose }) {
  if (!event) return null
  const hasChoice = Boolean(event.prompt)
  return (
    <div className="card mx-auto max-w-sm text-center">
      <div className="mb-3 text-5xl">{event.emoji ?? '🎴'}</div>
      <p className="text-lg font-bold">{event.text}</p>
      {event.prompt && <p className="mt-2 text-white/80">{event.prompt}</p>}

      <div className="mt-4 flex justify-center gap-3">
        {hasChoice ? (
          <>
            <button className="btn-primary" onClick={() => onChoose?.('yes')}>Yes</button>
            <button className="btn-secondary" onClick={() => onChoose?.('no')}>No</button>
          </>
        ) : (
          <button className="btn-primary" onClick={() => onChoose?.('ok')}>OK</button>
        )}
      </div>

      {event.concept && (
        <p className="mt-3 text-sm text-highlight">💡 {event.concept}</p>
      )}
    </div>
  )
}
