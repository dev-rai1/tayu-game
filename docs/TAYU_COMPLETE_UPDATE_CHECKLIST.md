# TAYU Complete Update Checklist

Updated: July 30, 2026

This is the single source of truth for the requested TAYU revisions. It combines the Budget Town rebuild request, the first middle-school playtest, the Kid Playtest UX round, the attached walkthrough review, and the implementation already merged into the repository.

## Status key

- **Complete**: implemented on `main` and covered by the current product.
- **Complete + protected**: implemented and covered by automated tests or deployment checks.
- **PR #121**: implemented in the open navigation PR and awaiting merge.
- **Next PR**: confirmed product gap that still needs code.
- **Human follow-up**: requires real testers or outreach and cannot be completed by GitHub code.
- **Documentation only**: the product is correct, but an older document described it incorrectly.

## 1. Product entry, accounts, and learning paths

| Requirement | Status | Current result |
|---|---|---|
| PLAY is the clear entry point into login/sign-up | Complete | The main route directs players through authentication and the pre-game flow. |
| Remove a duplicate small login entry | Complete | The experience uses the main play/auth route rather than a competing second login call to action. |
| Require organization name for organization accounts | Complete | Organization and classroom account data are supported in the current auth/classroom flow. |
| Require grade level and all sign-up questions | Complete | Grade and required onboarding fields are validated before account creation. |
| Working password-reset flow | Complete | Firebase authentication owns password reset. |
| Guest mode works without a permanent account | Complete + protected | Guest players receive an independent fallback context and no longer stall on the module page. |
| Ask independent players for a grade band | Complete + protected | K–2, 3–5, 6–8, and 9–12 paths are available. |
| K–2 recommended path ends after Modules 1–2 | Complete + protected | An accurate two-module certificate is issued. |
| Grades 3–5 recommended path ends after Modules 1–3 | Complete + protected | An accurate three-module certificate is issued. |
| Grades 6–8 use all five modules | Complete + protected | Module 5 is divided into two parts. |
| Grades 9–12 retain the foundation and receive advanced prompts | Complete | High-school extensions appear in the teacher guide. |
| Teacher assignments override the general grade path | Complete + protected | Teacher-enabled modules define the classroom path. |
| Locked modules stay locked | Complete + protected | Disabled modules cannot redirect a player into another lesson. |
| Completed modules can be replayed | Complete | The module map displays **Play again** for completed modules. |
| Resume an unfinished module | Complete + protected | The active module and Money Garden Part 2 checkpoint persist. |

## 2. World, performance, and general interface

| Requirement | Status | Current result |
|---|---|---|
| Preserve the five-world order | Complete + protected | Market & Three Jars → Lemonade Stand → Budget Town → Bank of TAYU → Money Garden → Finale. |
| Shrink long travel and keep destinations close | Complete | The current town layout is tighter than the older walkthrough and Budget Town no longer requires indoor walking. |
| Keep the world visually alive | Complete | Ambient people, scenery, reactions, celebrations, and animated business outcomes remain. |
| Stop overlapping guidance boxes | Complete + protected | One responsive coach layer is shown at a time; active panels suppress competing guidance. |
| Fix narrow Google Meet and phone layouts | Complete + protected | Large helpers become bottom sheets on narrow screens, and mobile controls no longer cover the page. |
| Use large, consistent action controls | Complete | Desktop uses the E interaction control and phone users receive a visible bounded movement pad and large DO button. |
| Preserve music and make it audible but gentle | Complete | Music is on for new players, rotates among original themes, and preserves the saved mute preference. |
| Multilingual control | Complete | The language menu includes English, Spanish, Hindi, Mongolian, Russian, Simplified Chinese, Marathi, and additional widely used languages. |
| Read-aloud for lesson and NPC text | Complete | Visible lesson cards include a Read aloud control. |
| Keep saved messages available | Complete | The latest message returns after a blocking panel closes. |
| Verify the exact production commit | Complete + protected | Deployment writes and checks the Git SHA on Firebase Hosting and `tayufinance.app`. |
| Smoke-test important routes after deployment | Complete + protected | `/`, `/modules`, and `/teacher-guide` are checked after production deployment. |

