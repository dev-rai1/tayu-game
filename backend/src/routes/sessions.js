import { Router } from 'express'
import { sessions, getSession } from '../socket/sessionHandler.js'
import { snapshot } from '../socket/leaderboardHandler.js'

const router = Router()
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous chars

function generateCode() {
  let code
  do {
    code = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')
  } while (sessions.has(code))
  return code
}

// POST /api/sessions/create  -> { sessionCode }
router.post('/create', (req, res) => {
  const { hostId } = req.body ?? {}
  const code = generateCode()
  sessions.set(code, { code, hostId: hostId ?? null, players: new Map(), createdAt: Date.now() })
  res.json({ sessionCode: code, createdAt: Date.now() })
})

// GET /api/sessions/:code -> public session state
router.get('/:code', (req, res) => {
  const session = getSession(req.params.code.toUpperCase())
  if (!session) return res.status(404).json({ error: 'not_found' })
  res.json({
    sessionCode: session.code,
    players: [...session.players.values()],
    leaderboard: snapshot(session.code),
  })
})

// POST /api/sessions/:code/end -> close it
router.post('/:code/end', (req, res) => {
  const code = req.params.code.toUpperCase()
  const final = snapshot(code)
  sessions.delete(code)
  res.json({ success: true, finalLeaderboard: final })
})

export default router
