# University of Arizona / Take Charge Today feedback audit

Source: Robin Palmer feedback received August 5, 2026.

This document is the release checklist for the feedback pass. A checkbox may only be marked complete when the implementation and a regression check both exist.

## Copy and learning-language corrections

- [x] Use the possessive phrase **character's appearance** wherever that sentence appears. Current player-facing avatar copy avoids the incorrect phrase and uses “how your character looks” / “selected appearance.”
- [x] Classify the lemonade player's wages as a **business cost**, not an outside fee.
- [x] Explicitly include the missing **make your business sign** step in the lemonade setup guide.
- [x] Replace “decide whether a want fits” with “decide whether to spend on a want.”
- [x] Replace “decide whether a treat fits” with “decide whether a treat fits into your budget today.”
- [x] Replace misleading “homes for money” language with **financial accounts** / destinations.
- [x] Clarify that company-seed **values** can rise or fall over time.

## Interaction and accessibility acceptance criteria

- [ ] Reproduce and eliminate the store and Module 5 character-freeze reports on keyboard, touch, and gamepad input. Add an automated state-reset/regression test.
- [ ] Use a left-pointing arrow glyph for every decrease control in the three-account allocation activity, while retaining an accessible “one dollar less” label.
- [ ] Module 4 conversation text must never disappear before the learner advances it. Long text must remain visible, scroll if needed, and expose Continue / Back controls.
- [ ] Replace unexplained “trust score” language with **credit score** and teach the connection before using any trust analogy.
- [ ] Module 5 decision guidance must not cover portfolio controls. It must be dismissible/minimizable and remain outside the actionable investment cards at phone, tablet, and desktop widths.
- [ ] Pre- and post-quiz correct-answer positions must be deliberately balanced and not all use the first option. Add a test that fails when answer-position distribution collapses.

## Verification matrix

Test at minimum:

1. iPhone-size touch viewport.
2. iPad/tablet touch viewport.
3. 1366×768 desktop keyboard viewport.
4. Slow-reader mode / younger reading band.
5. Complete Modules 2–5 without refresh.
6. Repeat the store and Module 5 movement paths at least three times each.

The unchecked interaction items are intentionally left visible so they cannot be mistaken for completed work. They should be completed before this feedback pass is merged as a final release.
