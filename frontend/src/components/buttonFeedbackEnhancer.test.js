import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const enhancerSource = fs.readFileSync(path.resolve('src/components/ButtonFeedbackEnhancer.jsx'), 'utf8')
const actionCss = fs.readFileSync(path.resolve('src/styles/actionButtons.css'), 'utf8')

describe('button feedback icons', () => {
  it('does not inject a default arrow into unmatched controls', () => {
    expect(enhancerSource).not.toContain("match?.icon || '→'")
    expect(enhancerSource).toContain('if (match && !hasOwnVisualIcon(button, visibleLabel))')
  })

  it('keeps icon-only controls from receiving a second generated icon', () => {
    expect(enhancerSource).toContain("button.querySelector('svg, img')")
    expect(enhancerSource).toContain('/^[?×✕✖←→↻✓★⚙…]+$/u')
  })

  it('treats hide and dismiss controls as close actions before hint/help matching', () => {
    expect(enhancerSource).toContain('/back|cancel|close|hide|dismiss|choose another|not now|return/i')
  })

  it('renders pseudo-icons only for controls explicitly opted in by the enhancer', () => {
    expect(actionCss).toContain("[data-tayu-action-icon='true']::before")
  })
})
