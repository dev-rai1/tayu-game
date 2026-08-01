# TAYU Discovery Feedback Implementation Audit

Date: August 1, 2026

## Scope and source limits

This audit covers the requested feedback associated with April, Sania/Sanaya, Dia, Chetna Shah, Oral, and the general tester notes. It intentionally excludes Take Charge Today, the Economic Awareness Council, and Thano 101.

The exact Google Drive workbook (`TAYU task tracker` → `Discovery Call` → `Detailed Notes`) was not exposed by the connected tools. It did not appear in File Library spreadsheet searches, Gmail Drive-share searches, or available plugin connections. This document therefore audits every recoverable transcript, prior-chat summary, current implementation guide, repository file, merged pull request, and open pull request. It does **not** claim that a Drive-only row was reviewed when its text was unavailable.

## Status labels

- **Merged:** present on `main`.
- **Implemented in PR:** code exists and is under review, but is not on production `main` until merged.
- **Human validation:** cannot be proven by source inspection or unit tests alone.
- **Unverified source:** the exact attributed note was not recoverable outside the inaccessible tracker.

## Named feedback audit

### April

The exact April detailed note or transcript was not recoverable from prior-chat context, Gmail, or File Library. April-specific items must remain **unverified source** rather than being guessed or marked complete.

### Sania / Sanaya / elementary iPad transcript

The recoverable elementary-session transcript appears under the name **Manasa**, while prior task wording also referred to Sania/Sanaya. The source identity should be checked against the tracker. The actionable findings are still clear:

| Finding | Status | Implementation evidence |
| --- | --- | --- |
| Navigation and controls required adult explanation | Merged + PR #139 | PR #127 made controls contextual and stopped repeating the tutorial. PR #137 reduced competing guidance. PR #139 stabilizes the viewport and prevents the camera/player from reaching blank map corners. |
| Jar selection, jar meaning, reset behavior, and the expected answer were confusing | Implemented in PR #138 | Corrective feedback auto-expands; the diagnosis and next action are larger; per-$5 blocking lessons are removed; valid allocations are judged by the financial goal rather than one exact split; the ghost split is an example rather than the only answer. |
| Market items were difficult to select precisely on a tablet | Implemented in PR #138 | Items and checkout can be tapped directly while E/DO remains available. Objects and interaction areas are larger. |
| Needs versus wants was not visually obvious | Implemented in PR #138 | Market labels show price plus `NEED` or `WANT`, and checkout language is explicit. |
| Character creation felt too long and optional choices looked required | Implemented in PR #138 | Quick start is above detailed customization; appearance is labeled optional; detailed choices are collapsed; quick-use, surprise, and shuffle actions are available; appearance labels are neutral. |
| Content could feel too easy for an older child | Partly merged + PR #138 | Younger/Older reading settings and optional high-school extensions are merged. PR #138 keeps every module available to individuals and labels harder content as `Older Topic`. This improves access and pacing, but a broader adaptive-math/content system is not claimed. |
| Completing one selected module should continue naturally | Implemented in PR #138 | Modules 1–4 continue to the next module; Module 5 continues to the Money Guru finale. |

### Dia

PR #33, **Address virtual demo tester feedback across TAYU**, is merged. It implemented the recoverable Dia-specific items:

- increased SPEND/SAVE/GIVE spacing;
- moved nearby characters away from jar interactions;
- improved live jar labels and highlighted the targeted jar;
- clarified where added money goes;
- listed all Lemonade supplies explicitly;
- changed repeated `Got it` buttons to show when another message follows;
- preserved manually advanced Budget decisions;
- wrapped long Banker Bea text;
- added a concise simple-versus-compound-interest explanation;
- kept one lesson/dialog surface visible at a time.

The later general feedback associated with an entering-eighth-grade tester—overlapping text, excessive reading, long modules, too few decisions, and insufficient age differentiation—was also addressed through PRs #113, #115, #125, and #137.

### Chetna Shah

| Finding | Status | Implementation evidence |
| --- | --- | --- |
| Use `Modules` consistently instead of calling them phases or worlds | Active app is consistent | Current routed pages and module catalog use `Module`/`Modules`. Remaining `phase` values are internal state/route parameters, and the old `GameScreen` phase/stage page is not routed in `App.jsx`. A separate research-paper file outside the app still says `worlds`; that is a document-editing issue, not active GitHub UI copy. |
| Avoid claims about using TAYU before/after another organization’s presentations; frame discussions as exploring collaboration | No active product-code occurrence found | Repository search found no current user-facing product copy containing that presentation claim. Any meeting-document wording should be corrected in the original Drive document when accessible. |
| Too many overlapping, long, or non-dismissible boxes | Merged | PR #137 uses one compact guidance tray, suppresses it during active panels, collapses optional helpers, adds Hide/Dismiss/Read aloud, adds Skip controls, reduces card size, and preserves scrolling. |
| Guidance should be clear but not a chain of popups | Merged | PR #52 created exact task/place/control guidance; PR #127 made it contextual; PR #137 starts optional guidance collapsed and prevents competing surfaces. |

