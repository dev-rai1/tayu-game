import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameState } from '../hooks/useGameState.jsx'
import { GameWorld } from '../world/GameWorld.jsx'
import { TaxWorkbenchOverlay } from '../world/TaxWorkbenchOverlay.jsx'
import { TaxWorldInteractionBridge } from '../world/TaxWorldInteractionBridge.jsx'
import { TaxActionPrompt } from '../world/TaxActionPrompt.jsx'
import { Hud } from '../world/Hud.jsx'
import { MobileControls } from '../world/MobileControls.jsx'
import { usesTouchControls } from '../world/controlMode.js'
import { useGame, playerPos, joystick, moveTarget } from '../world/store.js'
import {
  PAYCHECK_MODE_EVENT,
  activatePaycheckWorld,
  deactivatePaycheckWorld,
  isPaycheckWorldActive,
} from '../world/paycheckMode.js'
import { loadProfile, saveProfile } from '../services/walletStore.js'
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
import { MODULE_CATALOG } from '../constants/modules.js'
import { BANK_DISTRICT, BUDGET_TOWN, LEMONADE, SPAWN, SPROUT, TAX_DISTRICT } from '../world/config.js'
import { useTaxLab } from '../world/taxLabStore.js'
import { readPhysicalModuleLaunch, placePhysicalModuleArrival } from '../world/physicalModuleLaunch.js'
import '../world/worldDeclutter.css'
import '../world/moduleEntryFixes.css'

const MODULE_BY_WEEK = { 1: 'jars', 2: 'lemonade', 3: 'budget', 4: 'bank', 5: 'garden' }
const TAX_ORIGIN_KEY = 'tayu-tax-entry-origin'
const BOND_ONLY_KEY = 'tayu-bond-only-entry'
const MODULE_JUMP_KEY = 'tayu-jump-module'
const MODULE_ENTRY_KEY = 'tayu-module-entry-intent'
const GARDEN_ENTRY_KEY = 'tayu-garden-entry-part'
let taxWorldSnapshot = null

function clearWorldMessages() {
  try {
    const game = useGame.getState()
    game.adminClearUi()
    useGame.setState({
      guide: null, actorCaption: null, banner: null, toast: null, helpOpen: false, near: null,
      playerSpeedMult: 1, playerPose: 'idle', scenarioLocked: false, weekComplete: false, pendingWeekComplete: false,
    })
  } catch (error) { console.error(error) }
}

function rememberWorldBeforeTax() {
  if (taxWorldSnapshot) return
  const state = useGame.getState()
  taxWorldSnapshot = {
    week: state.week, objective: state.objective, lemPhase: state.lemPhase, mgPhase: state.mgPhase, mg: state.mg,
    btPanel: state.btPanel, bkPanel: state.bkPanel, panelPortfolio: state.panelPortfolio, scenarioLocked: state.scenarioLocked,
    weekComplete: state.weekComplete, pendingWeekComplete: state.pendingWeekComplete, cards: state.cards, lessons: state.lessons,
    dialog: state.dialog, helpOpen: state.helpOpen, playerSpeedMult: state.playerSpeedMult, playerPose: state.playerPose,
    near: state.near, toast: state.toast, guide: state.guide, actorCaption: state.actorCaption, banner: state.banner,
  }
}

function prepareWorldForTaxWalking() {
  rememberWorldBeforeTax()
  const state = useGame.getState()
  useGame.setState({
    cards: [], lessons: [], dialog: null, toast: null, guide: null, actorCaption: null, banner: null, near: null,
    helpOpen: false, panelJar: null, panelItem: null, panelPortfolio: false, btPanel: null, bkPanel: null,
    weekComplete: false, pendingWeekComplete: false, scenarioLocked: false, lemPhase: null,
    mgPhase: state.mg ? 'tax-paused' : state.mgPhase,
    mg: state.mg ? { ...state.mg, phase: 'tax-paused' } : state.mg,
    playerSpeedMult: 1, playerPose: 'idle',
  })
  joystick.x = 0; joystick.y = 0; moveTarget.x = null; moveTarget.z = null
}

