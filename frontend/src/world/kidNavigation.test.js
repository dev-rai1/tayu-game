import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = (name) => readFileSync(resolve(process.cwd(), 'src/world', name), 'utf8')
const pageSource = readFileSync(resolve(process.cwd(), 'src/pages/World.jsx'), 'utf8')
const tutorialSource = source('FirstTimeMovementTutorial.jsx')
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
    expect(tutorialSource).toContain('glowing destination')
    expect(pageSource).toContain('<FirstTimeMovementTutorial enabled={use3D} />')
  })

  it('uses one compact, dismissible guidance surface', () => {
    expect(coachSource).toContain('coachVisibility')
    expect(coachSource).toContain('showGuidance')
    expect(coachSource).toContain('Show hint')
    expect(coachSource).toContain('Read aloud')
    expect(coachSource).toContain('Dismiss')
    expect(coachSource).toContain('pointer-events-none fixed')
    expect(pageSource).toContain('<PersistentCoach />')
    expect(pageSource).not.toContain('<ObjectiveChip />')
  })

  it('does not render the removed off-screen THIS WAY pointer', () => {
    expect(worldSource).not.toContain('ObjectiveEdgePointer')
    expect(worldSource).not.toContain('<ObjectiveEdgePointer />')
  })

  it('guides the normal Bank handoff to Paycheck Planet instead of teleporting', () => {
    const handoffStart = pageSource.indexOf('// The legacy Bank action initializes internal week 5')
    const handoffEnd = pageSource.indexOf('  useEffect(() => {\n    initWorld()', handoffStart)
    const handoffSource = pageSource.slice(handoffStart, handoffEnd)
    expect(handoffSource).toContain("useGame.setState({ objective: 'tax' })")
    expect(handoffSource).toContain("objective: 'tax-active'")
    expect(handoffSource).not.toContain('moveToPaycheckPlanet()')
  })
})