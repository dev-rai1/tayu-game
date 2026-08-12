import { loadProfile, saveProfile } from '../services/walletStore.js'

export const GRADE_PATHS = [
  { id: 'early-elementary', label: 'Grades K–2', title: 'Early Elementary', modules: [1, 2], copy: 'A short 2-stop adventure: everyday money choices, then a first business challenge.' },
  { id: 'upper-elementary', label: 'Grades 3–5', title: 'Upper Elementary', modules: [1, 2, 3], copy: 'A 3-stop adventure: money foundations, a business challenge, and Budget Town.' },
  { id: 'middle-school', label: 'Grades 6–8', title: 'Middle School', modules: [1, 2, 3, 4, 5, 6, 7], copy: 'The full 7-module adventure: saving, business, budgeting, banking, Money Garden, Bond Street, then the Tax Office.' },
  { id: 'high-school', label: 'Grades 9–12', title: 'High School', modules: [1, 2, 3, 4, 5, 6, 7], copy: 'The full 7-module adventure with deeper banking, investing, fixed income on Bond Street, and a simplified return at the Tax Office.' },
]

export const DEFAULT_GRADE_PATH = 'middle-school'
export const ACTIVE_PATH_KEY = 'tayu-active-learning-path-v1'

const BADGES_BY_MODULE = { 1: 'jars', 2: 'lemonade', 3: 'budget', 4: 'bank', 5: 'garden', 6: 'bond', 7: 'tax' }

function normalizeModules(modules) {
  return [...new Set((modules || []).map(Number).filter((number) => number >= 1 && number <= 7))].sort((a, b) => a - b)
}

export function normalizeLearningPath(path) {
  if (!path) return null
  const modules = normalizeModules(path.modules)
  if (!modules.length) return null
  return {
    id: String(path.id || 'custom-path'),
    label: String(path.label || 'Assigned path'),
    title: String(path.title || 'Assigned Learning Path'),
    modules,
  }
}

export function getGradePath(id) {
  return GRADE_PATHS.find((path) => path.id === id) || null
}

export function moduleNumbersForPath(id) {
  return getGradePath(id)?.modules || []
}

export function requiredModules({ pathId, classroomModules, teacherPreview = false, plain = true }) {
  if (teacherPreview || !plain) return normalizeModules(classroomModules)
  return moduleNumbersForPath(pathId)
}

export function completedRequiredModules(required, completed) {
  const completedSet = new Set(completed || [])
  return (required || []).filter((moduleNumber) => completedSet.has(moduleNumber))
}

export function badgesForModules(modules) {
  return normalizeModules(modules).map((moduleNumber) => BADGES_BY_MODULE[moduleNumber]).filter(Boolean)
}

export function isLearningPathComplete(modules, badges) {
  const badgeSet = new Set(badges || [])
  const requiredBadges = badgesForModules(modules)
  return requiredBadges.length > 0 && requiredBadges.every((badge) => badgeSet.has(badge))
}

export function milestoneBadges(state = {}) {
  const badges = []
  if (state.week === 1 && state.weekComplete) badges.push('jars')
  if (state.week === 2 && state.weekComplete) badges.push('lemonade')
  if (state.btStage === 'handoff') badges.push('budget')
  if (Number(state.bkWeek || 0) >= 7) badges.push('bank')
  if (state.mgPhase === 'done' || state.gameComplete) badges.push('garden')
  const profileBadges = loadProfile()?.badges || []
  if (profileBadges.includes('bond')) badges.push('bond')
  if (profileBadges.includes('tax')) badges.push('tax')
  return badges
}

export function saveActiveLearningPath(path) {
  const value = normalizeLearningPath(path)
  if (!value) return null
  try { localStorage.setItem(ACTIVE_PATH_KEY, JSON.stringify(value)) } catch { /* optional */ }
  saveProfile({ activeLearningPath: value })
  return value
}

export function clearActiveLearningPath() {
  try { localStorage.removeItem(ACTIVE_PATH_KEY) } catch { /* optional */ }
  saveProfile({ activeLearningPath: null })
}

export function loadActiveLearningPath() {
  const profileValue = normalizeLearningPath(loadProfile()?.activeLearningPath)
  if (profileValue) return profileValue
  try { return normalizeLearningPath(JSON.parse(localStorage.getItem(ACTIVE_PATH_KEY) || 'null')) } catch { return null }
}
