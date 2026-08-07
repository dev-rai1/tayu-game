const activeList = (value) => Array.isArray(value) && value.length > 0

export function isBlockingGameOverlay(state = {}) {
  return Boolean(
    state.helpOpen || state.dialog || activeList(state.cards) || activeList(state.lessons) ||
    state.panelJar || state.panelItem || state.btPanel || state.bkPanel ||
    state.panelPortfolio || state.weekComplete
  )
}

export function isCommerceOverlayActive() {
  // Commerce controls now stay in the gameplay area while guidance stays in the
  // right rail. Focus walkthroughs render above the shared coach when active,
  // so commerce never needs to permanently suppress the shared instructions.
  return false
}

export function isSpecializedCoachActive(state = {}) {
  // MoneyGardenFlowGuide owns the decision prompt and Part 1/Part 2 intermission.
  // The generic coach must stay hidden or the two guidance systems can collide.
  return Boolean(state.week === 5 && state.mg?.phase === 'adjust')
}

export function coachVisibility(state = {}) {
  const blocking = isBlockingGameOverlay(state)
  const commerce = isCommerceOverlayActive(state)
  const specialized = isSpecializedCoachActive(state)
  const clear = !blocking && !commerce && !specialized

  return {
    blocking,
    commerce,
    specialized,
    showGuidance: clear && !state.gameComplete,
    showSavedMessage: clear,
  }
}
