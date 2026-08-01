const asScore = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback

export function normalizeCheckAttempts(entry) {
  if (!entry) return []
  if (Array.isArray(entry.attempts) && entry.attempts.length > 0) {
    return entry.attempts.map((attempt) => ({
      score: asScore(attempt.score),
      total: asScore(attempt.total),
      completedAt: attempt.completedAt || null,
    }))
  }
  if (Number.isFinite(Number(entry.score)) && Number.isFinite(Number(entry.total))) {
    return [{
      score: asScore(entry.score),
      total: asScore(entry.total),
      completedAt: entry.completedAt || null,
    }]
  }
  return []
}

export function moduleCheckProgress(entry) {
  const attempts = normalizeCheckAttempts(entry)
  if (attempts.length === 0) return { attempts: 0, bestScore: 0, latestScore: 0, total: 0 }
  const latest = attempts[attempts.length - 1]
  return {
    attempts: attempts.length,
    bestScore: Math.max(...attempts.map((attempt) => attempt.score)),
    latestScore: latest.score,
    total: latest.total,
  }
}

export function addModuleCheckAttempt(entry, attempt, limit = 12) {
  const normalized = {
    score: asScore(attempt.score),
    total: asScore(attempt.total),
    completedAt: attempt.completedAt || new Date().toISOString(),
  }
  const attempts = [...normalizeCheckAttempts(entry), normalized].slice(-Math.max(1, limit))
  const bestScore = Math.max(...attempts.map((item) => item.score))
  return {
    ...normalized,
    bestScore,
    attemptCount: attempts.length,
    attempts,
  }
}
