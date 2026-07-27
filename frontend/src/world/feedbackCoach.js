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

export function feedbackKeyForWeek(week) {
  if (week === 1) return null
  if (week === 2) return 'lemonade'
  if (week === 3) return 'budget'
  if (week === 4) return 'bank'
  if (week === 5) return 'garden'
  return null
}
