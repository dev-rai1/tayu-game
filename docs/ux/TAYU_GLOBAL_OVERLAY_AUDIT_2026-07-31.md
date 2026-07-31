# TAYU Global Text and Overlay Audit

Date: July 31, 2026

## Playtest problem

A young tester and adult observer reported that later modules could show too much text at once, boxes could overlap, movement controls could be covered, and some screens did not offer an obvious way to dismiss or escape.

## Overlay systems found in the current world

The audit found several independent systems capable of placing text over gameplay:

1. The HUD next-step box.
2. The persistent objective chip.
3. The persistent coach and retry coach.
4. Character captions and Penny guide bubbles.
5. Toasts and achievement banners.
6. Full dialogue panels.
7. Lesson cards and story decision cards.
8. Market and Lemonade helper overlays.
9. Budget Town takeaway modals.
10. The first-time movement tutorial.
11. Module-specific action and results panels.

Even when each component worked by itself, multiple systems could repeat the same instruction or occupy several parts of the screen.

## Changes in this pull request

- Remove the duplicate objective chip and hide the older permanent HUD guidance box.
- Use one compact global hint tray that is collapsed by default.
- Show only one hint at a time and hide it while character captions, toasts, banners, dialogue, lessons, or decision panels are active.
- Add Hide, Dismiss, and Read aloud controls to the global hint tray.
- Collapse the Market click-to-shop panel into a small button until the learner opens it.
- Collapse the Lemonade helper into a small button and show only the clue relevant to the current phase.
- Replace the full-screen Budget Town takeaway modal with a compact, dismissible result card.
- Add a Skip control to the first-time movement tutorial.
- Add “Skip this talk” for multi-line NPC conversations while preserving the conversation’s completion callback.
- Reduce the maximum size and font size of dialogue, lesson, and story cards, while retaining scrolling and read-aloud support.
- Keep the existing world menu for leaving or restarting a module.

## What remains intentionally blocking

A panel remains blocking when the learner must make a choice for the module to continue, such as selecting a jar amount, choosing Lemonade supplies, answering a Bank decision, or allocating Money Garden funds. These panels should not silently disappear because doing so could leave module state incomplete.

Blocking panels must still follow these rules:

- One panel at a time.
- One primary action per step.
- Short text before the choices.
- Scrolling when content does not fit.
- A visible module exit through the world menu.
- Read-aloud where instructional text is required.

## Device and playtest checks

Test the full path on desktop Chrome, desktop Safari, iPad Safari, and a phone-sized touch viewport.

For every module, confirm:

- No more than one instructional or hint box is visible with an active decision panel.
- The joystick and action button remain usable.
- Hint panels can be hidden or dismissed.
- Multi-line NPC conversations can be skipped.
- Dialogue and story text remain readable without occupying most of the screen.
- Required decisions still complete their state transitions correctly.
- The world menu can exit and restart each module.
