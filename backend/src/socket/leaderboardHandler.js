import { getSession, sessions } from './sessionHandler.js'

// Snapshot leaderboard, broadcast every ~3s per active session.
export function snapshot(code) {
  const session = getSession(code)
  if (!session) return []
  return [...session.players.values()]
    .map((p) => ({ name: p.name ?? 'Player', netWorth: p.netWorth ?? 0, stage: p.stage ?? 1 }))
    .sort((a, b) => b.netWorth - a.netWorth)
    .map((p, i) => ({ ...p, rank: i + 1 }))
}

export function broadcastLeaderboard(io, code) {
  io.to(code).emit('leaderboard_update', snapshot(code))
}

let timer = null
export function registerLeaderboardHandlers(io, _socket) {
  // Start one global 3s ticker (idempotent across connections).
  if (timer) return
  timer = setInterval(() => {
    for (const code of sessions.keys()) broadcastLeaderboard(io, code)
  }, 3000)
}