### Oral

The exact Oral-attributed transcript was not recoverable outside the tracker. The recoverable notes associated with this session describe:

- a half-screen, blank, or split-looking view after turning or moving the wrong way;
- overlapping boxes and controls being covered;
- too much reading;
- a preference for shorter modules, more decisions, and age-banded content.

Status:

- the half-blank/split view is implemented in PR #139 through a circular world boundary and viewport/camera resynchronization;
- overlay and reading-load items are merged through PRs #113, #115, #125, and #137;
- direct Oral attribution remains **unverified source** until the tracker row is available.

## General implementation matrix

| Repeated finding | Status | Evidence / action |
| --- | --- | --- |
| Looking or walking the wrong way can produce a half-blank or split-looking screen | Implemented in PR #139 | The old rectangular movement boundary extended beyond the circular island. `WorldBoundaryGuard` keeps the player and maximum camera orbit over rendered ground. |
| Canvas can retain the wrong size after orientation, browser-toolbar, split-screen, or compressed-window changes | Implemented in PR #139 | `CanvasViewportGuard` re-syncs renderer size, camera aspect, viewport, and scissor state. Dynamic viewport CSS keeps the world at visible-screen height. |
| Explanation boxes overlap or cover controls | Merged | PR #113 added shared visibility rules and narrow-screen sheets. PR #137 reduced the game to one prominent guidance surface and made optional helpers collapsible. |
| Too much text appears at once | Merged | PR #115 shortened and split text-heavy content. PR #137 reduced card sizes, retained scrolling, and added skip/dismiss controls. |
| Learners need exact next-step guidance without repeated popups | Merged | PR #52 centralized exact next-task guidance. PR #127 made guidance contextual. PR #137 keeps optional guidance collapsed and suppresses it during active tasks. |
| Younger readers need more time and read-aloud support | Merged | PR #125 consolidated Younger/Older settings, grade defaults, word-count timing, and persistent instructional takeaways. |
| Budget results appeared to skip and Investing hints were covered | Merged | PR #125 made core Budget takeaways player-controlled and hid competing Investing objective guidance during affected states. |
| Later modules need more choices and less answer-revealing text | Merged | PR #115 preserved consequence-based choices, shortened explanations, and divided Money Garden into two five-decision parts. |
| Feedback after a wrong jar allocation is hard to notice | Implemented in PR #138 | Corrective feedback expands automatically and uses larger diagnosis and next-step text. |
| Jar activities should allow financially valid reasoning, not one exact answer | Implemented in PR #138 | Scenario-specific concept rules accept multiple valid plans and keep the ghost split as an example only. |
| Grade level should advise rather than lock an individual learner | Implemented in PR #138 | Individual learners retain access to all modules; harder modules show `Older Topic` and a continue-anyway choice. Teacher-assigned restrictions remain supported. |
| Module completion should continue to the next numbered module | Implemented in PR #138 | Modules 1–4 launch the next module and Module 5 leads to the finale. |
| Important primary controls should be easy to notice | Partly implemented | Current buttons, arrows, contextual interaction prompts, and direct tapping improve this. The v8 implementation guide still identifies standardizing a teal pulse on every possible primary control as optional polish requiring more observation. |

## Product rule after this audit

During gameplay, TAYU should provide one clear next action at a time. Travel is guided visually. Text appears when the learner can act or must decide. Optional detail remains collapsed. Required decisions remain visible until answered, but do not compete with another coach, hint, lesson, or helper.

## Human validation still required

Code inspection and automated tests cannot replace these checks:

1. Complete Module 1 on a physical iPad in portrait and landscape.
2. Verify direct item tapping does not accidentally rotate the camera.
3. Verify direct checkout tapping and E/DO checkout both work.
4. Confirm quick-start character creation stays above optional details on common phone/tablet sizes.
5. Walk and rotate the camera near every outer map boundary on a phone.
6. Resize to a compressed Google Meet/split-screen window and confirm controls remain reachable.
7. Re-test with at least one original named tester and collect written feedback.
8. Review the actual Drive tracker row by row once it is available, especially April and Oral.

## Completion conclusion

All recoverable code-actionable findings are either **merged** or **implemented in PR #138 / PR #139**. It is not honest to certify every Drive row as implemented until the exact tracker is accessible and the remaining physical-device tests are completed. Open-PR work is also not production behavior until merged.
