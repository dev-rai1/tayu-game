// R10 v8 7.1: read-aloud for early readers. Web Speech API, one tap.
// Calm, slightly slow, and always cancels the previous line first.
export function say(text) {
  try {
    if (!('speechSynthesis' in window) || !text) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(String(text))
    u.rate = 0.95
    u.pitch = 1.05
    window.speechSynthesis.speak(u)
  } catch { /* speech unavailable - the button simply does nothing */ }
}
