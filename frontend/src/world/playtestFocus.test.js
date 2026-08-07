import { describe, expect, it } from 'vitest'
import { READING_BANDS } from '../services/readingPreferences.js'
import {
  canShowFocusGuide,
  focusStepsFor,
  shouldSuppressTransientGuide,
} from './playtestFocus.js'

describe('playtest focus guidance', () => {
  it('breaks Lemonade setup into one short step at a time', () => {
    expect(focusStepsFor('supplies')).toHaveLength(1)
    expect(focusStepsFor('template', READING_BANDS.YOUNGER)).toHaveLength(4)
    expect(focusStepsFor('template', READING_BANDS.OLDER)).toHaveLength(4)
  })

  it('does not tell players to read Town News before it unlocks', () => {
    const steps = focusStepsFor('supplies', READING_BANDS.OLDER, 0)
    expect(steps).toHaveLength(1)
    expect(steps[0].title).toContain('choose one batch')
    expect(steps[0].text).not.toContain('TOWN NEWS')
  })

  it('clearly points to Town News once the feature is available', () => {
    const steps = focusStepsFor('supplies', READING_BANDS.OLDER, 3)
    expect(steps).toHaveLength(2)
    expect(steps[0].title).toContain('TOWN NEWS')
    expect(steps[0].text).toContain('same Lemonade Stand screen')
    expect(steps[1].text).toContain('TOWN NEWS clue')
  })

  it('plainly defines the hourly work cost for younger players', () => {
    const payStep = focusStepsFor('template', READING_BANDS.YOUNGER)[1]
    expect(payStep.text).toContain('50 cents for every hour')
    expect(payStep.text).toContain('not a fee')
  })

  it('includes the missing business-sign setup step', () => {
    const younger = focusStepsFor('template', READING_BANDS.YOUNGER)
    const older = focusStepsFor('template', READING_BANDS.OLDER)
    expect(younger.some((step) => step.title.includes('business sign'))).toBe(true)
    expect(older.some((step) => step.title.includes('business sign'))).toBe(true)
  })

  it('suppresses temporary coach bubbles only during focused Lemonade moments', () => {
    expect(shouldSuppressTransientGuide({ week: 2, lemPhase: 'template' })).toBe(true)
    expect(shouldSuppressTransientGuide({ week: 2, lemPhase: 'selling' })).toBe(true)
    expect(shouldSuppressTransientGuide({ week: 2, lemPhase: 'toMarket' })).toBe(false)
    expect(shouldSuppressTransientGuide({ week: 4, dialog: { lines: ['Bank lesson'] } })).toBe(false)
  })

  it('waits until other instruction and animation captions are gone', () => {
    const base = { week: 2, lemPhase: 'template', cards: [], lessons: [] }
    expect(canShowFocusGuide(base)).toBe(true)
    expect(canShowFocusGuide({ ...base, actorCaption: { line: 'Watch this.' } })).toBe(false)
    expect(canShowFocusGuide({ ...base, lessons: [{ text: 'Another instruction' }] })).toBe(false)
    expect(canShowFocusGuide({ ...base, dialog: { lines: ['Hello'] } })).toBe(false)
  })
})
