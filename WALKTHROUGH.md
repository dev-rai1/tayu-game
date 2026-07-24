# TAYU — Full Walkthrough of Every Text Box (Round 9 build)

This is the complete, in-order script of the game: every pop-up, card, speech
bubble, toast, and hint the child sees, with its exact copy, who says it, what
triggers it, and what buttons it offers. `$X`-style values are filled with the
child's real numbers at runtime.

Legend for the box types:

| Type | What it looks like |
|---|---|
| **HELP POPUP** | The full-screen '?' menu (Controls / Phases / Library tabs) |
| **POINTER** | Tap-to-dismiss dark card with the TAYU logo |
| **CARD** | White bottom card, one speaker, 1–3 buttons (only ever ONE at a time) |
| **DIALOG** | Speech panel with the speaker's name (Next / Got it) |
| **BUBBLE** | Small speech bubble floating over an NPC's head in the 3D world |
| **TOAST** | White strip at the bottom, disappears by itself |
| **PANEL** | Interactive pop-up (sliders, basket, pie chart...) |
| **BANNER** | Big celebration strip at the top with confetti |

---

## 0. Entering the world (every entry, both platforms)

1. **HELP POPUP** (auto-opens on EVERY world entry, Controls tab first):
   - Desktop copy: *"WASD or the UP/DOWN/LEFT/RIGHT ARROW KEYS - walk. To LOOK AROUND: hold the RIGHT MOUSE BUTTON, or press the LEFT/RIGHT ARROW KEYS. Walk up to a glowing person or button and press E (or click it) to interact. Follow the arrows - they show you where to go next!"*
   - Phone copy: *"Use the on-screen pad to walk. Drag with TWO FINGERS to look around. Tap a glowing person or button to interact. Follow the arrows - they show you where to go next!"*
   - Tabs: **CONTROLS** (biggest, default), **PHASES** (journey list with DONE / YOU ARE HERE / LOCKED), **LIBRARY** (all Learn More resources by module). Button: **Got it!**
2. **POINTER** — *"Confused about the controls? Tap the question mark (?) any time to see them again."* (first play on this device only)
3. **POINTER** — *"Up top in that menu you'll also find PHASES (where you are in the journey) and the LIBRARY (extra things to learn)."*
4. **POINTER** — *"Whenever you want to learn more about something, look for a LEARN MORE button. There is lots more waiting if you are curious!"*
5. Welcome overlay — *"Welcome to your neighborhood, {name}!"* / *"Follow the arrows - they'll show you where to go next!"*

Interaction prompts everywhere: desktop shows **"Click or press E - {action}"**, phone shows **"Tap - {action}"**.

---

## Module 1 — The Tayu Market (allowance, jars, needs vs wants)

1. Hint chip (top right): *"Go to the ALLOWANCE BANK"* → arrow leads along the ring.
2. At the Allowance Bank, prompt: *"Collect Allowance"* → **TOAST** *"You got your weekly allowance! +$30"*
3. **DIALOG — Penny** (one of three scenarios per run; scenario 1 shown):
   - *"Hi! I'm Penny. It's Theo's birthday this week!"*
   - *"You really want that $8 toy for yourself too..."*
   - *"AND Mia is collecting for the animal shelter."*
   - *"You have $30. Fill your 3 jars: some to SPEND, some to SAVE, some to GIVE!"*
   - (Scenario 2 "A Rainy Day" and scenario 3 "The Big Want" have their own four lines and targets.)
4. **PANEL** — jar panel at each jar (SPEND / SAVE / GIVE, +/- amounts).
5. First deposit into each jar → **POINTER** teaching line for that jar.
6. When the wallet hits $0, the NPCs ACT OUT the result. Wrong splits get a hint and the coins fly back:
   - Spent nearly all: *"You spent it ALL on yourself. Fun toy... but nothing saved and nothing for the shelter. Try again!"*
   - Saved nearly all: *"Great saving! But Theo got no gift and the shelter left empty-handed. Balance it out!"*
   - Gave nearly all: *"So generous! But now you have nothing to spend or save. Keep a little for you too!"*
   - Close but off: *"Close! Think: SOME to spend, SOME to save, SOME to give. Spread it across all three jars."*
   - Balanced: Penny's recap — *"You spent $X, saved $Y, and gave $Z - a real budget!"*