## 3. Onboarding and wayfinding

| Requirement | Status | Current result |
|---|---|---|
| Keep the existing question-mark controls helper | Complete | The full help panel remains replayable. |
| Replace text-only first-time controls with learn-by-doing | PR #121 | The player must move, then use the real E/DO interaction before the world opens. Completion is saved. |
| Do not repeat the tutorial for returning players | PR #121 | A saved tutorial flag skips the gate on later visits. |
| Keep a persistent objective visible | PR #121 | A current-mission chip stays on screen and can replay the objective. |
| Make off-screen destinations recoverable | PR #121 | The target becomes a screen-edge pointer when outside the camera view. |
| Scale the pointer as the player gets closer | PR #121 | Pointer scale reflects distance. |
| Pulse after the player walks away | PR #121 | A restrained recovery pulse appears after roughly six seconds of moving away. |
| Regression coverage for tutorial, mission, and edge pointer | PR #121 | Navigation source-level tests pass in CI. |

## 4. Reading accessibility and age-specific language

| Requirement | Status | Current result |
|---|---|---|
| Lesson/instruction cards wait for a player action | Complete | Core lesson cards are tap-to-dismiss rather than disappearing on a fixed short timer. |
| Replay lesson text through speech | Complete | Read aloud is wired to lesson cards. |
| Scale auto-clearing chatter by word count | Next PR | The requested `base 2600ms`, Younger `380ms/word`, and Older `260ms/word` constants are not yet implemented. |
| Add a Younger / Older reading setting | Next PR | Grade-aware module paths exist, but a separate reading-band setting does not yet exist. |
| Default reading band from grade | Next PR | Must be connected to the selected grade/classroom profile. |
| Provide shorter copy variants only where needed | Next PR | Current copy is substantially shorter, but it is not yet switched by a reading-band preference. |

## 5. Module 1: Market & Three Jars

| Requirement | Status | Current result |
|---|---|---|
| Allowance starts the lesson | Complete | The player collects an allowance and gives every dollar a job. |
| Spend / Save / Give allocation | Complete | Three interactive jars and a live allocation board remain. |
| Teach the job of each jar | Complete | Each first deposit triggers one short lesson and read-aloud option. |
| Preserve trial and error | Complete + protected | Coins reset after an ineffective split and the player retries. |
| Do not reveal exact allocations | Complete + protected | Coaching points toward a larger or smaller category without exposing a target amount. |
| Make retry guidance concrete | Complete + protected | Generic answer-revealing coaching was replaced with directional evidence clues. |
| Needs before wants shopping | Complete | The market asks for a healthy food and drink before checkout. |
| Feedback uses the actual basket | Complete | Consequences and retry feedback reflect the selected items. |
| Leftover spending becomes savings | Complete | The rollover is shown and explained. |
| Personalized end recap | Complete | The completion card uses the player name and actual Spend/Save/Give values. |

## 6. Module 2: Lemonade Stand

| Requirement | Status | Current result |
|---|---|---|
| Preserve the most decision-rich module | Complete + protected | Players choose supplies, hours, wage, price, recipe, sign, and react to town news. |
| Remove “Choose guided batch” and auto-answer buttons | Complete + protected | The player makes the plan. Guidance no longer applies the correct setup. |
| Keep pricing formula re-openable | Complete | The player can open a short cost-per-cup explanation. |
| Keep tax mathematically accurate | Complete + protected | Tax is calculated on profit, not revenue. |
| Show the ledger in a fixed clear order | Complete | Revenue → supplies → player pay → profit → tax → amount kept. |
| Name one main change after a weak week | Complete + protected | The result sequence gives one directional improvement clue. |
| Avoid exact recommended price/batch answers | Complete + protected | Coaching uses demand, leftovers, costs, and missed customers instead of a final answer. |
| Rewind only the failed business week | Complete | Bankruptcy restores the week checkpoint rather than erasing the journey. |
| Preserve opportunity-cost choice | Complete | The pool-versus-work moment remains. |
| Personalized recap | Complete | The week recap includes the player name, actual price, sales, and result. |
| Visually pulse the single missed control | Partially complete | The guidance identifies the primary lever, but a consistent teal pulse on every relevant control remains a polish item. |

