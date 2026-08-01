import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = (name) => readFileSync(resolve(process.cwd(), 'src/world', name), 'utf8')
const pageSource = readFileSync(resolve(process.cwd(), 'src/pages/World.jsx'), 'utf8')
const tutorialSource = source('FirstTimeMovementTutorial.jsx')
const pointerSource = source('ObjectiveEdgePointer.jsx')
const coachSource = source('PersistentCoach.jsx')
const worldSource = source('GameWorld.jsx')

describe('kid navigation support', () => {
  it('uses a first-session learn-by-doing controls practice', () => {
    expect(tutorialSource).toContain('tayu-interactive-controls-v1')
    expect(tutorialSource).toContain('MOVEMENT_DISTANCE')
    expect(tutorialSource).toContain("window.addEventListener('tayu-interact'")
    expect(tutorialSource).toContain("if (step === 1 && !near) return null")
    expect(tutorialSource).toContain('EXPERIENCED_PLAYER_DELAY_MS')
    expect(tutorialSource).toContain('I know these controls')
    expect(tutorialSource).not.toContain('>\n          Skip\n')
    expect(pageSource).toContain('<FirstTimeMovementTutorial enabled={use3D} />')
  })

  it('uses one compact, dismissible guidance surface', () => {
    expect(coachSource).toContain('coachVisibility')
    expect(coachSource).toContain('showGuidance')
    expect(coachSource).toContain('Show hint')
    expect(coachSource).toContain('Read aloud')
    expect(coachSource).toContain('Dismiss')
    expect(pageSource).toContain('<PersistentCoach />')
    expect(pageSource).not.toContain('<ObjectiveChip />')
  })

  it('pins off-screen objectives to the display edge', () => {
    expect(pointerSource).toContain('behindCamera')
    expect(pointerSource).toContain('maxX')
    expect(pointerSource).toContain('awayFor.current >= 6')
    expect(worldSource).toContain('<ObjectiveEdgePointer />')
  })
})
