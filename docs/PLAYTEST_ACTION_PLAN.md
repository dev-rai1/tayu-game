# TAYU Playtest Action Plan

Source: first-round middle-school playtest and follow-up team discussion.

## What the tester liked and should be preserved

- The Lemonade Stand was the favorite module because the player chose the batch, recipe, price, hours, and other business inputs, then saw the result.
- The NPC names, character personalities, and continuing story made the game feel engaging.
- Character customization was fun.
- The financial concepts were understandable.
- The game loaded quickly and did not lag during the test.
- The player learned about profit, revenue versus spending, banking, investing, and market risk.
- The Market & Jars and grocery choices worked as useful introductory decisions.

## Confirmed problems

1. Guidance and explanation boxes sometimes overlap, especially during the Lemonade Stand, hiding part of the text.
2. Several boxes contain too many words at once.
3. Module 5 contains too much explanation and not enough action.
4. Later modules feel more guided than the Lemonade Stand and need more player decisions.
5. Some guidance reveals the answer instead of giving a clue and allowing trial and error.
6. Module 5 is too large as one uninterrupted experience.
7. The same sequence is shown to every age group even though the difficulty changes substantially.
8. Elementary students may feel overwhelmed by later modules.
9. Middle-school students can handle Module 5 concepts, but some may lose interest because of its reading load.
10. Module 1 may feel easy to older students, even though it is an important foundation.
11. Teachers need clearer guidance on which modules to use, expected timing, discussion prompts, and how to debrief decisions.
12. The learning path and certificate language currently assume every player must complete all five modules.

## Required product changes

### Interface and accessibility

- Never display a persistent coach card over a dialog, decision panel, lesson card, portfolio, store sheet, or Lemonade planning sheet.
- Use one responsive coaching tray rather than multiple competing cards.
- Keep saved NPC messages available after the active panel closes.
- Make large commerce helpers bottom sheets on smaller screens and side panels only when enough width exists.
- Keep read-aloud support and clear, large action buttons.

### Writing and pacing

- Limit each story beat to one idea and generally one or two short sentences.
- Keep NPC voice and story context, but remove repeated definitions.
- Replace long reset paragraphs with a short outcome, one principle, and one retry clue.
- Use progressive disclosure: show details only when they are needed for the current decision.
- Display expected time and progress for each module.
- Use the Lemonade Stand's roughly 10–15 minute decision loop as the engagement benchmark.
- Aim for roughly 5–10 minute bite-sized sections elsewhere.

### Decision-first learning

- Let players make a choice before giving the full explanation whenever the choice is safe and reversible.
- Show the consequence, ask what changed, and then let the player retry.
- Give directional clues rather than exact batches, prices, allocations, or portfolio answers.
- Keep the Lemonade Stand's “change one variable and compare” pattern.
- Add more compare-and-choose moments to budgeting, banking, and investing.
- Preserve the building-block order instead of allowing older students to skip every foundational idea.

### Module 5 redesign

- Divide the Money Garden into two clear parts:
  - Part 1: investing basics, diversification, and interpreting evidence.
  - Part 2: market changes, emergency cash, warning signs, hype, patience, and rebalancing.
- Add an intermission after Part 1 with options to continue or save and exit.
- Replace answer-revealing instructions with questions and evidence clues.
- Keep the concepts available to middle school, but use shorter text and optional advanced context for high school.

### Grade-aware pathways

- Ask the player for a grade band before showing the learning path.
- Recommended plain-user paths:
  - Grades K–2: Modules 1–2.
  - Grades 3–5: Modules 1–3.
  - Grades 6–8: Modules 1–5, with Module 5 divided into two parts.
  - Grades 9–12: Modules 1–5 plus advanced prompts in later modules.
- A teacher-assigned classroom path should override the general recommendation.
- Keep Module 1 as a short foundation for older players rather than removing it.
- Base certificate requirements on the assigned or recommended path, not automatically all five modules.

### Teacher guide

- Add a teacher-facing guide inside the app.
- For every module include target grades, expected time, learning goals, decisions students make, discussion questions, and evidence to observe.
- Explain the two Money Garden parts.
- Include suggested stopping points for short sessions.
- Explain that the game should encourage reasoning and trial and error rather than giving exact answers.
- Include a quick pre-play setup and post-play debrief.

## Validation

- Add regression tests for overlay collision rules.
- Add tests for grade-band recommendations and certificate requirements.
- Add tests that guidance does not reveal exact answers.
- Re-test on a narrow laptop/Google Meet-sized viewport and a phone-sized viewport.
- Re-test Module 5 with middle-school students after the split.
- Track completion time, where students stop, incorrect attempts, retries, and module drop-off.

## Non-code follow-up

- Invite the tester to try the revised version.
- Collect written feedback in addition to the interview.
- Recruit one or two additional testers with parent permission.
- Test separately with elementary, middle-school, and high-school students rather than treating one age group as representative of all players.
