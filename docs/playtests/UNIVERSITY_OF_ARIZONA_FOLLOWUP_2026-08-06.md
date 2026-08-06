# University of Arizona feedback follow-up

This follow-up PR continues the implementation work after PR #159.

Implemented in this branch:

- Replaces the unexplained Trust Meter with a clearly labeled Credit Habits practice meter.
- Explicitly states that the in-game meter is not a real credit score.
- Rewrites the instructional connection between payment/borrowing habits and credit.
- Redistributes correct quiz answers across positions 1, 2, and 3.
- Adds a regression test that fails if answer positions collapse back to the first option.

Still requiring hands-on gameplay reproduction before this feedback pass can be called complete:

- Store and Module 5 movement freezes.
- Module 4 dialogue persistence and learner-controlled advancement.
- Module 5 Decision overlay placement at phone, tablet, and desktop widths.
- Left-arrow decrease affordance in the three-account allocation control.

Do not mark the full educator feedback complete until these interaction items are implemented and manually verified across the device matrix.
