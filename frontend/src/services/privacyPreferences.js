export const ANALYTICS_CHOICE_KEY = 'tayu-analytics-choice-v1'
export const ANALYTICS_CHOICES = Object.freeze({ ALLOW: 'allow', NECESSARY_ONLY: 'necessary-only' })

export function getAnalyticsChoice() {
  if (typeof localStorage === 'undefined') return null
  const saved = localStorage.getItem(ANALYTICS_CHOICE_KEY)
  return Object.values(ANALYTICS_CHOICES).includes(saved) ? saved : null
}

export function analyticsRoleAllowed() {
  if (typeof sessionStorage === 'undefined') return false
  try {
    const user = JSON.parse(sessionStorage.getItem('tayu-session-v1') || 'null')
    return user?.role === 'teacher' || user?.role === 'admin'
  } catch {
    return false
  }
}

export function optionalAnalyticsAllowed() {
  return analyticsRoleAllowed() && getAnalyticsChoice() === ANALYTICS_CHOICES.ALLOW
}

export function setAnalyticsChoice(choice) {
  if (!Object.values(ANALYTICS_CHOICES).includes(choice)) throw new Error('Choose allow or necessary-only.')
  if (typeof localStorage !== 'undefined') localStorage.setItem(ANALYTICS_CHOICE_KEY, choice)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tayu-analytics-choice-changed', { detail: choice }))
  }
  return choice
}
