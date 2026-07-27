import { beforeEach, describe, expect, it } from 'vitest'
import { useFeedbackCoach } from './feedbackCoach.js'

const STORAGE_KEY = 'tayu-pinned-improvement-feedback-v1'

describe('persistent improvement feedback store', () => {
  beforeEach(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    useFeedbackCoach.setState({ feedbackByModule: {} })
  })

  it('stores structured feedback for the next decision screen', () => {
    useFeedbackCoach.getState().setFeedback('lemonade', {
      title: 'Fix the price',
      diagnosis: 'The price was too high, so demand fell.',
      action: 'Lower the price to $1.25.',
      goal: 'Keep a positive profit.',
    })

    const feedback = useFeedbackCoach.getState().feedbackByModule.lemonade
    expect(feedback.title).toBe('Fix the price')
    expect(feedback.action).toContain('$1.25')
    expect(feedback.moduleKey).toBe('lemonade')
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)).lemonade.goal).toContain('positive profit')
  })

  it('does not disappear until the game explicitly clears a corrected module', () => {
    useFeedbackCoach.getState().setFeedback('jars', {
      title: 'Fix the split',
      diagnosis: 'SAVE was too small.',
      action: 'Move $4 more to SAVE.',
      goal: 'Use all three jars.',
    })

    expect(useFeedbackCoach.getState().feedbackByModule.jars).toBeTruthy()

    useFeedbackCoach.getState().clearFeedback('jars')

    expect(useFeedbackCoach.getState().feedbackByModule.jars).toBeUndefined()
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY))).toEqual({})
  })
})
