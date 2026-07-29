import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { currentUser } from '../services/auth.js'
import { loadProfile, saveProfile } from '../services/walletStore.js'
import { isLearningPathComplete, loadActiveLearningPath } from '../constants/learningPaths.js'

export default function PathCompletionWatcher() {
  const navigate = useNavigate()
  const location = useLocation()
  const handling = useRef(false)

  const checkCompletion = useCallback(() => {
    if (handling.current || location.pathname !== '/world') return
    const user = currentUser()
    if (!user || user.role === 'teacher') return

    const path = loadActiveLearningPath()
    // The complete five-module path keeps the existing Money Guru finale.
    if (!path || path.modules.length >= 5) return

    const profile = loadProfile() || {}
    if (!isLearningPathComplete(path.modules, profile.badges || [])) return

    handling.current = true
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
  }, [location.pathname, navigate])

  useEffect(() => {
    checkCompletion()
    window.addEventListener('tayu-progress-saved', checkCompletion)
    return () => window.removeEventListener('tayu-progress-saved', checkCompletion)
  }, [checkCompletion])

  useEffect(() => {
    handling.current = false
  }, [location.pathname])

  return null
}
