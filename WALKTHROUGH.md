# TAYU Current Walkthrough and Demo Script v7

Updated: July 30, 2026

This is the official walkthrough for the proposed final TAYU build after the open pull-request stack is merged in order: **#121 → #122 → #123 → #124**. It replaces the attached v6 review script and the older Round 9 walkthrough.

The repository currently contains five financial-literacy modules. Money Garden remains Module 5, but it now contains **Part 1 and the additional Part 2**. Dynamic values such as the player name, money amounts, percentages, sales, Trust progress, and portfolio results come from the player’s actual choices.

> The four PRs are open and intentionally stacked. This document describes the final combined behavior; it does not claim those open changes are already live on `main`.

## Complete route map

1. Landing and authentication
2. Pre-game money check-in
3. Grade or teacher-assigned learning path
4. Avatar creation
5. First-session movement and action practice
6. Module 1: Market & Three Jars
7. Two-question Module 1 check, personalized recap, and Golden Money Pin reveal
8. Module 2: Lemonade Stand
9. Two-question Module 2 check, personalized recap, and Lemonade Visor reveal
10. Module 3: stationary Budget Town household scene
11. Two-question Module 3 check, personalized recap, and Budget Planner Badge reveal
12. Module 4: Bank of TAYU
13. Two-question Module 4 check, personalized recap, and Trust Shield reveal
14. Module 5 Part 1: Investing Foundations, Decisions 1–5
15. Part 1 intermission: Start Part 2 or Save and exit
16. Module 5 Part 2: Markets, Risk, and Patience, Decisions 6–10
17. Two-question Module 5 check, personalized harvest recap, and Sprout Crown reveal
18. Full Money Guru finale or an accurate shorter-path certificate

---

## 0. Landing, account, path, avatar, and reading level

### Landing and account entry

The player arrives at `tayufinance.app` and sees the TAYU brand, media coverage, music and language controls, the main Play action, About information, and Guest Mode.

- **Play** opens Firebase login and sign-up.
- **Play in Guest Mode** creates an independent anonymous session without requiring an email address.
- Sign-up validates required account type, role, grade, referral source, and organization/classroom information when applicable.
- Students joining an organization enter a teacher’s class code.
- Password reset remains available through Firebase.

### Pre-game check-in

Non-teacher players answer the short whole-game pre-assessment. The questions return after the full journey for learning analytics. It is not presented as a grade.

### Grade-aware and teacher-assigned paths

Independent players choose a grade band:

- **K–2:** Modules 1–2
- **3–5:** Modules 1–3
- **6–8:** Modules 1–5
- **9–12:** Modules 1–5 with optional advanced teacher prompts

A teacher-assigned classroom path overrides the general recommendation. Module cards display **START**, **RESUME**, **DONE**, **PLAY AGAIN**, or **LOCKED** based on the saved path and progress. Completed modules can be replayed without erasing completion.

### Reading accessibility — PR #123

Grade selection establishes a starting reading preference:

- **Younger reader:** normally K–5
- **Older reader:** normally grades 6–12

The player may change this at `/settings` through the **Reading settings** action on the module page.

Auto-clearing NPC and guide captions use the Kid Playtest timing rules:

- base display time: **2,600 ms**
- Younger reader: **380 ms per word**
- Older reader: **260 ms per word**
- an intentionally longer existing duration is still respected

Core lesson cards remain tap-to-dismiss and include **Read aloud**.

### Avatar creation

The child names and customizes the avatar, then enters the world. Account progress is saved to the user profile; Guest Mode uses an anonymous session.

---

## 1. Entering the world: controls, mission, and navigation — PR #121

### First session only: learn by doing

The old repeated text-only opening is replaced by two required practice steps.

**Step 1: Move**

- Desktop: **Use WASD to walk.**
- Mobile: **Hold and drag the MOVE pad.**
- The game detects real movement before advancing.

**Step 2: Act**

- The child follows the arrow to a nearby glowing interaction.
- Desktop completes the step with **E**.
- Mobile completes it with the large blue **DO** button.

Completion is stored locally so returning players enter directly.

