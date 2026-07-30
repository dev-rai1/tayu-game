import { beforeEach, describe, expect, it } from 'vitest'
import {
  CAPTION_BASE_MS,
  OLDER_PER_WORD_MS,
  READING_BANDS,
  READING_BAND_KEY,
  YOUNGER_PER_WORD_MS,
  captionDwellMs,
  getReadingBand,
  readingBandForGrade,
  setDefaultReadingBandForGrade,
  setReadingBand,
  wordCount,
} from './readingPreferences.js'

describe('reading preferences', () => {
  beforeEach(() => localStorage.clear())

  it('maps younger and older grade bands', () => {
    expect(readingBandForGrade('K-2')).toBe(READING_BANDS.YOUNGER)
    expect(readingBandForGrade('upper-elementary')).toBe(READING_BANDS.YOUNGER)
    expect(readingBandForGrade('6-8')).toBe(READING_BANDS.OLDER)
    expect(readingBandForGrade('high-school')).toBe(READING_BANDS.OLDER)
  })

  it('uses the grade default only before a player chooses a preference', () => {
    expect(setDefaultReadingBandForGrade('K-2')).toBe(READING_BANDS.YOUNGER)
    expect(localStorage.getItem(READING_BAND_KEY)).toBe(READING_BANDS.YOUNGER)
    setReadingBand(READING_BANDS.OLDER)
    expect(setDefaultReadingBandForGrade('3-5')).toBe(READING_BANDS.OLDER)
  })

  it('infers a default from the active learning path', () => {
    localStorage.setItem('tayu-active-learning-path-v1', JSON.stringify({ id: 'early-elementary', modules: [1, 2] }))
    expect(getReadingBand()).toBe(READING_BANDS.YOUNGER)
  })

  it('counts words and scales dwell time by reading band', () => {
    const line = 'one two three four five six seven eight nine ten'
    expect(wordCount(line)).toBe(10)
    expect(captionDwellMs(line, 0, READING_BANDS.YOUNGER)).toBe(10 * YOUNGER_PER_WORD_MS)
    expect(captionDwellMs(line, 0, READING_BANDS.OLDER)).toBe(CAPTION_BASE_MS)
    expect(captionDwellMs('one two', 5000, READING_BANDS.OLDER)).toBe(5000)
    expect(OLDER_PER_WORD_MS).toBe(260)
  })
})
