# TAYU Current Walkthrough and Demo Script v7

Updated: July 30, 2026

This walkthrough replaces the older Round 9 document and the attached v6 review script. It describes the current product after the merged playtest revisions plus the interactive onboarding and navigation work in PR #121.

The game contains five financial-literacy modules. Money Garden is still Module 5, but it now contains **Part 1 and the additional Part 2**. Grade and classroom paths may end after an earlier module and issue an accurate path certificate.

Dynamic values such as `$[amount]`, `[name]`, percentages, sales, and portfolio results come from the player’s actual choices. Some consequence lines therefore vary.

## Quick route map

1. Landing and authentication
2. Pre-game money check-in
3. Grade or teacher-assigned learning path
4. Avatar creation
5. First-session controls practice
6. Module 1: Market & Three Jars
7. Module 2: Lemonade Stand
8. Module 3: Budget Town, stationary household scene
9. Module 4: Bank of TAYU
10. Module 5 Part 1: Investing Foundations
11. Module 5 Part 2: Markets, Risk, and Patience
12. Finale or shorter-path certificate

---

## 0. Landing, account, path, and avatar

### Landing page

The player arrives at `tayufinance.app`. The page shows the TAYU brand, media coverage, music/language controls, a main play entry, and About information.

Primary actions:

- **Play** opens the login/sign-up experience.
- **About Us** opens the team, project, track-record, partnership, and contact information.
- **Play in Guest Mode** creates an anonymous playable session without requiring an email account.

### Login and sign-up

Account users sign in with Firebase authentication. Sign-up asks for the required account information, role, grade information, and referral source. Organization/classroom users provide their school or organization context, and students may join a teacher using a class code.

Forgot-password email remains available through Firebase.

### Pre-game money check-in

Non-teacher players complete the short pre-game assessment before entering the game. The same questions return after the full journey so administrators can compare pre/post results. This assessment is not a grade.

### Grade-aware path selection

Independent players choose a grade band:

- **Grades K–2:** Modules 1–2
- **Grades 3–5:** Modules 1–3
- **Grades 6–8:** Modules 1–5
- **Grades 9–12:** Modules 1–5, with optional advanced teacher prompts

A teacher-assigned classroom path overrides this recommendation. The module page shows **START**, **RESUME**, **DONE**, **PLAY AGAIN**, or **LOCKED** based on the saved path and progress.

### Avatar creation

The child names and customizes the avatar, then enters the world. Avatar choices and game progress are saved for returning account users. Guest progress is stored under an anonymous guest session.

---

## 1. Entering the world: controls, mission, and navigation

### First session only: two-step controls practice

The old repeated text-only opening is replaced by a short learn-by-doing gate.

**Step 1 of 2**

- Desktop heading: **Use WASD to walk.**
- Mobile heading: **Hold and drag the MOVE pad.**
- Support line: **Move a few steps to finish this practice.**

The game detects real movement before advancing.

**Step 2 of 2**

- Heading: **Great. Now use the action control.**
- The player follows the arrow to a nearby glowing person or place.
- Desktop completes the step with **E**.
- Mobile completes the step with the large blue **DO** button.

The tutorial completion flag is stored on the device, so returning players enter directly.

### Persistent help

The question-mark button remains available throughout the world. It opens:

- **Controls**
- **Your Modules**
- **Learning Resources**

The controls tab includes a read-aloud button.

### Current mission chip

A Deep Navy chip stays at the top center while the player has an active objective.

- Label: **Current mission · tap to replay**
- It shows the short objective title, such as **COLLECT YOUR ALLOWANCE** or **TALK TO MR. BRAM**.
- Tapping it reads the mission aloud and refocuses navigation.

### Arrow and screen-edge pointer

When the target is visible, the normal world arrow points to it. When the camera faces away, the objective becomes a screen-edge pointer that rotates toward the target. The pointer changes with distance and gives a restrained recovery pulse if the player keeps moving away.

### Saved progress

Returning players may continue the active world rather than restarting. Money Garden Part 2 also resumes from its saved checkpoint.

---

## 2. Module 1: Market & Three Jars

### Goal

Give an allowance three jobs, then shop for needs and wants without exceeding the plan.

### A. Collect the allowance

Mission: **COLLECT YOUR ALLOWANCE**

The player follows the arrow to the Allowance Bank and interacts. Coins animate to the player.

Toast: **You got your weekly allowance! +$30**

### B. Divide the allowance

Penny introduces one of the jar scenarios. The player receives a real situation with competing goals and allocates all $30 among:

- **SPEND:** money for needs and things enjoyed now
- **SAVE:** money kept for later goals
- **GIVE:** money used to help others

