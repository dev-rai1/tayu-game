# TAYU bond + tax recommendation audit

Source reviewed: `Fwd- Recommendations for Tayu modules.pdf` (9 pages).

## Explicit requirements now covered

- Bank CD-to-bond conceptual bridge remains in the existing Bank module.
- Budget Town bond concept remains in the existing four-card educational preview.
- Money Garden retains Treasury/Muni/Corporate bond teaching, stock-vs-bond ownership/lending, bondholder seniority, and interest-rate/price lessons.
- A playable Bond Street gate now runs before the Tax Office in the final sequence.
- Bond Street carries forward saved Money Garden value rather than resetting the player's money.
- Bond Street lets the player allocate across Treasury, Muni, and Corporate bonds.
- All three bonds display a simple three-star safety framework and distinct practice interest outcomes.
- Bond Street saves whether the player invested in a municipal bond.
- The Tax Office shows a municipal-bond tax callback only when that saved muni choice exists.
- The Tax Office completion review connects taxes to the school bus, clinic, and roads and ends with a visible PAID/THUNK stamp.
- The Money Check-In includes the stock-vs-bond and refund questions for middle/high-school paths only.
- Module-select copy now shows the continuous journey: Market → Lemonade Stand → Budget Town → Bank → Money Garden → Bond Street → Tax Office → Finale.
- Existing finale/certificate copy from PR #257 remains in place for stocks, bonds, and the practice tax return.

## Source limitation

The 9-page PDF repeatedly refers to a separate 14-page `TAYU_Walkthrough_Module6_7_Addendum.docx`, including exact BN0–BN… insertion text, but that addendum is not embedded in or attached with the PDF available in this task. This branch implements every explicit Bond Street/Tax Office behavior and concept described in the 9 pages without inventing unavailable verbatim addendum text.

## Architecture note

The current production game has six public module cards and a persistent 3D final district. To avoid breaking saved progress, teacher assignments, badges, and existing Module 6 CI contracts, Bond Street and Tax Office are presented as a continuous two-stage final sequence inside public Module 6 rather than renumbering every production subsystem to seven public cards. The visible journey and actual play order still follow Money Garden → Bond Street → Tax Office → Finale.
