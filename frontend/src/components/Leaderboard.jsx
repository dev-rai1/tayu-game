// Multiplayer leaderboard. Feed it rows from useLeaderboard(socket.on).
const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard({ rows = [] }) {
  if (!rows.length) {
    return <p className="text-center text-white/50">Waiting for players…</p>
  }
  return (
    <ol className="card flex flex-col gap-2">
      {rows.slice(0, 10).map((p, i) => (
        <li key={p.name + i} className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-6">{MEDALS[i] ?? i + 1}</span>
            <span>{p.name}</span>
          </span>
          <span className="text-save font-bold">${Number(p.netWorth).toLocaleString()}</span>
        </li>
      ))}
    </ol>
  )
}