A persistent allocation board shows the amount left and each jar’s current value. The player chooses a jar, adds money, and sees an NPC react.

The first contribution to each jar opens one short, tap-to-dismiss explanation with **Read aloud**.

### C. Retry ineffective plans

When all $30 has been assigned, the scenario evaluates the actual split.

- An ineffective split triggers one directional clue.
- The clue does not reveal exact target amounts.
- Coins reset so the child can revise.
- The current mission stays visible during the retry.

A successful plan shows the actual Spend, Save, and Give values.

### D. Talk to Mr. Bram

Mission: **TALK TO MR. BRAM**

Mr. Bram explains that needs come first and a want may fit afterward. The shopping mission remains locked until this conversation is complete.

### E. Shop the market

Mission: **BUY FOOD AND A DRINK**

The player walks near an item, uses E/DO, reviews the price and need/want type, and chooses whether to buy it. The top mission bar shows:

- money remaining in the Spend jar
- basket item count
- whether food is present
- whether a drink is present

After one healthy food and one healthy drink are selected, the mission changes to **GO TO CHECKOUT**.

### F. Consequence and retry

Checkout uses the actual basket. The world acts out the result. A basket missing a key need receives a short consequence and one next-step clue, then the player retries. A suitable basket completes the shopping mission.

Any unused Spend money rolls into Save, and the game explains that money not spent can become savings.

### G. Completion

The completion card includes the player’s name and actual Spend/Save/Give values. The next action begins the Lemonade Stand unless the active K–2/classroom path ends here.

For a shorter path, the module page unlocks the accurate path certificate.

---

## 3. Module 2: Lemonade Stand

### Goal

Run a small business, pay costs and the player’s own labor, and accumulate $30 in after-tax profit kept.

### A. Meet Penny

Mission: **GO TO THE LEMONADE STAND**

Penny introduces the starting cash, the business goal, and the tax rule. Tax is applied to profit, not revenue.

### B. Buy supplies

Mission: **BUY THIS WEEK’S SUPPLIES**

The child returns to the market and chooses a supply bundle that the current cash can afford. No button applies an automatically correct bundle.

### C. Build the weekly plan

Mission: **BUILD THIS WEEK’S PLAN**

The planning panel asks the child to set:

- open hours
- the player’s wage/pay
- price per cup
- later unlocks such as recipe quality and a sign
- town-news context when that feature unlocks

The panel always shows:

- supplies cost
- player labor cost
- total cost
- cost per cup
- town tax as 10% of profit

### D. Re-openable pricing explanation

**How do I pick?** opens a two-card explanation of cost per cup and adding a possible profit margin. It teaches the calculation but does not choose the final plan.

### E. Watch the business day

Customers approach the stand and react to the actual plan. Coins, missed customers, leftovers, and the tax action make the consequence visible before the ledger appears.

### F. End-of-week cards

The cards appear one at a time:

1. **Week [N] is done!** — personalized sales recap
2. **Your results** — Revenue → Supplies → Your pay → Profit → Tax → You keep
3. **Your goal** — cumulative progress toward $30
4. **What to change next week** — one main lever to reconsider

The feedback uses demand, leftovers, missed customers, cost, and profit. It does not reveal an exact final answer or apply the change automatically.

### G. Opportunity-cost choice

After the relevant unlock, Theo invites the player to a pool activity during selling time. The child chooses work or the pool and sees the tradeoff.

### H. Bankruptcy rewind

When the player cannot afford the next business step, the current week rewinds to its checkpoint. Earlier modules and progress remain intact.

### I. Completion

At $30 cumulative kept profit:

- banner: **LEMONADE TYCOON!**
- the game connects earnings to the next budgeting decision
- the player moves to Budget Town unless this is the end of the active K–2/classroom path

The module card becomes replayable after completion.

---

## 4. Module 3: Budget Town, stationary household scene

### Important correction from the attached v6 walkthrough

The player does **not** walk from building to building inside Budget Town. The prior walk-through-town design was removed. The current module is one stationary household scene. Decisions happen through cards and panels while rooms, people, and objects react in place.

### Goal

Cover needs, decide whether a want fits, divide the leftover money among three jobs, and test the plan against a surprise.

### A. Introduction

Budget Keeper line:

**You earned $[amount]. Cover today’s needs, decide whether a want fits, and keep something ready for a surprise.**

### B. Five household decisions

The sequence advances automatically. The player never needs to navigate to another Budget Town building.

1. **The House**
   - Rent: $6
   - Button: **Pay rent ($6)**
   - Result: the family has a safe place to live.

