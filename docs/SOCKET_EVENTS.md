# Socket.io Event Contract

Soft real-time: avatar sync ~500 ms, leaderboard broadcast every 3 s. Payloads ~2 KB.

## Client → Server
| Event | Payload | Handler |
|-------|---------|---------|
| `join_session` | `{ sessionCode, player }` (+ ack) | sessionHandler |
| `leave_session` | — | sessionHandler |
| `avatar_update` | `{ x, y, location }` | playerHandler |
| `stage_complete` | `{ stage, netWorth }` | playerHandler |
| `marketplace_trade_request` | `{ toId, itemA, itemB }` (+ ack) | marketplaceHandler |
| `marketplace_trade_accept` | `{ fromId, itemA, itemB }` | marketplaceHandler |

## Server → Client
| Event | Payload | Meaning |
|-------|---------|---------|
| `player_list` | `[{ id, name, stage, netWorth }]` | roster changed |
| `avatar_moved` | `{ id, x, y, location }` | another player moved |
| `leaderboard_update` | `[{ name, netWorth, stage, rank }]` | every 3 s |
| `trade_offer` | `{ fromId, itemA, itemB }` | incoming trade |
| `trade_complete` | `{ inventory }` | trade finalized |

## Rooms
One Socket.io room per `sessionCode`. Empty sessions are deleted automatically. Frontend client: `frontend/src/hooks/useSocket.js`.
