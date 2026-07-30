# TAYU Complete Update Checklist

Updated: July 30, 2026

This is the single source of truth for the requested TAYU revisions. It combines the Budget Town rebuild, account and login changes, the middle-school playtest, the Kid Playtest UX round, the attached v6 walkthrough review, and the four open pull requests.

## Status key

- **Main**: implemented before this four-PR stack.
- **PR #121–#124**: implemented in the named open pull request and not yet merged into `main`.
- **Protected**: covered by automated tests, deployment checks, or safety rewinds.
- **Polish**: useful refinement that should follow additional observation rather than block the stack.
- **Human**: requires real student testing or outreach and cannot be completed by GitHub code.

## Pull-request stack

| PR | Scope | Base | Status |
|---|---|---|---|
| #121 | Learn-by-doing controls practice, persistent mission, screen-edge pointer | `main` | Open; individual CI passed |
| #122 | Replacement v7 walkthrough and complete audit | PR #121 branch | Open |
| #123 | Younger/Older reading setting and word-count caption timing | PR #122 branch | Open; cumulative CI passed |
| #124 | Two-question checks, actual-value recaps, collectible payoff | PR #123 branch | Open; cumulative CI passed |

**Required merge order: #121 → #122 → #123 → #124.**

## 1. Entry, account, and learning paths

| Requirement | Status | Final result |
|---|---|---|
| Clear play/auth entry and no competing duplicate login | Main | The main Play action owns login/sign-up. |
| Required organization, role, grade, referral, and class information | Main | Sign-up blocks incomplete required profiles. |
| Password reset | Main | Firebase reset flow remains available. |
| Guest Mode | Main + Protected | Anonymous players receive an independent playable session and analytics context. |
| Grade-aware recommended paths | Main + Protected | K–2 uses Modules 1–2; 3–5 uses 1–3; 6–8 and 9–12 use all five. |
| Teacher override | Main + Protected | Teacher-enabled modules define the classroom path. |
| Locked modules stay locked | Main + Protected | Disabled or out-of-order modules cannot be opened. |
| Replay completed modules | Main | Completed cards show **Play again** without erasing completion. |
| Resume unfinished progress | Main + Protected | Active module and Money Garden Part 2 checkpoint persist. |
| Accurate shorter certificates | Main + Protected | Certificates list only the modules actually required and completed. |
| Default reading level from selected grade | PR #123 | K–5 defaults to Younger; 6–12 defaults to Older. |

## 2. Interface, performance, and responsiveness

| Requirement | Status | Final result |
|---|---|---|
| Preserve the five-module order | Main + Protected | Market → Lemonade → Budget → Bank → Money Garden → Finale. |
| Reduce long travel | Main | The town is tighter and Budget Town no longer requires indoor walking. |
| Keep the world alive | Main | Ambient NPCs, scenery, consequence scenes, reactions, and celebrations remain. |
| Prevent overlapping guidance | Main + Protected | One responsive coach layer is visible at a time. |
| Narrow Google Meet and phone layouts | Main + Protected | Panels become readable bottom sheets; controls avoid blocking actions. |
| Large consistent action controls | Main | Desktop uses E; mobile uses a bounded MOVE pad and large DO button. |
| Music and mute preference | Main | Original music is audible but gentle and preserves the saved mute choice. |
| Multilingual controls | Main | English, Spanish, Hindi, Mongolian, Russian, Simplified Chinese, Marathi, and more are available. |
| Read aloud | Main | Core lesson and help cards expose speech controls. |
| Preserve the latest message | Main | Blocking panels no longer permanently erase the active lesson message. |
| Verify production commit and routes | Main + Protected | Firebase deployment checks the Git SHA and smoke-tests important routes. |

## 3. Onboarding and wayfinding

| Requirement | Status | Final result |
|---|---|---|
| Replayable question-mark controls help | Main | Controls, modules, and resources remain available. |
| Replace text-only first-use instructions | PR #121 + Protected | The child must move, then complete a real E/DO interaction. |
| Do not repeat the tutorial | PR #121 | Completion is saved locally for returning devices. |
| Persistent objective | PR #121 | A current-mission chip remains visible and replayable. |
| Recover an off-screen destination | PR #121 | A screen-edge pointer rotates toward the target. |
| Distance feedback | PR #121 | Pointer scale changes as the player approaches. |
| Recovery pulse | PR #121 | A restrained pulse appears after continued movement away. |
| Regression coverage | PR #121 + Protected | Navigation source tests cover tutorial, mission, and pointer behavior. |

## 4. Reading accessibility

