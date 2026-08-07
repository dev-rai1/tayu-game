export const ACTOR_NAMES = Object.freeze({
  bram: 'Mr. Bram',
  penny: 'Penny',
  keeper: 'Budget Keeper',
  bea: 'Banker Bea',
  sprout: 'Mr. Sprout',
  scoop: 'Scoop',
  wanderer: 'Milo',
  nea: 'Nea',
})

function firstText(value, keys) {
  if (!value) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  for (const key of keys) {
    if (typeof value?.[key] === 'string' && value[key].trim()) return value[key].trim()
  }
  return ''
}

export function coachMessageFromTransient(kind, value) {
  if (!value) return null

  if (kind === 'actor') {
    const actor = typeof value === 'object' ? value.actor : ''
    const name = ACTOR_NAMES[actor] || actor || 'TAYU friend'
    const action = firstText(value, ['text', 'message', 'line', 'copy', 'body'])
    if (!action) return null
    return {
      kind,
      label: `${name} says`,
      title: name,
      action,
      helper: 'talk',
    }
  }

  if (kind === 'lesson') {
    const action = firstText(value, ['text', 'message', 'line', 'copy', 'body', 'instruction'])
    if (!action) return null
    return {
      kind,
      label: 'Learn this',
      title: firstText(value, ['title', 'heading']) || 'Quick lesson',
      action,
      helper: 'learn',
    }
  }

  if (kind === 'guide') {
    const action = firstText(value, ['action', 'instruction', 'text', 'message', 'line', 'copy', 'body'])
    if (!action) return null
    return {
      kind,
      label: 'Next step',
      title: firstText(value, ['title', 'heading']) || 'Do this next',
      action,
      helper: 'guide',
    }
  }

  if (kind === 'banner') {
    const action = firstText(value, ['text', 'message', 'line', 'copy', 'body', 'instruction', 'title'])
    if (!action) return null
    return {
      kind,
      label: 'Game update',
      title: firstText(value, ['title', 'heading']) || 'Something changed',
      action,
      helper: 'update',
    }
  }

  const action = firstText(value, ['text', 'message', 'line', 'copy', 'body', 'instruction', 'title'])
  if (!action) return null
  return {
    kind: 'toast',
    label: 'Feedback',
    title: firstText(value, ['title', 'heading']) || 'Check this',
    action,
    helper: 'feedback',
  }
}

export function coachMessageSignature(message) {
  if (!message) return ''
  return [message.kind, message.label, message.title, message.action].filter(Boolean).join('|')
}
