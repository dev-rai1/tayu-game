# October 2026 playtest follow-up

## Implemented

- Tax Office question 5: explicit navy text on white category controls and income labels; selected controls use white on navy. Categories have unique accessible labels and selection state. Narrow screens stack the payment cards.
- Budget Town repeated feedback and extra clicks: queued coach feedback yields to question cards, is deduplicated for the module session, clears at module handoff, and stays in the side lane rather than covering choice controls. Existing choice buttons still advance in one tap; meaningful quiz feedback retains its Continue button.
- Slow world rebuild between modules: preserve the WebGL renderer on sequential week changes, remount only the scene group, and retain renderer recreation for context recovery. Explicit module selection keeps its existing scene reset safeguard.
- Movement: reuse the camera target vector and make follow smoothing depend on frame time instead of frame count.
- Market pop-ups: consolidate the three post-controls pointers into one short message.
- Unclear lessons: Money words opens current-module definitions during gameplay, including borrowing costs/CDs, investment risk, bond borrowers, withholding, deductions and credits. Budget groceries explain what to cut first. Lemonade labor guidance gives a concrete hours-times-pay example; its coach now respects whether town news is unlocked.

## Existing coverage

Avatar creation already supports hair, clothing, body, accessories, rewards, live preview, and randomization. The earlier Modules menu loading timeout/cache fix (PR #349) is merged and remains intact.

## Future content requests

Insurance; jobs and paychecks; buying a car; college costs. These are separate curriculum expansions rather than defects in the current modules and are not new playable modules in this PR.

## Device checks

Verify sequential Market → Lemonade → Budget → Bank → Garden handoffs; explicit module starts; WebGL context recovery; movement on a low-powered tablet; Tax Office question 5 on touch and keyboard; no coach covering a Budget decision; Money words open/close and read aloud. Automated DOM checks do not measure actual device FPS.
