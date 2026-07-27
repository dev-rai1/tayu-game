// Persistent, player-facing guidance for the Money Garden decision screen.
// This is intentionally kept separate from market outcomes so the HUD can pin
// the same clear instructions above the portfolio without hiding the lesson.

export const MONEY_GARDEN_FLOW = [
  '1. Read Mr. Sprout’s clue.',
  '2. Adjust the highlighted part of your portfolio.',
  '3. Check that your choice matches the clue.',
  '4. Press Start the Week to see the outcome.',
]

export const MONEY_GARDEN_DECISIONS = {
  1: {
    title: 'Choose with clues, not luck',
    instruction: 'Study each company story, then split your seeds across more than one company. Keep some cash available instead of planting blindly.',
  },
  2: {
    title: 'Spread out your risk',
    instruction: 'Make sure you own seeds in at least two companies. One company can fall, but your other company can help protect the garden.',
  },
  3: {
    title: 'Do not panic-sell',
    instruction: 'A temporary price dip is not automatically a reason to sell. Hold the dipping company unless the lesson gives a real warning sign.',
  },
  4: {
    title: 'Follow real business clues',
    instruction: 'Favor the busy company and avoid adding money to the empty, dusty company. Customers are evidence.',
  },
  5: {
    title: 'Cheap is not always healthy',
    instruction: 'Buy the company that is both discounted and busy. Do not buy the empty company only because its price is low.',
  },
  6: {
    title: 'Keep emergency money',
    instruction: 'Move enough money into Pocket to cover a surprise bill. Do not put every dollar into company seeds.',
  },
  7: {
    title: 'Respond to warning signs',
    instruction: 'Sell seeds from the unhealthy company before it closes, then keep the remaining money spread across healthier companies.',
  },
  8: {
    title: 'Do not chase hype',
    instruction: 'Do not buy the company only because its price just jumped. Keep your plan based on business clues, not excitement.',
  },
  9: {
    title: 'Steady can beat flashy',
    instruction: 'Add or keep money in the steady company instead of placing everything in the companies with the biggest short-term moves.',
  },
  10: {
    title: 'Rebalance the garden',
    instruction: 'Sell a little from any company holding too much and add to smaller holdings so one company does not control the whole portfolio.',
  },
}

export function moneyGardenDecision(week) {
  return MONEY_GARDEN_DECISIONS[week] || {
    title: 'Keep the garden balanced',
    instruction: 'Keep your seeds spread across companies, leave some safe money available, and press Start the Week when your plan matches the clue.',
  }
}
