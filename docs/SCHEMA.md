# Firebase Realtime DB Schema

```
tayu-db/
├── sessions/
│   └── <CODE>/                 # 4-char session code (e.g. MONY)
│       ├── createdAt
│       ├── hostId
│       ├── active
│       ├── players/
│       │   └── <playerId>/
│       │       ├── name
│       │       ├── avatarColor
│       │       ├── stage
│       │       ├── netWorth
│       │       ├── stage1Results: { saved, spent, gave }
│       │       ├── stage2Business
│       │       ├── stage2Profit
│       │       ├── inventory: [itemId, ...]
│       │       └── lastUpdated
│       └── leaderboard          # snapshot, recomputed every 3s
├── players/
│   └── <playerId>/
│       ├── userId               # firebase anonymous uid
│       ├── name
│       ├── soloGameState        # for solo save/resume
│       └── allTimeStats: { gamesPlayed, bestScore }
└── metadata/
    ├── config/version
    └── logs/
```

## Security rules (summary)
- `sessions/<code>` is world-readable (public lobby state).
- A player may only write their own `players/<playerId>` node (`$playerId === auth.uid`).
- See the spec §10.2 for the full rules JSON. Sessions auto-delete after 7 days; live data is privacy-first and not retained between sessions.

Server access goes through `backend/src/firebase/{config,sessionDb,playerDb}.js`. Until Firebase is configured the backend uses an in-memory store (`socket/sessionHandler.js`).
