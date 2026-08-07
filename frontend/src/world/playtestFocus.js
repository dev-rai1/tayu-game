import { READING_BANDS } from '../services/readingPreferences.js'

const activeList = (value) => Array.isArray(value) && value.length > 0

export const LEMONADE_FOCUS_KEYS = Object.freeze({
  supplies: 'tayu-lemonade-supplies-focus-v2',
  template: 'tayu-lemonade-template-focus-v2',
})

const SUPPLY_STEPS_BEFORE_NEWS = [
  {
    title: 'First: choose one batch',
    text: 'Start with the batch choices on this screen. A bigger batch makes more cups, but it costs more. Pick one batch to continue.',
  },
]

const SUPPLY_STEPS_WITH_NEWS = [
  {
    title: 'First: read TOWN NEWS',
    text: 'Look for the TOWN NEWS box on this same Lemonade Stand screen. Read its weather or crowd clue before choosing a batch.',
  },
  {
    title: 'Next: choose one batch',
    text: 'A bigger batch makes more cups, but it costs more. Use the TOWN NEWS clue to pick a batch that fits the expected crowd.',
  },
]

const PLAN_STEPS_YOUNGER = [
  {
    title: '1. Choose open hours',
    text: 'Open hours means how long your stand sells lemonade. More hours may bring more customers, but you also count more work time.',
  },
  {
    title: '2. Choose “My pay”',
    text: 'My pay is a business cost for your own work, not a fee paid to someone else. For example, 50 cents per hour means the business counts 50 cents for every hour you work.',
  },
  {
    title: '3. Make your business sign',
    text: 'Choose the sign style customers will see at your lemonade stand. The sign is part of setting up the business.',
  },
  {
    title: '4. Set the cup price',
    text: 'Look at cost per cup. Pick a price above that cost, but keep it low enough that customers still want to buy.',
  },
]

const PLAN_STEPS_OLDER = [
  {
    title: '1. Choose open hours',
    text: 'Open hours controls selling time. More hours can reach more customers, but they also increase the cost of your labor.',
  },
  {
    title: '2. Value your work',
    text: '“My pay” is a business cost for your labor, not an outside fee. A rate of $0.50 per hour adds 50 cents of labor cost for each hour you work. Teachers may describe this as fixed or variable depending on the lesson setup.',
  },
  {
    title: '3. Make your business sign',
    text: 'Choose the sign style shown to customers. This completes the setup step mentioned in the instructions.',
  },
  {
    title: '4. Set the cup price',
    text: 'Use cost per cup as your starting point. Charge enough to cover costs, without pricing so high that demand falls.',
  },
]

export function focusStepsFor(phase, readingBand = READING_BANDS.OLDER, lemonadeFeatures = 0) {
  if (phase === 'supplies') {
    return lemonadeFeatures >= 3 ? SUPPLY_STEPS_WITH_NEWS : SUPPLY_STEPS_BEFORE_NEWS
  }
  if (phase === 'template') {
    return readingBand === READING_BANDS.YOUNGER ? PLAN_STEPS_YOUNGER : PLAN_STEPS_OLDER
  }
  return []
}

export function shouldSuppressTransientGuide(state = {}) {
  if (state.week !== 2) return false
  const hasBlockingInstruction = Boolean(
    state.helpOpen || state.dialog || activeList(state.cards) || activeList(state.lessons)
  )
  const focusedLemonadePhase = ['supplies', 'template', 'selling'].includes(state.lemPhase)
  return hasBlockingInstruction || focusedLemonadePhase
}

export function canShowFocusGuide(state = {}) {
  if (state.week !== 2 || !['supplies', 'template'].includes(state.lemPhase)) return false
  return !Boolean(
    state.helpOpen || state.dialog || activeList(state.cards) || activeList(state.lessons) || state.actorCaption
  )
}