7. Hint chip: *"Talk to Mr. Bram first"* → **DIALOG — Mr. Bram**:
   - *"Welcome to the MARKET! I'm Mr. Bram."*
   - *"Prioritize your needs first. It is okay to enjoy a want too!"*
   - *"Explore the store and choose what feels right, then head to checkout."*
   - (Re-talk: *"Needs first, then a want if you can afford it. The checkout mat is waiting!"*)
8. Shelf items each show a NAME + $PRICE card; buying pops a small product panel (name, need/want, price, **Buy**).
9. Checkout mat prompt: *"Checkout (N in basket)"* → the day plays out (good basket = sunny day scene; junk-only, no-drink, or no-food baskets each get their own acted-out consequence and a retry with the basket refunded): e.g. *"Let's try that again! Pick ONE healthy drink and ONE healthy food with your $10 Spend jar."*
10. Leftover SPEND rolls into SAVE → **POINTER** *"Nice! The $X you did not spend went into your Savings! Money you keep becomes savings."*
11. **Week 1 Complete** card → button **Start Week 2**.

---

## Module 2 — The Lemonade Stand (earning)

1. **POINTER** — *"You saved money for things like this stand. Nice! Money you do not spend becomes your savings, just like we learned."* Toast: *"Follow your arrow to the LEMONADE STAND."*
2. **DIALOG — Penny** at the stand:
   - *"Welcome to your Lemonade Stand! You have $X to start. You'll buy supplies, set your price, and sell cups. Your goal: earn $30 profit. Penny will help you!"*
   - *"Tax is a small part of your PROFIT that goes to the town. Profit is what is left after you pay for your supplies and pay yourself for your work."*
   - *"Each week: buy supplies from Mr. Bham, set your plan at the stand, and sell. I will tell you exactly what to fix each week!"*
3. **PANEL** — supplies at Mr. Bham (Small $4 / Medium $6 / Large $9 / Mega $12).
4. **CARD ×2** — the price formula (before the first price decision, re-openable any week):
   - *"How do you set your price? Add your costs. Supplies: $6 (cups, lemons, sugar, water, table). Your work: $4 (you can change what your time is worth). Total cost: $6 + $4 = $10."*
   - *"These supplies make 10 cups, so each cup costs $10 / 10 = $1. Now add a little profit - say 10%: $0.10. Price: $1 + $0.10 = $1.10 a cup. You decide your price - then see how your customers respond!"*
5. **PANEL** — the stand template: price stepper, hours, your pay, (later: quality, sign, town news).
6. End of each week, four cards in a row:
   - *"Week N is done!"* — *"Nice work, {name}! X kids bought your lemonade at $Y a cup."* (or *"A quiet day. Nobody bought at $Y. Every seller has days like this."*)
   - *"Your results"* — the ledger, always in this order: Revenue → Supplies → Your pay → Profit → Tax (10% of profit) → **You keep**.
   - *"Your goal"* — *"Goal: $30. You have $X, $Y to go!"*
   - *"What to change next week"* — ONE direct tip with real numbers, e.g. *"Your price is too high this week. Try around $1.05-$1.30 next week."* / *"You sold out and 5 kids were turned away. Buy Large supplies next week."* / on a perfect week: *"PERFECT combination! Supplies match your sales, your price works, your hours pay off. Nothing to fix!"*
7. After the first perfect week, one unlock card per week:
   - Quality: *"Something new this week! Upgrade time: EXTRA LEMONY costs more to make, but kids may pay more for it. Or go LESS SUGAR - healthier AND cheaper to make! Your call."*
   - Sign: *"Something new this week! A marketing SIGN brings more kids to your stand. Signs cost money - is it worth it? Your call."*
   - News: *"Something new this week! TOWN NEWS is live: each week, something happens in town. Check the news before you decide anything!"*
8. The pool-party choice (once): work → *"You kept the stand open while Theo swam. Everything you choose costs the thing you did not choose."* / swim → *"What a swim! But the stand earned nothing today. Everything you choose costs the thing you did not choose."*
9. If the money ever runs out: **CARD** *"Uh oh - bankruptcy! Your money ran out. That happens to real businesses too. Let's go back and make a better decision this time!"* (the week rewinds, money restored).
10. At $30: **BANNER** *"LEMONADE TYCOON!"* → *"All your leftover money went into your savings. Saving what you earn is how the next big thing gets funded!"* → **CARD** *"You did it! Time to CASH OUT - collect your $X from the stand. Now... where should all that money LIVE? Follow the arrow to BUDGET TOWN!"*

