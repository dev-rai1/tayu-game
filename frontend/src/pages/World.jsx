import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameState } from '../hooks/useGameState.jsx'
import { GameWorld } from '../world/GameWorld.jsx'
import { Hud } from '../world/Hud.jsx'
import { MobileControls } from '../world/MobileControls.jsx'
import { usesTouchControls } from '../world/controlMode.js'
import { useGame } from '../world/store.js'
import { TAX_ENTRY } from '../world/ModuleLandmarks.jsx'
import {
  PAYCHECK_MODE_EVENT,
  activatePaycheckWorld,
  deactivatePaycheckWorld,
  isPaycheckWorldActive,
} from '../world/paycheckMode.js'
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
import { hasWebGL } from '../utils/webgl.js'
import '../world/worldDeclutter.css'

// The original world still uses five internal chapter numbers. Public Module 5
// (Paycheck Planet) runs physically inside the same world between internal
// Bank (4) and Money Garden (5), instead of navigating to a separate page.
const MODULE_BY_WEEK = { 1: 'jars', 2: 'lemonade', 3: 'budget', 4: 'bank', 5: 'garden' }

function moveToPaycheckPlanet() {
  setTimeout(() => {
    try {
      const game = useGame.getState()
      game.adminClearUi()
      game.adminTeleport(TAX_ENTRY)
    } catch (error) {
      console.error(error)
    }
  }, 350)
}

export default function World() {
  const navigate = useNavigate()
  const { state, dispatch } = useGameState()
  const [faded, setFaded] = useState(false)
  const [paycheckMode, setPaycheckMode] = useState(() => isPaycheckWorldActive())
  const initWorld = useGame((s) => s.initWorld)
  const enterParty = useGame((s) => s.enterParty)
  const week = useGame((s) => s.week)
  const cards = useGame((s) => s.cards)
  const [use3D] = useState(hasWebGL)

  useEffect(() => {
    const sync = (event) => setPaycheckMode(event?.detail?.active ?? isPaycheckWorldActive())
    sync()
    window.addEventListener(PAYCHECK_MODE_EVENT, sync)
    return () => window.removeEventListener(PAYCHECK_MODE_EVENT, sync)
  }, [])

  useEffect(() => {
    setUsageModule(paycheckMode ? 'tax' : (MODULE_BY_WEEK[week] || '')).catch(() => {})
    return () => { setUsageModule('').catch(() => {}) }
  }, [paycheckMode, week])

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

  // The Bank engine predates Paycheck Planet. Keep its final story beat, but
  // send the learner to the physical Paycheck Planet district in this world.
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

  // Finishing Bank still initializes the legacy internal Money Garden chapter.
  // Intercept that handoff once and physically move the learner to Module 5.
  useEffect(() => {
    if (week !== 5 || paycheckMode) return
    const bypass = sessionStorage.getItem('tayu-bypass-tax-story-once')
    if (bypass) {
      sessionStorage.removeItem('tayu-bypass-tax-story-once')
      return
    }
    const profile = loadProfile() || {}
    const badges = profile.badges || []
    if (badges.includes('bank') && !badges.includes('tax')) {
      activatePaycheckWorld()
      moveToPaycheckPlanet()
    }
  }, [paycheckMode, week])

  useEffect(() => {
    initWorld()
    const jump = localStorage.getItem('tayu-jump-module')
    if (jump) {
      localStorage.removeItem('tayu-jump-module')
      // Public numbering: 5 = in-world Paycheck Planet, 6 = internal Money Garden.
      if (jump === '5') {
        activatePaycheckWorld()
        moveToPaycheckPlanet()
      } else {
        // Leaving/replaying another module must also leave Paycheck mode so its
        // stations and prompts cannot leak into the other world chapters.
        deactivatePaycheckWorld()
        const internal = jump === '6' ? 5 : jump === '7' ? 6 : Number(jump)
        if (jump === '6' || jump === '7') sessionStorage.setItem('tayu-bypass-tax-story-once', '1')
        setTimeout(() => { try { useGame.getState().adminJumpModule(internal) } catch (e) { console.error(e) } }, 400)
      }
    }
    crossfadeTo('town')
    const t1 = setTimeout(() => setFaded(true), 60)
    return () => clearTimeout(t1)
  }, [initWorld])

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
      {!paycheckMode && <LemonadeFocusGuide />}
      {!paycheckMode && <BudgetTakeawayGuard />}
      {!paycheckMode && <PersistentCoach />}
      {!paycheckMode && <PersistentImprovementCoach />}
      {!paycheckMode && <GuidedCommerceOverlay />}
      <OverlayEscapeControls />
      {paycheckMode && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-[210] w-[min(92vw,34rem)] -translate-x-1/2 rounded-2xl border border-[#FF8A3D]/60 bg-navy/90 px-4 py-2 text-center shadow-xl backdrop-blur-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#FFB27D]">Module 5 · Paycheck Planet</div>
          <div className="text-sm font-extrabold text-white">Stay in the world and walk to the glowing stations.</div>
        </div>
      )}
      {use3D && usesTouchControls && <MobileControls />}
      <FirstTimeMovementTutorial enabled={use3D} />
      <div className="pointer-events-none absolute inset-0 z-[130] bg-black transition-opacity duration-1000" style={{ opacity: faded ? 0 : 1 }} />
    </div>
  )
}
