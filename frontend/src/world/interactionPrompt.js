/**
 * Required world interactions should be called out prominently.
 * Optional conversations with random townspeople stay discoverable through the
 * blue action button without presenting them as the player's next required step.
 *
 * Named hosts are required gameplay interactions, so they should always get the
 * same visible interaction prompt as other required objectives. This includes
 * Banker Bea in Module 4 so players clearly see that they can press E to talk.
 */
export function shouldShowInteractionPrompt(near) {
  return Boolean(
    near &&
    !near.id?.startsWith('npc:')
  )
}