| Requirement | Status | Final result |
|---|---|---|
| Core lessons wait for player action | Main | Important cards are tap-to-dismiss. |
| Read-aloud support | Main | Lesson cards can be replayed through speech. |
| Younger/Older preference | PR #123 | A real `/settings` page lets the player choose either band. |
| Grade default | PR #123 | Grade selection establishes the starting band unless the player has overridden it. |
| Word-count caption timing | PR #123 + Protected | 2,600 ms base; 380 ms/word Younger; 260 ms/word Older. |
| Preserve intentional longer durations | PR #123 + Protected | The timing function never shortens an explicitly longer caption. |
| Alternate shorter wording variants | Polish | Add only when real testing shows specific lines still need simplification. |

## 5. Module 1 — Market & Three Jars

| Requirement | Status | Final result |
|---|---|---|
| Allowance and Spend/Save/Give allocation | Main | The child gives every dollar one of three jobs. |
| Teach each jar | Main | First deposits open short lessons with Read aloud. |
| Trial and error | Main + Protected | Weak splits reset for revision rather than ending the journey. |
| Never reveal exact allocation targets | Main + Protected | Coaching gives directional evidence only. |
| Needs before wants | Main | Shopping requires a healthy food and drink before checkout. |
| Feedback uses the actual basket | Main | The consequence and retry clue reflect selected items. |
| Unused Spend becomes Save | Main | The rollover is visible and explained. |
| Personalized recap | Main / PR #124 | Existing values are consolidated into the post-module recap. |
| Two-question check and collectible | PR #124 + Protected | Warm feedback, actual Spend/Save/Give recap, Golden Money Pin reveal. |

## 6. Module 2 — Lemonade Stand

| Requirement | Status | Final result |
|---|---|---|
| Preserve player decisions | Main + Protected | Supplies, hours, wage, price, recipe, sign, and news remain player-controlled. |
| Remove guided-batch/auto-answer controls | Main + Protected | Guidance never applies the correct plan. |
| Re-openable pricing explanation | Main | Cost per cup and possible margin are taught without choosing the final answer. |
| Accurate tax | Main + Protected | Tax is calculated on profit, not revenue. |
| Fixed ledger order | Main | Revenue → Supplies → Pay → Profit → Tax → Keep. |
| One main evidence-based clue | Main + Protected | Feedback identifies one lever without exact final values. |
| Opportunity-cost decision | Main | The pool-versus-work choice remains. |
| Bankruptcy rewind | Main + Protected | Only the failed week resets. |
| Personalized recap | Main / PR #124 | The post-module page uses actual cumulative after-tax profit. |
| Two-question check and collectible | PR #124 + Protected | Profit/evidence check, Lemonade Visor reveal. |
| Standard teal pulse on every possible primary control | Polish | Apply after observing which controls truly need it. |

## 7. Module 3 — Budget Town

| Requirement | Status | Final result |
|---|---|---|
| Delete the lagging walking module | Main + Protected | The active lesson is one stationary household scene. |
| Housing choice | Main | Paying rent visibly settles the home. |
| Grocery choice | Main | Needs are prioritized within a fixed budget. |
| Transportation choice | Main | School travel is represented in place. |
| Health choice | Main | Health care is covered before optional spending. |
| Optional fun | Main | A want appears after needs. |
| Pocket/Bank/Garden split | Main | Three controls and a live pie explain the tradeoffs. |
| No forced perfect split | Main + Protected | Extreme plans receive nudges rather than hard failure. |
| Emergency-money surprise | Main + Protected | Ready cash protects growth money; failure returns only to the split. |
| Carry amounts forward | Main + Protected | Bank and Garden values become real starting values later. |
| Correct official documentation | PR #122 | Old building-to-building instructions are removed. |
| Two-question check, actual recap, collectible | PR #124 + Protected | Emergency/risk check, actual split recap, Budget Planner Badge reveal. |

## 8. Module 4 — Bank of TAYU

| Requirement | Status | Final result |
|---|---|---|
| Continuous six-step flow | Main | The module advances one decision/result at a time. |
| Deposit and vault | Main | The actual Budget Town Bank amount is protected. |
| Checking, Savings, and CD comparison | Main | Access-versus-growth tradeoffs are demonstrated. |
| Debit | Main | Checking visibly drops because debit uses owned money. |
| Credit and interest | Main | Borrowing creates a bill; partial payment adds interest. |
| Debt help | Main | A trusted nonprofit helper organizes several debts. |
| Scam safety | Main + Protected | A send attempt is intercepted safely and replayed with evidence. |
| Trust Meter | Main | Six lessons connect reliable actions to credit trust. |
| Two-question check, Trust recap, collectible | PR #124 + Protected | Debit/credit and scam check, actual Trust recap, Trust Shield reveal. |

