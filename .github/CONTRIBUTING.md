# Contributing to Tayu

Short, scrappy, 11-day sprint. Keep it simple.

## Workflow

1. Branch off `main`: `git checkout -b stage1-allowance`
2. Build the feature; keep components small and specced (see `docs/COMPONENTS.md`).
3. Run `npm run dev` from the repo root and test the flow manually (see `docs/QUICK_START.md`).
4. Open a PR into `main`. CI (`.github/workflows/deploy.yml`) runs build + tests.
5. Merge → Vercel + Render auto-deploy.

## Conventions

- **Components:** one component per file, PascalCase, in `frontend/src/components/`.
- **Pure logic** (math, event generation, validation) goes in `frontend/src/utils/` and must be unit-tested.
- **Money:** store amounts as numbers in cents-free dollars; round only for display.
- **No PII:** names are display-only; never collect emails/addresses. Privacy-first.
- **Accessibility:** 16px+ body, 44px tap targets, color + pattern (never color alone), `?` help on every screen.

## Scope lock

Three stages, soft-sync multiplayer, basic marketplace. Everything else is Phase 2.

## Bugs

File a GitHub Issue using the template in `docs/` (title `[BUG] ...`, severity, repro steps, browser).
