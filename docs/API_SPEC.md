# REST API Spec (Express)

Base URL (prod): `https://tayu-backend.onrender.com`

| Method | Route | Body | Response |
|--------|-------|------|----------|
| GET | `/health` | — | `{ ok, ts }` |
| POST | `/api/sessions/create` | `{ hostId }` | `{ sessionCode, createdAt }` |
| GET | `/api/sessions/:code` | — | `{ sessionCode, players[], leaderboard[] }` |
| POST | `/api/sessions/:code/end` | `{ hostId }` | `{ success, finalLeaderboard }` |
| POST | `/api/players/:playerId/stage-complete` | `{ stageNum, results }` | `{ netWorth, achievements }` |
| GET | `/api/players/:playerId/stats` | — | `{ allTimeStats, recentGames }` |
| GET | `/api/leaderboard/:sessionCode` | — | `{ players[] }` |

**Auth:** anonymous Firebase ID token in `Authorization: Bearer <token>` (see `middleware/auth.js`). In local dev with no Firebase configured, auth passes through with `uid = dev-anonymous`.

**Note:** the live game runs primarily over Socket.io (see `SOCKET_EVENTS.md`); these REST routes are for create/lookup/teardown and solo-mode persistence. Status: implemented against the in-memory store; player persistence routes are TODO pending Firebase wiring.
