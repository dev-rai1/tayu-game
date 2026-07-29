// Jar scenario data. The state machine + timeline are built once in store.js and
// scenes.js. Hidden targets keep evaluation consistent, while player-facing
// feedback gives a principle and a clue instead of revealing the exact split.

export const JAR_SCENARIOS = [
  {
    id: 's1_birthday',
    title: "Theo's Birthday",
    intro: [
      "It is Theo's birthday, you want an $8 toy, and Mia is collecting for the animal shelter.",
      'You have $30. Decide how much belongs in SPEND, SAVE, and GIVE.',
    ],
    target: { spend: 10, save: 10, give: 10, tolerance: 2 },
    hints: {
      spentAll: 'Your money reset. Spending everything left nothing for later or for others. Use all three jars and compare their jobs.',
      savedAll: 'Your money reset. Saving matters, but today and helping others still matter too. Use all three jars.',
      gaveAll: 'Your money reset. Giving is kind, but you also need money for today and later. Use all three jars.',
      unbalanced: 'Your money reset. One jar took too much. Try a more even plan so today, later, and others are all included.',
    },
    recap: (a) => `You spent $${a.spend}, saved $${a.save}, and gave $${a.give}. That is a complete plan.`,
  },
  {
    id: 's2_rainy',
    title: 'A Rainy Day',
    intro: [
      'The fair is next week, and a neighbor is raising money for new library books.',
      'You have $30. Which jar should be largest when a future goal is close?',
    ],
    target: { spend: 8, save: 14, give: 8, tolerance: 2 },
    hints: {
      spentAll: 'Your money reset. Spending everything made the fair and library impossible. Make SAVE the largest jar, then include the other two.',
      savedAll: 'Your money reset. You prepared for the fair, but today and the library disappeared from the plan. Include every jar.',
      gaveAll: 'Your money reset. The library received everything, but nothing remained for today or the fair. Make SAVE the largest jar.',
      unbalanced: 'Your money reset. The fair is the biggest goal in this story, so SAVE should be largest without erasing SPEND or GIVE.',
    },
    recap: (a) => `You kept $${a.save} for the fair, $${a.spend} for now, and $${a.give} for the library.`,
  },
  {
    id: 's3_bigwant',
    title: 'The Big Want',
    intro: [
      'A skateboard costs $45, more than one $30 allowance. Theo and the shelter still need a small share.',
      'Build a plan that moves you toward the skateboard without forgetting today or others.',
    ],
    target: { spend: 6, save: 18, give: 6, tolerance: 2 },
    hints: {
      spentAll: 'Your money reset. Spending everything moved you away from the skateboard. Make SAVE much larger than the other jars.',
      savedAll: 'Your money reset. The skateboard is important, but a strong plan still leaves a small amount for today and others.',
      gaveAll: 'Your money reset. Giving everything left no path toward the skateboard. Make SAVE much larger and keep small shares elsewhere.',
      unbalanced: 'Your money reset. A large future goal needs a clearly larger SAVE jar, plus smaller SPEND and GIVE amounts.',
    },
    recap: (a) => `You saved $${a.save} toward the skateboard while keeping $${a.spend} for now and $${a.give} for others.`,
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
