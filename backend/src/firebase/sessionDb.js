// Session persistence (Firebase Realtime DB). Stubs — wire up when migrating
// off the in-memory store in sessionHandler.js. Schema: docs/SCHEMA.md.
import { db } from './config.js'

export async function saveSession(session) {
  const database = db()
  if (!database) return null
  await database.ref(`sessions/${session.code}`).set({
    createdAt: session.createdAt,
    hostId: session.hostId,
    active: true,
  })
}

export async function deleteSession(code) {
  const database = db()
  if (!database) return null
  await database.ref(`sessions/${code}`).remove()
}
