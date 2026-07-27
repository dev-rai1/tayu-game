// Store "lunchbox" mission evaluation (Section 3.2). The basket is the list of
// bought item objects; wallet is what's left. Bad baskets are NOT blocked - the
// day plays out and teaches (Rule 4).
// Returns { scene, ok }. scene ∈ GOOD_DAY | JUNK_DAY | DEHYDRATED | HUNGRY | EMPTY_HANDED
export function evaluateBasket(basket, wallet) {
  const hasFood = basket.some((i) => i.tags?.includes('food'))
  const hasDrink = basket.some((i) => i.tags?.includes('drink')) // water/juice - soda is 'junk', not 'drink'
  const allJunk = basket.length > 0 && basket.every((i) => i.tags?.includes('junk'))

  if (basket.length === 0) return { scene: 'EMPTY_HANDED', ok: false }
  if (hasFood && hasDrink) return { scene: 'GOOD_DAY', ok: true }
  if (allJunk) return { scene: 'JUNK_DAY', ok: false }
  if (!hasDrink) return { scene: 'DEHYDRATED', ok: false }
  if (!hasFood) return { scene: 'HUNGRY', ok: false }
  return { scene: 'HUNGRY', ok: false }
}

export const DAY_LESSON = {
  DEHYDRATED: 'Your basket is resetting. You chose food but no healthy drink, so you would get thirsty. Next, choose exactly two basics first: one healthy food and one healthy drink.',
  HUNGRY: 'Your basket is resetting. You chose a drink but no healthy food, so you would still be hungry. Next, choose exactly two basics first: one healthy food and one healthy drink.',
  JUNK_DAY: 'Your basket is resetting. Treats are wants, not the two basics your body needs. Next, choose one healthy food and one healthy drink before adding any want.',
  EMPTY_HANDED: 'Your basket is resetting. Saving is useful, but food and water are needs you must pay for. Next, choose one healthy food and one healthy drink.',
  GOOD_DAY: 'You chose one healthy food and one healthy drink. Your needs are covered, and any money left can stay saved.',
}

// G2/G3 (Round 3): feedback COMPOSED from the actual cart - never references
// an item that is not in it. One branch per cart shape, QA each by building it.
export function cartFeedback(basket) {
  const names = basket.map((i) => i.name)
  const foods = basket.filter((i) => i.tags?.includes('food'))
  const drinks = basket.filter((i) => i.tags?.includes('drink'))
  const treats = basket.filter((i) => i.tags?.includes('junk') || i.tags?.includes('toy'))
  if (basket.length === 0) {
    return 'RESET COMPLETE: Your items were returned and your SPEND money was refunded. Start again by buying exactly two basics: one healthy food and one healthy drink. Then go to checkout.'
  }
  if (basket.length === 1) {
    const missing = foods.length > 0 ? 'healthy drink' : drinks.length > 0 ? 'healthy food' : 'healthy food and healthy drink'
    return `RESET COMPLETE: Your ${names[0]} was returned and your SPEND money was refunded. One item is not enough. Keep that lesson in mind and buy one ${missing}, so your basket has one healthy food and one healthy drink.`
  }
  if (foods.length > 0 && drinks.length === 0) {
    return `RESET COMPLETE: Your basket was returned and your SPEND money was refunded. You had ${foods[0].name}, but no healthy drink. Buy one healthy food and one healthy drink, then go to checkout.`
  }
  if (drinks.length > 0 && foods.length === 0) {
    return `RESET COMPLETE: Your basket was returned and your SPEND money was refunded. You had ${drinks[0].name}, but no healthy food. Buy one healthy food and one healthy drink, then go to checkout.`
  }
  if (treats.length === basket.length) {
    return `RESET COMPLETE: ${names.join(' and ')} were wants, so they were returned and your SPEND money was refunded. Needs come first. Buy one healthy food and one healthy drink before choosing a treat.`
  }
  return 'RESET COMPLETE: Your basket was returned and your SPEND money was refunded. For the retry, buy exactly one healthy food and one healthy drink first. When both are in your basket, go to the glowing checkout.'
}
