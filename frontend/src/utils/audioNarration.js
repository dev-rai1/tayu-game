// Optional text-to-speech narration for early grades (Web Speech API).
// No-ops gracefully where unsupported.
export function speak(text) {
  try {
    if (!('speechSynthesis' in window) || !text) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.95
    u.pitch = 1.1
    window.speechSynthesis.speak(u)
  } catch {
    /* unsupported */
  }
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* noop */
  }
}