## 7. Module 3: Budget Town

| Requirement | Status | Current result |
|---|---|---|
| Delete the lagging walk-through module | Complete + protected | The former building-to-building lesson is no longer the active implementation. |
| Rebuild as one stationary indoor household scene | Complete | The player stays in place while household areas and NPCs react to decisions. |
| Shelter decision and visible home reaction | Complete | Paying for housing lights and settles the home. |
| Grocery decision | Complete | The family basket prioritizes food needs and permits a treat when affordable. |
| Transportation decision | Complete | The school-bus need is represented in the stationary sequence. |
| Health decision | Complete | The health-care choice and doctor response remain. |
| Optional fun after needs | Complete | The want appears after the core needs are handled. |
| Pocket / Bank / Garden split | Complete | Three controls and a live pie show the player’s allocation. |
| Explain safety, slow growth, and investment risk | Complete | Each money home has a concise explanation. |
| Do not force one exact split | Complete + protected | Extreme allocations receive a nudge, not a blocked answer. |
| Emergency-money surprise | Complete + protected | The player handles a surprise from ready cash or revises the plan. |
| Carry the bank and garden amounts forward | Complete + protected | The saved split flows into the Bank and Money Garden. |
| Remove old walking instructions from documentation | Documentation only | The attached v6 and root Round 9 walkthrough were outdated; the replacement walkthrough fixes this. |

## 8. Module 4: Bank of TAYU

| Requirement | Status | Current result |
|---|---|---|
| Continuous Bank-style lesson flow | Complete | The lesson advances through one decision or result at a time. |
| Open account and vault animation | Complete | Coins move into the vault and the account is established. |
| Compare checking, savings, and CD | Complete | The player observes access-versus-growth tradeoffs. |
| Debit card uses the player’s own money | Complete | The checking balance visibly changes. |
| Credit card is borrowed money | Complete | The bill follows the purchase and the player chooses how to pay. |
| Show interest consequence of paying too little | Complete | The bill grows and the extra cost is explained. |
| Debt and nonprofit help | Complete | A simplified debt-help sequence and learning resource remain. |
| Scam-safety choice | Complete + protected | The player identifies warning signs; a poor choice is safely caught and replayed. |
| Build the Trust Meter | Complete | Six lessons fill the meter and connect reliable actions to credit trust. |
| Do not reveal the correct button in advance | Complete + protected | Retry clues identify the reason or warning sign instead. |

## 9. Module 5: Money Garden, including the extra section

| Requirement | Status | Current result |
|---|---|---|
| Use only the money assigned to the garden | Complete | Pocket and bank allocations remain separate. |
| Choose companies using evidence | Complete + protected | Players inspect customers, business news, stability, and risk. |
| Diversify rather than guess | Complete + protected | The opening split asks for evidence and avoids one-bed concentration. |
| Preserve ten decision weeks | Complete | The full sequence covers diversification, dips, company health, patience, failure risk, hype, steadiness, and rebalancing. |
| Split the module into Part 1 and Part 2 | Complete + protected | Part 1 contains decisions 1–5; **the extra Part 2** contains decisions 6–10. |
| Add the Part 1 intermission | Complete + protected | Players may start Part 2 or save and exit. |
| Resume directly at Part 2 | Complete + protected | The Part 2 state is stored inside the saved Money Garden state. |
| Reduce reading | Complete + protected | Opening and weekly cards were shortened and length-tested. |
| Use evidence questions rather than exact trades | Complete + protected | Portfolio coaching asks players to analyze, test, and revise. |
| Preserve honest real-world timing message | Complete | The ending states that real investments grow more slowly than the simulation. |
| Personalized harvest | Complete | The summary uses starting value, ending value, owned companies, weeks, and followed lessons. |
| Update walkthrough from six weeks to ten decisions/two parts | Documentation only | The replacement walkthrough corrects the older six-week description. |

