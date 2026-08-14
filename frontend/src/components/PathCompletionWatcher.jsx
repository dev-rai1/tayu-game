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

      // Money Garden still has a legacy mg.bridge action that raises enterParty
      // before the old finale. Catch that exact state immediately (not only the
      // later gameComplete state seen after entering the portal) and replace it
      // with the real Module 5 -> Module 6 handoff. This prevents even a brief
      // visit to the old Finale/certificate portal.
      const gardenFinished = handOffGardenToModule6(badges) || (week === 5 && mgPhase === 'done' && !badges.includes('bond'))
      if (week === 5 && (enterParty || gameComplete) && gardenFinished) {
        try {
          sessionStorage.setItem(TAX_ORIGIN_KEY, 'garden-handoff')
          sessionStorage.removeItem(BOND_ONLY_KEY)
        } catch { /* storage can be unavailable */ }

        const game = useGame.getState()
        if (typeof game.adminClearUi === 'function') game.adminClearUi()
        useGame.setState({
          gameComplete: false,
          enterParty: false,
          objective: 'tax',
          weekComplete: false,
          pendingWeekComplete: false,
          banner: null,
          guide: null,
          actorCaption: null,
          toast: 'Module 5 complete! Next: Module 6 · Bond Street.',
        })
        saveProfile({ guru: false, badges: [...new Set([...badges, 'garden'])] })
        activatePaycheckWorld()
        return
      }

      // Module completion stays inside the game. Do not interrupt gameplay by
      // navigating to the old per-module quiz/check pages.
      const path = loadActiveLearningPath()
      if (!path || !isLearningPathComplete(path.modules, badges)) return

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

export { MODULE_6_HANDOFF_TEXT, fixModule5BridgeCard, handOffGardenToModule6 }