---

## Module 3 — Budget Town (a day in the life + the split)

**TOAST on arrival:** *"BUDGET TOWN is open! Follow your arrow to the Budget Keeper."*

### The day (walk to each building; the Keeper only nudges — never re-starts dialogue)

1. **CARD — The Budget Keeper**: *"You arrive with $X - nicely earned! Before money can grow, it pays for LIFE. Let's live one day in Budget Town. Follow your arrow!"* → **Live one day!**
2. TOAST: *"First stop: the HOUSE. Follow your arrow!"*
3. **The House** — prompt *"Pay the rent"* → **CARD**: *"A roof over your head comes first. Rent: $6."* → **Pay the rent ($6)** → coins fly to the house, the windows LIGHT UP, the family waves at the door. TOAST: *"The lights come on - the family waves!"* then *"Shelter is a NEED - usually the biggest slice."*
4. TOAST: *"Next: the GROCERY - the basket is waiting."*
5. **The Grocery** — prompt *"Fill your basket"* → **PANEL** basket mini-game: Milk $1, Bread $1, Eggs $2, Apples $1, Veggies $2 (foods) + Ice pop $1, Chips $1, Comic $2 (treats), budget $6. Gate line until 3 foods: *"Tummies first! Grab at least 3 real foods, then treats if there is room."* When ready: *"N foods and M treats - a smart basket!"* → **Check out ($X)** → bags line up outside. TOASTS: *"Basket packed! The bags line up out front."* / *"Food is a NEED - a treat or two is okay!"*
6. TOAST: *"Next: the BUS STOP - school days!"*
7. **The Bus Stop** — prompt *"Catch the school bus"* → **CARD**: *"The school bus is coming. A week of rides: $2."* → **Hop on ($2)** → the yellow bus drives in, pauses, drives off with kids waving. TOASTS: *"Here comes the school bus..."* / *"All aboard! The kids wave as it rolls away."* / *"Getting to school is a NEED."*
8. TOAST: *"Next: the CLINIC - the health jar."*
9. **The Clinic** — prompt *"Fund the health jar"* → **CARD**: *"The health jar keeps checkups covered. Drop in $2."* → **Fill the health jar ($2)** → coin drops in the jar, the red cross glows, the doctor gives a thumbs-up. TOASTS: *"The doctor gives a thumbs-up!"* / *"Health care is a NEED you plan for."*
10. TOAST: *"Last stop: the FUN PARK... if you want to."*
11. **The Fun Park** — prompt *"Visit the Fun Park"* → **CARD**: *"Every NEED is covered - so now you get to choose. The mini-wheel costs $2."*
    - **Ride the wheel ($2)** → the ferris wheel spins up, riders cheer. TOASTS: *"Wheee! The wheel spins and everyone cheers!"* / *"Wants come AFTER needs - and yours were covered. Enjoy the ride!"*
    - **Save it instead** → TOAST: *"Skipping a want you did not need - that is real budget power!"*

### The split (the climax) and the coin walk

12. **CARD — The Budget Keeper**: *"What a day! Needs cost $X and fun cost $Y - you have $Z left. Grown-ups give leftover money three homes. Tap each one to see what it does!"* → **Show me the three homes!**
13. **PANEL** — three tappable cards, each with a 2-second line animation:
    - POCKET — *"Cash you keep close. Safe, ready anytime - but it never grows."* (flat line)
    - BANK — *"Money you store at the bank. It grows a little, slow and steady."* (gentle slope)
    - MONEY GARDEN — *"Money you plant to grow the most - but it can wiggle up AND down. There is a risk."* (wiggle)
14. **PANEL** — the sliders + LIVE PIE on the leftover. Tapping a slice speaks the advisor's exact line with the child's real percentage:
    - Pocket: *"You have N% in safe cash, which will stay steady. It will not grow, but it's safe."*
    - Bank: *"You have kept N% of your money in the bank. It will grow over time - smaller amounts, slow and steady."*
    - Garden: *"You have decided to put N% of your money here. Just keep in mind: this money has a risk. It may grow, or it may be lost."*
    - Nudges (never blocks): all-pocket → *"If it all naps in your pocket, none of it grows - try putting a little to work!"* · all-garden → *"Brave! But smart gardeners keep some safe in case of surprises."* · nothing growing → *"All pocket cash so far - the bank and garden are where money grows."* · zero pocket → *"A little pocket cash is handy for surprises - grown-ups call it emergency money."*
    - Button: **This is my plan!**
