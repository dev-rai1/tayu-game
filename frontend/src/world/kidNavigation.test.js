import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = (name) => readFileSync(resolve(process.cwd(), 'src/world', name), 'utf8')
const pageSource = readFileSync(resolve(process.cwd(), 'src/pages/World.jsx'), 'utf8')
const tutorialSource = source('FirstTimeMovementTutorial.jsx')
const coachSource = source('PersistentCoach.jsx')
const worldSource = source('GameWorld.jsx')
const declutterSource = source('worldDeclutter.css')

describe('kid navigation support', () => {
  it('uses a first-session learn-by-doing controls practice through the shared coach', () => {
    expect(tutorialSource).toContain('tayu-interactive-controls-v1')
    expect(tutorialSource).toContain('MOVEMENT_DISTANCE')
    expect(tutorialSource).toContain("window.addEventListener('tayu-interact'")
    expect(tutorialSource).toContain("title: step === 0 ? 'Move around TAYU' : 'Use the action control'")
    expect(tutorialSource).toContain('guide: {')
    expect(tutorialSource).toContain('glowing destination')
    expect(tutorialSource).toContain('return null')
    expect(pageSource).toContain('<FirstTimeMovementTutorial enabled={!taxMode} />')
  })

  it('puts normal-world important guidance in front and ordinary hints to the side while Tax Lab keeps map navigation', () => {
    expect(coachSource).toContain('coachVisibility')
    expect(coachSource).toContain("data-guidance-lane={important ? 'important-popup' : 'side-hint'}")
    expect(coachSource).toContain('coachMessageFromTransient')
    expect(coachSource).toContain('advanceDialog')
    expect(coachSource).toContain('Read aloud')
    expect(coachSource).toContain("queue.length > 1 ? 'Next' : 'Got it'")
    expect(coachSource).toContain('pointer-events-none fixed')
    expect(coachSource).toContain('data-important-message-scrim="true"')
    expect(pageSource).toContain('{!taxMode && <PersistentCoach key="world-coach" />}')
    expect(pageSource).toContain('<Hud playerName={state.player.name')
    expect(pageSource).toContain('{usesTouchControls && <MobileControls />}')
    expect(pageSource).not.toContain('TaxSideHint')
    expect(pageSource).not.toContain('<LemonadeFocusGuide />')
    expect(pageSource).not.toContain('<BudgetTakeawayGuard />')
    expect(declutterSource).toContain('[data-guidance-lane="side-hint"]')
    expect(pageSource).not.toContain('<ObjectiveChip />')
  })

  it('does not render the removed off-screen THIS WAY pointer', () => {
    expect(worldSource).not.toContain('ObjectiveEdgePointer')
    expect(worldSource).not.toContain('<ObjectiveEdgePointer />')
  })
})
