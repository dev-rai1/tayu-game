import 'dotenv/config'
import http from 'node:http'
import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'

import sessionsRouter from './routes/sessions.js'
import playersRouter from './routes/players.js'
import leaderboardRouter from './routes/leaderboard.js'

import { registerSessionHandlers } from './socket/sessionHandler.js'
import { registerPlayerHandlers } from './socket/playerHandler.js'
import { registerLeaderboardHandlers } from './socket/leaderboardHandler.js'
import { registerMarketplaceHandlers } from './socket/marketplaceHandler.js'

const PORT = process.env.PORT || 4000
const ORIGIN = process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:5173'

const app = express()
app.use(cors({ origin: ORIGIN }))
app.use(express.json())

// Health check (Render pings this; UptimeRobot keeps the free dyno awake).
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }))

app.use('/api/sessions', sessionsRouter)
app.use('/api/players', playersRouter)
app.use('/api/leaderboard', leaderboardRouter)

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: ORIGIN } })

io.on('connection', (socket) => {
  console.log(`[socket] connected: ${socket.id}`)
  registerSessionHandlers(io, socket)
  registerPlayerHandlers(io, socket)
  registerLeaderboardHandlers(io, socket)
  registerMarketplaceHandlers(io, socket)

  socket.on('disconnect', () => console.log(`[socket] disconnected: ${socket.id}`))
})

server.listen(PORT, () => {
  console.log(`Tayu backend listening on :${PORT} (CORS: ${ORIGIN})`)
})

export { app, io }