function restoreWorldAfterTax() {
  if (!taxWorldSnapshot) return
  useGame.setState({ ...taxWorldSnapshot, near: null })
  taxWorldSnapshot = null
  joystick.x = 0; joystick.y = 0; moveTarget.x = null; moveTarget.z = null
}

function enterPaycheckPlanet({ restart = false, origin = 'world' } = {}) {
  try {
    rememberWorldBeforeTax(); clearWorldMessages()
    if (restart) { saveProfile({ taxLabProgress: null, taxLab: null }); useTaxLab.getState().reset() }
    try { sessionStorage.setItem(TAX_ORIGIN_KEY, origin) } catch { /* storage can be unavailable */ }
    activatePaycheckWorld(); prepareWorldForTaxWalking()
  } catch (error) { console.error(error) }
}

function enterGardenPartB() {
  try {
    let game = useGame.getState()
    if (game.week !== 5 || !game.mg) return
    if (Number(game.mg.week || 1) < 6) { game.adminJumpWeek(6); game = useGame.getState() }
    useGame.setState((state) => ({ mg: state.mg ? { ...state.mg, partTwoStarted: true } : state.mg }))
    useGame.getState().persist()
  } catch (error) { console.error(error) }
}

function finishBankHandoffIntoGarden() {
  const game = useGame.getState(); const bank = game.bk
  if (bank) {
    const bankNow = Math.round((bank.vault + bank.savings + bank.cd + bank.checking + bank.bankAmount) * 100) / 100
    useGame.setState({ split: { pocket: bank.pocket, bank: bankNow, garden: bank.gardenReserve } })
    game.awardBadge('bank', 'BANK BUILDER'); game.persist()
  }
  game.adminClearUi(); game.startGarden()
}

function readModuleEntryIntent() {
  try {
    const explicitModule = localStorage.getItem(MODULE_JUMP_KEY)
    const gardenEntryPart = localStorage.getItem(GARDEN_ENTRY_KEY)
    const rawIntent = localStorage.getItem(MODULE_ENTRY_KEY)

    if (rawIntent) {
      try {
        const intent = JSON.parse(rawIntent)
        const moduleId = String(intent?.moduleId || explicitModule || '')
        if (moduleId) {
          return {
            moduleId,
            gardenEntryPart: intent?.gardenEntryPart || gardenEntryPart || null,
            resume: Boolean(intent?.resume),
          }
        }
      } catch { /* ignore malformed selection intent */ }
    }

    // Keep admin/deep-link jump behavior working even when it did not originate
    // from the visual module selector.
    if (explicitModule) return { moduleId: explicitModule, gardenEntryPart, resume: false }
  } catch { /* storage can be unavailable */ }
  return null
}

function moduleArrivalPoint(moduleId) {
  if (moduleId === '1') return [SPAWN[0], SPAWN[1]]
  if (moduleId === '2') return [LEMONADE[0] + 2, LEMONADE[1] + 3]
  if (moduleId === '3') return [BUDGET_TOWN[0], BUDGET_TOWN[1] + 8]
  if (moduleId === '4') return [BANK_DISTRICT[0] - 1, BANK_DISTRICT[1] - 6]
  if (moduleId === '5') return [SPROUT[0], SPROUT[1] + 10]
  if (moduleId === '6' || moduleId === '7') return [TAX_DISTRICT[0], TAX_DISTRICT[1] + 5]
  return [SPAWN[0], SPAWN[1]]
}

function teleportToModuleArrival(moduleId) {
  const point = moduleArrivalPoint(moduleId)
  try {
    const game = useGame.getState()
    if (typeof game.adminTeleport === 'function') game.adminTeleport(point)
    else { playerPos.x = point[0]; playerPos.y = 1; playerPos.z = point[1] }
  } catch {
    playerPos.x = point[0]; playerPos.y = 1; playerPos.z = point[1]
  }
  joystick.x = 0; joystick.y = 0; moveTarget.x = null; moveTarget.z = null
}

function entryMeta(entry) {
  const moduleNumber = Number(entry?.moduleId || 0)
  const card = MODULE_CATALOG.find((module) => module.n === moduleNumber)
  const part = moduleNumber === 5 && entry?.gardenEntryPart
    ? card?.parts?.find((candidate) => candidate.id === entry.gardenEntryPart)
    : null
  return {
    label: part ? part.label : `Module ${moduleNumber}`,
    title: part?.title || card?.title || 'TAYU mission',
  }
}

