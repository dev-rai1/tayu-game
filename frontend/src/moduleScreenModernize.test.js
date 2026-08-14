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

  it('positions admin access in the top utility area instead of over bottom gameplay controls', () => {
    const source = read('src/components/AdminPanel.jsx')

    expect(source).toContain('TAYU Admin')
    expect(source).toContain('top-[calc(0.75rem+env(safe-area-inset-top,0px))]')
    expect(source).toContain('top-[calc(4.25rem+env(safe-area-inset-top,0px))]')
    expect(source).not.toContain("bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))'")
  })
})
