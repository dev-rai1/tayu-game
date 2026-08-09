# Aug. 9 PDF Closure Audit

Source: **TAYU Finance — Comprehensive App Improvement & Bug Fix Plan** (Aug. 9, 2026).

This document is the release gate for every finding in that report. A finding is marked **CODE-CLOSED** only when the current source contains the fix and regression coverage protects it. Items the PDF itself labels **NOT TESTED** remain **LIVE-VALIDATION** rather than being falsely presented as confirmed defects or verified production behavior.

## Confirmed bugs and shared issues

| PDF item | Status | Current protection |
|---|---|---|
| Bug #1 `/avatar` missing `tax` reward look + null crash | CODE-CLOSED | `AvatarRewards.jsx` includes Tax Pro Look and skips incomplete reward metadata/look entries; regression test checks both. |
| Bug #2 Module 1 incorrectly locked | CODE-CLOSED | `ModuleSelect.jsx` allows plain sessions and the first incomplete required module; Module 1 is playable as the first required entry instead of locking itself behind itself. Regression coverage protects the rule. |
| Bug #3 teacher Module 6 persistence | CODE-CLOSED | `classroom.js` defaults and serializer permit module 6; analytics completion denominator is 6. |
| Bug #4 modal `querySelectorAll` transition error | CODE-CLOSED | `DialogAccessibility.jsx` guards the active dialog and optional-chains DOM queries. |
| Bug #5 2D `How to Play` shows 3D controls | CODE-CLOSED IN THIS PR | `AccessibleWorld.jsx` consumes the shared help request and opens a 2D-only destination-button dialog, while closing the underlying shared 3D help state so contradictory instructions do not coexist. |
| Bug #6 top-left HUD/Admin/Skip overlap | CODE-CLOSED | Current anchors are separated: jar HUD left/top, Skip Talk right/top, Admin right/bottom. Regression protects those placements. |
| Bug #7 persistent 2D intro/background clutter | CODE-CLOSED | Intro is dismissible/reopenable and guidance/status surfaces use opaque navy backgrounds. |
| Landing cookie prompt overlap | CODE-CLOSED | Desktop consent prompt is compact/right-anchored; mobile retains a readable full-width treatment. |
| Protected-route auth rehydration bounce | CODE-CLOSED | Protected gates wait for Firebase session restoration before redirecting to login. |
| Replay stale Module 1 jar state | CODE-CLOSED | Fresh Week-1 initialization uses base state; scenario start resets SPEND/SAVE/GIVE and the working balance. |
| Jar over-allocation/wrap anomaly | CODE-CLOSED | Allocation is clamped to the remaining wallet before subtraction. |

## Module 1 learning improvements

| PDF improvement | Status | Current protection |
|---|---|---|
| Name the `$7 < $8` consequence and allow re-allocation | CODE-CLOSED | `jarScenario.js` produces exact shortfall feedback and reset/re-allocation wording. |
| Show the running affordability/trade-off live | CODE-CLOSED IN THIS PR | `JarPlanCoach.jsx` updates the $8 toy status, SAVE/GIVE participation, remaining dollars, and plan quality while dollars move. |
| Fewer words + more icons + optional audio for younger learners | CODE-CLOSED IN THIS PR | The live plan coach is icon-led and concise with one-tap read-aloud. Existing lesson/dialog coach continues to provide Read aloud and reading-band pacing. |
| Collapse the intro after step 1 | CODE-CLOSED | Accessible 2D intro can be acknowledged and reopened from a small info control. |
| Mode-aware help | CODE-CLOSED IN THIS PR | Dedicated 2D help interception described above. |
| Reward the plan, not only completion | CODE-CLOSED / MADE EXPLICIT IN THIS PR | Birthday success already requires the $8 SPEND goal plus positive SAVE and GIVE amounts before later jar-badge/reward progression. The live coach now explicitly labels when that three-jar plan is reward-ready, reinforcing why the Golden Money Look is earned. |

## P0/P1/P2/P3 release checklist

- P0 Tax Pro Look + null guard: closed.
- Protected route definitions remain covered for `/world`, `/tax-paycheck`, `/guru`, `/party`, and `/path-complete`; avatar reward rendering is crash-guarded.
- Module 1 entry gating: closed/regression protected.
- Module 6 teacher enable/save: closed/regression protected.
- Module 1 replay/reset source chain: protected (fresh state, scenario reset, allocation clamp, jar badge path). A deployed human play-through remains in live validation below.
- Later-module persistence restoration remains in `initWorld`; Week 1 intentionally starts fresh so narrative and wallet cannot disagree.
- Focus handler, 2D help, HUD separation, consequence feedback, 2D intro, cookie layout, and auth rehydration are all covered by source/regression gates.

## PDF Appendix: explicitly NOT TESTED items

The PDF did not establish a defect for these. They are therefore tracked as **LIVE-VALIDATION**, not silently labeled “fixed”:

1. Modules 2, 3, 4, 5, 6A, and 6B full gameplay paths.
2. 3D world visual navigation/rendering on real WebGL hardware.
3. Full Module 1 human play-through: allocate → consequence → completion → Golden Money Look → Play Again.
4. Admin dashboard `/dashboard` behavior with a real admin session.
5. Downloaded CSV contents from a class containing real student analytics.
6. Mobile and tablet visual layouts on real devices.
7. “Try my session” plus each protected deep-link in a deployed Firebase-authenticated browser.

CI/build/unit/regression success is required before this PR can merge, but CI is not a substitute for the real-device/live checks above. Keeping that distinction is part of the no-false-assurance release gate.
