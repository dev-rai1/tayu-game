# TAYU Final Playtest Implementation Status

Updated: July 30, 2026

This file records the final state after the four-PR playtest revision stack.

## Implemented in this stack

1. **PR #121 — Interactive onboarding and navigation**
   - two-step learn-by-doing movement/action tutorial
   - returning-player tutorial flag
   - persistent replayable current mission
   - screen-edge objective pointer with distance scaling and recovery pulse

2. **PR #122 — Walkthrough and complete audit**
   - replacement v7 walkthrough
   - complete product checklist
   - corrected stationary Budget Town description
   - corrected ten-decision, two-part Money Garden description

3. **PR #123 — Reading accessibility**
   - Younger / Older reading preference
   - default from grade or selected grade path
   - 2600 ms caption base
   - 380 ms per word for Younger readers
   - 260 ms per word for Older readers
   - real player settings route

4. **PR #124 — Retention, checks, and recaps**
   - exactly two supportive questions after every module
   - immediate correct/close feedback
   - actual-value personalized recap for all five modules
   - saved module-check results and analytics
   - module collectible reveal connected to the existing finale shelf
   - correct check-before-certificate flow for shorter paths

## Already implemented before this stack

- required account and organization fields
- guest mode and guest analytics
- grade-aware and teacher-assigned module paths
- accurate shorter-path certificates
- replay of completed modules
- responsive/narrow-window controls
- multilingual UI controls
- saved messages and read-aloud lesson cards
- concise decision-first content
- stationary Budget Town rebuild
- continuous six-step Bank module
- Money Garden Part 1 / Part 2 intermission and resume
- teacher guide, classroom dashboard, analytics, and CSV exports
- verified Firebase deployment marker and route smoke tests

## Human validation still required

Code cannot replace real student observation. The deployed build still needs:

- one original-tester retest
- one or two new student sessions with parent permission
- physical-phone testing
- compressed Google Meet testing
- grade-specific elementary, middle, and high-school sessions
- analytics review after those sessions

## Merge order

Merge the pull requests in numeric order: **#121 → #122 → #123 → #124**.