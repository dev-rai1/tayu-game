// Central replay guidance for world interactions.
// Player.jsx can call this when the player presses E on an object or host they
// have already visited. Keeping the copy here avoids one-off reminders that
// drift away from the actual module flow.

const JAR_NAMES = {
  spend: 'SPEND',
  save: 'SAVE',
  give: 'GIVE',
}

const JAR_REMINDERS = {
  spend: 'SPEND is for needs and reasonable wants today. Check the story before deciding how much belongs here.',
  save: 'SAVE is money kept for later goals and surprises. Check whether this story needs extra saving.',
  give: 'GIVE helps other people, animals, or the community. Keep it balanced with spending and saving.',
}

export function replayGuidance(state, interactionId) {
  if (!state || !interactionId) return null

  if (interactionId === 'mailbox') {
    return state.mailboxOpened
      ? 'Your $30 allowance was already collected. Next, split all $30 across SPEND, SAVE, and GIVE. Press E on any jar to review what it does.'
      : 'Press E to collect your $30 allowance. Then follow the arrow to the three jars.'
  }

  if (interactionId.startsWith('jar:')) {
    const jar = interactionId.split(':')[1]
    const label = JAR_NAMES[jar]
    if (!label) return null
    const amount = state.allocations?.[jar] ?? 0
    const left = state.wallet ?? 0
    return `${label} currently has $${amount}. ${JAR_REMINDERS[jar]} You still have $${left} left to split.`
  }

  if (interactionId === 'shopkeeper') {
    return state.bramTalked
      ? 'Needs first. Choose one healthy food and one healthy drink. A want is okay only after those needs are covered, then go to the glowing checkout.'
      : 'Talk to Mr. Bram before shopping. He will explain needs versus wants and unlock the market items.'
  }

  if (interactionId === 'checkout') {
    if (!state.bought?.length) return 'Your basket is empty. Choose one healthy food and one healthy drink before checking out.'
    return 'Before checking out, confirm your basket has one healthy food and one healthy drink. The result will explain your choices and reset the basket if you need another try.'
  }

  if (interactionId === 'stand' || interactionId === 'stand2') {
    if (state.lemPhase === 'toMarket') return 'First buy a supply bundle from Mr. Bram. Then return to the stand to set the price.'
    return 'At the stand, calculate cost per cup, add a small profit, choose hours and a sign, then test the week. Keep the last feedback visible and change one choice at a time.'
  }

  if (interactionId === 'supplies') {
    return 'Choose a supply bundle you can afford. Bigger bundles make more cups but cost more, so use the previous week’s feedback before changing sizes.'
  }

  if (interactionId === 'sprout' || interactionId === 'host:sprout') {
    const week = state.mg?.week ?? 1
    return `Money Garden week ${week}: read Mr. Sprout’s clue, adjust the portfolio to match it, then press Start the Week. Press E on Mr. Sprout again whenever you need the clue repeated.`
  }

  if (interactionId === 'host:penny') {
    return state.week === 2
      ? 'Penny’s Lemonade reminder: calculate your first price from costs, then use the previous result to change one choice at a time.'
      : 'Penny’s jar reminder: split the full $30 among SPEND, SAVE, and GIVE based on the story. Do not leave a jar empty unless the story clearly calls for it.'
  }

  if (interactionId === 'host:keeper') {
    return 'Budget Town reminder: cover needs first, choose wants carefully, then split leftover money among Pocket, Bank, and Money Garden. Your choices have different outcomes.'
  }

  if (interactionId === 'host:bea') {
    return 'Bank reminder: read the lesson before choosing. Checking is easy to access, savings grows slowly, CDs stay locked longer, debit uses your money, and credit borrows the bank’s money.'
  }

  return null
}