### Persistent help and mission recovery

- The question-mark panel replays Controls, Your Modules, and Learning Resources.
- A top-center **Current mission · tap to replay** chip keeps the objective visible and reads it aloud when tapped.
- When the target is visible, the normal world arrow points toward it.
- When the camera faces away, a screen-edge pointer rotates toward the target, changes with distance, and gives a restrained pulse after the player keeps moving away.

Returning players resume saved progress, including a saved Money Garden Part 2 checkpoint.

---

## 2. Module 1: Market & Three Jars

### Learning goal

Give every dollar a job, balance present needs with future goals and generosity, and shop for needs before wants.

### Player flow

1. **Collect the allowance.** The child reaches the Allowance Bank and receives $30.
2. **Hear the scenario.** Penny presents a situation with competing goals.
3. **Allocate all $30.** The child chooses Spend, Save, and Give amounts while a persistent board shows the amount left.
4. **Learn each jar.** The first contribution to each jar opens one short lesson with Read aloud.
5. **Observe and retry.** An ineffective plan receives one directional clue without revealing exact target values; coins reset for revision.
6. **Talk to Mr. Bram.** Shopping remains locked until the needs-before-wants conversation is complete.
7. **Shop with the real Spend balance.** The mission tracks money remaining, basket count, food, and drink.
8. **Checkout and observe the result.** Feedback reflects the actual basket; a missing need produces one concrete retry clue.
9. **Roll unused Spend into Save.** The game visibly moves leftover spending money to savings.

### Completion — PR #124

The player completes exactly two conceptual questions. Correct answers receive **Exactly!**; incorrect answers receive **Close — here is the trick** and an immediate explanation. The recap uses the player name and actual Spend, Save, and Give amounts. The **Golden Money Pin** is revealed as an earned finale collectible.

A K–2 or custom classroom path may end here with an accurate certificate after the check.

---

## 3. Module 2: Lemonade Stand

### Learning goal

Run a small business by choosing supplies, time, labor value, price, quality, and promotion, then interpret demand, costs, profit, and tax.

### Player flow

1. **Open the stand.** Penny introduces starting cash and the $30 cumulative after-tax-profit goal.
2. **Buy supplies.** The child chooses an affordable bundle; no guided-batch control selects the correct answer.
3. **Build the weekly plan.** The child sets open hours, wage/pay, price per cup, and later recipe, sign, and town-news options.
4. **Open the pricing explanation when needed.** It teaches total cost, cost per cup, and a possible margin without choosing the final plan.
5. **Watch the selling day.** Customers, leftovers, missed sales, coins, and tax make the consequence visible.
6. **Review the fixed ledger:** Revenue → Supplies → Your pay → Profit → Tax → You keep. Tax is calculated on profit, not revenue.
7. **Receive one main improvement clue.** Guidance identifies the main lever through evidence such as leftovers, missed customers, hours, price, or cost; it does not reveal an exact final answer.
8. **Experience opportunity cost.** The pool-versus-work event lets the child choose and see what was given up.
9. **Use a local bankruptcy rewind when needed.** Only the failed week resets; earlier modules and the rest of the journey remain intact.
10. **Cash out at $30.** The LEMONADE TYCOON celebration bridges earnings into budgeting.

### Completion — PR #124

The two-question check covers profit and how to interpret leftover-cup evidence. The personalized recap uses the player name and cumulative after-tax profit. The **Lemonade Visor** is revealed on the finale shelf.

A K–2 or custom classroom path may issue its accurate certificate after this check.

---

## 4. Module 3: Budget Town — stationary household scene

### Critical correction from the attached v6 walkthrough

The child does **not** walk from building to building. The old walk-through-town implementation was removed. The player remains in one household scene while cards, rooms, people, and objects react in place.

### Learning goal

Cover needs, decide whether a want fits, divide leftover money among ready cash, steadier growth, and higher-risk growth, then test the plan against a surprise.

### Five household decisions

