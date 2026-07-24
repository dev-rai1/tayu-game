// In-memory session store for the scaffold. Swap for Firebase (firebase/sessionDb.js)
// when ready. Privacy-first: nothing persists beyond the live session.
export const sessions = new Map() // code -> { code, hostId, players: Map, createdAt }

const MAX_PLAYERS = Number(process.env.MAX_PLAYERS_PER_SESSION || 15)

export function getSession(code) {
  return sessions.get(code)
}

export function registerSessionHandlers(io, socket) {
  socket.on('join_session', ({ sessionCode, player } = {}, ack) => {
    const code = String(sessionCode || '').toUpperCase()
    let session = sessions.get(code)
    if (!session) {
      // Auto-create on first join (host flow). Tighten if hosts must pre-create.
      session = { code, hostId: socket.id, players: new Map(), createdAt: Date.now() }
      sessions.set(code, session)
    }
    if (session.players.size >= MAX_PLAYERS) {
      ack?.({ ok: false, reason: 'session_full' })
      return
    }
    session.players.set(socket.id, { id: socket.id, ...player, netWorth: 0, stage: 1 })
    socket.join(code)
    socket.data.sessionCode = code

    io.to(code).emit('player_list', [...session.players.values()])
    ack?.({ ok: true, code, players: [...session.players.values()] })
  })

  socket.on('leave_session', () => removeFromSession(io, socket))
  socket.on('disconnect', () => removeFromSession(io, socket))
}

function removeFromSession(io, socket) {
  const code = socket.data.sessionCode
  if (!code) return
  const session = sessions.get(code)
  if (!session) return
  session.players.delete(socket.id)
  if (session.players.size === 0) {
    sessions.delete(code) // empty → clean up
  } else {
    io.to(code).emit('player_list', [...session.players.values()])
  }
}