export default function World() {
  const navigate = useNavigate(); const { state, dispatch } = useGameState(); const [faded, setFaded] = useState(false)
  const [moduleEntry, setModuleEntry] = useState(() => readModuleEntryIntent())
  // Module jumps reset mutable 3D scene registries. Remount the Canvas after
  // every selected-module start so no frame can read actors from the old scene.
  const [worldSession, setWorldSession] = useState(0)
  const initialModuleEntry = useRef(moduleEntry)
  const [paycheckMode, setPaycheckMode] = useState(() => moduleEntry ? false : isPaycheckWorldActive())
  const initWorld = useGame((s) => s.initWorld); const enterParty = useGame((s) => s.enterParty); const week = useGame((s) => s.week)
  const cards = useGame((s) => s.cards); const mg = useGame((s) => s.mg); const taxMode = moduleEntry ? false : (paycheckMode || isPaycheckWorldActive())
  const sawBankGardenHandoff = useRef(false); const previousTaxMode = useRef(taxMode)

  useEffect(() => {
    const sync = (event) => setPaycheckMode(event?.detail?.active ?? isPaycheckWorldActive())
    sync(); window.addEventListener(PAYCHECK_MODE_EVENT, sync)
    return () => window.removeEventListener(PAYCHECK_MODE_EVENT, sync)
  }, [])

  useEffect(() => {
    setUsageModule(moduleEntry ? '' : (taxMode ? 'tax' : (MODULE_BY_WEEK[week] || ''))).catch(() => {})
    return () => { setUsageModule('').catch(() => {}) }
  }, [moduleEntry, taxMode, week])

  useEffect(() => { if (!moduleEntry && taxMode) prepareWorldForTaxWalking() }, [moduleEntry, taxMode])

  useEffect(() => {
    if (!moduleEntry) return undefined
    const blockKeyInteraction = (event) => {
      if (event.code !== 'KeyE') return
      event.preventDefault()
      event.stopImmediatePropagation()
    }
    const blockWorldInteraction = (event) => event.stopImmediatePropagation()
    window.addEventListener('keydown', blockKeyInteraction, true)
    window.addEventListener('tayu-interact', blockWorldInteraction, true)
    return () => {
      window.removeEventListener('keydown', blockKeyInteraction, true)
      window.removeEventListener('tayu-interact', blockWorldInteraction, true)
    }
  }, [moduleEntry])

  useEffect(() => {
    const wasTax = previousTaxMode.current; previousTaxMode.current = taxMode
    if (!wasTax || taxMode) return
    let origin = 'world'
    try { origin = sessionStorage.getItem(TAX_ORIGIN_KEY) || 'world'; sessionStorage.removeItem(TAX_ORIGIN_KEY) } catch { /* storage can be unavailable */ }
    if (origin === 'garden-handoff') { taxWorldSnapshot = null; const game = useGame.getState(); game.adminClearUi(); game.unlockParty(); return }
    restoreWorldAfterTax()
  }, [taxMode])

  useEffect(() => {
    if (moduleEntry || !enterParty) return
    useGame.setState({ enterParty: false })
    const taxComplete = (loadProfile()?.badges || []).includes('tax')
    if (!taxComplete) { enterPaycheckPlanet({ origin: 'garden-handoff' }); return }
    navigate(loadProfile()?.assessment?.post ? '/guru' : '/assessment/post')
  }, [enterParty, moduleEntry, navigate])

  useEffect(() => {
    if (state.player.name) return
    const prof = loadProfile()
    if (prof?.name) { if (prof.avatar) dispatch({ type: 'SET_AVATAR', payload: prof.avatar }); dispatch({ type: 'SET_PLAYER', payload: { name: prof.name } }) }
    else navigate('/avatar', { replace: true })
  }, [state.player.name, navigate, dispatch])

  useEffect(() => {
    if (moduleEntry) return
    const handoff = cards.find((card) => card.id === 'bkhand')
    if (!handoff || handoff.__moduleOrderIntegrated) return
    useGame.setState({ cards: cards.map((card) => card.id === 'bkhand' ? { ...card, __moduleOrderIntegrated: true, text: 'Your bank plan is ready. Module 5 is Money Garden. Follow the route to Mr. Sprout and begin Investing Foundations.', buttons: (card.buttons || []).map((button) => ({ ...button, label: 'Start Module 5', act: null })) } : card) })
  }, [cards, moduleEntry])

  useEffect(() => {
    if (moduleEntry) return
    const hasHandoff = cards.some((card) => card.id === 'bkhand')
    if (hasHandoff) { sawBankGardenHandoff.current = true; return }
    if (!sawBankGardenHandoff.current || taxMode) return
    sawBankGardenHandoff.current = false; finishBankHandoffIntoGarden()
  }, [cards, moduleEntry, taxMode])

  useEffect(() => {
    const entry = initialModuleEntry.current
    const gardenEntryPart = entry?.gardenEntryPart || null
    initWorld()

    // Modules 6 & 7 are physical 3D destinations. initWorld() above unconditionally
    // resets the player to SPAWN, and this parent effect runs AFTER the Bond/Tax
    // child-scene placement effects, so without this the player is stranded at the
    // world center. The generic module-entry path below never fires for 6/7, so
    // re-place deterministically at the correct district entrance right here.
    const physicalModule = readPhysicalModuleLaunch()
    if (physicalModule) {
      placePhysicalModuleArrival(physicalModule)
      crossfadeTo('town')
      const fadeTimer = setTimeout(() => setFaded(true), 60)
      // Reassert across any late init/re-render passes so nothing re-strands them.
      const reassert = [80, 200, 420, 800].map((d) =>
        setTimeout(() => placePhysicalModuleArrival(physicalModule), d),
      )
      return () => { clearTimeout(fadeTimer); reassert.forEach((t) => clearTimeout(t)) }
    }

    if (entry) {
      try {
        localStorage.removeItem(MODULE_ENTRY_KEY)
        localStorage.removeItem(MODULE_JUMP_KEY)
        localStorage.removeItem(GARDEN_ENTRY_KEY)
      } catch { /* storage can be unavailable */ }
      deactivatePaycheckWorld()
      const arrivalTimer = setTimeout(() => teleportToModuleArrival(entry.moduleId), 60)
      crossfadeTo('town')
      const fadeTimer = setTimeout(() => setFaded(true), 60)
      return () => { clearTimeout(arrivalTimer); clearTimeout(fadeTimer) }
    }

    if (gardenEntryPart) {
      try { localStorage.removeItem(GARDEN_ENTRY_KEY) } catch { /* storage can be unavailable */ }
      if (gardenEntryPart === 'B') setTimeout(enterGardenPartB, 120)
    }
    crossfadeTo('town'); const t1 = setTimeout(() => setFaded(true), 60); return () => clearTimeout(t1)
  }, [initWorld])

  const startSelectedModule = () => {
    const entry = moduleEntry
    if (!entry) return
    const { moduleId, gardenEntryPart, resume } = entry

    if (resume) {
      if (moduleId === '5' && gardenEntryPart === 'B') setTimeout(enterGardenPartB, 0)
      setModuleEntry(null)
      return
    }

    clearWorldMessages()
    if (moduleId === '6' || moduleId === '7') {
      try {
        if (moduleId === '6') sessionStorage.setItem(BOND_ONLY_KEY, '1')
        else sessionStorage.removeItem(BOND_ONLY_KEY)
      } catch { /* storage can be unavailable */ }
      enterPaycheckPlanet({ restart: moduleId === '7', origin: 'module-select' })
    } else {
      deactivatePaycheckWorld()
      const internal = moduleId === '5' ? 5 : Number(moduleId)
      if (moduleId === '5') {
        try { sessionStorage.setItem('tayu-bypass-tax-story-once', '1') } catch { /* storage can be unavailable */ }
      }
      try {
        useGame.getState().adminJumpModule(internal, false)
        if (moduleId === '5' && gardenEntryPart === 'B') setTimeout(enterGardenPartB, 80)
      } catch (error) { console.error(error) }
    }
    setWorldSession((session) => session + 1)
    setModuleEntry(null)
  }

  const onContinue = () => { const g = useGame.getState(); if (g.week === 1) { g.startWeek2(); return } if (g.week === 2) { g.startBudget(); return } dispatch({ type: 'COMPLETE_MODULE1', allocation: g.allocations, badge: 'Week 3 Complete' }); g.unlockParty() }
  const gardenPartB = week === 5 && (Boolean(mg?.partTwoStarted) || Number(mg?.week || 1) > 6)
  const publicModule = week === 5 ? `5${gardenPartB ? 'B' : 'A'}` : String(week)
  const publicModuleTitle = week === 5 ? (gardenPartB ? 'Money Garden · Markets, Risk & Patience' : 'Money Garden · Investing Foundations') : ''
  const arrival = entryMeta(moduleEntry)

  return (
    <div className="tayu-fixed-viewport tayu-world-declutter bg-navy" data-tax-mode={taxMode ? 'true' : 'false'} data-world-mode="3d">
      <GameWorld key={worldSession} avatar={state.avatar} />
      {!moduleEntry && taxMode && <TaxWorldInteractionBridge />}
      {!moduleEntry && taxMode && <TaxWorkbenchOverlay />}
      {!moduleEntry && taxMode && <TaxActionPrompt />}
      {!moduleEntry && <Hud playerName={state.player.name || 'friend'} onContinue={onContinue} />}
      {!moduleEntry && !taxMode && <JarPlanCoach />}
      {!moduleEntry && !taxMode && <LemonadeCompletionCheck onContinue={onContinue} />}
      {!moduleEntry && !taxMode && <PersistentCoach key="world-coach" />}
      {!moduleEntry && !taxMode && <PersistentImprovementCoach />}
      {!moduleEntry && !taxMode && <GuidedCommerceOverlay />}
      {!moduleEntry && !taxMode && <OverlayEscapeControls />}
      {!moduleEntry && !taxMode && week === 5 && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-[210] w-[min(92vw,32rem)] -translate-x-1/2 rounded-2xl border border-white/25 bg-navy/92 px-4 py-2 text-center shadow-xl backdrop-blur-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#FFB27D]">Module {publicModule} · Investing sequence</div>
          <div className="text-base font-extrabold text-white">{publicModuleTitle}</div>
          <div className="text-xs font-bold text-white/80">{gardenPartB ? 'Purple theme = Module 5B' : 'Green theme = Module 5A'}</div>
        </div>
      )}
      {!moduleEntry && usesTouchControls && <MobileControls />}
      {!moduleEntry && <FirstTimeMovementTutorial enabled={!taxMode} />}
      {!moduleEntry && !taxMode && <WorldModuleLearningRecap />}
      {!moduleEntry && <AdminPanel />}

      {moduleEntry && (
        <div className="absolute inset-0 z-[1200] flex items-end justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="module-entry-title">
          <section className="w-full max-w-xl rounded-[2rem] border-2 border-white/30 bg-navy/95 p-5 text-center text-white shadow-2xl backdrop-blur-md sm:p-6">
            <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-sun">{arrival.label} · You’re here</div>
            <h1 id="module-entry-title" className="mt-2 font-display text-3xl font-extrabold">{arrival.title}</h1>
            <p className="mx-auto mt-3 max-w-md text-sm font-bold leading-relaxed text-white/85">
              You’ve been teleported to this module first. Nothing in the module starts or appears until you choose {moduleEntry.resume ? 'Resume' : 'Start'} below.
            </p>
            <button type="button" onClick={startSelectedModule} autoFocus className="mt-5 min-h-[56px] w-full rounded-2xl bg-sun px-5 text-lg font-extrabold text-navy shadow-lg transition hover:-translate-y-0.5 active:translate-y-0">
              {moduleEntry.resume ? `Resume ${arrival.label}` : `Start ${arrival.label}`} →
            </button>
            <button type="button" onClick={() => navigate('/modules')} className="mt-3 min-h-[44px] w-full rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-extrabold text-white">
              Back to module selection
            </button>
          </section>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 z-[130] bg-black transition-opacity duration-1000" style={{ opacity: faded ? 0 : 1 }} />
    </div>
  )
}