15. **CARD** with the plan pie: *"Here's your plan! Pocket $A | Bank $B | Garden $C."* + nudge line: *"Now walk your money home! Take the BANK coins to the BANK KIOSK, and the GARDEN coins to the GARDEN GATE."* → **Walk the coins!**
16. **Bank Kiosk** (glowing) — prompt *"Drop off the BANK coins"* → coins arc in. TOAST: *"$B tucked at the bank kiosk - Banker Bea will collect it."* (Going to the gate first: *"Bank coins first - the kiosk is glowing!"*)
17. **Garden Gate** — prompt *"Drop off the GARDEN coins"* → coins arc in, a sprout pops up. TOAST: *"$C waits at the garden gate, ready to grow."*
18. **CARD**: *"One more thing - a gardener's secret: always keep a little in your pocket for SURPRISES. A flat bike tire, a rainy day. That's called emergency money."* → **Uh oh, what is that?**
19. The flat tire plays out (Theo rolls up with a wrench): TOASTS *"Flat bike tire! It costs $2."* / *"Tire fixed! Paid from your pocket cash."* → **CARD**: *"See? Because you kept a little in your pocket, the surprise was no problem."*
    - If pocket had less than $2: **POINTER** *"Uh oh - no pocket cash for the surprise! Let's set your split again and keep a little close."* → the sliders reopen.
20. **CARD — hand-off**: *"Your plan is set! The $B you're saving - let's go to the Bank and open a real account. And the $C you're growing? That comes later, at the Money Garden. Follow the path to the Bank - Banker Bea is waiting!"* → **To the Bank!**

---

## Module 4 — The Bank of TAYU (learn by doing; one continuous sequence)

**TOAST on arrival:** *"THE BANK OF TAYU is open! Follow your arrow to Banker Bea."*
**POINTER:** *"You decided to keep $B in the bank. Let's go open your account so it's safe and earns a little."*

Talk to Bea ONCE. From here every lesson auto-flows into the next — the
learning happens with BUBBLES over the acting NPCs; each lesson ends with a
one-line summary card whose button starts the next lesson.

### Lesson 1 — Open the account (the vault)
- **BUBBLE (Bea):** *"Hand me your coins - the vault keeps them SAFE."*
- **CARD:** *"Banker Bea waves you to the counter."* → **Give Bea my $B**
- Teller Tom carries the coins from the counter to the vault; the great door spins and THUNKS; **BUBBLE (Tom):** *"THUNK! Safe in the vault."*
- **CARD summary:** *"Your money sleeps behind a giant steel door - and you can take it out any time."* → **Next lesson**

### Lesson 2 — The three teller windows (account types)
- **BUBBLE (Bea):** *"Three windows: CHECKING, SAVINGS, CD. The longer money stays, the more the bank pays!"*
- Tom walks window to window: **BUBBLES:** *"Checking: grab it anytime... earns $0."* → *"Savings: DING! +50 cents."* → *"CD: locked up... DING DING! +$1!"* (a gold padlock snaps onto the CD window)
- **CARD:** *"Where should YOUR money live?"* → **Some in a CD too** / **Mostly SAVINGS** / **All CHECKING**
- Result lines: smart → *"The locked CD earns the most. Patience pays!"* · safe → *"Slow and steady - and you can still reach it."* · cash → *"Easy to grab - but it earns nothing. Next time, let a little grow."* (nudge, never a block) → **Next lesson**

### Lesson 3 — The debit card
- **BUBBLE (Bea):** *"This DEBIT card is a key to YOUR checking. Water bottle time!"*
- The child's avatar walks to the snack stall and taps the card; the CHECKING gauge on the wall visibly drops. **BUBBLE (Clerk Cleo):** *"Beep! $3 from YOUR checking."* **BUBBLE (Bea):** *"See the CHECKING gauge drop? Your own money."*
- **CARD summary:** *"A debit card spends your own money - it is a key, not extra cash."* → **Next lesson**

