# Game Mechanics (Condensed)

Full design lives in the source spec (`finquest_claude_max_system_prompt`). This is the
build-facing summary; numbers here are the source of truth for `utils/financialCalculations.js`.

## Stage 1 — Childhood Choices (5–8 min)
- $20 weekly allowance split across **Spend / Save / Give** jars (must sum to $20).
- Then **3 random event cards** modify jars (bonus / emergency / opportunity / compound).
- End: summary + badge ("Budget Master" / "Saver Spotlight").
- Standards: Jump$tart 1.1 (Spending & Saving), 2.3 (Resilience).

## Stage 2 — Teen Hustle (7–12 min)
- Pick 1 of 5 businesses (lemonade, dog walking, art, tutoring, content).
- **4-week P&L loop:** set Price + Effort → auto-calc revenue/costs/tax → result → event card.
  - `Revenue = price × demandAtPrice × (effort / maxEffort)`
  - Variable costs = 20–30% of revenue; **flat 10% tax** on gross.
- **Marketplace:** earn points, buy upgrades, trade with other players.
- Standards: Jump$tart 1.2 (Income), 3.1 (Taxation); NGPF Unit 1 (Consumer Skills).

## Stage 3 — Young Adult (10–15 min)
- Salary $40,000/yr ($3,333/mo gross). Deductions: 22% tax, $800 rent, $150 insurance → **~$1,650 take-home**.
- Allocate $1,650 across 5 buckets: Emergency / Stocks / Bonds / Living / Savings Goals.
- **6-month sim:** stocks return −2%..+8% (random, compounding); bonds +1% fixed; life-event cards (job loss, medical bill, windfall, loan…).
- End: net worth = investments + cash − debt; achievements.
- Standards: Jump$tart 2.1–2.3 (Investing), 1.1 (Spending/Risk/Credit); NGPF Unit 8 (Income).

## Coverage
8 Jump$tart standards · 4 NGPF units. Full mapping in spec §5.

## Total play-through
22–35 min. Checkpoint save after each stage (solo mode only).
