import { beforeEach, describe, expect, it, vi } from 'vitest'
import { activeTimelines, clearTimelines, flushTimelines, playTimeline, tickTimelines } from './timeline.js'

describe('accessible timeline completion', () => {
  beforeEach(clearTimelines)

  it('runs every beat and completion callback in order', () => {
    const events = []
    playTimeline([
      { at: 500, run: () => events.push('first') },
      { at: 2500, run: () => events.push('second'), hold: 1000 },
    ], () => events.push('done'))

    flushTimelines()

    expect(events).toEqual(['first', 'second', 'done'])
  })

  it('also completes a follow-up timeline queued by onDone', () => {
    const events = []
    playTimeline([{ at: 100, run: () => events.push('scene') }], () => {
      playTimeline([{ at: 100, run: () => events.push('follow-up') }])
    })

    flushTimelines()

    expect(events).toEqual(['scene', 'follow-up'])
  })
})

describe('timeline frame timing', () => {
  beforeEach(clearTimelines)

  it('runs beats according to elapsed frame time', () => {
    const first = vi.fn()
    const second = vi.fn()
    const done = vi.fn()
    playTimeline([
      { at: 0, run: first },
      { at: 100, run: second },
    ], done)

    tickTimelines(0.016)
    expect(first).toHaveBeenCalledOnce()
    expect(second).not.toHaveBeenCalled()
    for (let frame = 0; frame < 6; frame += 1) tickTimelines(0.016)

    expect(second).toHaveBeenCalledOnce()
    expect(done).toHaveBeenCalledOnce()
    expect(activeTimelines()).toBe(0)
  })

  it('clamps long frames instead of skipping the activity', () => {
    const laterBeat = vi.fn()
    playTimeline([
      { at: 0, run: vi.fn() },
      { at: 200, run: laterBeat },
    ])

    tickTimelines(10)
    expect(laterBeat).not.toHaveBeenCalled()
    expect(activeTimelines()).toBe(1)
    tickTimelines(0.1)
    expect(laterBeat).toHaveBeenCalledOnce()
    expect(activeTimelines()).toBe(0)
  })
})
