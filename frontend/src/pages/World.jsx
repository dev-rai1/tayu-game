import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameState } from '../hooks/useGameState.jsx'
import { GameWorld } from '../world/GameWorld.jsx'
import { Hud } from '../world/Hud.jsx'
import { MobileControls } from '../world/MobileControls.jsx'
import { usesTouchControls } from '../world/controlMode.js'
import { useGame } from '../world/store.js'
import { loadProfile } from '../services/walletStore.js'
import { crossfadeTo } from '../services/audio.js'
import { setUsageModule } from '../services/usageAnalytics.js'
import { AccessibleWorld } from '../world/AccessibleWorld.jsx'
import { PersistentCoach } from '../world/PersistentCoach.jsx'
import { PersistentImprovementCoach } from '../world/PersistentImprovementCoach.jsx'
import { GuidedCommerceOverlay } from '../world/GuidedCommerceOverlay.jsx'
import { LemonadeFocusGuide } from '../world/LemonadeFocusGuide.jsx'
import { FirstTimeMovementTutorial } from '../world/FirstTimeMovementTutorial.jsx'
import { BudgetTakeawayGuard } from '../world/BudgetTakeawayGuard.jsx'
import { OverlayEscapeControls } from '../world/OverlayEscapeControls.jsx'
import { WorldModuleLearningRecap } from '../components/ModuleLearningRecap.jsx'
import { hasWebGL } from '../utils/webgl.js'
import '../world/worldDeclutter.css'

// Internal 3D-world week numbers predate Paycheck Planet. Public Module 5 is
// the standalone tax/paycheck experience; the internal week 5 is now public
// Module 6 (Money Garden).
const MODULE_BY_WEEK = { 1: 'jars', 2: 'lemonade', 3: 'budget', 4: 'bank', 5: 'garden' }

export default function World() {
  const navigate = useNavigate()
  const { state, dispatch } = useGameState()
  const [faded, setFaded] = useState(false)
  const initWorld = useGame((s) => s.initWorld)
  const enterParty = useGame((s) => s.enterParty)
  const week = useGame((s) => s.week)
  const cards = useGame((s) => s.cards)
  const [use3D] = useState(hasWebGL)

  useEffect(() => {
    setUsageModule(MODULE_BY_WEEK[week] || '').catch(() => {})
    return () => { setUsageModule('').catch(() => {}) }
  }, [week])

  useEffect(() => {
    if (enterParty) {
      useGame.setState({ enterParty: false })
      navigate(loadProfile()?.assessment?.post ? '/guru' : '/assessment/post')
    }
  }, [enterParty, navigate])

  useEffect(() => {
    if (state.player.name) return
    const prof = loadProfile()
    if (prof?.name) {
      if (prof.avatar) dispatch({ type: 'SET_AVATAR', payload: prof.avatar })
      dispatch({ type: 'SET_PLAYER', payload: { name: prof.name } })
    } else {
      navigate('/avatar', { replace: true })
    }
  }, [state.player.name, navigate, dispatch])

  // Keep the Bank handoff consistent with the new six-module story. The Bank
  // engine is older than Paycheck Planet, so normalize its final card here
  // instead of letting it tell learners to skip directly to investing.
  useEffect(() => {
    const handoff = cards.find((card) => card.id === 'bkhand')
    if (!handoff || handoff.__paycheckIntegrated) return
    useGame.setState({
      cards: cards.map((card) => card.id === 'bkhand'
        ? {
            ...card,
            __paycheckIntegrated: true,
            text: 'Your bank plan is ready. Next, visit Paycheck Planet to see how taxes change a paycheck and how take-home pay should be planned before you invest.',
            buttons: (card.buttons || []).map((button) => ({ ...button, label: 'To Paycheck Planet!' })),
          }
        : card),
    })
  }, [cards])

  // The legacy Bank action initializes the old internal week 5 (Money Garden).
  // If the learner arrived there by finishing Bank and has not completed taxes,
  // immediately continue the story through public Module 5 instead. Direct
  // module/admin jumps can explicitly bypass this once so modules remain replayable.
  useEffect(() => {
    if (week !== 5) return
    const bypass = sessionStorage.getItem('tayu-bypass-tax-story-once')
    if (bypass) {
      sessionStorage.removeItem('tayu-bypass-tax-story-once')
      return
    }
    const profile = loadProfile() || {}
    const badges = profile.badges || []
    if (badges.includes('bank') && !badges.includes('tax')) {
      navigate('/tax-paycheck?from=story', { replace: true })
    }
  }, [navigate, week])

  useEffect(() => {
    initWorld()
    const jump = localStorage.getItem('tayu-jump-module')
    if (jump) {
      localStorage.removeItem('tayu-jump-module')
      // Public numbering: 5 = Paycheck Planet, 6 = Money Garden, 7 = Finale.
      if (jump === '5') {
        navigate('/tax-paycheck', { replace: true })
      } else {
        const internal = jump === '6' ? 5 : jump === '7' ? 6 : Number(jump)
        if (jump === '6' || jump === '7') sessionStorage.setItem('tayu-bypass-tax-story-once', '1')
        setTimeout(() => { try { useGame.getState().adminJumpModule(internal) } catch (e) { console.error(e) } }, 400)
      }
    }
    if (localStorage.getItem('tayu-return-from-paycheck') === '1') {
      localStorage.removeItem('tayu-return-from-paycheck')
      sessionStorage.setItem('tayu-bypass-tax-story-once', '1')
      setTimeout(() => {
        const game = useGame.getState()
        game.showLesson('Paycheck Planet complete! You planned the money that actually reaches you after taxes. Now use that same planning mindset in Module 6: Money Garden.', 'paycheck-to-garden', true)
      }, 850)
    }
    crossfadeTo('town')
    const t1 = setTimeout(() => setFaded(true), 60)
    return () => clearTimeout(t1)
  }, [initWorld, navigate])

  const onContinue = () => {
    const g = useGame.getState()
    if (g.week === 1) { g.startWeek2(); return }
    if (g.week === 2) { g.startBudget(); return }
    dispatch({ type: 'COMPLETE_MODULE1', allocation: g.allocations, badge: 'Week 3 Complete' })
    g.unlockParty()
  }

  return (
    <div className="tayu-fixed-viewport tayu-world-declutter bg-navy">
      {use3D ? <GameWorld avatar={state.avatar} /> : <AccessibleWorld />}
      <Hud playerName={state.player.name || 'friend'} onContinue={onContinue} />
      <LemonadeFocusGuide />
      <BudgetTakeawayGuard />
      <PersistentCoach />
      <PersistentImprovementCoach />
      <GuidedCommerceOverlay />
      <OverlayEscapeControls />
      {use3D && usesTouchControls && <MobileControls />}
      <FirstTimeMovementTutorial enabled={use3D} />
      <WorldModuleLearningRecap />
      <div className="pointer-events-none absolute inset-0 z-[130] bg-black transition-opacity duration-1000" style={{ opacity: faded ? 0 : 1 }} />
    </div>
  )
}
