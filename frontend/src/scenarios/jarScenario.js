// Jar scenario data. The state machine + timeline are built once in store.js and
// scenes.js. The visible target remains an example for the late retry scaffold,
// but success is based on the financial idea in each story, not one exact split.

export const JAR_SCENARIOS = [
  {
    id: 's1_birthday',
    title: "Theo's Birthday",
    intro: [
      "It is Theo's birthday, you want an $8 toy, and Mia is collecting for the animal shelter.",
      'You have $30. Decide how much belongs in SPEND, SAVE, and GIVE.',
    ],
    target: { spend: 10, save: 10, give: 10 },
    spendGoal: { label: 'toy', amount: 8 },
    rules: { min: { spend: 8, save: 1, give: 1 } },
    hints: {
      spentAll: 'Your money reset. Spending everything left nothing for later or for others. Use all three jars.',
      savedAll: 'Your money reset. Saving matters, but the toy and helping others still matter too. Use all three jars.',
      gaveAll: 'Your money reset. Giving is kind, but you also need money for the toy and for later. Use all three jars.',
      unbalanced: 'Your money reset. The toy costs $8, and a complete plan also keeps something for later and something for others.',
    },
    recap: (a) => `You spent $${a.spend}, saved $${a.save}, and gave $${a.give}. You covered the toy and gave every dollar a job.`,
  },
  {
    id: 's2_rainy',
    title: 'A Rainy Day',
    intro: [
      'The fair is next week, and a neighbor is raising money for new library books.',
      'You have $30. Which jar should be largest when a future goal is close?',
    ],
    target: { spend: 8, save: 14, give: 8 },
    rules: { min: { spend: 1, save: 1, give: 1 }, largest: 'save' },
    hints: {
      spentAll: 'Your money reset. Spending everything made the fair and library impossible. Make SAVE the largest jar, then include the other two.',
      savedAll: 'Your money reset. You prepared for the fair, but today and the library disappeared from the plan. Include every jar.',
      gaveAll: 'Your money reset. The library received everything, but nothing remained for today or the fair. Make SAVE the largest jar.',
      unbalanced: 'Your money reset. The fair is the biggest goal in this story, so SAVE should be larger than both SPEND and GIVE.',
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
    target: { spend: 6, save: 18, give: 6 },
    rules: { min: { spend: 1, save: 15, give: 1 }, largest: 'save' },
    hints: {
      spentAll: 'Your money reset. Spending everything moved you away from the skateboard. Make SAVE much larger than the other jars.',
      savedAll: 'Your money reset. The skateboard is important, but a strong plan still leaves a small amount for today and others.',
      gaveAll: 'Your money reset. Giving everything left no path toward the skateboard. Make SAVE much larger and keep small shares elsewhere.',
      unbalanced: 'Your money reset. A large future goal needs at least half in SAVE, plus a smaller amount in SPEND and GIVE.',
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
  return `SPEND $${allocation.spend} < $${goal.amount} ${goal.label} — you're $${short} short. Your money reset so you can re-allocate and cover the ${goal.label} while still using SAVE and GIVE.`
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
