import { useGame } from './store.js'
import { replayGuidance } from './replayGuidance.js'

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

    // A lesson card stays until the player dismisses it, so children can reread
    // at their own pace instead of racing a short toast.
    if (typeof state.showLesson === 'function') state.showLesson(message)
    else if (typeof state.setToast === 'function') state.setToast(message)
  }, 0)
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'KeyE' && !event.repeat) replayCurrentInstruction()
})
window.addEventListener('tayu-interact', replayCurrentInstruction)
