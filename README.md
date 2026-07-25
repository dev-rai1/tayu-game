# TAYU

A free, browser-based 3D financial-literacy game for K-5. Kids build a
character, walk a circular town, and learn real money skills through five
playable modules — earning, budgeting, banking, and investing — with a
printable certificate at the end.

**Live:** https://tayufinance.app (also on Firebase: https://tayu-financial-literacy.firebaseapp.com)

## The five modules

| # | Module | Best for | Teaches |
|---|--------|----------|---------|
| 1 | The Market & Jars | Grades K-2 | Spend / Save / Give, needs vs wants |
| 2 | The Lemonade Stand | Grades 2-4 | Costs, fair pricing, wages, profit, tax on profit |
| 3 | Budget Town | Grades 3-5 | Living within your means, planning a real day |
| 4 | The Bank of TAYU | Grades 4-6 | Accounts, interest, debit vs credit, what borrowing costs, scam safety |
| 5 | The Money Garden | Grades 4-6 | Why people invest, diversification, patience |

## Tech

React 18 + Vite + Tailwind, React-Three-Fiber/three.js (the 3D town),
Zustand (game state), optional Supabase (accounts + analytics — see
`AUTH_README.md`). Everything ships as a static SPA; no server is required
to play.

## Run it locally

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

## Build for production

```bash
cd frontend
npm install
npm run build      # output in frontend/dist
```

## Deploy to Firebase Hosting

The repo is pre-configured (`firebase.json` points Hosting at
`frontend/dist` with the SPA rewrite). One-time setup:

```bash
npm install -g firebase-tools
firebase login
firebase projects:create   # or use an existing project
# put your project id in .firebaserc (replace YOUR-FIREBASE-PROJECT-ID)
```

Then every deploy is:

```bash
cd frontend && npm run build && cd ..
firebase deploy --only hosting
```

To enable the cloud account system on Firebase Hosting, create
`frontend/.env` from `frontend/.env.example` with your Supabase keys
**before** running the build (Vite bakes env vars in at build time).

## Deploy to Vercel (current production)

```bash
cd frontend
npx vercel deploy --prod
```

`frontend/vercel.json` already carries the SPA rewrite. Set
`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` in the Vercel project
settings for cloud accounts.

## Accounts, analytics, and the admin dashboard

See [`AUTH_README.md`](AUTH_README.md) — the login system runs in on-device
demo mode until Supabase keys are provided; [`supabase-setup.sql`](supabase-setup.sql)
creates the tables, security policies, and the admin account.

## Docs

- [`WALKTHROUGH.md`](WALKTHROUGH.md) — every text box in the game, in order,
  with exact copy and triggers.
- `docs/` — earlier design notes.

## Team

Built by the TAYU team (Dev Rai, Austin Chen, Ayush Ranjan; advisor
Dr. Gaamaa Hishigsuren). Contact: tayu.finance@gmail.com
