const activeList = (value) => Array.isArray(value) && value.length > 0

export function isBlockingGameOverlay(state = {}) {
  // Actual choice/story overlays can still own the screen. Module workspaces
  // (jars, shop panels, budget controls, bank controls, portfolio) do not hide
  // the coach anymore: the whole point of the shared lane is to explain those
  // controls without adding another popup on top of them.
  return Boolean(
    state.helpOpen || state.dialog || activeList(state.cards) || state.weekComplete
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
    ['toMarket', 'supplies', 'toStand2', 'template', 'selling'].includes(state.lemPhase) &&
    !state.weekComplete
  )

  return marketActive || lemonadeActive
}

export function isSpecializedCoachActive(state = {}) {
  return Boolean(state.week === 5 && state.mg?.phase === 'adjust')
}

export function coachVisibility(state = {}) {
  const blocking = isBlockingGameOverlay(state)
  const commerce = isCommerceOverlayActive(state)
  const specialized = isSpecializedCoachActive(state)
  const clear = !blocking

  return {
    blocking,
    commerce,
    specialized,
    showGuidance: clear && !state.gameComplete,
    showSavedMessage: clear,
  }
}
