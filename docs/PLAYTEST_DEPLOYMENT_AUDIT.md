# TAYU Playtest and Deployment Audit

Source: the first middle-school playtest interview and the team discussion that followed it.

Status legend:

- **Implemented**: present in the game or educator experience.
- **Protected**: covered by automated regression tests.
- **Measured**: recorded in Firebase analytics for future playtests.
- **Human follow-up**: cannot be completed by a software deployment and still requires a real tester, parent permission, or team outreach.

## What must be preserved

| Playtest finding | Status | Evidence in the product |
|---|---|---|
| Lemonade Stand remains decision-heavy | Implemented and protected | Players choose batch, price, hours, recipe, sign, and wage, then compare results. |
| Trial and error remains central | Implemented and protected | Retry coaching gives one directional clue rather than an exact setup. |
| NPC names, personalities, and continuing story remain | Implemented | Existing characters and story progression were retained. |
| Character customization remains | Implemented | Avatar creation and saved profile remain part of the player flow. |
| Financial concepts remain understandable | Implemented | Modules retain allowance, needs/wants, profit, banking, investing, and risk concepts. |
| Fast loading/no observed lag is not intentionally regressed | Protected | Every pull request must pass the production build; deployment smoke tests verify live routes. |
| Read-aloud support and large actions remain | Implemented | Existing narration utilities and large action controls remain in the game. |

## Confirmed problems and product changes

| Requirement from the call | Status | Implementation |
|---|---|---|
| Stop overlapping guidance and explanation boxes | Implemented and protected | One responsive coach tray; blocking overlays, commerce sheets, and the Money Garden guide suppress generic coaching. |
| Fix compressed Google Meet and phone layouts | Implemented and protected | Commerce guidance becomes a bottom sheet on narrow screens and a side panel only when width allows. |
| Keep NPC messages available after panels close | Implemented | The latest message is saved and restored when the interaction area is clear. |
| Remove walls of text | Implemented and protected | Story beats and consequence cards are shortened and length-tested. |
| Keep one idea per beat | Implemented and protected | Scenario copy is divided into short decision-focused prompts. |
| Remove repeated definitions | Implemented | Later feedback focuses on the current consequence and next decision. |
| Give a choice before the full explanation | Implemented | Safe, reversible decisions precede the debrief throughout the redesigned modules. |
| Show consequence, ask what changed, and retry | Implemented and measured | Outcome-based retry clues are displayed and attempts/retries are recorded. |
| Do not reveal exact jar allocations | Implemented and protected | Jar retries describe which jar should be larger or more balanced without revealing amounts. |
| Do not reveal exact Lemonade setup | Implemented and protected | Guidance asks players to adjust one variable using demand, leftovers, costs, and profit. |
| Do not reveal exact Budget Town allocation | Implemented and protected | The emergency retry says to protect enough ready cash without giving the target amount. |
| Do not reveal the correct bank button | Implemented and protected | Bank clues identify cost, risk, and scam warning signs without naming the correct button. |
| Do not reveal an exact investment or trade | Implemented and protected | Money Garden prompts ask for business evidence, diversification, ready cash, and concentration analysis. |
| Add more compare-and-choose moments | Implemented | Budgeting, banking, and investing now emphasize consequences and revision. |
| Split Module 5 | Implemented and protected | Part 1 covers foundations; Part 2 covers markets, risk, and patience. Each has five decisions. |
| Add a Module 5 intermission | Implemented and protected | Players can start Part 2 or save and exit after Part 1. |
| Resume Module 5 from the saved Part 2 checkpoint | Implemented and protected | The Part 2 flag is stored inside the saved Money Garden state. |
| Ask for a grade band | Implemented and protected | Independent learners select K–2, 3–5, 6–8, or 9–12. |
| K–2 ends after Module 2 | Implemented and protected | The recommended path is Modules 1–2 with its own completion certificate. |
| Grades 3–5 ends after Module 3 | Implemented and protected | The recommended path is Modules 1–3 with its own completion certificate. |
| Grades 6–8 keeps all five modules | Implemented and protected | The full sequence remains, with Module 5 divided into two parts. |
| Grades 9–12 keeps the foundation and adds depth | Implemented | The full path remains and every teacher-guide module includes an optional high-school extension. |
| Teacher assignments override general paths | Implemented and protected | Classroom-enabled modules become the active assigned path. |
| Keep Module 1 for older students | Implemented | Module 1 is labeled as a short K–12 foundation rather than removed. |
| Base certificates on the actual assigned path | Implemented and protected | Short paths receive accurate certificates naming only completed modules. |
| Award completion at the real module ending | Implemented and protected | Milestones are inferred at the end of Lemonade, Budget Town, Bank, and Money Garden. |
| Prevent guest players from becoming stuck | Implemented and protected | Missing classroom context falls back to an independent learner context. |
| Keep locked modules truly locked | Implemented and protected | Locked module buttons are disabled and cannot redirect into another module. |
| Add an in-app teacher guide | Implemented | The guide includes timing, goals, decisions, questions, evidence, stopping points, and debriefs. |
| Explain the two Money Garden parts to teachers | Implemented | Part-specific goals and stopping guidance appear in the guide. |
| Include short-session stopping points | Implemented | Every module includes a suggested stopping point. |
| Add a quick setup and five-minute debrief | Implemented | Both appear in the teacher guide. |

