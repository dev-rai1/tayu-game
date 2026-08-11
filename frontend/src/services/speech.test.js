import { afterEach, describe, expect, it, vi } from 'vitest'
import { canSpeak, say, stopSpeaking } from './speech.js'

class FakeUtterance {
  constructor(text) {
    this.text = text
    this.lang = ''
    this.rate = 1
    this.pitch = 1
    this.voice = null
    this.onend = null
    this.onerror = null
  }
}

function installSpeech({ paused = false } = {}) {
  const synth = {
    paused,
    pending: false,
    speaking: false,
    cancel: vi.fn(),
    resume: vi.fn(function resume() { this.paused = false }),
    speak: vi.fn(),
    getVoices: vi.fn(() => [{ lang: 'en-US', default: true }]),
  }

  globalThis.window = {
    speechSynthesis: synth,
    SpeechSynthesisUtterance: FakeUtterance,
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
  }

  return synth
}

afterEach(() => {
  stopSpeaking()
  vi.useRealTimers()
  delete globalThis.window
})

describe('read aloud service', () => {
  it('reports unavailable speech without throwing', () => {
    delete globalThis.window
    expect(canSpeak()).toBe(false)
    expect(say('Hello')).toBe(false)
  })

  it('cancels stale speech and speaks on the next task', () => {
    vi.useFakeTimers()
    const synth = installSpeech({ paused: true })

    expect(canSpeak()).toBe(true)
    expect(say('Read this sentence')).toBe(true)
    expect(synth.cancel).toHaveBeenCalledTimes(1)
    expect(synth.resume).toHaveBeenCalledTimes(1)
    expect(synth.speak).not.toHaveBeenCalled()

    vi.advanceTimersByTime(20)

    expect(synth.speak).toHaveBeenCalledTimes(1)
    expect(synth.speak.mock.calls[0][0].text).toBe('Read this sentence')
    expect(synth.speak.mock.calls[0][0].rate).toBe(0.95)
  })

  it('keeps only the newest read-aloud request when tapped repeatedly', () => {
    vi.useFakeTimers()
    const synth = installSpeech()

    say('First message')
    say('Second message')
    vi.advanceTimersByTime(20)

    expect(synth.cancel).toHaveBeenCalledTimes(2)
    expect(synth.speak).toHaveBeenCalledTimes(1)
    expect(synth.speak.mock.calls[0][0].text).toBe('Second message')
  })
})
