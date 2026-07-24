# Quick Start — Developer Onboarding

## Prerequisites
- Node.js 20+
- A Firebase project (optional for local dev — the backend falls back to an in-memory store)

## Install & run

```bash
git clone <repo> && cd Tayu-mvp
npm install                      # root tooling (concurrently)
npm run install:all             # frontend + backend deps

cp frontend/.env.example frontend/.env
cp backend/.env.example  backend/.env
# fill in Firebase values when ready; defaults work for local UI dev

npm run dev                     # frontend :5173 + backend :4000
```

- Frontend: http://localhost:5173
- Backend health: http://localhost:4000/health

Run them separately with `npm run dev:frontend` / `npm run dev:backend`.

## Tests
```bash
npm test                        # runs frontend (vitest) + backend (node:test)
npm --prefix frontend run test:watch
```
`frontend/src/utils/financialCalculations.test.js` covers the core money math.

## Where things live
| Path | What |
|------|------|
| `frontend/src/pages/` | Welcome → AvatarCreate → GameScreen → FinalScreen → Settings |
| `frontend/src/components/` | Stage1/2/3, WorldMap, Marketplace, Leaderboard, EventCard, HelpTooltip |
| `frontend/src/utils/` | financialCalculations, eventGenerator, marketplaceLogic, validators (pure, tested) |
| `frontend/src/hooks/` | useGameState (context), useSocket, useFirebase, useLeaderboard |
| `backend/src/socket/` | session / player / leaderboard / marketplace handlers |
| `backend/src/routes/` | REST mirrors of the socket flows |

## Build order (per spec, you are on Day 7)
1. Stage 1 event-card sequence (3 cards) → polish
2. Stage 2 full 4-week P&L loop + marketplace points
3. Stage 3 allocation sliders + 6-month sim + events
4. Multiplayer wiring (useSocket already connects; flesh out world-map avatars)
5. Stress test 15 players → deploy

## Deploy
- **Frontend → Vercel:** import repo, root = `frontend/`, framework auto-detected (`vercel.json` present).
- **Backend → Render:** uses `backend/render.yaml`; set env vars in dashboard.
- Both auto-deploy on push to `main`. Keep the Render free dyno awake with UptimeRobot hitting `/health`.
