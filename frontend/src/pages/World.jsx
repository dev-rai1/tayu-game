import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameState } from '../hooks/useGameState.jsx'
import { GameWorld } from '../world/GameWorld.jsx'
import { BondStreetOverlay } from '../world/BondStreetOverlay.jsx'
import { BondStreetInteractionBridge, BondActionPrompt } from '../world/BondStreetInteractionBridge.jsx'
import { TaxWorkbenchOverlay } from '../world/TaxWorkbenchOverlay.jsx'
import { TaxWorldInteractionBridge } from '../world/TaxWorldInteractionBridge.jsx'
import { TaxActionPrompt } from '../world/TaxActionPrompt.jsx'
import { Hud } from '../world/Hud.jsx'
import { MobileControls } from '../world/MobileControls.jsx'
import { usesTouchControls } from '../world/controlMode.js'
import { useGame, playerPos, joystick, moveTarget } from '../world/store.js'
import {
  BOND_MODE_EVENT,
  activateBondStreet,
  deactivateBondStreet,
  isBondStreetActive,
} from '../world/bondMode.js'
import {
  PAYCHECK_MODE_EVENT,
  activatePaycheckWorld,
  deactivatePaycheckWorld,
  isPaycheckWorldActive,
} from '../world/paycheckMode.js'
import { useBondStreet } from '../world/bondStreetStore.js'
import { loadProfile, loadWallet, saveProfile } from '../services/walletStore.js'
import { crossfadeTo } from '../services/audio.js'
import { setUsageModule } from '../services/usageAnalytics.js'
import { PersistentCoach } from '../world/PersistentCoach.jsx'
import { PersistentImprovementCoach } from '../world/PersistentImprovementCoach.jsx'
import { GuidedCommerceOverlay } from '../world/GuidedCommerceOverlay.jsx'
import { FirstTimeMovementTutorial } from '../world/FirstTimeMovementTutorial.jsx'
import { OverlayEscapeControls } from '../world/OverlayEscapeControls.jsx'
import { JarPlanCoach } from '../world/JarPlanCoach.jsx'
import { WorldModuleLearningRecap } from '../components/ModuleLearningRecap.jsx'
import { LemonadeCompletionCheck } from '../components/LemonadeCompletionCheck.jsx'
import { AdminPanel } from '../components/AdminPanel.jsx'
import { useTaxLab } from '../world/taxLabStore.js'
import '../world/worldDeclutter.css'
import '../world/moduleEntryFixes.css'

const MODULE_BY_WEEK = { 1: 'jars', 2: 'lemonade', 3: 'budget', 4: 'bank', 5: 'garden' }
const TAX_ORIGIN_KEY = 'tayu-tax-entry-origin'
const BOND_ORIGIN_KEY = 'tayu-bond-entry-origin'
let externalWorldSnapshot = null

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
      playerSpeedMult: 1,
      playerPose: 'idle',
      scenarioLocked: false,
      weekComplete: false,
      pendingWeekComplete: false,
    })
  } catch (error) {
    console.error(error)
  }
}

function rememberWorldBeforeExternalModule() {
  if (externalWorldSnapshot) return
  const state = useGame.getState()
  externalWorldSnapshot = {
    week: state.week,
    objective: state.objective,
    lemPhase: state.lemPhase,
    mgPhase: state.mgPhase,
    mg: state.mg,
    btPanel: state.btPanel,
    bkPanel: state.bkPanel,
    panelPortfolio: state.panelPortfolio,
    scenarioLocked: state.scenarioLocked,
    weekComplete: state.weekComplete,
    pendingWeekComplete: state.pendingWeekComplete,
    cards: state.cards,
    lessons: state.lessons,
    dialog: state.dialog,
    helpOpen: state.helpOpen,
    playerSpeedMult: state.playerSpeedMult,
    playerPose: state.playerPose,
    near: state.near,
    toast: state.toast,
    guide: state.guide,
    actorCaption: state.actorCaption,
    banner: state.banner,
  }
}

