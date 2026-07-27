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
      spentAll: 'RESET: Your $30 is back in your hand. You put too much in SPEND, so nothing was left for SAVE or GIVE. This time, split the money across all three jars. Try about $10 in each.',
      savedAll: 'RESET: Your $30 is back in your hand. Saving is important, but Theo still needs a gift and the shelter needs help. This time, put some money in every jar. Try about $10 in each.',
      gaveAll: 'RESET: Your $30 is back in your hand. Giving is kind, but you also need money for today and later. This time, put some money in every jar. Try about $10 in each.',
      unbalanced: 'RESET: Your $30 is back in your hand. The split was too uneven. You must use all three jars: SPEND for now, SAVE for later, and GIVE for others. Try about $10 in each.',
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
      spentAll: 'RESET: Your $30 is back. You put too much in SPEND, so there was nothing for the fair or the library. This time, put the MOST in SAVE, then split the rest between SPEND and GIVE. Try about $8, $14, and $8.',
      savedAll: 'RESET: Your $30 is back. You saved everything, but today and helping others still matter. This time, put the MOST in SAVE and a smaller amount in both SPEND and GIVE. Try about $8, $14, and $8.',
      gaveAll: 'RESET: Your $30 is back. You gave everything away, so nothing remained for today or the fair. This time, put the MOST in SAVE and a smaller amount in both SPEND and GIVE. Try about $8, $14, and $8.',
      unbalanced: 'RESET: Your $30 is back. Because the fair is next week, SAVE should be the biggest jar. You still need some SPEND and some GIVE. Try about $8 in SPEND, $14 in SAVE, and $8 in GIVE.',
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
      spentAll: 'RESET: Your $30 is back. Spending everything moved you farther from the skateboard. This time, put the MOST in SAVE and only a little in SPEND and GIVE. Try about $6, $18, and $6.',
      savedAll: 'RESET: Your $30 is back. Saving most is correct, but Theo and the shelter still need a small share. Try about $6 in SPEND, $18 in SAVE, and $6 in GIVE.',
      gaveAll: 'RESET: Your $30 is back. Giving everything left nothing for the skateboard or your needs. This time, put the MOST in SAVE and only a little in SPEND and GIVE. Try about $6, $18, and $6.',
      unbalanced: 'RESET: Your $30 is back. A big future goal means SAVE must be much larger than the other jars. Try about $6 in SPEND, $18 in SAVE, and $6 in GIVE.',
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
