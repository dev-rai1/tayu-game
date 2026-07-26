import { beforeEach, describe, expect, it } from 'vitest'
import { clearTimelines, flushTimelines, playTimeline } from './timeline.js'

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