function prepareWorldForExternalWalking() {
  rememberWorldBeforeExternalModule()
  const state = useGame.getState()
  useGame.setState({
    cards: [],
    lessons: [],
    dialog: null,
    toast: null,
    guide: null,
    actorCaption: null,
    banner: null,
    near: null,
    helpOpen: false,
    panelJar: null,
    panelItem: null,
    panelPortfolio: false,
    btPanel: null,
    bkPanel: null,
    weekComplete: false,
    pendingWeekComplete: false,
    scenarioLocked: false,
    lemPhase: null,
    mgPhase: state.mg ? 'external-paused' : state.mgPhase,
    mg: state.mg ? { ...state.mg, phase: 'external-paused' } : state.mg,
    playerSpeedMult: 1,
    playerPose: 'idle',
  })
  joystick.x = 0
  joystick.y = 0
  moveTarget.x = null
  moveTarget.z = null
}

function restoreWorldAfterExternalModule() {
  if (!externalWorldSnapshot) return
  useGame.setState({ ...externalWorldSnapshot, near: null })
  externalWorldSnapshot = null
  joystick.x = 0
  joystick.y = 0
  moveTarget.x = null
  moveTarget.z = null
}

function currentGardenStake() {
  try {
    const game = useGame.getState()
    if (game.mg) return Math.max(12, Math.round(game.mgTotal()))
  } catch { /* use persisted fallbacks */ }
  const wallet = loadWallet()
  const saved = wallet?.mg
  if (saved?.companies) {
    const companyValue = Object.values(saved.companies).reduce((sum, company) => sum + Number(company?.owned || 0) * Number(company?.price || 0), 0)
    return Math.max(12, Math.round(Number(saved.pocket || 0) + Number(saved.bank || 0) + Number(saved.cash || 0) + companyValue))
  }
  return Math.max(12, Math.round(Number(wallet?.lemCum || 30)))
}

function enterBondStreet({ restart = false, origin = 'world' } = {}) {
  try {
    rememberWorldBeforeExternalModule()
    clearWorldMessages()
    if (restart) useBondStreet.getState().reset()
    try { sessionStorage.setItem(BOND_ORIGIN_KEY, origin) } catch { /* storage can be unavailable */ }
    useBondStreet.getState().begin(currentGardenStake())
    activateBondStreet()
    prepareWorldForExternalWalking()
  } catch (error) {
    console.error(error)
  }
}

function enterPaycheckPlanet({ restart = false, origin = 'world' } = {}) {
  try {
    rememberWorldBeforeExternalModule()
    clearWorldMessages()
    if (restart) {
      saveProfile({ taxLabProgress: null, taxLab: null })
      useTaxLab.getState().reset()
    }
    try { sessionStorage.setItem(TAX_ORIGIN_KEY, origin) } catch { /* storage can be unavailable */ }
    activatePaycheckWorld()
    prepareWorldForExternalWalking()
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
    useGame.setState((state) => ({ mg: state.mg ? { ...state.mg, partTwoStarted: true } : state.mg }))
    useGame.getState().persist()
  } catch (error) {
    console.error(error)
  }
}

function finishBankHandoffIntoGarden() {
  const game = useGame.getState()
  const bank = game.bk
  if (bank) {
    const bankNow = Math.round((bank.vault + bank.savings + bank.cd + bank.checking + bank.bankAmount) * 100) / 100
    useGame.setState({ split: { pocket: bank.pocket, bank: bankNow, garden: bank.gardenReserve } })
    game.awardBadge('bank', 'BANK BUILDER')
    game.persist()
  }
  game.adminClearUi()
  game.startGarden()
}

