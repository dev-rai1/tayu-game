// eventGenerator.js
// Random event-card decks for each stage. Cards are data; components render them.
// Pass a custom rng (returns 0..1) for deterministic tests.

const pick = (arr, rng = Math.random) => arr[Math.floor(rng() * arr.length)]

// Stage 1: each card modifies the jars.
//  - amount  : flat dollar change to `jar`
//  - percent : multiply `jar` balance (compound interest)
//  - prompt  : if present, player chooses YES/NO; effect only applies on YES
export const STAGE1_EVENTS = [
  { id: 's1-birthday', emoji: '🎁', text: 'You got a birthday gift! +$10 to spend.', jar: 'spend', amount: 10, concept: 'Unexpected income' },
  { id: 's1-lunch', emoji: '💔', text: 'Oops - you lost your lunch money. (–$5)', jar: 'save', amount: -5, prompt: 'Use your Save Jar to cover it?', concept: 'Emergency fund' },
  { id: 's1-fundraiser', emoji: '🎪', text: "Your school's holding a playground fundraiser.", jar: 'give', amount: -3, prompt: 'Donate $3 from your Give Jar?', concept: 'Opportunity cost' },
  { id: 's1-interest', emoji: '🏦', text: 'Your parents add 5% interest on your saved money!', jar: 'save', percent: 0.05, concept: 'Compound interest' },
  { id: 's1-lend', emoji: '🤝', text: 'A friend needs supplies for a project.', jar: 'spend', amount: -2, prompt: 'Lend $2 from your Spend Jar?', concept: 'Generosity vs. cost' },
  { id: 's1-toy', emoji: '🧸', text: 'You broke your favorite toy. $8 to replace.', jar: 'save', amount: -8, prompt: 'Use your Save Jar?', concept: 'Emergency fund' },
]

// Stage 2: modifies a weekly figure (revenue or expenses).
export const STAGE2_EVENTS = [
  { id: 's2-supplier', emoji: '📦', text: 'A supplier raised prices. Expenses +$2 this week.', field: 'expenses', amount: 2, concept: 'Cost management' },
  { id: 's2-newsletter', emoji: '📰', text: 'You got featured in the school newsletter! Revenue +$10.', field: 'revenue', amount: 10, concept: 'Marketing' },
  { id: 's2-sick', emoji: '🤒', text: 'You took a sick day. Revenue –$5.', field: 'revenue', amount: -5, concept: 'Reliability' },
  { id: 's2-viral', emoji: '🚀', text: 'A post went a little viral! Revenue +$8.', field: 'revenue', amount: 8, concept: 'Demand spikes' },
  { id: 's2-rain', emoji: '🌧️', text: 'Rainy week - fewer customers. Revenue –$6.', field: 'revenue', amount: -6, concept: 'External risk' },
]

// Stage 3: higher-stakes life events. `bucket` = where the money comes from / goes.
export const STAGE3_EVENTS = [
  { id: 's3-medical', emoji: '🏥', text: 'Medical bill - a $300 emergency expense.', amount: -300, bucket: 'emergencyFund', prompt: 'Pay from your Emergency Fund?', concept: 'Why emergency funds matter' },
  { id: 's3-windfall', emoji: '💸', text: 'Surprise bonus! +$200.', amount: 200, bucket: 'stocks', prompt: 'Invest it into stocks?', concept: 'Pay yourself first' },
  { id: 's3-carrepair', emoji: '🚗', text: 'Car repair - a $250 emergency.', amount: -250, bucket: 'emergencyFund', prompt: 'Pay from your Emergency Fund?', concept: 'Resilience' },
  { id: 's3-raise', emoji: '📈', text: 'You got a small raise! +$150 added to savings.', amount: 150, bucket: 'savingsGoals', concept: 'Income growth' },
  { id: 's3-gift', emoji: '🎉', text: 'Birthday money from family! +$100 to your emergency fund.', amount: 100, bucket: 'emergencyFund', concept: 'Building a buffer' },
]

/** Draw `count` distinct events from a deck, in random order. */
export function drawEvents(deck, count = 3, rng = Math.random) {
  const pool = [...deck]
  const out = []
  while (out.length < count && pool.length) {
    const i = Math.floor(rng() * pool.length)
    out.push(pool.splice(i, 1)[0])
  }
  return out
}

export { pick }
