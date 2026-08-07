import { useGame } from './store.js'
import { replayGuidance } from './replayGuidance.js'

const LEMONADE_STAND_GUIDANCE_KEY = 'replay-lemonade-stand'

// Replays useful instructions after the normal E/tap interaction finishes.
// The zero-delay callback lets Player.jsx handle the interaction first, then
// presents the reminder without immediately dismissing it in the same event.
function replayCurrentInstruction() {
  const before = useGame.getState()
  const interactionId = before.near?.id
  if (!interactionId) return

  const isRepeat =
    (interactionId.startsWith('jar:') && ((before.wallet ?? 30) < 30 || (before.allocations?.[interactionId.split(':')[1]] ?? 0) > 0)) ||
    (interactionId === 'shopkeeper' && before.bramTalked) ||
    interactionId === 'checkout' ||
    interactionId === 'stand' ||
    interactionId === 'stand2' ||
    interactionId === 'supplies' ||
    interactionId === 'sprout' ||
    interactionId.startsWith('host:')

  if (!isRepeat) return

  window.setTimeout(() => {
    const state = useGame.getState()
    const message = replayGuidance(state, interactionId)
    if (!message) return

    // The general stand reminder is useful the first time, but should not
    // interrupt every later Lemonade Stand visit. Treat both stand interaction
    // IDs as the same one-time lesson so it cannot be queued repeatedly.
    const onceKey = interactionId === 'stand' || interactionId === 'stand2'
      ? LEMONADE_STAND_GUIDANCE_KEY
      : null

    // A lesson card stays until the player dismisses it, so children can reread
    // at their own pace instead of racing a short toast.
    if (typeof state.showLesson === 'function') state.showLesson(message, onceKey)
    else if (typeof state.setToast === 'function') state.setToast(message)
  }, 0)
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'KeyE' && !event.repeat) replayCurrentInstruction()
})
window.addEventListener('tayu-interact', replayCurrentInstruction)
