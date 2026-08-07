import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const escapeSource = fs.readFileSync(path.resolve('src/world/OverlayEscapeControls.jsx'), 'utf8')
const gardenSource = fs.readFileSync(path.resolve('src/world/MoneyGardenFlowGuide.jsx'), 'utf8')

describe('world overlay collision guards', () => {
  it('keeps the dialog escape control compact and safe-area aware', () => {
    expect(escapeSource).toContain('aria-label="Skip this talk"')
    expect(escapeSource).toContain('right-[max(0.75rem,env(safe-area-inset-right,0px))]')
    expect(escapeSource).toContain('max-w-[6rem]')
    expect(escapeSource).toContain('>\n      Skip\n    </button>')
  })

  it('keeps Money Garden guidance below the permanent top HUD', () => {
    expect(gardenSource).toContain('top-[calc(7.25rem+env(safe-area-inset-top,0px))]')
    expect(gardenSource).not.toContain('left-1/2 top-20')
  })

  it('does not stack Money Garden guidance behind active dialogs or cards', () => {
    expect(gardenSource).toContain('if (cards.length > 0 || dialog) return null')
  })
})