## 9. Module 5 — Money Garden, including the extra Part 2

| Requirement | Status | Final result |
|---|---|---|
| Use only the Garden allocation | Main | Pocket and Bank remain separate. |
| Compare companies with evidence | Main + Protected | Customers, business health, news, price behavior, and risk guide decisions. |
| Diversify without one exact portfolio | Main + Protected | The game rewards evidence and avoids answer-revealing trades. |
| Ten decision weeks | Main | Diversification, dips, health, patience, failure, hype, steadiness, and rebalancing are covered. |
| Split into Part 1 and extra Part 2 | Main + Protected | Decisions 1–5 and 6–10 are separated by an intermission. |
| Start Part 2 or Save and exit | Main + Protected | Decision 5 is a natural stopping point. |
| Resume directly at Decision 6 | Main + Protected | The checkpoint lives inside the current player’s Money Garden state. |
| Reduced reading and evidence questions | Main + Protected | Copy is shorter and coaching asks the child to analyze. |
| Honest real-world timing | Main | The ending says real investing is slower and risky. |
| Personalized harvest | Main / PR #124 | Actual portfolio results feed the post-module recap. |
| Correct official walkthrough | PR #122 | The old six-week description becomes ten decisions/two parts. |
| Two-question check and collectible | PR #124 + Protected | Diversification/context check, actual harvest recap, Sprout Crown reveal. |

## 10. Completion, retention, and assessment

| Requirement | Status | Final result |
|---|---|---|
| Money Guru celebration | Main | NPCs, party music, dancers, lights, and certificate remain. |
| Correct production domain | Main | Display, PDF, and share link use `tayufinance.app`. |
| Accurate shorter paths | Main + Protected | Certificates never claim unplayed modules. |
| Free replay | Main | Completed modules show **Play again**. |
| Whole-game pre/post assessment | Main | Existing three-question check remains for longitudinal analytics. |
| Exactly two questions after every module | PR #124 + Protected | Five module-specific check definitions are validated by tests. |
| Immediate warm feedback | PR #124 | Correct answers say “Exactly”; misses explain the trick without shaming. |
| Actual-value recaps for all modules | PR #124 | Budget and Bank receive the same personalized ending standard as the other modules. |
| Visible reward payoff | PR #124 | Each module names and reveals one collectible tied to the existing finale shelf. |
| Save module-check results | PR #124 | Results persist in the profile and learning-event analytics. |

## 11. Teacher experience, analytics, and deployment

| Requirement | Status | Final result |
|---|---|---|
| In-app Teacher Guide | Main | Goals, time, decisions, prompts, evidence, stopping points, extensions, and debriefs are included. |
| Explain both Money Garden parts | Main | Part-specific goals and the Decision 5 stopping point are documented. |
| Class codes and module settings | Main | Teachers create classes and control student paths. |
| Student-detail analytics | Main | Sessions, module time, completion, attempts, and assessments are available. |
| Guest analytics | Main | Anonymous use is measured without an email. |
| Traffic analytics | Main | Total and unique visits are tracked. |
| Retry/drop-off analytics | Main | Attempts, clues, completion, time, and ended-session state are available. |
| Module-check analytics | PR #124 | Post-module score and outcome events are recorded. |
| Protected access | Main | Firestore rules restrict classroom and admin data. |
| Required rules deployment | Main + Protected | Rules deployment cannot fail silently. |

## 12. Validation completed

- PR #121’s frontend and backend workflow passed.
- The cumulative top branch was temporarily compared with `main` so the repository workflow would run.
- Frontend `npm ci`, production build, and all tests passed.
- Backend `npm ci` and all tests passed.
- The clean stacked bases were restored after validation.
- The replacement walkthrough was compared against current scenario, path, teacher, certificate, analytics, and deployment source files.

## 13. Human follow-up

1. Invite the original middle-school tester back and collect written feedback.
2. Run one or two additional student sessions with parent permission.
3. Test at least one elementary, middle-school, and high-school path.
4. Focus one middle-school session on Money Garden Part 2.
5. Repeat on a physical phone and in a compressed Google Meet window.
6. Review analytics and prioritize the highest drop-off, retry, or confusion point.

## Scope boundary

This checklist includes only TAYU website, game, classroom, teacher, analytics, deployment, and official-documentation work. Outreach emails, media coordination, college work, and unrelated projects are intentionally excluded.