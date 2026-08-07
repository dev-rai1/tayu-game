import { describe, expect, it, vi } from 'vitest'
import { installViewportSync, syncViewportVariables, visibleViewport } from './viewport.js'

function fakeDocument() {
  const values = new Map()
  return {
    values,
    documentElement: {
      style: { setProperty: (key, value) => values.set(key, value) },
    },
  }
}

describe('visible viewport synchronization', () => {
  it('uses VisualViewport dimensions without following its transient offsets', () => {
    const win = {
      innerWidth: 1024,
      innerHeight: 768,
      visualViewport: { width: 620.4, height: 710.6, offsetLeft: 3.2, offsetTop: 11.8 },
    }
    expect(visibleViewport(win)).toEqual({ width: 620, height: 711, left: 0, top: 0 })
  })

  it('falls back to the layout viewport', () => {
    expect(visibleViewport({ innerWidth: 800, innerHeight: 600 })).toEqual({ width: 800, height: 600, left: 0, top: 0 })
  })

  it('writes stable CSS variables used by fixed and full-page layouts', () => {
    const doc = fakeDocument()
    syncViewportVariables({ innerWidth: 744, innerHeight: 521 }, doc)
    expect(doc.values.get('--tayu-viewport-width')).toBe('744px')
    expect(doc.values.get('--tayu-viewport-height')).toBe('521px')
    expect(doc.values.get('--tayu-viewport-left')).toBe('0px')
    expect(doc.values.get('--tayu-viewport-top')).toBe('0px')
  })

  it('listens for size changes but not VisualViewport scrolling', () => {
    const listeners = []
    const viewportListeners = []
    const win = {
      innerWidth: 800,
      innerHeight: 600,
      requestAnimationFrame: (callback) => { callback(); return 1 },
      cancelAnimationFrame: vi.fn(),
      addEventListener: (name) => listeners.push(name),
      removeEventListener: vi.fn(),
      visualViewport: {
        width: 800,
        height: 600,
        addEventListener: (name) => viewportListeners.push(name),
        removeEventListener: vi.fn(),
      },
    }
    const cleanup = installViewportSync(win, fakeDocument())
    expect(listeners).toEqual(expect.arrayContaining(['resize', 'orientationchange', 'pageshow']))
    expect(viewportListeners).toEqual(['resize'])
    cleanup()
  })
})
