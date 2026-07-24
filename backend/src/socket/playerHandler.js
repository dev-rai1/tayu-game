import { getSession } from './sessionHandler.js'
import { broadcastLeaderboard } from './leaderboardHandler.js'

// Player progress + avatar position sync.
export function registerPlayerHandlers(io, socket) {
  // Avatar position broadcast (world map, ~500ms cadence from client).
  socket.on('avatar_update', (pos = {}) => {
    const code = socket.data.sessionCode
    if (!code) return
    socket.to(code).emit('avatar_moved', { id: socket.id, ...pos })
  })

  // Stage completion → update record, then refresh leaderboard.
  socket.on('stage_complete', ({ stage, netWorth } = {}) => {
    const code = socket.data.sessionCode
    const session = getSession(code)
    if (!session) return
    const p = session.players.get(socket.id)
    if (p) {
      p.stage = stage
      p.netWorth = netWorth ?? p.netWorth
    }
    broadcastLeaderboard(io, code)
    // TODO: achievement checks
  })
}
