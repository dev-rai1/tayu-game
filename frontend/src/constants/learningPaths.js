export const GRADE_PATHS = [
  {
    id: 'early-elementary',
    label: 'Grades K–2',
    title: 'Early Elementary',
    modules: [1, 2],
    copy: 'Everyday money choices and a first business challenge.',
  },
  {
    id: 'upper-elementary',
    label: 'Grades 3–5',
    title: 'Upper Elementary',
    modules: [1, 2, 3],
    copy: 'Foundations, business choices, and a complete daily budget.',
  },
  {
    id: 'middle-school',
    label: 'Grades 6–8',
    title: 'Middle School',
    modules: [1, 2, 3, 4, 5],
    copy: 'The full pathway, with banking and investing in shorter decision sections.',
  },
  {
    id: 'high-school',
    label: 'Grades 9–12',
    title: 'High School',
    modules: [1, 2, 3, 4, 5],
    copy: 'The full pathway with advanced discussion prompts in later modules.',
  },
]

export const DEFAULT_GRADE_PATH = 'middle-school'
export const ACTIVE_PATH_KEY = 'tayu-active-learning-path-v1'

const BADGES_BY_MODULE = {
  1: 'jars',
  2: 'lemonade',
  3: 'budget',
  4: 'bank',
  5: 'garden',
}

export function getGradePath(id) {
  return GRADE_PATHS.find((path) => path.id === id) || null
}

export function moduleNumbersForPath(id) {
  return getGradePath(id)?.modules || []
}

export function requiredModules({ pathId, classroomModules, teacherPreview = false, plain = true }) {
  if (teacherPreview || !plain) return [...new Set(classroomModules || [])].sort((a, b) => a - b)
  return moduleNumbersForPath(pathId)
}

export function completedRequiredModules(required, completed) {
  const completedSet = new Set(completed || [])
  return (required || []).filter((moduleNumber) => completedSet.has(moduleNumber))
}

export function badgesForModules(modules) {
  return (modules || []).map((moduleNumber) => BADGES_BY_MODULE[moduleNumber]).filter(Boolean)
}

export function isLearningPathComplete(modules, badges) {
  const badgeSet = new Set(badges || [])
  const requiredBadges = badgesForModules(modules)
  return requiredBadges.length > 0 && requiredBadges.every((badge) => badgeSet.has(badge))
}

export function saveActiveLearningPath(path) {
  try {
    localStorage.setItem(ACTIVE_PATH_KEY, JSON.stringify(path))
  } catch { /* local persistence is optional */ }
  return path
}

export function loadActiveLearningPath() {
  try {
    const value = JSON.parse(localStorage.getItem(ACTIVE_PATH_KEY) || 'null')
    if (!value || !Array.isArray(value.modules) || !value.modules.length) return null
    return { ...value, modules: [...new Set(value.modules.map(Number).filter((n) => n >= 1 && n <= 5))].sort((a, b) => a - b) }
  } catch { return null }
}