1. **House:** pay $6 rent; the home lights and the family settles.
2. **Grocery:** use a $6 food budget; select at least three foods, with a treat only when it fits.
3. **Transportation:** pay $2 for school rides.
4. **Health:** pay $2 for care before optional spending.
5. **Fun:** choose **Ride now ($2)** or **Keep the money**.

A live readout shows spending and the amount remaining.

### Three money homes and surprise test

- **Pocket:** ready for surprises; steady; does not grow.
- **Bank:** slower, steadier growth; lower risk and later access.
- **Money Garden:** more growth potential with more risk.

The child builds a Pocket/Bank/Garden split while a live pie and percentage feedback update. Extreme plans receive evidence-based nudges rather than one forced answer.

A $2 flat-bike-tire surprise tests the plan. Enough Pocket cash protects the longer-term money; too little returns only to the split with a revision clue. Bank and Garden amounts carry into Modules 4 and 5.

### Completion — PR #124

The two questions cover emergency money and the Bank-versus-Garden tradeoff. The recap uses the actual Pocket, Bank, and Garden amounts. The **Budget Planner Badge** is revealed.

A grades 3–5 or custom classroom path may issue its accurate certificate after this check.

---

## 5. Module 4: Bank of TAYU

### Learning goal

Compare account access and growth, distinguish debit from credit, observe interest and debt consequences, identify trustworthy help, and recognize scams.

### Continuous six-lesson sequence

1. **Protect the deposit.** The actual Bank amount enters the vault.
2. **Compare account types.** Checking emphasizes access; Savings demonstrates modest interest; a CD demonstrates more growth with longer locking.
3. **Debit.** A purchase visibly reduces checking because debit uses money already owned.
4. **Credit and interest.** A borrowed purchase creates a bill; paying only part leaves a balance and adds interest.
5. **Debt help.** Several debts become one organized plan with a trusted nonprofit counselor.
6. **Scam safety.** A stranger promises a prize but asks for money first. A send attempt is intercepted safely and replayed with a warning-sign clue.

A six-segment Trust Meter fills across the lessons. The handoff connects reliable payment and careful borrowing with credit trust while preserving the saved Garden amount.

### Completion — PR #124

The two questions cover debit versus credit and the safest response to a suspicious prize request. The recap uses the actual Trust progress. The **Trust Shield** is revealed.

---

## 6. Module 5: Money Garden, including the extra Part 2

### Critical correction from the attached v6 walkthrough

Money Garden no longer contains about six guided weeks. It now contains **ten decisions divided into two five-decision parts**, plus overtime only when needed to reach the final growth condition.

### Opening company comparison

The player invests only the amount assigned to Money Garden in Budget Town. Pocket and Bank remain separate.

- **Toy Town:** steadier customer activity
- **Snack Shack:** positive product news that still requires store evidence
- **Game Land:** sharper movement in either direction and more risk

The initial seed pie encourages evidence and diversification but does not prescribe one exact portfolio.

### Part 1 — Investing Foundations, Decisions 1–5

1. Use business clues before investing.
2. Diversification limits one-company risk.
3. A price dip needs business context.
4. Customers provide business evidence.
5. Low price and healthy business are different clues.

### Part 1 intermission

After Decision 5:

- **Start Part 2** continues immediately.
- **Save and exit** returns to the learning path.

Returning later resumes directly at Decision 6. The checkpoint is stored inside the current player’s Money Garden state.

### Part 2 — Markets, Risk, and Patience, Decisions 6–10

6. Ready cash protects long-term investments.
7. Genuine business warnings can justify a change.
8. Hype is not business evidence.
9. Steady performance can matter more than one flashy move.
10. Rebalancing restores the intended risk.

Each decision uses the same loop: read one clue, inspect the portfolio, buy/sell/hold/keep cash, test the choice, watch the world react, and receive one result plus one next clue.

### Honest harvest

The final recap uses the actual starting value, ending value, holdings, weeks, and followed lessons. It explicitly states that real investing moves more slowly and still involves risk.

### Completion — PR #124

The two questions cover diversification and interpreting a price drop alongside healthy business evidence. The personalized harvest recap uses the actual Money Garden result. The **Sprout Crown** is revealed.

---

