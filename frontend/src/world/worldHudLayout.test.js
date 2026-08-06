import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const worldSource = fs.readFileSync(path.resolve('src/pages/World.jsx'), 'utf8')
const cssSource = fs.readFileSync(path.resolve('src/world/worldDeclutter.css'), 'utf8')

describe('world HUD layout', () => {
  it('does not render the redundant world menu button', () => {
    expect(worldSource).not.toContain('WorldMenu')
  })

  it('keeps top controls in separate safe-area zones', () => {
    expect(cssSource).toContain('.absolute.left-4.top-4')
    expect(cssSource).toContain('.absolute.right-4.top-4')
    expect(cssSource).toContain('env(safe-area-inset-left')
    expect(cssSource).toContain('env(safe-area-inset-right')
  })

  it('uses a single clear Help label instead of a question-mark-only control', () => {
    expect(cssSource).toContain('button[aria-label="Help"]::after')
    expect(cssSource).toContain('content: "Help"')
  })

  it('moves mission cards below the top controls on small screens', () => {
    expect(cssSource).toContain('top: calc(7.25rem + env(safe-area-inset-top, 0px))')
  })
})