### Lesson 4 — The credit card and the bill
- **BUBBLE (Bea):** *"A CREDIT card borrows the BANK's money. Watch what follows it home..."*
- Swipe at the stall (**BUBBLE Cleo:** *"Beep! $5 on CREDIT."*), then Postal Pat marches up with an envelope: **BUBBLE:** *"Bill! $5, please."*
- **CARD:** *"The bill is here. What do you do?"* → **Pay it ALL ($5)** / **Pay a little ($1)**
  - Pay all → **BUBBLE (Pat):** *"Paid in FULL - zero extra!"* → summary *"Whole bill, on time - zero extra. That is the credit-card superpower."*
  - Pay a little → **BUBBLE (Pat):** *"Only $1? See you next week..."* → the envelope PUFFS BIGGER → **BUBBLE:** *"The bill GREW - interest works against you!"* → **BUBBLE (Bea):** *"All cleared - $1 went to interest."* → summary *"Bea helped you clear the grown bill. The little-pay cost $1 extra."* with **Let's try that again!** offered.
- Summary card button → **Next lesson**

### Lesson 5 — Debt, late fees, and help
- **BUBBLE (Bea):** *"Six cards means six bills - and every late one GROWS by itself."*
- Six little red debt blobs sprout on the plaza and GROW; TOAST: *"The little debts grow taller with every late fee..."*
- Helper Hana walks in and herds them together — they MERGE into one calm blue blob. **BUBBLE (Hana):** *"One plan. One payment. Lower rate."*
- **CARD summary** (with **Learn More: Nonprofit credit counseling (NFCC)**): *"Debt can grow - but help exists, and asking is the smart, brave move."* → **Next lesson**

### Lesson 6 — Scams and safety
- Sneaky Sam creeps up to the child. **BUBBLE (Sam):** *"You WON a prize! Just send $5 first!"*
- **CARD:** *"A stranger wants $5 to 'deliver your prize.'"* → **Shoo them away!** / **Send the $5**
  - Shoo → Sam bolts; Bea rushes over and a golden SHIELD floats over the child. **BUBBLE (Bea):** *"A real bank NEVER asks you to send money."*
  - Send → the coins fly out, Bea intercepts and returns them. **BUBBLE (Bea):** *"So close! Bea caught it - never send money to strangers."* (retry offered)
- **CARD summary:** *"Never send money to someone you do not know."* → **Show me my Trust!**

### The wrap
- **BANNER:** *"TRUST METER: FULL!"*
- **CARD:** *"This is your TRUST - grown-ups call it a credit score. Paying on time and staying safe builds it, and big trust unlocks big things later."* → **Next**
- **CARD:** *"Your bank money is safe and growing. Now - that $C you set aside for the Money Garden? Time to grow it. Follow the path!"* → **To the Money Garden!**

---

## Module 5 — The Money Garden (investing, last)

**TOAST:** *"THE MONEY GARDEN is open! Follow your arrow to Mr. Sprout."*

1. **CARD ×3 — Mr. Sprout's opening** (the split is already decided):
   - *"There you are! You earned it at the stand, you budgeted it in town, you banked the safe part... and you brought the GROW part right here. Welcome to the Money Garden!"*
   - *"Remember your plan: pocket cash for surprises, bank money growing slow and steady. THIS money is the brave part - the garden can grow it the most, but it wiggles. Some days it even droops."*
   - *"Here we plant money in COMPANIES. But smart gardeners never plant at random - let me show you how to choose your seeds."* → **Plant my seeds!**
2. **Week 1 CARD:** *"Time to plant! Three companies, three garden beds. Before you choose, be a detective: who is busy? What does the news say? Who is steady, who is wiggly? Then split your seeds the way YOU think is smart."* → **Plant my seeds**
3. **PANEL — the SEED PIE** (dollars across the three companies, live pie, per-company stories on tap):
   - Toy Town: *"Peek in the windows - PACKED with customers every day. A busy store is a healthy company. A steady grower."*
   - Snack Shack: *"The town news says kids love their new juice pops. Good news can mean growth - but always check the store, not just the headlines."*
   - Game Land: *"Exciting, but its price jumps around - a wiggly grower. It can grow fast AND droop fast. Plant here only what can ride the wiggles."*
   - Teach line: *"That is how gardeners choose: look for BUSY stores, listen for REAL news, and know your steady growers from your wiggly ones. Never plant at random - and never all in one bed!"* + **Learn More: What stocks are (Investor.gov)** → **Plant my seeds!**
