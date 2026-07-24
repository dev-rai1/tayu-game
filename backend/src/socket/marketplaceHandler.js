import { getSession } from './sessionHandler.js'

// Peer-to-peer marketplace trades. Both players must own what they offer.
export function registerMarketplaceHandlers(io, socket) {
  socket.on('marketplace_trade_request', ({ toId, itemA, itemB } = {}, ack) => {
    const code = socket.data.sessionCode
    const session = getSession(code)
    if (!session) return ack?.({ ok: false, reason: 'no_session' })

    const a = session.players.get(socket.id)
    const b = session.players.get(toId)
    if (!a || !b) return ack?.({ ok: false, reason: 'player_missing' })

    const aHas = (a.inventory ?? []).includes(itemA)
    const bHas = (b.inventory ?? []).includes(itemB)
    if (!aHas || !bHas) return ack?.({ ok: false, reason: 'item_missing' })

    // Forward the offer; finalize when the recipient accepts.
    io.to(toId).emit('trade_offer', { fromId: socket.id, itemA, itemB })
    ack?.({ ok: true })
  })

  socket.on('marketplace_trade_accept', ({ fromId, itemA, itemB } = {}) => {
    const code = socket.data.sessionCode
    const session = getSession(code)
    if (!session) return
    const a = session.players.get(fromId)
    const b = session.players.get(socket.id)
    if (!a || !b) return

    a.inventory = (a.inventory ?? []).filter((i) => i !== itemA).concat(itemB)
    b.inventory = (b.inventory ?? []).filter((i) => i !== itemB).concat(itemA)

    io.to(fromId).emit('trade_complete', { inventory: a.inventory })
    socket.emit('trade_complete', { inventory: b.inventory })
  })
}