## 10. Completion, replay, and assessment

| Requirement | Status | Current result |
|---|---|---|
| Celebration and Money Guru finale | Complete | Town NPCs celebrate and the certificate experience plays party music. |
| Correct production domain on certificate | Complete | Certificate display, PDF, and sharing use `tayufinance.app`. |
| Accurate shorter-path certificates | Complete + protected | Certificates list only the modules actually required and completed. |
| Free replay of completed modules | Complete | Completed cards show **Play again**. |
| Badge/avatar visual upgrade payoff | Needs verification/polish | Celebration and badge systems exist; a consistent avatar cosmetic unlock after every badge still needs an end-to-end verification pass. |
| Two-question check after each module | Next PR | The current assessment is a three-question pre/post whole-game check, not a two-question post-module check. |
| Warm immediate module-check feedback | Next PR | Must be added with supportive “close, here is the trick” language. |
| Personalized recap after every module | Partially complete | Modules 1, 2, and 5 use player/session values; Budget and Bank need a consistent final one-line recap. |

## 11. Teacher experience, analytics, and deployment

| Requirement | Status | Current result |
|---|---|---|
| In-app teacher guide | Complete | Goals, timing, decisions, discussion prompts, evidence, stopping points, setup, and debrief are included. |
| Explain both Money Garden parts | Complete | Teacher guidance includes part-specific objectives and a stopping point. |
| Teacher-created class codes and module settings | Complete | Students link to a teacher and inherit enabled modules. |
| Teacher student-detail analytics | Complete | Login history, sessions, module time, completion, assessments, and exports are available. |
| Guest session analytics | Complete | Anonymous guest progress and time are recorded without an email address. |
| Track total and unique site visits | Complete | Page-view and unique-browser metrics appear in admin analytics. |
| Track attempts, retry clues, completion, and drop-off | Complete | Events and ended-session module state appear in the admin dashboard and CSV. |
| Protect teacher/admin data access | Complete | Firestore rules limit classroom data to assigned teachers and admin-level views. |
| Require Firestore rules deployment | Complete + protected | Rules deployment can no longer fail silently. |

## 12. Human follow-up that GitHub cannot complete

1. Re-invite the original middle-school tester to the revised build.
2. Collect written feedback in addition to an interview.
3. Recruit one or two additional students with parent permission.
4. Run separate elementary, middle-school, and high-school sessions.
5. Test Money Garden Part 2 specifically with middle-school students.
6. Test the revised build in a compressed Google Meet window and on a physical phone.
7. Review the new analytics after those sessions and prioritize the highest drop-off or retry area.
8. Verify every badge cosmetic and celebration end to end on the deployed site.

## 13. Remaining code PR plan

1. **PR #121: Interactive onboarding and navigation** — complete and CI-passing; awaiting merge.
2. **Reading accessibility PR** — add Younger/Older preference, grade default, and word-count dwell constants for auto-clearing text.
3. **Retention and assessment PR** — add two supportive questions after each module, complete Budget/Bank personalized recaps, and verify the badge-to-avatar payoff.

## 14. Source scope

This checklist intentionally includes only changes that affect the TAYU website, game, teacher experience, analytics, deployment, or official walkthrough. Outreach emails, research papers, media coordination, and unrelated project work are not GitHub product requirements.