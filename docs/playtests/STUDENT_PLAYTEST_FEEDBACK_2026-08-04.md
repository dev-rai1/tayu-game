# Student Playtest Feedback — August 4, 2026

This record converts the full call transcript into product requirements and implementation decisions. The participants are anonymized; the discussion included middle-school and ninth-grade perspectives.

## Session coverage

- About 25 minutes of play.
- Roughly five activities completed, reaching the Bank of TAYU account comparison.
- The first activity took about 2–3 minutes; later activities were closer to five minutes each.
- The tester generally understood navigation after looking around and reading the instructions.

## What worked and should be preserved

- The experience felt like a real game rather than a worksheet.
- Moving characters and the Roblox-like world kept the testers engaged.
- The Lemonade Stand was the favorite activity.
- The Lemonade Stand successfully taught startup cost, revenue, profit, supply and demand, customer traffic, and pricing.
- The overall module pace felt balanced.
- The content covered useful topics and encouraged the testers to continue playing.

These strengths are intentionally preserved. This change does not remove the 3D world, reduce the choice-and-consequence loop, or lengthen every module.

## Problems reported

1. **Too many messages could compete for attention.** In Lemonade, a central instruction surface and a second message near the bottom could appear while characters moved behind them.
2. **Instructions sometimes moved too quickly for younger players.** The tester requested one instruction box at a time and player-controlled pacing.
3. **Some language was too abstract.** The Bank line about trading availability for growth was understandable to an older tester but could be difficult for younger learners.
4. **“My pay” was unclear.** The hourly choices ($0.50, $1.00, and $1.50) did not clearly say that this is the business counting the value of the player's own work.
5. **The animation should be the focus.** Character activity was visible behind instruction boxes, but the instructions drew attention away from the action.
6. **Module 1 felt brief and similar to ideas revisited later.** Its distinct purpose as the first spend/save/give plan should be clearer.
7. **Investing and the stock market were requested.** Those topics already exist in Money Garden, but that was not obvious to a tester who had not reached Module 5.

## Implemented changes

### One instruction at a time

- Added a Lemonade focus guide that pauses the decision surface behind one short, player-controlled card.
- Supply selection now begins with two separate beats: read demand, then choose a batch.
- Stand planning now begins with three separate beats: choose hours, understand the work cost, then choose a price.
- The guide waits when a dialog, lesson, decision card, help menu, or animation caption is already active.

### Remove competing temporary messages

- Short-lived coach bubbles are suppressed while Lemonade supply, planning, and selling phases already own the learner's attention.
- Selling remains visually focused on the characters and customer result rather than adding another large instruction box.

### Explain “My pay”

- Younger-reader copy gives a concrete example: 50 cents per hour adds 50 cents of cost for every hour worked.
- Both reading levels explicitly say this is the value assigned to the player's own labor, not an outside fee.

### Simplify Bank language

- Replaced “trade easy access for different growth” with direct comparisons:
  - checking can be used anytime and earns nothing in the activity;
  - savings is still easy to reach and earns a little;
  - a CD stays locked longer and earns more.
- Rewrote the takeaway to define interest before discussing account restrictions.

### Clarify the module sequence

- Module 1 now describes its unique role as building the learner's first spend/save/give plan.
- Lemonade describes wages as the cost of the learner's own work.
- Money Garden now explicitly advertises investing and stock-market basics, including pretend stocks, risk, patience, and rebalancing.

## Validation requirements

- Focus guidance must never appear over a dialog, lesson, decision card, help menu, or actor caption.
- Temporary coach bubbles must be hidden during focused Lemonade decisions and the selling animation.
- Younger and older reading settings must each receive the appropriate three-step planning copy.
- The focus guide must remain player-controlled and must not auto-advance.
- Existing module logic, profit calculations, saved progress, and completion behavior must remain unchanged.
