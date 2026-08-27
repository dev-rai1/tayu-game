import { STORE_ITEMS } from './config.js'

const actionControl = (touch) => (touch ? 'Tap the blue ACT button' : 'Press E')

const marketReady = (bought = []) => {
  const basket = bought.map((id) => STORE_ITEMS.find((item) => item.id === id)).filter(Boolean)
  return basket.some((item) => item.tags?.includes('food'))
    && basket.some((item) => item.tags?.includes('drink'))
}
const guide = (title, instruction, action) => ({ title, instruction, action })

// Modules 6 and 7 use several different interaction styles. Keep the existing
// persistent Hint card, but make it specific to the exact challenge on screen
// so a player always knows both HOW to interact and WHAT idea to use.
const LATE_CARD_HINTS = {
  6: [
    ['LEND OR OWN?', 'BOND = LENDING', 'A bond means you lend money to a borrower; stock means you own part of a company.', 'Drag the statement that says you are lending $100 into the answer basket.'],
    ['BORROWER CHECK:', 'COMPARE CREDIT RISK', 'Think about who is least likely to miss repayment. U.S. Treasury debt is generally treated as the lowest-credit-risk choice of these three.', 'Drag Treasury into the answer basket.'],
    ['COUPON MATH:', 'CALCULATE THE INTEREST', 'Change 4.5% to 0.045, then multiply the $200 principal by 0.045. The question wants interest only, not principal plus interest.', 'Type only the final number in the box, without a $ sign, then press Check.'],
    ['TAX-EQUIVALENT YIELD:', 'USE THE TAX-EQUIVALENT FORMULA', 'First calculate 1 − 0.22 = 0.78. Then divide the 3.8% municipal yield by 0.78 to find the comparable taxable yield.', 'Type the percentage number only, such as 4.87, then press Check.'],
    ['PROJECT DECISION:', 'FOCUS ON AFTER-TAX RETURN', 'The municipal bond can look lower before tax but still be attractive because qualifying municipal interest may be exempt from federal income tax in this lesson.', 'Drag the choice about keeping more interest after federal tax into the basket.'],
    ['RISK VS RETURN:', 'WHY IS THE YIELD HIGHER?', 'A company usually has more credit/default risk than the U.S. Treasury, so lenders generally expect a higher potential return for taking that extra risk.', 'Drag the choice about compensating lenders for more credit risk into the basket.'],
    ['RATE-SHOCK EVENT:', 'THINK LIKE A NEW BUYER', 'If new similar bonds pay 6%, an older bond paying only 3% is less attractive. Its market price usually has to move down to compete.', 'Drag “It falls” into the answer basket.'],
    ['CREDIT-NEWS EVENT:', 'LOOK AT THE BORROWER', 'Weak earnings and a late coupon are warning signs that the company may have trouble making promised payments.', 'Drag Credit/default risk into the basket.'],
    ['WHO GETS PAID FIRST?', 'REMEMBER THE CAPITAL STRUCTURE', 'Bondholders are lenders. In a collapse, lenders generally have a higher claim on company assets than common stockholders.', 'Drag Bondholders into the answer basket.'],
    ['SIX-WEEK PAYOUT:', 'ADD INTEREST ONLY', 'Add the three coupon payments: 4.50 + 3.80 + 6.20. Do not include the $300 principal because the question asks only for interest received.', 'Type only the final dollar number, without a $ sign, then press Check.'],
    ['DIVERSIFICATION CHALLENGE:', 'BUILD THE THREE-PART MIX', 'Use all $300 and spread it across all three borrowers. For this challenge, set Treasury to $150, Municipal to $90, and Corporate to $60 so the riskiest borrower gets the smallest share.', 'Move each slider to the target amount. Make sure Total says $300, then press Lock portfolio.'],
    ['MATURITY MATH:', 'ADD PRINCIPAL BACK', 'At maturity, repaid principal comes back in addition to the interest earned. Add $300 principal + $14.50 interest.', 'Type only the total number, without a $ sign, then press Check.'],
    ['STOCKS VS BONDS:', 'DIFFERENT ASSETS, DIFFERENT JOBS', 'Stocks can offer more growth potential while bonds can provide income and stability. A portfolio can combine both instead of choosing only one forever.', 'Drag the choice saying a portfolio can use both for different jobs into the basket.'],
  ],
  7: [
    ['WHY TAXES?', 'LOOK FOR A SHARED PUBLIC SERVICE', 'Taxes pool money for things used by the community, such as roads, schools, clinics, and public safety.', 'Drag “Roads, schools, and public services” into the answer basket.'],
    ['EVIDENCE FIRST:', 'READ THE W-2 CAREFULLY', '$1,200 is wage income. The $120 withholding is money already prepaid toward taxes; it is not the final tax calculation and it is not extra wages.', 'Drag the choice saying $120 was already prepaid toward tax into the basket.'],
    ['GROSS-INCOME MATH:', 'ADD TAXABLE INCOME SOURCES', 'Gross income here is wages + lemonade profit + taxable corporate-bond interest: 1,200 + 300 + 20.', 'Type only the final number, without commas or a $ sign, then press Check.'],
    ['BUSINESS CHECK:', 'NO W-2 DOES NOT MEAN NO TAX', 'The lemonade stand profit came from self-employment/business activity. Business income can still belong on a tax return even without a W-2.', 'Drag the self-employment/business income choice into the basket.'],
    ['EXCLUSION SORT:', 'SORT EACH INTEREST PAYMENT', 'In this simplified lesson, the $40 municipal-bond interest is federally excluded, while the $20 corporate-bond interest is taxable.', 'Tap EXCLUDED under Municipal interest and TAXABLE under Corporate interest, then press Send to return.'],
    ['DEDUCTION MATH:', 'SUBTRACT THE DEDUCTION', 'A deduction reduces taxable income. Start with $1,520 gross income and subtract the $500 practice deduction.', 'Type only the amount remaining, without a $ sign, then press Check.'],
    ['PROGRESSIVE-BRACKET MATH:', 'TAX EACH BRACKET SEPARATELY', 'Calculate $500 × 10% = $50. Then calculate $520 × 20% = $104. Add those two tax amounts; do not tax every dollar at 20%.', 'Type only the total tax number, without a $ sign, then press Check.'],
    ['MARGINAL-RATE CHECK:', 'ONLY THE NEXT DOLLARS MOVE UP', 'Entering a higher bracket does not retroactively change the rate on dollars already taxed in the lower bracket.', 'Drag the choice saying the earlier dollars keep their lower rate into the basket.'],
    ['CAPITAL-GAIN MATH:', 'GAIN = SALE PRICE − COST BASIS', 'You sold for $110 and originally paid $80. Subtract what you paid from what you sold it for.', 'Type only the gain amount, without a $ sign, then press Check.'],
    ['HOLDING-PERIOD DECISION:', 'HOLDING PERIOD CAN CHANGE TAX TREATMENT', 'Short-term gains can be treated like ordinary income, while qualifying long-term gains can use a different, often lower, federal rate schedule.', 'Drag the choice about a different long-term federal rate schedule into the basket.'],
    ['REFUND OR DUE:', 'COMPARE TAX WITH PREPAYMENT', 'The final tax is $154 and $120 was already withheld. Because tax is larger than withholding, subtract 154 − 120 to find what is still due.', 'Type only the amount still due, without a $ sign, then press Check.'],
    ['WITHHOLDING DECISION:', 'A REFUND IS RETURNED OVERPAYMENT', 'A very large refund can mean too much tax was prepaid during the year. Adjusting withholding can move prepayments closer to the final tax owed.', 'Drag the choice about aiming closer to the tax actually owed into the basket.'],
    ['ERROR HUNT:', 'CHECK ALL THREE ERRORS', 'Fix every planted mistake: exclude the $40 municipal interest, include the $20 corporate interest, and change the stock gain from $40 to $30.', 'Drag the choice that contains all three fixes into the answer basket.'],
    ['FINAL CHECK:', 'RECONCILE THE WHOLE RETURN', 'Follow the chain: $1,520 gross income − $500 deduction = $1,020 taxable income; bracket tax = $154; $120 withholding means $34 is still due.', 'Drag the summary showing $1,020 taxable income, $154 tax, and $34 due into the basket.'],
  ],
}

