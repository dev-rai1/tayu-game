import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = (name) => readFileSync(resolve(process.cwd(), 'src/world', name), 'utf8')
const pageSource = readFileSync(resolve(process.cwd(), 'src/pages/World.jsx'), 'utf8')
const tutorialSource = source('FirstTimeMovementTutorial.jsx')
const pointerSource = source('ObjectiveEdgePointer.jsx')
const chipSource = source('ObjectiveChip.jsx')
const worldSource = source('GameWorld.jsx')

describe('kid navigation support', () => {
  it('uses a first-session learn-by-doing controls practice', () => {
    expect(tutorialSource).toContain('tayu-interactive-controls-v1')
    expect(tutorialSource).toContain('MOVEMENT_DISTANCE')
    expect(tutorialSource).toContain("window.addEventListener('tayu-interact'")
    expect(tutorialSource).toContain("if (step === 1 && !near) return null")
    expect(pageSource).toContain('<FirstTimeMovementTutorial enabled={use3D} />')
  })

  it('shows guidance only when an interaction is relevant', () => {
    expect(chipSource).toContain('if (!state.near) return true')
    expect(chipSource).toContain('Next action')
    expect(chipSource).toContain('say(spoken)')
    expect(pageSource).toContain('<ObjectiveChip />')
  })

  it('pins off-screen objectives to the display edge', () => {
    expect(pointerSource).toContain('behindCamera')
    expect(pointerSource).toContain('maxX')
    expect(pointerSource).toContain('awayFor.current >= 6')
    expect(worldSource).toContain('<ObjectiveEdgePointer />')
  })
})
