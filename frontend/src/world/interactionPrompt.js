/**
 * Required world interactions should be called out prominently.
 * Optional conversations with random townspeople stay discoverable through the
 * blue action button without presenting them as the player's next required step.
 */
export function shouldShowInteractionPrompt(near) {
  return Boolean(near && !near.id?.startsWith('npc:'))
}
