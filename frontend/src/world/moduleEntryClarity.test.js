import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const read = (relative) => fs.readFileSync(path.resolve(relative), 'utf8')

const world = read('src/pages/World.jsx')
const entryCss = read('src/world/moduleEntryFixes.css')

describe('module entry clarity', () => {
  it('starts Explore launches from the beginning instead of resuming Module 5', () => {
    expect(world).toContain("if (jump === '5')")
    expect(world).toContain('enterPaycheckPlanet({ restart: true })')
    expect(world).toContain('saveProfile({ taxLabProgress: null, taxLab: null })')
    expect(world).toContain('adminJumpModule(internal, false)')
  })

  it('clears old world messages before entering an explored module', () => {
    expect(world).toContain('function clearWorldMessages()')
    expect(world).toContain('guide: null')
    expect(world).toContain('actorCaption: null')
    expect(world).toContain('banner: null')
    expect(world).toContain('helpOpen: false')
  })

  it('gives Tax Lab one primary foreground surface', () => {
    expect(world).toContain("{!paycheckMode && <Hud")
    expect(world).toContain("{!paycheckMode && <LemonadeCompletionCheck")
    expect(world).toContain("paycheckMode ? <TaxSideHint /> : <PersistentCoach")
    expect(world).toContain("{!paycheckMode && <WorldModuleLearningRecap />}")
  })

  it('keeps tax hints secondary and filters automatic entry chatter', () => {
    expect(world).toContain('data-guidance-kind="tax-hint"')
    expect(world).toContain("line.startsWith('Pick any W-2 case')")
    expect(world).toContain("line.startsWith('Resume Module 5')")
    expect(world).toContain('Got it')
  })

  it('never splits an active module dialog to make room for a side hint', () => {
    expect(entryCss).toContain('align-items: center !important')
    expect(entryCss).toContain('justify-content: center !important')
    expect(entryCss).toContain('width: min(94vw, 46rem) !important')
    expect(entryCss).not.toContain('tayu-guidance-rail-width')
  })
})
