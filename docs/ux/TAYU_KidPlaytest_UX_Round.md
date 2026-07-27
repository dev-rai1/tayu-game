# TAYU Adjustment Prompt: Kid Playtest UX & Onboarding

**For:** Ayush (build in Claude Max)
**From:** Dev
**Slot as:** next round (v12+)
**Scope:** onboarding, wayfinding, reading load, feedback clarity, fun and retention. No new modules. No curriculum reorder.

Locked context (do not change):
- Module order: 1 Market + Three Jars (Mr. Bram) -> 2 Lemonade Stand (Penny) -> 3 Budget Town (Budget Keeper) -> 4 Bank of TAYU (Banker Bea) -> 5 Money Garden (Mr. Sprout) -> Finale.
- Brand tokens: Electric Blue #1464F0, Deep Navy #071748, Teal #00DCA0, Purple #7850F0.
- Gaamaa accuracy doctrine still governs all message text. Every new line stays factually exact and one idea per sentence.
- Admin panel spec unchanged: solid gray background, three working controls only, always bottom-right.

---

## How this was tested
Played the live build end to end from the shipped code as an elementary and middle school kid would hit it. Every issue below maps to real on-screen text or a real flow in the current build. Grounded, not guessed.

## Kid playthrough log (short)
- **Start:** Made an avatar, world loaded, arrow told me to follow it to Mr. Bram. Good.
- **Market:** Split money into three jars, then shopped needs first at the green checkout. The three-jar idea landed. Some feedback told me exactly what to fix, some just said "Balance it!" and I did not know what to change.
- **Lemonade:** Set hours, pay, price, supplies. Fun, but a lot of sliders at once with no idea which one was "wrong" when I lost money.
- **Budget Town:** Rent, groceries, bus, needs first. Clear.
- **Bank:** Checking vs savings vs CD, debit vs credit, pay bills on time, and a scammer who I learned to ignore. Strong.
- **Money Garden:** Plant coins, wait, prices wiggle up and down, do not yank your seed on a dip. Best lesson, slowest to feel.
- **Finale:** Party, badges, trophy shelf. Felt like a real reward.

Biggest kid problems: text disappears before a young reader finishes it, moving around is taught with words a non-reader skips, and the arrow is the only way to find anything so the moment it points off-screen I was lost.

---

## VERIFY BEFORE BUILDING (do not rebuild what exists)
These already appear in the current build. Confirm each works, then only patch the gap noted. Do not recreate from scratch.
1. **Read-aloud / audio.** `speechSynthesis` and audio calls exist in the bundle. Check whether read-aloud is actually wired to the lesson captions and NPC lines, or only to music and sound effects. If it only covers music, that is the P0 below. If it covers captions, just make the toggle obvious.
2. **Controls helper.** A "?" button already exists ("Tap the question mark (?) any time to see them again"). Keep it. P0 below only adds a first-time interactive gate, not a second help panel.
3. **Save system.** "You have a world in progress" and "Continue my world" already work. Do not touch. The objective chip below reads from existing state.
4. **Action model.** "Press E or click the blue action button" and "Tap the blue button to do things" already exist. Reuse that same blue button in the movement gate, do not invent a new control.

---

## P0 — build first (blocks young kids from playing)

### P0.1 Caption dwell time scales with length, and lesson text waits for a tap
**Kid problem:** captions auto-clear on fixed timers (guide ~2800ms, actor ~3400ms, toasts short). A 1st or 2nd grader reads about one word per second, so a 12-word lesson vanishes before they finish.
**Build:**
- Replace fixed timers with `dwell = max(base, words * perWordMs)`. Start values: base 2600ms, perWordMs 380 for the Younger band, 260 for Older. Expose both as constants.
- Any caption that teaches the lesson or gives the next instruction gets a small "tap to continue" affordance and does not auto-dismiss. Chatter and flavor lines can still auto-clear.
- Add a tiny replay speaker icon on lesson captions that re-speaks the line (read-aloud) and re-shows it.

### P0.2 Interactive movement gate before the world opens (first session only)
**Kid problem:** movement is taught with text ("Use the stick in the corner to walk", "Drag anywhere to look around", "Press E or click the blue action button"). Non-readers hit "Play first" / "Skip to the game" and skip it, then cannot move.
**Build:** a 10 to 15 second learn-by-doing gate, no wall of text:
1. Glowing joystick with a bouncing hand hint and the words "Hold and drag." A single glowing coin sits 3 steps away. Walking onto it clears step 1.
2. The blue action button glows next to one friendly NPC. "Tap the blue button." Tapping it clears step 2 and opens the world.
- Show it once, gated on a `tutorialDone` flag in the existing save. Returning kids skip straight in.
- Keep the "?" helper for replay. This gate is teach-by-doing, the "?" is reference.