## Measurement and validation

| Validation requirement | Status | Implementation or next action |
|---|---|---|
| Build and unit tests | Protected | Frontend build, frontend tests, and backend tests run on every PR and main push. |
| Overlay collision regression tests | Protected | Shared overlay rules and source-level one-tray tests are included. |
| Grade-path and certificate tests | Protected | Grade recommendations, custom paths, milestones, and certificate requirements are tested. |
| No-exact-answer tests | Protected | Scenario and final-audit tests reject answer-revealing retry language. |
| Track completion time | Measured | Active seconds are stored per module and session. |
| Track where students stop | Measured | Ended sessions retain the last active module. |
| Track incorrect attempts | Measured | Choice events record incorrect/revise/effective outcomes. |
| Track retry frequency | Measured | Every directional retry prompt increments a module-specific count. |
| Track module completion and drop-off | Measured | Completion events and ended-session stop modules appear in the admin dashboard and CSV. |
| Verify narrow and phone behavior | Protected plus human follow-up | Responsive rules are regression-tested; a real-device pass remains part of the retest protocol. |
| Verify the exact deployed commit | Protected | Firebase writes `deployment.json` containing the Git SHA and checks it on Firebase Hosting and `tayufinance.app`. |
| Verify SPA routes after deployment | Protected | `/`, `/modules`, and `/teacher-guide` are fetched after each production deploy. |
| Deploy Firestore rules | Protected | Rules deployment is required; it can no longer fail silently. |

## Human follow-up that software cannot complete

These items are part of the original call, but they require real people rather than code:

1. Re-invite the original middle-school tester to the revised game.
2. Collect written feedback in addition to the interview.
3. Ask whether one or two additional students can test, with parent permission.
4. Run separate elementary, middle-school, and high-school sessions.
5. Test the revised Module 5 with middle-school students.
6. Test in a compressed Google Meet-sized window and on a physical phone.
7. Review the new admin metrics after those sessions and prioritize the highest drop-off or retry areas.

The product is instrumented to measure those sessions, but the sessions themselves must still be scheduled and conducted by the TAYU team.

## Deployment integrity

The old Firebase workflow built the website and then attempted Hosting and Firestore together. A Firestore database-creation permission error stopped the combined command before Hosting completed. The corrected workflow now:

1. Builds the frontend.
2. Deploys Hosting first.
3. Requires Firestore rules to deploy successfully.
4. Fetches a commit-specific deployment marker from Firebase Hosting and the custom domain.
5. Smoke-tests the main SPA routes.
6. Fails visibly if any part is incomplete or if the live website serves an older commit.
