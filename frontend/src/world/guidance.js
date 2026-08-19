import { STORE_ITEMS } from './config.js'

const actionControl = (touch) => (touch ? 'Tap the blue ACT button' : 'Press E')

const marketReady = (bought = []) => {
  const basket = bought.map((id) => STORE_ITEMS.find((item) => item.id === id)).filter(Boolean)
  return basket.some((item) => item.tags?.includes('food'))
    && basket.some((item) => item.tags?.includes('drink'))
}
const guide = (title, instruction, action) => ({ title, instruction, action })

// One source of truth for the persistent NEXT STEP card. Every state answers:
// what to do, where to do it, and which control completes the step.
export function getGuidance(st, touch = false) {
  const act = actionControl(touch)

  if (st.helpOpen) return guide('HELP IS OPEN', 'Choose Controls, Modules, or Learning Resources.', 'Tap Got it when you are ready to return')
  if (st.dialog) return guide('FINISH THE CONVERSATION', 'Read what the character says.', 'Tap Next to continue')
  if (st.lessons?.length) return guide('READ THIS CARD', 'This short lesson explains your next decision.', 'Tap the large button at the bottom')
  if (st.cards?.length) return guide('MAKE THE CHOICE ON SCREEN', 'Read the current card, then choose one of its large buttons.', 'Your next step starts automatically')
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
