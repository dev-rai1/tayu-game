// Store lunchbox mission evaluation. Incorrect baskets remain safe to try: the
// player sees the consequence, gets one clue, and makes a new decision.
export function evaluateBasket(basket, wallet) {
  void wallet
  const hasFood = basket.some((item) => item.tags?.includes('food'))
  const hasDrink = basket.some((item) => item.tags?.includes('drink'))
  const allJunk = basket.length > 0 && basket.every((item) => item.tags?.includes('junk'))

  if (basket.length === 0) return { scene: 'EMPTY_HANDED', ok: false }
  if (hasFood && hasDrink) return { scene: 'GOOD_DAY', ok: true }
  if (allJunk) return { scene: 'JUNK_DAY', ok: false }
  if (!hasDrink) return { scene: 'DEHYDRATED', ok: false }
  if (!hasFood) return { scene: 'HUNGRY', ok: false }
  return { scene: 'HUNGRY', ok: false }
}

export const DAY_LESSON = {
  DEHYDRATED: 'You had food but no healthy drink, so you became thirsty. Add a drink on the retry.',
  HUNGRY: 'You had a drink but no healthy food, so you became hungry. Add a food on the retry.',
  JUNK_DAY: 'Treats did not cover what your body needed. Choose needs before wants.',
  EMPTY_HANDED: 'Saving everything left your food and water needs uncovered. Pay for needs first.',
  GOOD_DAY: 'Food and a healthy drink covered your needs. The money left can stay saved.',
}

export function cartFeedback(basket) {
  const names = basket.map((item) => item.name)
  const foods = basket.filter((item) => item.tags?.includes('food'))
  const drinks = basket.filter((item) => item.tags?.includes('drink'))
  const treats = basket.filter((item) => item.tags?.includes('junk') || item.tags?.includes('toy'))

  if (basket.length === 0) return 'Your money was refunded. Start with one healthy food and one healthy drink.'
  if (basket.length === 1) {
    const missing = foods.length ? 'healthy drink' : drinks.length ? 'healthy food' : 'healthy food and drink'
    return `${names[0]} was returned. Your basket still needs a ${missing}.`
  }
  if (foods.length && !drinks.length) return 'Your basket was returned. Keep the food and add a healthy drink to your next plan.'
  if (drinks.length && !foods.length) return 'Your basket was returned. Keep the drink and add a healthy food to your next plan.'
  if (treats.length === basket.length) return 'Those choices were wants. Cover food and water needs before adding a treat.'
  return 'Your basket was returned. Build the two basics first: one healthy food and one healthy drink.'
}
