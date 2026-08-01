# TAYU Discovery Feedback Implementation Audit

Date: August 1, 2026

## Scope

This audit consolidates the requested discovery-call feedback for April, Sania/Sanaya, Dia, Chetna Shah, Oral, and the general tester notes. It intentionally excludes Take Charge Today, the Economic Awareness Council, and Thano 101.

The audit uses the available prior tester transcripts and summaries, the current `main` branch, and merged/open pull-request history. The Google Drive task-tracker sheet was not directly available through the connected tools in this session, so any wording that exists only in that sheet still requires a final human cross-check.

## Implementation status

| Repeated finding | Current status | Evidence / action |
| --- | --- | --- |
| Looking or walking the wrong way can produce a half-blank or split-looking world | Fixed in this branch | The old rectangular movement boundary extended beyond the circular island. `WorldBoundaryGuard` now keeps the player and maximum camera orbit over rendered ground. |
| Canvas can retain the wrong size after orientation, browser-toolbar, split-screen, or compressed-window changes | Fixed in this branch | `CanvasViewportGuard` re-syncs renderer size, camera aspect, viewport, and scissor state after relevant viewport changes. Dynamic viewport CSS keeps the world at the visible screen height. |
| Explanation boxes overlap or cover controls | Merged | PR #113 added shared overlay visibility rules and narrow-screen sheets. PR #137 reduced the game to one prominent guidance surface and made optional helpers collapsible. |
| Too much text appears at once | Merged | PR #115 shortened and split text-heavy content. PR #137 reduced card sizes, added scrolling, and added safe skip/dismiss controls. |
| Learners need exact next-step guidance without repeated popups | Merged | PR #52 centralized exact task/place/control guidance. PR #127 made guidance contextual. PR #137 keeps optional guidance collapsed and suppresses it while a task panel is active. |
| Younger readers need more time and read-aloud support | Merged | PR #125 consolidated Younger/Older settings, grade defaults, word-count timing, and persistent instructional takeaways. |
| Budget results appeared to skip and Investing hints were covered | Merged | PR #125 made the six Budget takeaways player-controlled and hid competing Investing objective guidance during affected phases. |
| Learning should be decision-first, especially in later modules | Merged | PR #115 shortened explanations, preserved consequence-based choices, and divided Money Garden into two five-decision parts with an intermission. |
| Feedback after a wrong jar allocation is hard to notice | Implemented in open PR #138 | Corrective feedback expands automatically and uses larger, clearer diagnosis and next-step text. |
| Grade level should advise, not lock, individual learners | Implemented in open PR #138 | Individual learners retain access to all modules; harder modules are labeled as older topics with a continue-anyway choice. Teacher-assigned restrictions remain supported. |
| Completing a selected module should lead directly to the next module | Implemented in open PR #138 | Modules 1–4 continue to the next numbered module; Module 5 continues to the Money Guru finale. |

## Product rule after this audit

During gameplay, TAYU should provide one clear next action at a time. Travel is guided visually by the world arrow and edge pointer. Text appears when the learner can act or must make a decision. Optional detail remains collapsed. Required decisions remain visible until answered, but do not compete with another coach, hint, or lesson surface.

## Validation required before calling the discovery-call work complete

1. Test the full world path on a physical phone while rotating the camera near every outer boundary.
2. Resize a desktop browser repeatedly, including a narrow Google Meet or split-screen width.
3. Confirm no blue-sky/blank wedge replaces the island when walking away from an objective.
4. Confirm all required destinations remain reachable, including Budget Town, Bank, Money Garden, and the Finale.
5. Re-test with at least one of the original named testers and record whether the reported display problem is gone.
6. Merge or otherwise reconcile PR #138 so its jar-feedback, advisory-grade, and continuous-progression changes are not lost.