export default function World() {
  const navigate = useNavigate()
  const { state, dispatch } = useGameState()
  const [faded, setFaded] = useState(false)
  const [bondModeState, setBondModeState] = useState(() => isBondStreetActive())
  const [paycheckMode, setPaycheckMode] = useState(() => isPaycheckWorldActive())
  const initWorld = useGame((s) => s.initWorld)
  const enterParty = useGame((s) => s.enterParty)
  const week = useGame((s) => s.week)
  const cards = useGame((s) => s.cards)
  const mg = useGame((s) => s.mg)
  const bondMode = bondModeState || isBondStreetActive()
  const taxMode = paycheckMode || isPaycheckWorldActive()
  const externalMode = bondMode || taxMode
  const sawBankGardenHandoff = useRef(false)
  const previousTaxMode = useRef(taxMode)

  useEffect(() => {
    const sync = (event) => setBondModeState(event?.detail?.active ?? isBondStreetActive())
    sync()
    window.addEventListener(BOND_MODE_EVENT, sync)
    return () => window.removeEventListener(BOND_MODE_EVENT, sync)
  }, [])

  useEffect(() => {
    const sync = (event) => setPaycheckMode(event?.detail?.active ?? isPaycheckWorldActive())
    sync()
    window.addEventListener(PAYCHECK_MODE_EVENT, sync)
    return () => window.removeEventListener(PAYCHECK_MODE_EVENT, sync)
  }, [])

  useEffect(() => {
    setUsageModule(bondMode ? 'bond' : taxMode ? 'tax' : (MODULE_BY_WEEK[week] || '')).catch(() => {})
    return () => { setUsageModule('').catch(() => {}) }
  }, [bondMode, taxMode, week])

  useEffect(() => {
    if (externalMode) prepareWorldForExternalWalking()
  }, [externalMode])

  useEffect(() => {
    const wasTax = previousTaxMode.current
    previousTaxMode.current = taxMode
    if (!wasTax || taxMode) return

    let origin = 'world'
    try {
      origin = sessionStorage.getItem(TAX_ORIGIN_KEY) || 'world'
      sessionStorage.removeItem(TAX_ORIGIN_KEY)
    } catch { /* storage can be unavailable */ }

    if (origin === 'garden-handoff' || origin === 'bond-handoff') {
      externalWorldSnapshot = null
      const game = useGame.getState()
      game.adminClearUi()
      game.unlockParty()
      return
    }
    restoreWorldAfterExternalModule()
  }, [taxMode])

  useEffect(() => {
    if (!enterParty) return
    useGame.setState({ enterParty: false })
    const badges = loadProfile()?.badges || []
    if (!badges.includes('bond')) {
      enterBondStreet({ origin: 'garden-handoff' })
      return
    }
    if (!badges.includes('tax')) {
      enterPaycheckPlanet({ origin: 'bond-handoff' })
      return
    }
    navigate(loadProfile()?.assessment?.post ? '/guru' : '/assessment/post')
  }, [enterParty, navigate])

  useEffect(() => {
    if (state.player.name) return
    const prof = loadProfile()
    if (prof?.name) {
      if (prof.avatar) dispatch({ type: 'SET_AVATAR', payload: prof.avatar })
      dispatch({ type: 'SET_PLAYER', payload: { name: prof.name } })
    } else navigate('/avatar', { replace: true })
  }, [state.player.name, navigate, dispatch])

  useEffect(() => {
    const handoff = cards.find((card) => card.id === 'bkhand')
    if (!handoff || handoff.__moduleOrderIntegrated) return
    useGame.setState({
      cards: cards.map((card) => card.id === 'bkhand'
        ? {
            ...card,
            __moduleOrderIntegrated: true,
            text: 'Your bank plan is ready. Module 5 is Money Garden. Follow the route to Mr. Sprout and begin Investing Foundations.',
            buttons: (card.buttons || []).map((button) => ({ ...button, label: 'Start Module 5', act: null })),
          }
        : card),
    })
  }, [cards])

  useEffect(() => {
    const hasHandoff = cards.some((card) => card.id === 'bkhand')
    if (hasHandoff) {
      sawBankGardenHandoff.current = true
      return
    }
    if (!sawBankGardenHandoff.current || externalMode) return
    sawBankGardenHandoff.current = false
    finishBankHandoffIntoGarden()
  }, [cards, externalMode])

  useEffect(() => {
    const jump = localStorage.getItem('tayu-jump-module')
    const preservedExternalPosition = ['6', '7'].includes(jump)
      ? { x: playerPos.x, y: playerPos.y, z: playerPos.z }
      : null
    const gardenEntryPart = localStorage.getItem('tayu-garden-entry-part')

    initWorld()

    if (preservedExternalPosition) {
      playerPos.x = preservedExternalPosition.x
      playerPos.y = preservedExternalPosition.y
      playerPos.z = preservedExternalPosition.z
      joystick.x = 0
      joystick.y = 0
      moveTarget.x = null
      moveTarget.z = null
    }

    if (gardenEntryPart) localStorage.removeItem('tayu-garden-entry-part')
    if (jump) {
      localStorage.removeItem('tayu-jump-module')
      clearWorldMessages()
      if (jump === '6') {
        deactivatePaycheckWorld()
        enterBondStreet({ restart: true, origin: 'module-select' })
      } else if (jump === '7') {
        deactivateBondStreet()
        enterPaycheckPlanet({ restart: true, origin: 'module-select' })
      } else {
        deactivateBondStreet()
        deactivatePaycheckWorld()
        const internal = jump === '5' ? 5 : Number(jump)
        if (jump === '5') sessionStorage.setItem('tayu-bypass-tax-story-once', '1')
        setTimeout(() => {
          try {
            useGame.getState().adminJumpModule(internal, false)
            if (jump === '5' && gardenEntryPart === 'B') setTimeout(enterGardenPartB, 80)
          } catch (e) {
            console.error(e)
          }
        }, 400)
      }
    } else if (gardenEntryPart === 'B') setTimeout(enterGardenPartB, 120)

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
  const publicModule = week === 5 ? `5${gardenPartB ? 'B' : 'A'}` : String(week)
  const publicModuleTitle = week === 5
    ? gardenPartB ? 'Money Garden · Markets, Risk & Patience' : 'Money Garden · Investing Foundations'
    : ''

  return (
    <div className="tayu-fixed-viewport tayu-world-declutter bg-navy" data-bond-mode={bondMode ? 'true' : 'false'} data-tax-mode={taxMode ? 'true' : 'false'} data-world-mode="3d">
      <GameWorld avatar={state.avatar} />

      {bondMode && <BondStreetInteractionBridge />}
      {bondMode && <BondStreetOverlay onFinish={() => { deactivateBondStreet(); enterPaycheckPlanet({ origin: 'bond-handoff' }) }} />}
      {bondMode && <BondActionPrompt />}

      {taxMode && <TaxWorldInteractionBridge />}
      {taxMode && <TaxWorkbenchOverlay />}
      {taxMode && <TaxActionPrompt />}

      <Hud playerName={state.player.name || 'friend'} onContinue={onContinue} />
      {!externalMode && <JarPlanCoach />}
      {!externalMode && <LemonadeCompletionCheck onContinue={onContinue} />}
      {!externalMode && <PersistentCoach key="world-coach" />}
      {!externalMode && <PersistentImprovementCoach />}
      {!externalMode && <GuidedCommerceOverlay />}
      {!externalMode && <OverlayEscapeControls />}

      {!externalMode && week === 5 && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-[210] w-[min(92vw,32rem)] -translate-x-1/2 rounded-2xl border border-white/25 bg-navy/92 px-4 py-2 text-center shadow-xl backdrop-blur-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#FFB27D]">Module {publicModule} · Investing sequence</div>
          <div className="text-base font-extrabold text-white">{publicModuleTitle}</div>
          <div className="text-xs font-bold text-white/80">{gardenPartB ? 'Purple theme = Module 5B' : 'Green theme = Module 5A'}</div>
        </div>
      )}

      {usesTouchControls && <MobileControls />}
      <FirstTimeMovementTutorial enabled={!externalMode} />
      {!externalMode && <WorldModuleLearningRecap />}
      {!externalMode && <AdminPanel />}
      <div className="pointer-events-none absolute inset-0 z-[130] bg-black transition-opacity duration-1000" style={{ opacity: faded ? 0 : 1 }} />
    </div>
  )
}