4. **Weeks 2–10** — each week: a pinned LESSON chip + intro card + the world acts (customers stream into busy stores, prices droop and recover, a rocket inflates and pops, the quiet shop wins) + ONE feedback card (praise or coach, with the week's real numbers and a Learn More link). All ten lessons, verbatim in the game:
   - W2 *"never keep all your money in one company"*, W3 *"prices wiggle - do not panic when they dip"*, W4 *"watch the store - a busy store is a healthy company"*, W5 *"price and health are different"*, W6 *"money seeds take time - patience pays"* (the ONE surprise bill), W7 *"companies can fail - watch for warning signs"*, W8 *"do not chase - what shot up fast can fall fast"*, W9 *"steady and boring can beat flashy"*, W10 *"check your garden - trim the big, water the small"*.
5. **Harvest summary panel:** plants for every company owned, *"You started with $X → You finished with $Y"*, *"N weeks in the garden. You followed M of N lessons - every one was a DECISION, not luck."* → **Finish**
6. **CARD:** *"$GOAL! You planted, you watched, you waited - and when things drooped, you didn't panic. One last secret, gardener: real money gardens grow slower than ours did. But the earlier in life you plant, the taller they grow. Now go tell someone what a busy store means!"*
7. **CARD — the bridge:** *"You EARNED it. You BUDGETED it. You BANKED it. And now you GREW it. That is the whole money journey! Follow the path east - the FINALE AREA is open, and the party is for YOU."* → **To the Finale!**

---

## The Finale

1. **BANNER:** *"THE FINALE AREA IS OPEN!"* + **POINTER:** *"You finished the whole journey. Follow your arrow to the FINALE AREA - the party is for you!"*
2. Approaching the Finale Area: the WHOLE TOWN rushes over (snappy), circles the child and dances. **BANNER:** *"EVERYONE CAME TO CELEBRATE YOU!"* **BUBBLES:** *"You did it!"* · *"MONEY GURU!"* · *"Hip hip HOORAY!"* · *"The whole journey!"* · *"So proud of you!"* · *"Party time!"*
3. Door prompt: *"Enter the FINALE!"* → the certificate page: *"CONGRATULATIONS, {NAME}! You saved, you shopped smart, you gave, you ran a business, you invested, you budgeted, and you banked. That makes you a true MONEY GURU."* + the downloadable certificate (*"Mastered saving, smart spending, giving, running a business, investing, budgeting, and banking."*) with disco lights, dancers, and party music.

---

## Everyone you can talk to (Part 7)

Every townsperson answers with a short line over their head; many point to the
next stop (the {next stop} fills in live — e.g. "BUDGET TOWN"):

- **Milo** (walks the loop): *"I walk this ring road every single day. Best loop in the world."* · *"Keep going around - {next stop} is just ahead!"* · *"Two-way street, friend. You can walk it both ways!"*
- **Nea** (walks it backwards): *"I walk the loop backwards. It is the same circle!"* · *"Need a hint? {next stop} - follow your arrow."*
- **Theo:** *"Hey friend! My bike and I are ready for anything."* · *"Follow the arrow - {next stop} is waiting for you!"*
- **Mia:** *"The shelter says hi! Giving feels amazing."* · *"Lost? The arrow points to {next stop}!"*
- **Scoop:** *"EXTRA EXTRA! Kid learns money, town amazed!"* · *"My ball rolls to {next stop} every time. Follow it!"*
- **Teller Tom:** *"The vault door weighs more than a hippo!"* — **Clerk Cleo:** *"Cards are keys to your own money, you know."* — **Postal Pat:** *"Pay the whole bill on time - trust me, I deliver the grown ones."* — **Helper Hana:** *"One payment beats six fees - that is my motto."* — **Sneaky Sam:** *"...no prizes today. Fine. FINE. I am leaving."*
- **Park folk by the lake:** Dana & Rio (dancing), Lulu & Finn (on the bench), Pip (picnic), Momo: e.g. *"The disco at the Finale Area is going to be LEGENDARY."* · *"Resting by the water is free. Best deal in town."*
- **Hosts out of turn:** each future host gives a friendly not-yet line (e.g. Mr. Sprout: *"Not right now - finish the Bank of TAYU first, then come grow your money with me!"*); finished hosts greet warmly (e.g. *"Your budget still looks great, Budget Boss!"*).

---

## Always-available UI

- **'?' button** (top right, always): reopens the Controls / Phases / Library popup.
- **Your Money pill** (top center): the one number, always visible, every module.
- **Trust Meter** (bank module), **Week/goal chip** (garden), **jar chips** (week 1).
- **Admin** (bottom right, password): ◀ Module / Module ▶, ◀ Week / Week ▶, Add money — on a solid gray panel.
