# TAYU

A free, browser-based 3D financial-literacy game for K-5. Kids build a
character, walk a circular town, and learn real money skills through six
playable modules — spending and saving, entrepreneurship, budgeting, banking,
paychecks, and investing — with a printable certificate at the end.

**Live:** https://tayufinance.app (also on Firebase: https://tayu-financial-literacy.firebaseapp.com)

## The six modules

| # | Module | Best for | Teaches |
|---|--------|----------|---------|
| 1 | The Market & Jars | Grades K-2 | Spend / Save / Give, needs vs wants |
| 2 | The Lemonade Stand | Grades 2-4 | Costs, fair pricing, wages, profit, tax on profit |
| 3 | Budget Town | Grades 3-5 | Living within your means, planning a real day |
| 4 | The Bank of TAYU | Grades 4-6 | Accounts, interest, debit vs credit, what borrowing costs, scam safety |
| 5 | Paycheck Planet | Grades 4-6 | Gross vs take-home pay, withholding, budgeting, emergency savings, work/time tradeoffs |
| 6 | The Money Garden | Grades 4-6 | Investing foundations, diversification, risk, market evidence, patience, and rebalancing |

Money Garden is taught in two connected parts inside Module 6:
**6A — Investing Foundations** and **6B — Markets, Risk & Patience**.

## Tech

React 18 + Vite + Tailwind, React-Three-Fiber/three.js (the 3D town), Zustand
(game state), and Firebase Authentication + Cloud Firestore for accounts and
progress. Everything ships as a static SPA; no application server is required
to play.

## Run it locally

```bash
cd frontend
npm install
cp .env.example .env   # fill in the Firebase web configuration
npm run dev            # http://localhost:5173
```

The app also boots without Firebase variables in local practice mode.

## Build for production

```bash
cd frontend
npm install
npm run build      # output in frontend/dist
```

## Deploy to Firebase Hosting

The repo is configured for the Firebase project in `.firebaserc`. One-time CLI
setup:

```bash
npm install -g firebase-tools
firebase login
```

Then build and deploy Hosting plus Firestore security rules:

```bash
cd frontend && npm run build && cd ..
firebase deploy --only hosting,firestore:rules
```

Vite embeds the `VITE_FIREBASE_*` web configuration values during the build.
See `frontend/.env.example` and `AUTH_README.md` for the required values and
Firebase Console setup.

## Deploy to Vercel

```bash
cd frontend
npx vercel deploy --prod
```

Set the same `VITE_FIREBASE_*` variables in the Vercel project settings before
the build.

## Accounts, analytics, and the admin dashboard

See [`AUTH_README.md`](AUTH_README.md) for Firebase Authentication,
forgot-password emails, Firestore profiles/progress, security rules, admin
roles, and where each item appears in the Firebase Console.

## Docs

- [`WALKTHROUGH.md`](WALKTHROUGH.md) — every text box in the game, in order,
  with exact copy and triggers.
- `docs/` — earlier design notes.

## Team

Built by the TAYU team (Dev Rai, Austin Chen, Ayush Ranjan; advisor
Dr. Gaamaa Hishigsuren). Contact: tayu.finance@gmail.com