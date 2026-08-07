/**
 * Required world interactions should be called out prominently.
 * Optional conversations with random townspeople stay discoverable through the
 * blue action button without presenting them as the player's next required step.
 *
 * The Bank of TAYU is intentionally different: Banker Bea's interaction is
 * already explained by the persistent guidance rail, and the module then flows
 * automatically through animated beats and choice cards. Suppressing the old
 * bottom-screen E prompt keeps the bank from showing two competing reminders.
 */
export function shouldShowInteractionPrompt(near) {
  return Boolean(
    near &&
    near.id !== 'host:bea' &&
    !near.id?.startsWith('npc:')
  )
}
