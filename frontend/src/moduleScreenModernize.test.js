import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path) => readFileSync(join(process.cwd(), path), 'utf8')

describe('module menu modernization', () => {
  it('uses the shared animated town and high-contrast light cards', () => {
    const source = read('src/pages/ModuleSelect.jsx')

    expect(source).toContain("import { TownBackground } from '../components/TownBackground.jsx'")
    expect(source).toContain('<TownBackground theme="play" scrim={0.72} />')
    expect(source).toContain('bg-white/95')
    expect(source).toContain('text-slate-950')
    expect(source).toContain('const GRADE_ACCENT = {')
  })

  it('keeps the module menu reachable while the 3D world is open', () => {
    const app = read('src/App.jsx')
    const dock = read('src/components/WorldUtilityDock.jsx')

    expect(app).toContain("import WorldUtilityDock from './components/WorldUtilityDock.jsx'")
    expect(app).toContain('<WorldUtilityDock />')
    expect(dock).toContain('to="/modules"')
    expect(dock).toContain('Module Menu')
  })

  it('preserves the last valid grade path when returning from Change grade', () => {
    const learningPaths = read('src/constants/learningPaths.js')
    const moduleSelect = read('src/pages/ModuleSelect.jsx')

    expect(moduleSelect).toContain('← Back to modules')
    expect(moduleSelect).toContain('setGradePathId(savedGradePath.id)')
    expect(learningPaths).toContain("LAST_GRADE_PATH_KEY = 'tayu-last-grade-learning-path-v1'")
    expect(learningPaths).toContain('saveLastGradePath(value)')
    expect(learningPaths).toContain('localStorage.getItem(LAST_GRADE_PATH_KEY)')
  })

  it('positions admin access in the bottom-right with the panel directly above it', () => {
    const source = read('src/components/AdminPanel.jsx')

    expect(source).toContain('TAYU Admin')
    expect(source).toContain('bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))]')
    expect(source).toContain('bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))]')
    expect(source).toContain('right-[calc(0.75rem+env(safe-area-inset-right,0px))]')
    expect(source).not.toContain('top-[calc(0.75rem+env(safe-area-inset-top,0px))]')
  })
})
