import { create } from 'zustand'

const STORAGE_KEY = 'tayu-pinned-improvement-feedback-v1'

function readSavedFeedback() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveFeedback(feedbackByModule) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbackByModule))
  } catch {
    // Storage is optional. The coach still works for the current session.
  }
}

export const useFeedbackCoach = create((set) => ({
  feedbackByModule: readSavedFeedback(),

  setFeedback: (moduleKey, feedback) => {
    set((state) => {
      const next = {
        ...state.feedbackByModule,
        [moduleKey]: {
          ...feedback,
          moduleKey,
          updatedAt: Date.now(),
        },
      }
      saveFeedback(next)
      return { feedbackByModule: next }
    })
  },

  clearFeedback: (moduleKey) => {
    set((state) => {
      if (!state.feedbackByModule[moduleKey]) return state
      const next = { ...state.feedbackByModule }
      delete next[moduleKey]
      saveFeedback(next)
      return { feedbackByModule: next }
    })
  },

  clearAllFeedback: () => {
    saveFeedback({})
    set({ feedbackByModule: {} })
  },
}))

// Broad module ownership is used to silence short-lived NPC/toast feedback while
// a retry clue is active. It intentionally includes consequence animations so
// those animations can keep playing without adding another text popup.
export function feedbackModuleForState(state = {}) {
  if (state.week === 1 && state.objective === 'kitchen') return 'jars'
  if (state.week === 1 && state.objective === 'store') return 'market'
  if (state.week === 2 && state.objective === 'lemonade') return 'lemonade'
  if (state.week === 3 && state.bt) return 'budget'
  if (state.week === 4 && state.bk) return 'bank'
  if (state.week === 5 && state.mg) return 'garden'
  return null
}

// The coach itself appears only when the player is back at a useful retry or
// decision state. That keeps the screen to one coaching popup at a time while
// consequence animation can finish quietly in the background.
export function activeFeedbackKey(state = {}) {
  if (state.week === 1 && state.objective === 'kitchen' && state.scenarioState === 'ALLOCATING') return 'jars'
  if (state.week === 1 && state.objective === 'store' && state.bramTalked && !state.storeMissionDone && !state.scenarioLocked) return 'market'
  if (
    state.week === 2
    && state.objective === 'lemonade'
    && ['toMarket', 'supplies', 'toStand2', 'template', 'pool'].includes(state.lemPhase)
  ) return 'lemonade'
  if (state.week === 3 && state.bt && (state.bt.stage === 'split' || state.btPanel === 'split')) return 'budget'
  if (state.week === 4 && state.bk && !state.scenarioLocked) return 'bank'
  if (state.week === 5 && state.mg && ['scenario', 'adjust', 'slider'].includes(state.mg.phase)) return 'garden'
  return null
}

export function feedbackKeyForWeek(week) {
  if (week === 1) return null
  if (week === 2) return 'lemonade'
  if (week === 3) return 'budget'
  if (week === 4) return 'bank'
  if (week === 5) return 'garden'
  return null
}
