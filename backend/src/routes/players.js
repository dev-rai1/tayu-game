import { Router } from 'express'

const router = Router()

// Stage completion (REST mirror of the socket event; socket is the primary path).
// POST /api/players/:playerId/stage-complete
router.post('/:playerId/stage-complete', (req, res) => {
  const { stageNum, results } = req.body ?? {}
  // TODO: persist to Firebase (playerDb) + compute achievements.
  res.json({ playerId: req.params.playerId, stageNum, results, achievements: [] })
})

// GET /api/players/:playerId/stats
router.get('/:playerId/stats', (req, res) => {
  // TODO: read all-time stats from Firebase.
  res.json({ playerId: req.params.playerId, allTimeStats: { gamesPlayed: 0, bestScore: 0 }, recentGames: [] })
})

export default router
