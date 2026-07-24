// Jar scenario data. The state machine + timeline are built ONCE (store.js +
// scenes.js); these three data objects feed the same machine.
// v6: allowance is $30 - it divides evenly three ways ($10/$10/$10), which
// keeps the math easy for grades 1–3. Targets sum to 30; tolerance ±2 per jar.

export const JAR_SCENARIOS = [
  {
    id: 's1_birthday',
    title: "Theo's Birthday",
    intro: [
      "Hi! I'm Penny. It's Theo's birthday this week!",
      'You really want that $8 toy for yourself too...',
      'AND Mia is collecting for the animal shelter.',
      "You have $30. Fill your 3 jars: some to SPEND, some to SAVE, some to GIVE!",
    ],
    target: { spend: 10, save: 10, give: 10, tolerance: 2 },
    hints: {
      spentAll: 'You spent it ALL on yourself. Fun toy... but nothing saved and nothing for the shelter. Try again!',
      savedAll: 'Great saving! But Theo got no gift and the shelter left empty-handed. Balance it out!',
      gaveAll: 'So generous! But now you have nothing to spend or save. Keep a little for you too!',
      unbalanced: 'Close! Think: SOME to spend, SOME to save, SOME to give. Spread it across all three jars.',
    },
    recap: (a) => `You spent $${a.spend}, saved $${a.save}, and gave $${a.give} - a real budget!`,
  },
  {
    id: 's2_rainy',
    title: 'A Rainy Day',
    intro: [
      "It's been raining all week. No going out!",
      "You could blow it all on treats... but next week the fair comes to town.",
      'A neighbor is also raising money for new library books.',
      'You have $30. Spread it across your 3 jars wisely!',
    ],
    target: { spend: 8, save: 14, give: 8, tolerance: 2 },
    hints: {
      spentAll: 'All spent on treats! But the fair next week? No money left. Save some for later!',
      savedAll: 'Super saver! But a little fun today and a little kindness matter too. Balance it!',
      gaveAll: 'Kind heart! But keep some for the fair and some in savings. Spread it out!',
      unbalanced: 'Almost! A rainy week means SAVE a bit more, but still spend a little and give a little.',
    },
    recap: (a) => `Spent $${a.spend}, saved $${a.save} for the fair, gave $${a.give} - smart planning!`,
  },
  {
    id: 's3_bigwant',
    title: 'The Big Want',
    intro: [
      'You saw a $45 skateboard, but you only get $30 a week!',
      "You can't buy it yet... but you CAN save toward it.",
      'Theo still hopes for a small birthday treat, and the shelter still needs help.',
      'You have $30. Save big for the skateboard, but don’t forget the others!',
    ],
    target: { spend: 6, save: 18, give: 6, tolerance: 2 },
    hints: {
      spentAll: 'You spent it all. The skateboard just got further away! Save a big chunk this week.',
      savedAll: 'Amazing saving! But keep a little to spend and a little to give too. Balance it!',
      gaveAll: 'Very kind! But you’ll never reach the skateboard without saving. Save the most this week!',
      unbalanced: 'Getting there! For a BIG want, put the MOST in SAVE, then a little spend, a little give.',
    },
    recap: (a) => `Saved $${a.save} toward the skateboard, spent $${a.spend}, gave $${a.give} - goals take patience!`,
  },
]

// Decide the outcome of a split against the scenario target.
// Returns { ok, scene, hint }. scene ∈ BALANCED | SPENT_ALL | SAVED_ALL | GAVE_ALL | UNBALANCED
export function checkAllocation(a, sc) {
  const { spend, save, give, tolerance } = sc.target
  const ok =
    Math.abs(a.spend - spend) <= tolerance &&
    Math.abs(a.save - save) <= tolerance &&
    Math.abs(a.give - give) <= tolerance
  if (ok) return { ok: true, scene: 'BALANCED', hint: null }
  const total = a.spend + a.save + a.give || 1
  if (a.spend >= total * 0.85) return { ok: false, scene: 'SPENT_ALL', hint: sc.hints.spentAll }
  if (a.save >= total * 0.85) return { ok: false, scene: 'SAVED_ALL', hint: sc.hints.savedAll }
  if (a.give >= total * 0.85) return { ok: false, scene: 'GAVE_ALL', hint: sc.hints.gaveAll }
  return { ok: false, scene: 'UNBALANCED', hint: sc.hints.unbalanced }
}
