// Jar scenario data. Module 1 should ask the child to DO something before
// explaining the rule. Each story is one short setup -> allocation decision ->
// visible consequence -> one short retry clue or takeaway.

export const JAR_SCENARIOS = [
  {
    id: 's1_birthday',
    title: "Theo's Birthday",
    intro: [
      "You have $30: an $8 birthday toy, money for later, and Mia's animal shelter. Split it into SPEND, SAVE, and GIVE.",
    ],
    target: { spend: 10, save: 10, give: 10 },
    spendGoal: { label: 'toy', amount: 8 },
    rules: { min: { spend: 8, save: 1, give: 1 } },
    hints: {
      spentAll: 'Try again: spending everything leaves nothing for later or others. Use all three jars.',
      savedAll: 'Try again: saving everything leaves today and giving uncovered. Use all three jars.',
      gaveAll: 'Try again: giving everything leaves the toy and future uncovered. Use all three jars.',
      unbalanced: 'Try again: cover the $8 toy, then keep something in SAVE and GIVE.',
    },
    recap: (a) => `You chose $${a.spend} to spend, $${a.save} to save, and $${a.give} to give.`,
  },
  {
    id: 's2_rainy',
    title: 'A Rainy Day',
    intro: [
      'The fair is next week and the library needs help. With $30, make the jar for your future goal the largest.',
    ],
    target: { spend: 8, save: 14, give: 8 },
    rules: { min: { spend: 1, save: 1, give: 1 }, largest: 'save' },
    hints: {
      spentAll: 'Try again: the fair is a future goal, so SAVE should be the largest jar.',
      savedAll: 'Try again: SAVE should be largest, but SPEND and GIVE still need something.',
      gaveAll: 'Try again: help the library, but keep SAVE largest for the fair.',
      unbalanced: 'Try again: make SAVE larger than both SPEND and GIVE.',
    },
    recap: (a) => `You kept $${a.save} for the fair, $${a.spend} for now, and $${a.give} for the library.`,
  },
  {
    id: 's3_bigwant',
    title: 'The Big Want',
    intro: [
      'A skateboard costs $45. You only have $30 today. Build a plan that moves toward it while keeping small amounts for today and others.',
    ],
    target: { spend: 6, save: 18, give: 6 },
    rules: { min: { spend: 1, save: 15, give: 1 }, largest: 'save' },
    hints: {
      spentAll: 'Try again: a big future goal needs a much larger SAVE jar.',
      savedAll: 'Try again: keep SAVE large, but leave a little for today and others.',
      gaveAll: 'Try again: keep giving in the plan, but make SAVE much larger.',
      unbalanced: 'Try again: put at least half in SAVE and keep smaller amounts in SPEND and GIVE.',
    },
    recap: (a) => `You saved $${a.save} toward the skateboard while keeping $${a.spend} for now and $${a.give} for others.`,
  },
]

const JARS = ['spend', 'save', 'give']

function followsRules(allocation, rules = {}) {
  const minimums = rules.min || {}
  if (!JARS.every((jar) => allocation[jar] >= (minimums[jar] || 0))) return false

  if (rules.largest) {
    const others = JARS.filter((jar) => jar !== rules.largest)
    if (!others.every((jar) => allocation[rules.largest] > allocation[jar])) return false
  }

  return true
}

function concreteGoalHint(allocation, scenario) {
  const goal = scenario.spendGoal
  if (!goal || allocation.spend >= goal.amount) return null
  const short = Math.round((goal.amount - allocation.spend) * 100) / 100
  return `Try again: SPEND is $${allocation.spend}; you're $${short} short. Re-allocate and cover the ${goal.label} while keeping something in SAVE and GIVE.`
}

// Decide the outcome of a split against the story's financial rule.
// Returns { ok, scene, hint }. scene ∈ BALANCED | SPENT_ALL | SAVED_ALL | GAVE_ALL | UNBALANCED
export function checkAllocation(a, sc) {
  const total = a.spend + a.save + a.give
  const ok = total === 30 && followsRules(a, sc.rules)
  if (ok) return { ok: true, scene: 'BALANCED', hint: null }
  const safeTotal = total || 1
  if (a.spend >= safeTotal * 0.85) return { ok: false, scene: 'SPENT_ALL', hint: sc.hints.spentAll }
  if (a.save >= safeTotal * 0.85) return { ok: false, scene: 'SAVED_ALL', hint: sc.hints.savedAll }
  if (a.give >= safeTotal * 0.85) return { ok: false, scene: 'GAVE_ALL', hint: sc.hints.gaveAll }
  const goalHint = concreteGoalHint(a, sc)
  return { ok: false, scene: 'UNBALANCED', hint: goalHint || sc.hints.unbalanced }
}
