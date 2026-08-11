# Module 6 E-key start verification

This file documents the regression that caused Module 6 to appear unstartable and the exact invariants covered by the automated test.

## Failure path found

Before this fix, the Module 6 key handler did this:

1. Wait for `nearbyTaxAction()` to return an action.
2. If no proximity action existed yet, immediately return.
3. Therefore `E` did nothing during the intro when the player spawned outside the 3.7-unit Maya radius or before the proximity poll initialized.
4. `Player.jsx` also owns a generic global `E` listener, so Module 6 and the normal world could both receive the same key event.

## Required behavior after this fix

- While Paycheck Planet is active and `phase === 'intro'`, pressing `E` always opens Maya's guide and starts Module 6, even if proximity has not initialized yet.
- The visible `Start Module 6 · talk to Maya` button calls the same tax interaction directly.
- Module 6 captures the `E` key before the generic world handler and stops the duplicate global interaction path.
- After the intro, taxpayer and tax-station interactions still require normal proximity.
- The automated test covers keyboard start, clickable start, far-from-Maya intro start, near-Maya start, and post-intro proximity protection.
