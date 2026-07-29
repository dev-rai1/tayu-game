import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { currentUser } from '../services/auth.js'
import { loadProfile, saveProfile } from '../services/walletStore.js'
import { useGame } from '../world/store.js'
import { isLearningPathComplete, loadActiveLearningPath, milestoneBadges } from '../constants/learningPaths.js'

export default function PathCompletionWatcher() {
  const navigate = useNavigate()
  const location = useLocation()
  const syncing = useRef(false)

  const week = useGame((state) => state.week)
  const weekComplete = useGame((state) => state.weekComplete)
  const btStage = useGame((state) => state.bt?.stage || '')
  const bkWeek = useGame((state) => state.bk?.week || 0)
  const mgPhase = useGame((state) => state.mgPhase)
  const gameComplete = useGame((state) => state.gameComplete)

  const syncAndCheck = useCallback(() => {
    if (syncing.current) return
    const user = currentUser()
    if (!user || user.role === 'teacher' || user.role === 'admin') return

    syncing.current = true
    try {
      const profile = loadProfile() || {}
      const existingBadges = profile.badges || []
      const inferred = milestoneBadges({ week, weekComplete, btStage, bkWeek, mgPhase, gameComplete })
      const badges = [...new Set([...existingBadges, ...inferred])]

      if (badges.length !== existingBadges.length) saveProfile({ badges })

      if (location.pathname !== '/world') return
      const path = loadActiveLearningPath()
      if (!path || path.modules.length >= 5 || !isLearningPathComplete(path.modules, badges)) return

      if (profile.pathCompletion?.pathId !== path.id) {
        saveProfile({
          pathCompletion: {
            pathId: path.id,
            label: path.label,
            title: path.title,
            modules: path.modules,
            completedAt: new Date().toISOString(),
          },
        })
      }
      navigate('/path-complete', { replace: true })
    } finally {
      syncing.current = false
    }
  }, [bkWeek, btStage, gameComplete, location.pathname, mgPhase, navigate, week, weekComplete])

  useEffect(() => {
    syncAndCheck()
    window.addEventListener('tayu-progress-saved', syncAndCheck)
    return () => window.removeEventListener('tayu-progress-saved', syncAndCheck)
  }, [syncAndCheck])

  return null
}
