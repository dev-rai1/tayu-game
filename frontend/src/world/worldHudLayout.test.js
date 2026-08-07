import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const worldSource = fs.readFileSync(path.resolve('src/pages/World.jsx'), 'utf8')
const hudSource = fs.readFileSync(path.resolve('src/world/Hud.jsx'), 'utf8')
const coachSource = fs.readFileSync(path.resolve('src/world/PersistentCoach.jsx'), 'utf8')
const visibilitySource = fs.readFileSync(path.resolve('src/world/overlayVisibility.js'), 'utf8')
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

  it('keeps Help obvious, high-contrast, and fully inside the viewport', () => {
    expect(hudSource).toContain('aria-label="Help"')
    expect(cssSource).toContain('background: #ffd24a')
    expect(cssSource).toContain('min-width: 5rem')
    expect(cssSource).toContain('max-width: calc(100vw - 1.5rem)')
  })

  it('moves mission cards below the top controls on small screens', () => {
    expect(cssSource).toContain('top: calc(7.25rem + env(safe-area-inset-top, 0px))')
  })

  it('wraps long controls instead of letting them push off-screen', () => {
    expect(cssSource).toContain('overflow-wrap: anywhere')
    expect(cssSource).toContain('max-width: calc(100% - 1.5rem)')
  })

  it('routes temporary feedback into one bottom-left guided clue tray', () => {
    expect(coachSource).toContain('data-guided-clue-tray="true"')
    expect(coachSource).toContain('transientClue({ toast, guide, actorCaption, banner })')
    expect(coachSource).toContain("left: 'max(0.75rem, env(safe-area-inset-left, 0px))'")
    expect(cssSource).toContain('.absolute.inset-x-0.bottom-24.z-\\[220\\]')
    expect(cssSource).toContain('.absolute.inset-x-0.top-32.z-\\[150\\]')
    expect(cssSource).toContain('.absolute.inset-x-0.top-24.z-\\[200\\]')
  })

  it('keeps major instructions focused while minor tips use the tray', () => {
    expect(visibilitySource).toContain('hasMajorLesson')
    expect(visibilitySource).toContain('!activeLesson(value).soft')
    expect(coachSource).toContain('minorLessonClue(activeLesson)')
    expect(coachSource).toContain("data-message-level={minorLesson || improvement || transient ? 'secondary' : 'guidance'}")
    expect(cssSource).toContain('.absolute.inset-x-0.z-\\[240\\]')
    expect(hudSource).toContain('aria-labelledby="tayu-lesson-title"')
    expect(hudSource).toContain('aria-labelledby="tayu-dialog-speaker"')
  })

  it('keeps clue copy short and readable', () => {
    expect(coachSource).toContain('compactText(rawTitle, 58)')
    expect(coachSource).toContain('compactText(rawAction, 118)')
    expect(coachSource).toContain('text-base font-semibold leading-snug')
  })
})
