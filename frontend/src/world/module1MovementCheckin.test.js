import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const controls = fs.readFileSync(path.join(here, 'useKeyboardControls.js'), 'utf8')

describe('Module 1 movement check-in', () => {
  it('lets movement dismiss the Penny check-in instead of freezing progression', () => {
    expect(controls).toContain('releaseModule1CheckInForMovement()')
    expect(controls).toContain("state.week !== 1")
    expect(controls).toContain("state.dialog?.name !== 'Penny'")
    expect(controls).toContain("scenarioState: state.scenarioState === 'INTRO' ? 'ALLOCATING' : state.scenarioState")
    expect(controls).toContain('scenarioLocked: false')
    expect(controls).toContain('playerSpeedMult: 1')
  })

  it('triggers the release before setting a movement key active', () => {
    expect(controls).toContain("if (k === 'forward' || k === 'backward' || k === 'left' || k === 'right')")
    expect(controls.indexOf('releaseModule1CheckInForMovement()')).toBeLessThan(controls.indexOf('keys.current[k] = true'))
  })
})
