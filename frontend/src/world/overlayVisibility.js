const activeList = (value) => Array.isArray(value) && value.length > 0

export function isBlockingGameOverlay(state = {}) {
  return Boolean(
    state.helpOpen || state.dialog || activeList(state.cards) || activeList(state.lessons) ||
    state.panelJar || state.panelItem || state.btPanel || state.bkPanel ||
    state.panelPortfolio || state.weekComplete
  )
}

export function isCommerceOverlayActive(state = {}) {
  const marketActive = Boolean(
    state.week === 1 && state.objective === 'store' && state.bramTalked &&
    !state.storeMissionDone && !state.panelItem && !state.dialog &&
    !activeList(state.lessons) && !activeList(state.cards) &&
    !state.scenarioLocked && !state.weekComplete
  )

  const lemonadeActive = Boolean(
    state.week === 2 && state.objective === 'lemonade' &&
    ['toMarket', 'supplies', 'toStand2', 'template'].includes(state.lemPhase) &&
    !state.weekComplete
  )

  return marketActive || lemonadeActive
}

export function coachVisibility(state = {}) {
  const blocking = isBlockingGameOverlay(state)
  const commerce = isCommerceOverlayActive(state)
  const clear = !blocking && !commerce

  return {
    blocking,
    commerce,
    showGuidance: clear && !state.gameComplete,
    showSavedMessage: clear,
  }
}
