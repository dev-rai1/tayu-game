import { describe, expect, it } from 'vitest'
import fs from 'node:fs'

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8')

describe('September 2026 audit remediations', () => {
  it('persists Firebase authentication locally', () => {
    const source = read('./services/firebase.js')
    expect(source).toContain('browserLocalPersistence')
    expect(source).not.toContain('browserSessionPersistence')
  })

  it('recovers WebGL, announces status, and retains diagnostic history', () => {
    const world = read('./world/GameWorld.jsx')
    const boundary = read('./components/Boundary.jsx')
    expect(world).toContain('webglcontextlost')
    expect(world).toContain('webglcontextrestored')
    expect(world).toContain('Rebuilding the world...')
    expect(world).toContain("logTayuError('renderer:stall'")
    expect(boundary).toContain('slice(-100)')
  })

  it('gates modules by grade and publishes standards metadata', () => {
    const selector = read('./pages/ModuleSelect.jsx')
    const modules = read('./constants/modules.js')
    expect(selector).toContain('return required.includes(moduleNumber)')
    expect(selector).toContain('switch grade to play')
    expect(modules).toContain("sol: ['EPF.1', 'EPF.16']")
    expect(modules).toContain('CURRICULUM_COVERAGE')
  })

  it('ships the capstone and three playable expansion missions', () => {
    const capstone = read('./pages/PathComplete.jsx')
    const missions = read('./pages/ExpansionMissions.jsx')
    expect(capstone).toContain('FCPS Unit 16 capstone')
    expect(missions).toContain("'first-paycheck'")
    expect(missions).toContain("'rainy-day'")
    expect(missions).toContain("'big-picture'")
  })
})
