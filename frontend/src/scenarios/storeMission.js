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
  DEHYDRATED: 'Water first! Your body needs a drink way before it wants candy.',
  HUNGRY: 'Snacks are fun, but a real meal is what keeps you going!',
  JUNK_DAY: 'All treats = big zoom, big crash, empty pockets. Balance it!',
  EMPTY_HANDED: 'Saving everything works for money, but you still gotta eat today!',
  GOOD_DAY: 'Food, water, THEN fun. You nailed the order! 🌟',
}


// G2/G3 (Round 3): feedback COMPOSED from the actual cart - never references
// an item that is not in it. One branch per cart shape, QA each by building it.
export function cartFeedback(basket) {
  const names = basket.map((i) => i.name)
  const foods = basket.filter((i) => i.tags?.includes('food'))
  const drinks = basket.filter((i) => i.tags?.includes('drink'))
  const treats = basket.filter((i) => i.tags?.includes('junk') || i.tags?.includes('toy'))
  if (basket.length === 0) return 'Your basket is empty! Your body needs food and something to drink.'
  // G3: the do-not-be-scared-to-spend beat
  if (basket.length === 1) {
    return `You saved a lot, nice! But do not be scared to spend on what keeps you going. Is a ${names[0]} enough for your whole day?`
  }
  if (foods.length > 0 && drinks.length === 0) {
    return `That ${foods[0].name} looks tasty, but nothing to drink? Your body needs water too.`
  }
  if (drinks.length > 0 && foods.length === 0) {
    return `A ${drinks[0].name} is refreshing, but what will you EAT? Think about what your body needs.`
  }
  if (treats.length === basket.length) {
    return `${names.join(' and ')}: all fun wants! What does your body NEED to go with them?`
  }
  return 'Hmm, will that basket take care of what your body needs? Needs first, then a want if you can afford it.'
}