### P0.3 Off-screen arrow becomes an edge pointer
**Kid problem:** wayfinding is 100% "follow your arrow." When the camera faces away, the arrow leaves the screen and the kid is lost with no recovery.
**Build:**
- When the target is off-screen, pin the arrow to the nearest screen edge and rotate it to point toward the target. When on-screen, keep the current floating arrow.
- Shrink the arrow as distance closes so "almost there" is felt, not read.
- If the kid walks away from the target for more than ~6 seconds, gently pulse the arrow and play one soft "this way" chime. No nagging, once per stretch.

---

## P1 — build next (clarity and confidence)

### P1.1 Persistent objective chip
**Kid problem:** the current objective lives in toasts that vanish. Put the game down for a minute and you forget what you were doing.
**Build:** a single always-visible chip, top center, Deep Navy #071748 background, one short line ("Talk to Mr. Bram"). Tapping it re-speaks the objective and re-flashes the arrow. It updates from existing objective state and clears when the step is done.

### P1.2 Every "try again" names the one thing to fix
**Kid problem:** feedback quality is uneven. Good: "give it one more trim and you're home." Weak: "Balance it!" with no direction.
**Build:** audit every retry branch across all five modules. Each wrong-answer line must (a) name the single concrete change in kid words, and (b) highlight the exact jar, slider, or item to move (pulse it in Teal #00DCA0). No generic "balance it" without a pointed target. Keep every rewrite under the accuracy doctrine.

### P1.3 Lemonade "which slider was wrong" hint
**Kid problem:** four inputs at once (hours, pay, price, supplies). When a kid loses money they cannot tell which lever caused it.
**Build:** on a losing or weak round, the result card calls out the single biggest miss first ("Your price was too high for a rainy day") and pulses that one control. One fix at a time, not all four.

### P1.4 Reading-level toggle by band
**Kid problem:** one world serves K-12, so a 1st grader gets the same sentence length as a 5th grader.
**Build:** a Younger / Older setting in options that swaps caption length and vocabulary and sets the P0.1 perWordMs. Default it from the grade chosen at signup. Ship two copy variants only where sentences run long; short lines can be shared.

---

## P2 — polish (more fun, more learning)

### P2.1 Avatar payoff
**Kid problem:** kids build an avatar up front, then it does little. Payoff drives kids.
**Build:** each badge earned visibly upgrades the avatar or the avatar's spot at the finale (a new item, color, or prop). Show a 1-second "new look unlocked" moment when a badge lands.

### P2.2 Free replay from the map
**Build:** the finale copy already says "come back any time to replay a favorite part." Surface it: from the world map, any completed module shows a "Play again" tag so kids can re-run the lemonade stand or garden for fun without redoing the whole path. Reuse existing module entry, just unlock direct entry once completed.

### P2.3 Two-question "show what you know" after each module
**Kid problem:** lessons land in the moment but fade. A tiny check helps them stick.
**Build:** after each module, two quick friendly questions tied to what the kid just did, with immediate warm feedback (never "wrong", always "close, here is the trick"). Reuse the existing Knowledge Quiz component if it fits. Feed results into the existing "I can..." mastery statements.

### P2.4 Personalized one-line recap
**Build:** end each module with one line tied to the kid's own choices that session ("You saved the most for the big want. Smart."). Uses values already in state. Makes the lesson feel like it was about them.

---

## Copy and accuracy guardrails (apply to every new line)
- One idea per sentence. Short enough to read aloud in a breath.
- No em dashes anywhere in game copy.
- Accuracy doctrine holds: tax on profit not earnings, exact price-setting logic, feedback rewards the behavior not luck.
- Encouraging, never scolding. Wrong answers get a trick, not a buzzer.
- Every new lesson or instruction line must also read cleanly through read-aloud.

## Suggested build order for this round
P0.1 -> P0.2 -> P0.3 -> P1.1 -> P1.2 -> P1.3 -> P1.4 -> P2.x as time allows. Ship P0 as one testable drop before starting P1.