## 7. Post-module checks, recaps, and collectibles — PR #124

Every newly completed module routes through exactly two short conceptual questions before the next module or a shorter-path certificate.

- **Correct:** “Exactly!” plus the concise principle.
- **Incorrect:** “Close — here is the trick.” plus the correct idea immediately.
- The page states that the purpose is learning, not a grade.
- Results are saved to the player profile and recorded in learning analytics.
- Recaps use actual saved game values rather than generic completion text.
- One named collectible is revealed per module and appears earned rather than dimmed on the existing Money Guru finale shelf.

| Module | Personalized value | Collectible |
|---|---|---|
| Market & Three Jars | Spend, Save, and Give amounts | Golden Money Pin |
| Lemonade Stand | Cumulative after-tax profit | Lemonade Visor |
| Budget Town | Pocket, Bank, and Garden split | Budget Planner Badge |
| Bank of TAYU | Trust segments | Trust Shield |
| Money Garden | Final garden result and practiced behaviors | Sprout Crown |

---

## 8. Finale and certificates

### Full journey

After the full required journey, the Finale area opens. Town characters rush toward the player and celebrate. Party music, dancers, lights, and money-rain effects play behind the certificate. The display, PDF, and share link use `tayufinance.app`.

### Shorter path

A K–2, 3–5, or custom classroom certificate lists only the modules that were actually required and completed. It never claims later banking or investing content that the child did not play.

### Replay

Completed module cards show **Play again →** and do not erase the completed path.

---

## 9. Teacher, classroom, analytics, and deployment

Teachers can create a class, share a unique code, enable or disable modules, control skipping, preview the exact student session, view linked students, and export detailed session data.

The in-app Teacher Guide includes goals, time, decisions, discussion prompts, evidence, short-session stopping points, high-school extensions, and five-minute debriefs. It explains both Money Garden parts and the stopping point after Decision 5.

Current analytics include:

- account and anonymous guest sessions
- total page views and unique-browser visits
- module attempts, retries, clue use, completion, and drop-off
- session and module time
- whole-game pre/post results
- PR #124 module-check results
- teacher/admin detail views and CSV exports

Firestore rules protect classroom data and rules deployment cannot fail silently. Production deployment records the expected Git commit and smoke-tests the landing, module, and teacher-guide routes.

---

## 10. Demo and QA checklist

Before presenting the combined build, verify:

1. `tayufinance.app` loads; music and language controls respond.
2. Guest Mode reaches a real independent path and preserves anonymous progress.
3. First-time Move then E/DO practice appears once; returning devices skip it.
4. The current-mission chip speaks the objective; facing away produces the edge pointer.
5. MOVE and DO do not cover lesson actions on a physical phone or narrow window.
6. Younger/Older settings persist and caption timing changes appropriately.
7. Market checkout requires food and a drink; retry clues do not expose exact allocations.
8. Lemonade uses Revenue → Supplies → Pay → Profit → Tax → Keep, with tax based on profit.
9. Budget Town remains stationary; emergency failure returns only to the split.
10. Bank lessons advance one at a time; Trust reaches six; scam money is never permanently lost.
11. Money Garden pauses after Decision 5; Save and exit resumes at Decision 6.
12. Every module opens exactly two supportive questions and an actual-value recap.
13. Each completed module reveals its named collectible on the finale shelf.
14. Completed modules show Play again without erasing completion.
15. Short certificates list only required completed modules; the full certificate uses `tayufinance.app`.
16. The production marker matches the expected Git commit.

## Remaining human validation

The cumulative frontend build/tests and backend tests passed. GitHub cannot replace real student observation. The remaining work is:

- invite the original middle-school tester back and collect written feedback
- run one or two additional student sessions with parent permission
- test elementary, middle-school, and high-school paths
- focus one session on Money Garden Part 2
- repeat on a physical phone and in a compressed Google Meet window
- review analytics and prioritize the highest drop-off or retry area

The exhaustive implementation table is in `docs/TAYU_COMPLETE_UPDATE_CHECKLIST.md`, and the final stack summary is in `docs/TAYU_FINAL_STATUS.md`.