function lateCardGuidance(st) {
  if (![6, 7].includes(st.week) || !st.cards?.length) return null
  const cardText = String(st.cards[0]?.text || '')
  const match = LATE_CARD_HINTS[st.week]?.find(([prefix]) => cardText.startsWith(prefix))
  if (!match) return null
  const [, title, instruction, action] = match
  return guide(title, instruction, action)
}

// One source of truth for the persistent NEXT STEP card. Every state answers:
// what to do, where to do it, and which control completes the step.
export function getGuidance(st, touch = false) {
  const act = actionControl(touch)

  if (st.helpOpen) return guide('HELP IS OPEN', 'Choose Controls, Modules, or Learning Resources.', 'Tap Got it when you are ready to return')
  if (st.dialog) return guide('FINISH THE CONVERSATION', 'Read what the character says.', 'Tap Next to continue')
  if (st.lessons?.length) return guide('READ THIS CARD', 'This short lesson explains your next decision.', 'Tap the large button at the bottom')
  if (st.cards?.length) {
    const lateHint = lateCardGuidance(st)
    if (lateHint) return lateHint
    return guide('MAKE THE CHOICE ON SCREEN', 'Read the current card, then choose one of its large buttons.', 'Your next step starts automatically')
  }
  if (st.objective === 'bond') return guide('TALK TO BEAU', 'Walk up to Ben at Bond Street and talk to him to begin.', `${act} beside Ben`)
  if (st.objective === 'tax') return guide('TALK TO REX', 'Walk up to Rex at the Tax Office and talk to him to begin.', `${act} beside Rex`)
  if (st.panelJar) return guide('ADD TO THIS JAR', 'Choose how many dollars this jar should receive.', 'Confirm the amount or close the panel')
  if (st.panelItem) return guide('CHECK THIS ITEM', 'Read its name, price, and type before buying.', 'Tap Buy or go back')
  if (st.btPanel === 'grocery') return guide('BUILD THE GROCERY BASKET', 'Choose the food the family needs while staying in budget.', 'Tap the button to finish shopping')
  if (st.btPanel === 'options') return guide('EXPLORE ALL THREE MONEY HOMES', 'Open Pocket, Bank, and Garden so you understand each job.', 'Continue after viewing all three')
  if (st.btPanel === 'split') return guide('DIVIDE THE LEFTOVER MONEY', 'Adjust Pocket, Bank, and Garden until the total matches.', 'Confirm the plan when it feels right')
  if (st.bkPanel) return guide('COMPLETE THE BANK ACTIVITY', 'Use the controls in the open bank panel.', 'Confirm your choice to continue')
  if (st.panelPortfolio) return guide('MAKE YOUR MONEY MOVES', 'Buy, sell, save, or keep cash based on this week’s lesson.', 'Close My Portfolio, then tap Start the Week')
  if (st.scenarioLocked) {
    if (st.week === 4) {
      return guide(
        'BANK ACTION IN PROGRESS',
        'Watch the bank scene play out. The movement, card swipe, teller, debt, or safety animation is the lesson right now.',
        'Do not press E — the next choice appears automatically when the animation finishes',
      )
    }
    return guide('WATCH WHAT HAPPENS', 'Your choice is playing out in the world.', 'The next step will appear automatically')
  }

  if (st.gameComplete) {
    return guide('GO TO THE FINALE AREA', 'Follow the gold arrow to the celebration house.', `${act} at the entrance`)
  }

  if (st.week === 1) {
    if (st.objective === 'mailbox') {
      return guide('COLLECT YOUR ALLOWANCE', 'Follow the arrow to the Allowance Bank mailbox.', `${act} when you reach it`)
    }
    if (st.objective === 'kitchen') {
      return guide('DIVIDE ALL $30', 'Follow the arrow to the three jars, then give every dollar a job.', `${act} near a jar to add money`)
    }
    if (st.objective === 'store') {
      if (!st.bramTalked) return guide('TALK TO MR. BRAM', 'Follow the arrow to him inside TAYU Market.', `${act} when you are beside him`)
      if (marketReady(st.bought)) return guide('GO TO CHECKOUT', 'Follow the arrow to the glowing green CHECKOUT at the front of the store.', `${act} on the checkout circle`)
      return guide('BUY FOOD AND A DRINK', 'Walk close to one healthy food and one healthy drink on the shelves.', `${act} beside an item, then tap Buy`)
    }
    return guide('MODULE COMPLETE', 'Review what you learned and continue when ready.', 'Tap Continue')
  }

  if (st.week === 2) {
    const phase = st.lemPhase
    if (phase === 'toStand') return guide('GO TO THE LEMONADE STAND', 'Follow the arrow to Penny at the stand.', `${act} when you arrive`)
    if (phase === 'toMarket') return guide('BUY THIS WEEK’S SUPPLIES', 'Follow the arrow to Mr. Bram at TAYU Market.', `${act} beside him`)
    if (phase === 'supplies') return guide('CHOOSE A SUPPLY BUNDLE', 'Pick how many cups you can afford for this week.', 'Tap one bundle to continue')
    if (phase === 'toStand2') return guide('RETURN TO YOUR STAND', 'Follow the arrow back to the Lemonade Stand.', `${act} at the stand`)
    if (phase === 'template') return guide('BUILD THIS WEEK’S PLAN', 'Set your hours, your pay, and your lemonade price.', 'Use How do I pick? if needed, then start selling')
    if (phase === 'pool') return guide('CHOOSE WORK OR THE POOL', 'Decide whether to open the stand or take the day off.', 'Tap one choice to see what happens')
    if (phase === 'selling') return guide('WATCH YOUR BUSINESS DAY', 'Customers are reacting to the plan you made.', 'Your results will appear automatically')
    if (['recapCard', 'results', 'goalCard', 'tipCard'].includes(phase)) {
      return guide('REVIEW THIS WEEK', 'Read the result, your goal progress, and the tip for next week.', 'Tap Continue at the bottom')
    }
    if (phase === 'done') return guide('LEMONADE GOAL REACHED', 'Review your cash-out lesson before moving on.', 'Tap the large button to continue')
    return guide('START THE BUSINESS LESSON', 'Read the introduction to see your money and profit goal.', 'Tap the large button to continue')
  }

  if (st.week === 3) {
    const stage = st.bt?.stage
    if (!st.bt || stage === 'intro') return guide('TALK TO THE BUDGET KEEPER', 'Follow the arrow to the Budget Town house.', `${act} when you reach the Keeper`)
    const names = {
      house: 'PAY FOR THE HOME',
      grocery: 'BUY THE FAMILY’S GROCERIES',
      bus: 'PAY FOR THE SCHOOL BUS',
      clinic: 'PAY FOR HEALTH CARE',
      fun: 'DECIDE ABOUT FUN',
      options: 'LEARN THE THREE MONEY HOMES',
      split: 'BUILD THE MONEY PLAN',
      emergency: 'HANDLE THE SURPRISE COST',
      handoff: 'CONTINUE TO THE BANK',
    }
    return guide(names[stage] || 'CONTINUE BUDGET TOWN', 'Use the current card or panel to finish this part of the family’s day.', 'The next part begins automatically')
  }

  if (st.week === 4) {
    if (!st.bk || !st.bk.seen?.intro) return guide('TALK TO BANKER BEA', 'Follow the arrow to Bea at the Bank of TAYU.', `${act} when you reach her`)
    if ((st.bk.week || 1) > 6) return guide('BANK COMPLETE', 'Use the final bank card to continue to the Money Garden.', 'No extra E press is needed')
    return guide(
      `BANK LESSON ${st.bk.week || 1} OF 6`,
      'Stay with the bank scene. Each choice starts the next animation automatically.',
      'Use the single bank card or guide when it appears — no repeated E presses',
    )
  }

  if (st.week === 5) {
    if (!st.mg || st.mgPhase === 'toGarden') return guide('TALK TO MR. SPROUT', 'Follow the arrow to him in the Money Garden.', `${act} when you reach him`)
    if (st.mg.phase === 'slider') return guide('PLANT YOUR FIRST SEEDS', 'Choose how to divide your garden money among the three companies.', 'Confirm the seed plan to continue')
    if (st.mg.phase === 'adjust') return guide(`MONEY GARDEN WEEK ${st.mg.week}`, 'Open My Portfolio and make the moves taught in this week’s lesson.', 'Close it, then tap Start the Week')
    if (st.mg.phase === 'simulating') return guide('WATCH THE MARKET MOVE', 'The results of your choices are playing out.', 'The next card will appear automatically')
    if (st.mgPhase === 'summary') return guide('REVIEW YOUR MONEY GARDEN', 'Read the final results and what your choices accomplished.', 'Tap the large button to continue')
    return guide(`MONEY GARDEN WEEK ${st.mg.week}`, 'Read Mr. Sprout’s lesson and complete the choice on screen.', 'The next week begins automatically')
  }

  return guide('FOLLOW YOUR NEXT STEP', 'Use the arrow and the instruction shown on screen.', `${act} near the highlighted person or place`)
}
