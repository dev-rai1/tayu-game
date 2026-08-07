import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameState } from '../hooks/useGameState.jsx'
import { GameWorld } from '../world/GameWorld.jsx'
import { TaxLabWorld } from '../world/TaxLabWorld.jsx'
import { Hud } from '../world/Hud.jsx'
import { MobileControls } from '../world/MobileControls.jsx'
import { usesTouchControls } from '../world/controlMode.js'
import { TAX_DISTRICT } from '../world/config.js'
import { useGame } from '../world/store.js'
import {
  PAYCHECK_MODE_EVENT,
  activatePaycheckWorld,
  deactivatePaycheckWorld,
  isPaycheckWorldActive,
} from '../world/paycheckMode.js'
import { loadProfile, saveProfile } from '../services/walletStore.js'
import { crossfadeTo } from '../services/audio.js'
import { setUsageModule } from '../services/usageAnalytics.js'
import { AccessibleWorld } from '../world/AccessibleWorld.jsx'
import { PersistentCoach } from '../world/PersistentCoach.jsx'
import { PersistentImprovementCoach } from '../world/PersistentImprovementCoach.jsx'
import { GuidedCommerceOverlay } from '../world/GuidedCommerceOverlay.jsx'
import { FirstTimeMovementTutorial } from '../world/FirstTimeMovementTutorial.jsx'
import { OverlayEscapeControls } from '../world/OverlayEscapeControls.jsx'
import { WorldModuleLearningRecap } from '../components/ModuleLearningRecap.jsx'
import { LemonadeCompletionCheck } from '../components/LemonadeCompletionCheck.jsx'
import { AdminPanel } from '../components/AdminPanel.jsx'
import { hasWebGL } from '../utils/webgl.js'
import '../world/worldDeclutter.css'
import '../world/moduleEntryFixes.css'

// The original world still uses five internal chapter numbers. Public Module 5
// (Paycheck Planet · Tax Filing Lab) runs between internal Bank (4) and Money
// Garden (5), but now gets its own isolated scene while the activity is active.
const MODULE_BY_WEEK = { 1: 'jars', 2: 'lemonade', 3: 'budget', 4: 'bank', 5: 'garden' }
const PAYCHECK_START = [TAX_DISTRICT[0], TAX_DISTRICT[1] + 3.3]

function clearWorldMessages() {
  try {
    const game = useGame.getState()
    game.adminClearUi()
    useGame.setState({
      guide: null,
      actorCaption: null,
      banner: null,
      toast: null,
      helpOpen: false,
      near: null,
    })
  } catch (error) {
    console.error(error)
  }
}

function enterPaycheckPlanet({ restart = false } = {}) {
  try {
    clearWorldMessages()
    if (restart) {
      // "Explore this module" always means start the activity from step 1.
      saveProfile({ taxLabProgress: null, taxLab: null })
    }
    const game = useGame.getState()
    game.adminTeleport(PAYCHECK_START)
    activatePaycheckWorld()
  } catch (error) {
    console.error(error)
  }
}

