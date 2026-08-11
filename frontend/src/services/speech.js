// Read-aloud support for early readers.
// Keep speech reliable across repeated taps and Chromium/Safari cancellation timing.
let pendingSpeakTimer = null
let activeUtterance = null

function speechApi() {
  if (typeof window === 'undefined') return null
  const synth = window.speechSynthesis
  const Utterance = window.SpeechSynthesisUtterance
  if (!synth || typeof synth.speak !== 'function' || typeof Utterance !== 'function') return null
  return { synth, Utterance }
}

function preferredLanguage() {
  if (typeof document !== 'undefined' && document.documentElement?.lang) return document.documentElement.lang
  if (typeof navigator !== 'undefined' && navigator.language) return navigator.language
  return 'en-US'
}

function preferredVoice(synth, language) {
  if (typeof synth.getVoices !== 'function') return null
  const voices = synth.getVoices() || []
  if (!voices.length) return null

  const normalized = String(language || '').toLowerCase()
  const base = normalized.split('-')[0]
  return voices.find((voice) => String(voice.lang || '').toLowerCase() === normalized)
    || voices.find((voice) => String(voice.lang || '').toLowerCase().split('-')[0] === base)
    || voices.find((voice) => voice.default)
    || null
}

export function canSpeak() {
  return Boolean(speechApi())
}

export function stopSpeaking() {
  const api = speechApi()
  if (!api) return false

  if (pendingSpeakTimer !== null) {
    window.clearTimeout(pendingSpeakTimer)
    pendingSpeakTimer = null
  }

  try {
    api.synth.cancel()
    activeUtterance = null
    return true
  } catch {
    return false
  }
}

export function say(text) {
  const spokenText = String(text ?? '').trim()
  const api = speechApi()
  if (!api || !spokenText) return false

  if (pendingSpeakTimer !== null) {
    window.clearTimeout(pendingSpeakTimer)
    pendingSpeakTimer = null
  }

  try {
    // Chromium can occasionally drop a new utterance when cancel() and speak()
    // happen in the exact same task. Cancel now, then speak on the next task.
    api.synth.cancel()
    if (api.synth.paused && typeof api.synth.resume === 'function') api.synth.resume()

    const utterance = new api.Utterance(spokenText)
    const language = preferredLanguage()
    utterance.lang = language
    utterance.rate = 0.95
    utterance.pitch = 1.05

    const voice = preferredVoice(api.synth, language)
    if (voice) utterance.voice = voice

    utterance.onend = () => {
      if (activeUtterance === utterance) activeUtterance = null
    }
    utterance.onerror = () => {
      if (activeUtterance === utterance) activeUtterance = null
    }

    activeUtterance = utterance
    pendingSpeakTimer = window.setTimeout(() => {
      pendingSpeakTimer = null
      try {
        if (api.synth.paused && typeof api.synth.resume === 'function') api.synth.resume()
        api.synth.speak(utterance)
      } catch {
        if (activeUtterance === utterance) activeUtterance = null
      }
    }, 20)

    return true
  } catch {
    activeUtterance = null
    return false
  }
}
