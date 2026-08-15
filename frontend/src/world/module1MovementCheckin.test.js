import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const controls = fs.readFileSync(path.join(here, 'useKeyboardControls.js'), 'utf8')

describe('module spawn movement check-ins', () => {
  it('lets movement dismiss guidance dialogs across modules instead of freezing the player', () => {
    expect(controls).toContain('releaseGuidanceForMovement()')
    expect(controls).toContain('const dialog = state.dialog')
    expect(controls).toContain('if (!dialog) return')
    expect(controls).toContain('dialog: null')
    expect(controls).toContain('scenarioLocked: false')
    expect(controls).toContain('playerSpeedMult: 1')
    expect(controls).toContain('dialog.onClose?.()')
    expect(controls).not.toContain("state.dialog?.name !== 'Penny'")
  })

  it('preserves the Module 1 intro progression while generalizing the movement behavior', () => {
    expect(controls).toContain("state.week === 1 && state.scenarioState === 'INTRO' ? 'ALLOCATING' : state.scenarioState")
  })

  it('triggers the release before setting a movement key active', () => {
    expect(controls).toContain("if (k === 'forward' || k === 'backward' || k === 'left' || k === 'right')")
    expect(controls.indexOf('releaseGuidanceForMovement()')).toBeLessThan(controls.indexOf('keys.current[k] = true'))
  })
})
