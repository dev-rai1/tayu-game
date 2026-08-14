import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { currentUser } from '../services/auth.js'
import { loadProfile, saveProfile } from '../services/walletStore.js'
import { recordLearningEvent } from '../services/usageAnalytics.js'
import { useGame } from '../world/store.js'
import { activatePaycheckWorld } from '../world/paycheckMode.js'
import { isLearningPathComplete, loadActiveLearningPath, milestoneBadges } from '../constants/learningPaths.js'

const MODULE_BY_BADGE = {
  jars: 'jars',
  lemonade: 'lemonade',
  budget: 'budget',
  bank: 'bank',
  bond: 'bond',
  tax: 'tax',
  garden: 'garden',
}

const TAX_ORIGIN_KEY = 'tayu-tax-entry-origin'
const BOND_ONLY_KEY = 'tayu-bond-only-entry'
const MODULE_6_HANDOFF_TEXT = 'You finished Money Garden. Next is Module 6: Bond Street. Leave the garden and continue to the Bond Street building.'

function fixModule5BridgeCard(cards) {
  let changed = false
  const nextCards = (cards || []).map((card) => {
    if (card?.id !== 'bridge') return card
    const finaleText = /finale/i.test(String(card.text || ''))
    const finaleButton = (card.buttons || []).some((button) => /finale/i.test(String(button?.label || '')))
    if (!finaleText && !finaleButton) return card
    changed = true
    return {
      ...card,
      text: MODULE_6_HANDOFF_TEXT,
      buttons: (card.buttons || []).map((button) => ({
        ...button,
        label: /finale/i.test(String(button?.label || '')) ? 'Start Module 6: Bond Street →' : button.label,
      })),
    }
  })
  return changed ? nextCards : cards
}

function handOffGardenToModule6(badges) {
  const badgeSet = new Set(badges || [])
  return badgeSet.has('garden') && !badgeSet.has('bond')
}

function startModule6FromGarden() {
  const game = useGame.getState()
  const profile = loadProfile() || {}
  const badges = [...new Set([...(profile.badges || []), 'garden'])]

  try {
    sessionStorage.setItem(TAX_ORIGIN_KEY, 'garden-handoff')
    sessionStorage.removeItem(BOND_ONLY_KEY)
  } catch { /* storage can be unavailable */ }

  if (typeof game.awardBadge === 'function') game.awardBadge('garden', 'MONEY GARDENER')
  const total = typeof game.mgTotal === 'function' ? game.mgTotal() : Number(game.allocations?.save || 0)
  if (typeof game.adminClearUi === 'function') game.adminClearUi()

  useGame.setState((state) => ({
    allocations: {
      ...state.allocations,
      save: Number.isFinite(total) ? total : Number(state.allocations?.save || 0),
      spend: 0,
    },
    cards: [],
    lessons: [],
    gameComplete: false,
    enterParty: false,
    objective: 'tax',
    weekComplete: false,
    pendingWeekComplete: false,
    banner: null,
    guide: null,
    actorCaption: null,
    toast: 'Module 5 complete! Next: Module 6 · Bond Street.',
  }))

  const nextGame = useGame.getState()
  if (typeof nextGame.persist === 'function') nextGame.persist()
  saveProfile({ guru: false, badges })
  activatePaycheckWorld()
}

export default function PathCompletionWatcher() {
  const syncing = useRef(false)

  const week = useGame((state) => state.week)
  const weekComplete = useGame((state) => state.weekComplete)
  const btStage = useGame((state) => state.bt?.stage || '')
  const bkWeek = useGame((state) => state.bk?.week || 0)
  const mgPhase = useGame((state) => state.mgPhase)
  const gameComplete = useGame((state) => state.gameComplete)
  const enterParty = useGame((state) => state.enterParty)
  const cards = useGame((state) => state.cards)

  // The store still contains a legacy mg.bridge -> unlockParty path. Replace
  // that action while this app-level watcher is mounted so pressing the final
  // Money Garden button routes synchronously to Module 6 before the old portal
  // can be opened for even one frame.
  useEffect(() => {
    const originalMgAct = useGame.getState().mgAct
    if (typeof originalMgAct !== 'function') return undefined

    const directMgAct = (act) => {
      if (act === 'mg.bridge' && useGame.getState().week === 5) {
        startModule6FromGarden()
        return
      }
      return originalMgAct(act)
    }

    useGame.setState({ mgAct: directMgAct })
    return () => {
      if (useGame.getState().mgAct === directMgAct) useGame.setState({ mgAct: originalMgAct })
    }
  }, [])

  // Normalize the legacy Money Garden bridge before the browser paints it, so
  // a learner never sees the obsolete "Finale" wording even for one frame.
  useLayoutEffect(() => {
    if (week !== 5 || !cards?.some((card) => card?.id === 'bridge')) return
    const nextCards = fixModule5BridgeCard(cards)
    if (nextCards !== cards) useGame.setState({ cards: nextCards })
  }, [cards, week])

  const syncAndCheck = useCallback(() => {
    if (syncing.current) return
    const user = currentUser()
    if (!user || user.role === 'teacher' || user.role === 'admin') return

    syncing.current = true
    try {
      const profile = loadProfile() || {}
      const existingBadges = profile.badges || []
      const inferred = milestoneBadges({ week, weekComplete, btStage, bkWeek, mgPhase, gameComplete })
      const newlyCompleted = inferred.filter((badge) => !existingBadges.includes(badge))
      const badges = [...new Set([...existingBadges, ...inferred])]

      if (badges.length !== existingBadges.length) {
        saveProfile({ badges })
        newlyCompleted.forEach((badge) => {
          const moduleName = MODULE_BY_BADGE[badge]
          if (moduleName) recordLearningEvent({ moduleName, type: 'module_complete', outcome: 'completed', detail: badge }).catch(() => {})
        })
      }

      // Fallback for old saved sessions that already reached the stale party
      // state before this direct bridge interception was installed.
      const gardenFinished = handOffGardenToModule6(badges) || (week === 5 && mgPhase === 'done' && !badges.includes('bond'))
      if (week === 5 && (enterParty || gameComplete) && gardenFinished) {
        startModule6FromGarden()
        return
      }

      const path = loadActiveLearningPath()
      const pathComplete = Boolean(path && isLearningPathComplete(path.modules, badges))

      // A stale saved enterParty/gameComplete flag must never hijack a replay or
      // a newly selected module and throw the learner into the Money Guru
      // certificate. Runtime completion is valid only when the active learning
      // path is actually complete right now.
      if ((enterParty || gameComplete) && !pathComplete) {
        useGame.setState({ enterParty: false, gameComplete: false })
      }

      // Module completion stays inside the game. Do not interrupt gameplay by
      // navigating to the old per-module quiz/check pages.
      if (!path || !pathComplete) return

      if (profile.pathCompletion?.pathId !== path.id) {
        saveProfile({
          pathCompletion: {
            pathId: path.id,
            label: path.label,
            title: path.title,
            modules: path.modules,
            completedAt: new Date().toISOString(),
          },
        })
      }
    } finally {
      syncing.current = false
    }
  }, [bkWeek, btStage, enterParty, gameComplete, mgPhase, week, weekComplete])

  useEffect(() => {
    syncAndCheck()
    window.addEventListener('tayu-progress-saved', syncAndCheck)
    return () => window.removeEventListener('tayu-progress-saved', syncAndCheck)
  }, [syncAndCheck])

  return null
}

export { MODULE_6_HANDOFF_TEXT, fixModule5BridgeCard, handOffGardenToModule6, startModule6FromGarden }
