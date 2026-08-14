import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path) => readFileSync(resolve(process.cwd(), 'src', path), 'utf8')
const moduleSelect = read('pages/ModuleSelect.jsx')
const completionWatcher = read('components/PathCompletionWatcher.jsx')
const gardenGuide = read('world/MoneyGardenFlowGuide.jsx')

describe('playtest persistence wiring', () => {
  it('does not leave guest players on an endless module-loading screen', () => {
    expect(moduleSelect).toContain('setContext(value || DEFAULT_CONTEXT)')
    expect(moduleSelect).toContain('setContext(DEFAULT_CONTEXT)')
  })

  it('keeps classroom-locked modules truly non-interactive', () => {
    expect(moduleSelect).toContain('disabled={!accessible}')
    expect(moduleSelect).toContain('if (!canPlay(moduleNumber)) return')
  })

  it('lets individual users choose any module while preserving grade recommendations', () => {
    expect(moduleSelect).toContain('if (context?.plain) return true')
    expect(moduleSelect).toContain('Recommended path')
    expect(moduleSelect).toContain('★ Play next')
    expect(moduleSelect).toContain('Explore Module ${module.n}')
  })

  it('stores, clears, and completes the selected learning path', () => {
    expect(moduleSelect).toContain('saveActiveLearningPath')
    expect(moduleSelect).toContain('clearActiveLearningPath')
    expect(moduleSelect).toContain('Recommended path complete — view your certificate')
  })

  it('awards credit at real module endpoints instead of the next module', () => {
    expect(completionWatcher).toContain('milestoneBadges')
    expect(completionWatcher).toContain('btStage')
    expect(completionWatcher).toContain('bkWeek')
  })

  it('stores Money Garden Part 2 progress in the saved game, not a global browser key', () => {
    expect(gardenGuide).toContain('mg?.partTwoStarted')
    expect(gardenGuide).toContain('partTwoStarted: true')
    expect(gardenGuide).toContain("navigate('/modules')")
    expect(gardenGuide).not.toContain('PART_TWO_KEY')
    expect(gardenGuide).not.toContain('localStorage.setItem')
  })
})