function enterGardenPartB() {
  try {
    let game = useGame.getState()
    if (game.week !== 5 || !game.mg) return
    if (Number(game.mg.week || 1) < 6) {
      game.adminJumpWeek(6)
      game = useGame.getState()
    }
    useGame.setState((state) => ({
      mg: state.mg ? { ...state.mg, partTwoStarted: true } : state.mg,
    }))
    useGame.getState().persist()
  } catch (error) {
    console.error(error)
  }
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
  const mg = useGame((s) => s.mg)
  const [use3D] = useState(hasWebGL)
  const taxMode = paycheckMode || isPaycheckWorldActive()

  useEffect(() => {
    const sync = (event) => setPaycheckMode(event?.detail?.active ?? isPaycheckWorldActive())
    sync()
    window.addEventListener(PAYCHECK_MODE_EVENT, sync)
    return () => window.removeEventListener(PAYCHECK_MODE_EVENT, sync)
  }, [])

  useEffect(() => {
    setUsageModule(taxMode ? 'tax' : (MODULE_BY_WEEK[week] || '')).catch(() => {})
    return () => { setUsageModule('').catch(() => {}) }
  }, [taxMode, week])

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

  useEffect(() => {
    const handoff = cards.find((card) => card.id === 'bkhand')
    if (!handoff || handoff.__paycheckIntegrated) return
    useGame.setState({
      cards: cards.map((card) => card.id === 'bkhand'
        ? {
            ...card,
            __paycheckIntegrated: true,
            text: 'Your bank plan is ready. Next is the Tax Filing Lab: scan a W-2, work through the tax math, and file a practice return.',
            buttons: (card.buttons || []).map((button) => ({ ...button, label: 'Start Module 5' })),
          }
        : card),
    })
  }, [cards])

  useEffect(() => {
    if (week !== 5 || taxMode) return
    const bypass = sessionStorage.getItem('tayu-bypass-tax-story-once')
    if (bypass) {
      sessionStorage.removeItem('tayu-bypass-tax-story-once')
      return
    }
    const profile = loadProfile() || {}
    const badges = profile.badges || []
    if (badges.includes('bank') && !badges.includes('tax')) enterPaycheckPlanet()
  }, [taxMode, week])

  useEffect(() => {
    initWorld()
    const jump = localStorage.getItem('tayu-jump-module')
    const gardenEntryPart = localStorage.getItem('tayu-garden-entry-part')
    if (gardenEntryPart) localStorage.removeItem('tayu-garden-entry-part')

    if (jump) {
      localStorage.removeItem('tayu-jump-module')
      clearWorldMessages()
      if (jump === '5') {
        enterPaycheckPlanet({ restart: true })
      } else {
        deactivatePaycheckWorld()
        const internal = jump === '6' ? 5 : jump === '7' ? 6 : Number(jump)
        if (jump === '6' || jump === '7') sessionStorage.setItem('tayu-bypass-tax-story-once', '1')
        setTimeout(() => {
          try {
            useGame.getState().adminJumpModule(internal, false)
            if (jump === '6' && gardenEntryPart === 'B') setTimeout(enterGardenPartB, 80)
          } catch (e) {
            console.error(e)
          }
        }, 400)
      }
    } else if (gardenEntryPart === 'B') {
      setTimeout(enterGardenPartB, 120)
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

  const gardenPartB = week === 5 && (Boolean(mg?.partTwoStarted) || Number(mg?.week || 1) > 6)
  const publicModule = week === 5 ? `6${gardenPartB ? 'B' : 'A'}` : String(week)
  const publicModuleTitle = week === 5
    ? gardenPartB
      ? 'Money Garden · Markets, Risk & Patience'
      : 'Money Garden · Investing Foundations'
    : ''

  return (
    <div className="tayu-fixed-viewport tayu-world-declutter bg-navy" data-tax-mode={taxMode ? 'true' : 'false'}>
      {use3D
        ? taxMode
          ? <TaxLabWorld />
          : <GameWorld avatar={state.avatar} />
        : <AccessibleWorld />}

      {/* Module 5 is a focused minigame. Nothing from the normal world UI is
          allowed to render over it: no HUD/map, generic coach, admin panel,
          movement controls, completion cards, or side-hint rail. */}
      {!taxMode && <Hud playerName={state.player.name || 'friend'} onContinue={onContinue} />}
      {!taxMode && <LemonadeCompletionCheck onContinue={onContinue} />}
      {!taxMode && <PersistentCoach key="world-coach" />}
      {!taxMode && <PersistentImprovementCoach />}
      {!taxMode && <GuidedCommerceOverlay />}
      {!taxMode && <OverlayEscapeControls />}

      {!taxMode && week === 5 && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-[210] w-[min(92vw,32rem)] -translate-x-1/2 rounded-2xl border border-white/25 bg-navy/92 px-4 py-2 text-center shadow-xl backdrop-blur-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#FFB27D]">Module {publicModule} · Investing finale</div>
          <div className="text-base font-extrabold text-white">{publicModuleTitle}</div>
          <div className="text-xs font-bold text-white/80">{gardenPartB ? 'Purple theme = Module 6B' : 'Green theme = Module 6A'}</div>
        </div>
      )}

      {use3D && usesTouchControls && !taxMode && <MobileControls />}
      <FirstTimeMovementTutorial enabled={use3D && !taxMode} />
      {!taxMode && <WorldModuleLearningRecap />}
      {!taxMode && <AdminPanel />}
      <div className="pointer-events-none absolute inset-0 z-[130] bg-black transition-opacity duration-1000" style={{ opacity: faded ? 0 : 1 }} />
    </div>
  )
}