2. **The Grocery**
   - Food budget: $6
   - Button: **Build my basket**
   - Gate: choose at least three foods without exceeding the budget; a treat may be added only if it fits.

3. **The Bus Stop**
   - School rides: $2
   - Button: **Pay for rides ($2)**
   - Result: transportation prevents a school-day problem.

4. **The Clinic**
   - Checkup: $2
   - Button: **Pay for care ($2)**
   - Result: health care is covered before optional spending.

5. **The Fun Park**
   - Want: $2
   - Buttons: **Ride now ($2)** or **Keep the money**
   - The result compares enjoyment now with flexibility later.

A live readout shows what has been spent and what remains.

### C. Compare the three money homes

The player opens each option:

- **POCKET:** ready for surprises; steady; no growth
- **BANK:** slower, lower-risk growth; remains available later
- **MONEY GARDEN:** more growth potential; more risk

### D. Build the split

Prompt:

**Divide the money among Pocket, Bank, and Money Garden. Use the live feedback, then test whether the plan survives a surprise.**

The child adjusts three values and watches the live pie chart. Tapping a category explains the actual percentage.

Extreme plans receive evidence-based nudges. The game does not require one mathematically perfect allocation.

### E. Surprise test

A $2 flat-bike-tire expense appears.

- Enough Pocket money: ready cash pays the surprise and the growing money remains untouched.
- Insufficient Pocket money: the plan returns to the sliders with a clue to revise ready cash.

### F. Handoff

The saved split carries forward:

- Pocket remains ready cash.
- Bank amount becomes the starting bank deposit.
- Garden amount becomes the investing amount in Module 5.

The player continues to Bank of TAYU unless the active 3–5/classroom path ends after Module 3.

---

## 5. Module 4: Bank of TAYU

### Goal

Compare bank accounts and payment tools, observe borrowing costs, identify trustworthy help, and recognize a scam.

The Bank is a stationary, continuous six-lesson sequence. The player sees one decision, one consequence, and one short takeaway at a time. A six-segment Trust Meter fills as lessons finish.

### Lesson 1: Protect the deposit

- The player deposits the actual Bank amount.
- Vault animation: **THUNK! The deposit is protected.**
- Takeaway: the bank stores money securely while it remains the player’s money.

### Lesson 2: Compare account types

The game contrasts:

- **Checking:** easiest access; earns $0 in the demonstration
- **Savings:** still reachable; earns 50 cents
- **CD:** locked longer; earns $1

Choices:

- **Savings plus a CD**
- **Mostly SAVINGS**
- **All CHECKING**

The result explains access now versus growth later without blocking one acceptable plan.

### Lesson 3: Debit

A $3 water-bottle purchase comes directly from checking. The visible balance drops.

Takeaway: debit uses money already owned.

### Lesson 4: Credit and interest

A $5 credit purchase creates a later bill.

Choices:

- **Pay all ($5)**
- **Pay only $1**

Paying all ends the debt. Paying part leaves a balance and adds interest. The consequence is shown before the short explanation.

### Lesson 5: Debt help

The game shows several debts becoming difficult to manage, then introduces a trusted nonprofit counselor and one organized payment plan. A learning resource explains debt-help options.

### Lesson 6: Scam safety

A stranger promises a prize but requests $5 first.

Choices:

- **Do not send money**
- **Send the $5**

A send attempt is stopped safely and replayed with a warning-sign clue. The game never lets the simulated scam permanently remove the player’s money.

### Trust handoff

The filled Trust Meter connects paying on time and borrowing carefully with credit trust. The Bank amount remains protected, and the saved Garden amount becomes the next module’s portfolio.

---

## 6. Module 5: Money Garden, Part 1 and Part 2

### Important correction from the attached v6 walkthrough

Money Garden is not a six-week ending anymore. It contains **ten decision weeks divided into two five-decision parts**, plus overtime only when needed to reach the final growth condition.

### Opening

Mr. Sprout establishes the three-part plan:

- Pocket remains ready.
- Bank grows more steadily.
- Money Garden accepts more market risk.

The player uses company evidence, changes the portfolio, and tests what happens.

### Initial company comparison

The player compares:

- **Toy Town:** steady customer activity
- **Snack Shack:** positive product news that still needs store evidence
- **Game Land:** faster and sharper price movement in both directions

The initial seed pie divides the actual Garden money among the companies. The game encourages evidence and diversification, not one exact allocation.

### Part 1: Investing Foundations, Decisions 1–5

1. **Use business clues before investing**
   - Compare the companies and make the first portfolio decision.

