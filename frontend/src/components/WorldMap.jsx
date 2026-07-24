// Top-down "town" hub. In multiplayer, other players' avatars render here too.
// For the scaffold it shows the three stage locations + session banner.
const LOCATIONS = [
  { id: 1, icon: '🏦', label: 'Allowance Bank' },
  { id: 2, icon: '🎨', label: 'Business District' },
  { id: 3, icon: '💼', label: 'Job Market' },
]

export default function WorldMap({ currentStage, sessionCode }) {
  return (
    <header className="card">
      <div className="mb-3 flex items-center justify-between text-sm text-white/70">
        <span className="font-display text-lg text-highlight">Tayu Town</span>
        {sessionCode && <span>Session: {sessionCode}</span>}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {LOCATIONS.map((loc) => (
          <div
            key={loc.id}
            className={`rounded-2xl p-4 text-center transition ${
              loc.id === currentStage ? 'bg-highlight/20 ring-2 ring-highlight' : 'bg-white/5 opacity-60'
            }`}
          >
            <div className="text-3xl">{loc.icon}</div>
            <div className="mt-1 text-xs">{loc.label}</div>
          </div>
        ))}
      </div>
      {/* TODO: render live player avatars (useSocket world-map sync, 500ms) */}
    </header>
  )
}
