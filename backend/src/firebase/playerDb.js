// Player persistence (Firebase Realtime DB). Stubs — used for solo-mode
// save/resume and all-time stats. Schema: docs/SCHEMA.md.
import { db } from './config.js'

export async function savePlayerState(playerId, state) {
  const database = db()
  if (!database) return null
  await database.ref(`players/${playerId}/soloGameState`).set(state)
}

export async function getPlayerStats(playerId) {
  const database = db()
  if (!database) return null
  const snap = await database.ref(`players/${playerId}/allTimeStats`).get()
  return snap.exists() ? snap.val() : { gamesPlayed: 0, bestScore: 0 }
}
