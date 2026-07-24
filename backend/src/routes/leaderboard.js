import { Router } from 'express'
import { snapshot } from '../socket/leaderboardHandler.js'

const router = Router()

// GET /api/leaderboard/:sessionCode -> ranked players
router.get('/:sessionCode', (req, res) => {
  res.json({ players: snapshot(req.params.sessionCode.toUpperCase()) })
})

export default router