2. **Diversification limits one-company risk**
   - One company may fall; other holdings can reduce the damage.

3. **A price dip needs context**
   - Decide whether the business changed or only the price moved.

4. **Customers provide business evidence**
   - Compare a busy store with an empty store before changing the portfolio.

5. **Low price and healthy business are different clues**
   - Two companies become cheaper, but only one remains healthy.

### Part 1 intermission

After Decision 5, the module pauses.

Actions:

- **Start Part 2** continues immediately.
- **Save and exit** returns to the learning path.

Returning later resumes at Part 2. The checkpoint is saved inside the player’s Money Garden state, so it is not shared incorrectly across different players or games.

### Part 2: Markets, Risk, and Patience, Decisions 6–10

6. **Ready cash protects long-term investments**
   - A surprise bill tests whether short-term needs can be paid without forcing an early sale.

7. **Business warnings can justify a change**
   - Empty aisles, damaged signs, and falling activity provide real evidence.

8. **Hype is not business evidence**
   - A fast price jump creates excitement; the player looks for support beyond the jump.

9. **Steady performance can matter more than one flashy move**
   - The player compares several weeks rather than one dramatic change.

10. **Rebalancing restores the intended risk**
   - The player checks whether one holding has become too large and tests a revised balance.

Each decision uses the same loop:

1. Read one short clue.
2. Open the portfolio.
3. Buy, sell, or keep cash based on evidence.
4. Tap **Test This Choice** or the equivalent current action.
5. Watch the world and prices react.
6. Receive one consequence and one next clue.

### Harvest

The final summary uses the player’s actual:

- starting Garden value
- ending value
- company holdings
- number of weeks
- number of lessons followed

Completion line:

**$[goal]. You researched, diversified, kept ready cash, responded to evidence, and rebalanced. Real investing moves more slowly and still involves risk.**

Bridge:

**You earned, budgeted, banked, and invested the same money. Follow the path to the finale.**

---

## 7. Finale and certificates

### Full five-module journey

When the complete path is finished:

- the Finale area opens
- NPCs celebrate around the avatar
- party music and effects begin
- the certificate recognizes the completed money journey
- the displayed and downloaded certificate use `tayufinance.app`

The player may download, print, or share the certificate and give feedback.

### Shorter grade/classroom path

A player whose required path ends after Module 2 or Module 3 receives a path certificate that lists only the modules actually completed. The game does not falsely state that later banking or investing modules were completed.

### Replay

On the module page, any completed module shows **Play again →**. The player can replay a favorite module without erasing the completed path.

---

## 8. Teacher walkthrough

Teachers receive a classroom dashboard with:

- unique class code
- module enable/disable controls
- skip settings
- exact student-session preview
- linked-student analytics
- completion, attempts, retries, drop-off, time, and assessment information
- detailed CSV export

The in-app Teacher Guide includes for every module:

- suggested grades
- expected time
- learning goals
- student decisions
- discussion prompts
- observable evidence
- short-session stopping point
- optional high-school extension
- five-minute debrief

The guide explains that TAYU is designed for reasoning, consequence, and revision rather than revealing exact answers.

---

## 9. Demo and QA checklist

Before presenting TAYU, verify:

1. `tayufinance.app` loads and music/language controls respond.
2. Guest Mode enters a playable independent path.
3. First-time controls practice appears only on a device that has not completed it.
4. The mission chip reads the current goal aloud when tapped.
5. Turning the camera away produces an edge pointer.
6. Mobile MOVE and DO controls do not block lesson buttons.
7. Market checkout requires food and a drink.
8. Lemonade results use Revenue → Supplies → Pay → Profit → Tax → Keep.
9. Budget Town remains stationary and never asks the player to walk between buildings.
10. Budget emergency failure returns only to the split.
11. Bank lessons advance one at a time and the Trust Meter reaches six.
12. Money Garden pauses after Decision 5 and resumes at Part 2 after Save and exit.
13. Completed modules show Play again.
14. The final certificate uses `tayufinance.app`.
15. The deployment marker matches the expected Git commit.

---

## 10. Confirmed remaining work

The following requested items are not described as complete in this walkthrough because they still need their own code PR or human validation:

- Younger/Older reading-band preference and grade default
- word-count timing constants for auto-clearing chatter
- two supportive knowledge-check questions after every module
- consistent personalized one-line endings for Budget and Bank
- end-to-end verification that every earned badge visibly changes the avatar or finale presentation
- physical-phone, compressed-window, and new-student retesting

The exhaustive status table is in `docs/TAYU_COMPLETE_UPDATE_CHECKLIST.md`.