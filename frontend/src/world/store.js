import { create } from 'zustand'
import { SPAWN, STORE_ITEMS, JARS, LEMONADE, SPROUT, MAILBOX } from './config.js'
import { JAR_SCENARIOS, checkAllocation } from '../scenarios/jarScenario.js'
import { evaluateBasket, DAY_LESSON, cartFeedback } from '../scenarios/storeMission.js'
import { playConsequence, playDayScene } from '../scenarios/scenes.js'
import {
  BUNDLES, PROFIT_GOAL, QUALITY, SIGNS, EVENTS, DEFAULT_HOURS, DEFAULT_WAGE_RATE,
  simulateSales, nextTip, rollEvent, FEATURE_QUEUE, FEATURE_CARDS,
  INTRO_LINE, TAX_LINE, PRICE_FORMULA_CARDS, CASHOUT_LINE, BANKRUPTCY_LINE,
  POOL_LINES, SAVE_DIALOG_START, SAVE_DIALOG_END,
} from '../scenarios/lemonade.js'
import {
  COMPANIES, COMPANY_IDS, tick, scriptedMove, guardFloor, fill,
} from '../scenarios/moneyGarden.js'
import {
  OPENING, weekSpec, TOTAL_WEEKS, SURPRISE_BILL,
  BANK_DRIP_MIN, GOAL_RATE, COMPLETION_LINE, BRIDGE_LINE,
} from '../scenarios/marketScenarios.js'
import { DAY_INTRO, STOPS, NEXT_STOP_TOAST, GROCERY_ITEMS, DAY_SUMMARY, RENT_COST, BUS_COST, CLINIC_COST, FUN_COST, SPLIT_CONFIRM, CARRY_PROMPT, CARRY_BANK_DONE, CARRY_GARDEN_DONE, EMERGENCY_INTRO, EMERGENCY_EVENT, EMERGENCY_PRAISE, EMERGENCY_REPLAY, HANDOFF, defaultSplit } from '../scenarios/budgetTown.js'
import { npcFirstLine, SHARED_SECOND } from '../scenarios/npcLines.js'
import { BK, DEBIT_ITEM, CARD_PURCHASE, CARD_MIN_PAY, SAVINGS_DING, CD_DING, TRUST_NAMED, BK_HANDOFF, BK_OPEN, TRUST_MAX } from '../scenarios/bankModule.js'
import { BUDGET_TOWN, BANK_DISTRICT, PARTY_HOUSE, btWorld } from './config.js'
import { playTimeline, clearTimelines } from '../anim/timeline.js'
import { resetStage, stage, NPC_HOME } from '../anim/stage.js'
import { allNpcsHome, npcWalkTo, npcEmote, placeNpc, npcHome, sparkleBurst, npcPose, npcSay, npcFace } from '../anim/worldActions.js'
import { loadWallet, saveWallet, clearWallet, saveProfile, loadProfile } from '../services/walletStore.js'
import { cameraRig } from './cameraRig.js'

// Module-level mutable refs for per-frame data (position, joystick, click target).
export const playerPos = { x: SPAWN[0], y: 1, z: SPAWN[1] }
export const joystick = { x: 0, y: 0 }
export const moveTarget = { x: null, z: null }

const ALLOWANCE = 30
const MONEY_FLOOR = 4 // global safety net (G4): below this, quietly top up
const itemById = (id) => STORE_ITEMS.find((i) => i.id === id)
const r2 = (n) => Math.round(n * 100) / 100
const fmtMoney = (n) => (Math.round(n * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })

let guideTimer, bannerTimer, tintTimer, glowTimer

export const useGame = create((set, get) => ({
  wallet: 0,
  allocations: { spend: 0, save: 0, give: 0 },
  week: 1,
  objective: 'mailbox',
  mailboxOpened: false,
  near: null,
  panelJar: null,
  toast: null,
  coinBatches: [],
  weekComplete: false,
  pendingWeekComplete: false, // G2/C7: summary waits until the message queue drains
  clickMarker: null,

  // ONE-AT-A-TIME message discipline (G2). `lessons` = simple tap-to-dismiss
  // cards; `cards` = decision cards with buttons (the module-3 bottom sheet).
  // Rendering priority (strictly one visible): dialog → cards → lessons.
  lessons: [],
  lessonSeen: {},
  cards: [],

  // jar scenario machine (Week 1)
  scenario: null,
  scenarioIndex: 0,
  scenarioState: 'IDLE',
  scenarioLocked: false,
  attempt: 0,
  jarGhost: false,

  // market mission (Week 1)
  dialog: null,
  panelItem: null,
  bought: [],
  bramTalked: false, // C3: buying is LOCKED until the Mr. Bram talk is done
  storeMissionDone: false,
  storeAttempt: 0,
  storeGhost: false,

  // Week 2 - lemonade (ONE money pool = allocations.save; comment 28)
  lemPhase: null, // recap|toStand|toMarket|supplies|pool|toStand2|template|selling|recapCard|results|goalCard|tipCard|done
  lemRound: 1,
  lemBundle: null,
  lemHours: DEFAULT_HOURS,
  lemPrice: null, // A3: the price input starts EMPTY - the formula finds the number
  lemQuality: QUALITY[0],
  lemSign: SIGNS[0],
  lemWageRate: DEFAULT_WAGE_RATE, // $ per hour you pay yourself (modest by design)
  lemEvent: EVENTS[0],
  lemPerfect: false, // G6: scenarios + extras unlock after the first perfect week
  lemFeatures: 0, // how many of FEATURE_QUEUE are live (quality, sign, events)
  lemSnapshot: null, // Part F: start-of-week checkpoint for the bankruptcy rewind
  lemLedger: null, // the player's own stand numbers - Budget Town W1 reuses them
  lemResult: null,
  lemCumProfit: 0,
  lemPoolSeen: false,
  lemHistory: [],
  lemTipHistory: [], // Feedback Variety Engine memory (D3)
  lemTip: null,

  // Week 3 - Mr. Sprout's Money Garden (Part F)
  mg: null, // v5: { week, phase, pocket, cash, bank, companies, goal, ... }
  mgPhase: null, // toGarden | rounds | summary | done
  split: null, // Round 8: { pocket, bank, garden } - decided ONCE in Budget Town
  bt: null, // MODULE 3 Budget Town v3: { beat, income, split, seen, snapshot }
  btPanel: null, // which Budget Board panel is open (the week number)
  bk: null, // MODULE 5 Bank of TAYU: { week, cash, vault, savings, checking, trust, ... }
  bkPanel: null,
  gameComplete: false, // Part J: all stages finished - the party house is open
  adminHideArrows: false, // Part 0: presenter toggle - hides all guidance arrows
  enterParty: false, // set by the door interaction; World navigates and clears it
  mgHighlight: null, // company id whose storefront glows for the current beat
  panelPortfolio: false, // the always-accessible Portfolio Panel (E-II.3)

  // FX
  helpOpen: false, // E2: the '?' help card
  guide: null,
  banner: null,
  tint: null,
  sunKey: 0,
  hudShakeKey: 0,
  jarGlow: null,
  playerSpeedMult: 1,
  playerPose: 'idle',

  setNear: (near) => {
    const cur = get().near
    if ((cur?.id ?? null) !== (near?.id ?? null)) set({ near })
  },
  setClickMarker: (m) => set({ clickMarker: m }),
  setHelpOpen: (v) => set({ helpOpen: v }),

  persist: () => {
    const s = get()
    saveWallet({
      spend: s.allocations.spend, save: s.allocations.save, give: s.allocations.give,
      week: s.week, lemCum: s.lemCumProfit, mg: s.mg, bt: s.bt, bk: s.bk, split: s.split, guru: s.gameComplete,
    })
  },

  // ---- SEQUENTIAL MESSAGES (G2) ----
  showLesson: (text, onceKey = null, soft = false, learn = null) => {
    const s = get()
    if (onceKey) {
      if (s.lessonSeen[onceKey]) return
      set({ lessonSeen: { ...s.lessonSeen, [onceKey]: true } })
    }
    set((x) => ({ lessons: [...x.lessons, { id: Date.now() + Math.random(), text, soft, learn }] }))
  },
  dismissLesson: () => {
    set((s) => ({ lessons: s.lessons.slice(1) }))
    const s = get()
    if (s.lessons.length === 0 && s.cards.length === 0 && s.pendingWeekComplete) {
      set({ pendingWeekComplete: false, weekComplete: true, objective: 'done' })
      get().persist()
    }
  },
  pushCards: (cs) => set((x) => ({ cards: [...x.cards, ...cs] })),
  // A card button was tapped: pop the card, then run its action.
  cardAct: (act) => {
    set((s) => ({ cards: s.cards.slice(1) }))
    if (!act) return
    if (act.startsWith('bt.')) get().btAct(act)
    else if (act.startsWith('bk.')) get().bkAct(act)
    else get().mgAct(act)
  },

  // ---- BANK / ALLOWANCE (Week 1) ----
  openMailbox: () => {
    if (get().mailboxOpened) return
    // v9 M1: coins BURST from the mailbox and arc to the child - a real event
    set((x) => ({
      mailboxOpened: true, wallet: ALLOWANCE, objective: 'kitchen',
      toast: 'You got your weekly allowance! +$30',
      coinBatches: [...x.coinBatches, { id: `allow-${Date.now() % 100000}`, from: { x: MAILBOX[0], y: 1.6, z: MAILBOX[1] }, to: { x: playerPos.x, y: 1.2, z: playerPos.z }, count: 8 }],
    }))
    sparkleBurst([MAILBOX[0], MAILBOX[1]], 2, 14)
    get().hudShake()
    setTimeout(() => set((s) => (s.toast?.includes('allowance') ? { toast: null } : {})), 2600)
    get().startScenario(get().scenarioIndex)
  },

  startScenario: (i) => {
    const sc = JAR_SCENARIOS[i] || JAR_SCENARIOS[0]
    set({
      scenario: sc, scenarioIndex: i, scenarioState: 'INTRO', attempt: 0, jarGhost: false,
      allocations: { spend: 0, save: 0, give: 0 }, wallet: ALLOWANCE,
      dialog: { name: 'Penny', lines: sc.intro, index: 0, onClose: () => set({ scenarioState: 'ALLOCATING' }) },
    })
  },

  openPanel: (jar) => { if (get().scenarioState === 'ALLOCATING') set({ panelJar: jar }) },
  closePanel: () => set({ panelJar: null }),

  allocate: (jar, amt, jarWorldPos) => {
    const s = get()
    const remaining = s.wallet
    const give = Math.max(0, Math.min(amt, remaining))
    if (give <= 0) { set({ panelJar: null }); return }
    const id = `${jar}-${s.allocations[jar]}-${Date.now() % 100000}`
    const batch = { id, from: { x: playerPos.x, y: 1.2, z: playerPos.z }, to: { x: jarWorldPos[0], y: 1.4, z: jarWorldPos[2] }, count: Math.max(3, Math.min(8, give)) }
    set({
      wallet: remaining - give,
      allocations: { ...s.allocations, [jar]: s.allocations[jar] + give },
      panelJar: null,
      coinBatches: [...s.coinBatches, batch],
    })
    get().persist()
    const JAR_LESSONS = {
      spend: 'SPEND money is for things you need and enjoy now.',
      save: 'SAVE money waits safely so you can afford bigger things later!',
      give: 'GIVE money helps friends, neighbors, and animals!',
    }
    get().showLesson(JAR_LESSONS[jar], `jar-${jar}`, false, 'jars')
    // v9 must-fix 7: the watching neighbors REACT to each choice (the little
    // audience that makes the decision feel like it matters)
    const FAN = { spend: 'theo', save: 'penny', give: 'mia' }
    const SYMBOL = { spend: '🎈', save: '⭐', give: '💜' }
    const CHEER = {
      spend: ['Fun money! Enjoy it!', 'Ooh, what will you get?'],
      save: ['Smart! Future-you says thanks.', 'Saving! That is the good stuff.'],
      give: ['So kind! The shelter cheers!', 'Giving! You are the best.'],
    }
    const fan = FAN[jar]
    const actor = stage.actors[fan]
    if (actor) {
      // R12 5.1: the fan WALKS UP to that jar and acts it out (Mia receives
      // from the GIVE jar, Penny pats the SAVE jar, Theo cheers the SPEND)
      npcWalkTo(fan, [jarWorldPos[0], jarWorldPos[2] + 1.2], {
        face: true, emote: SYMBOL[jar], pose: 'dance2',
        onArrive: () => {
          npcSay(fan, CHEER[jar][(s.allocations[jar] > 0 ? 1 : 0) % CHEER[jar].length], 2.6)
          setTimeout(() => npcHome(fan), 2200)
        },
      })
    }
    if (remaining - give === 0) setTimeout(() => get().evaluateJars(), 700)
  },

  evaluateJars: () => {
    const s = get()
    if (s.scenarioState !== 'ALLOCATING' || s.wallet !== 0) return
    const res = checkAllocation(s.allocations, s.scenario)
    set({ scenarioState: 'ACTING_OUT', scenarioLocked: true, panelJar: null, near: null })
    const ctx = { hint: res.hint, recap: s.scenario.recap(s.allocations) }
    playConsequence(res.scene, ctx, () => {
      allNpcsHome()
      if (res.ok) {
        set({ scenarioState: 'SUCCESS' })
        get().showLesson('See that? You did not put everything in one jar. That is DIVERSIFICATION: spreading your money so you are ready for everything!', 'diversify-jars')
        setTimeout(() => get().enterStore(), 900)
      } else {
        get().resetJarsAnim()
        const attempt = s.attempt + 1
        set({ attempt, jarGhost: attempt >= 2, scenarioState: 'ALLOCATING', scenarioLocked: false })
      }
    })
  },

  resetJarsAnim: () => {
    const s = get()
    const batches = []
    for (const [jar, amt] of Object.entries(s.allocations)) {
      if (amt > 0) {
        const p = JARS[jar]
        batches.push({ id: `back-${jar}-${Date.now() % 100000}`, from: { x: p[0], y: 1.4, z: p[1] }, to: { x: playerPos.x, y: 1.2, z: playerPos.z }, count: Math.max(3, Math.min(8, amt)) })
      }
    }
    set({ allocations: { spend: 0, save: 0, give: 0 }, wallet: ALLOWANCE, coinBatches: [...s.coinBatches, ...batches] })
    get().persist()
  },

  // ---- MARKET (Week 1) - allocation first, then Mr. Bram, THEN buying (C3) ----
  enterStore: () => {
    if (get().tint) get().clearTint()
    set({
      objective: 'store', bought: [], bramTalked: false, storeMissionDone: false, storeAttempt: 0, storeGhost: false,
      scenarioState: 'IDLE', scenarioLocked: false, playerSpeedMult: 1, playerPose: 'idle',
      toast: 'Nice budgeting! Now go talk to Mr. Bram at the MARKET. Follow your arrow.',
    })
    setTimeout(() => set((s) => (s.toast?.includes('Mr. Bram') ? { toast: null } : {})), 3800)
  },

  setBramTalked: () => {
    if (get().bramTalked) return
    set({ bramTalked: true, toast: 'Now you can shop! Pick one healthy drink and one healthy food.' })
    setTimeout(() => set((s) => (s.toast?.includes('healthy drink') ? { toast: null } : {})), 3600)
  },

  openDialog: (name, lines, onClose = null) => set({ dialog: { name, lines, index: 0, onClose } }),
  advanceDialog: () => {
    const s = get()
    if (!s.dialog) return
    if (s.dialog.index + 1 >= s.dialog.lines.length) {
      const cb = s.dialog.onClose
      set({ dialog: null })
      cb?.()
    } else {
      set({ dialog: { ...s.dialog, index: s.dialog.index + 1 } })
    }
  },
  closeDialog: () => { const cb = get().dialog?.onClose; set({ dialog: null }); cb?.() },

  openItem: (item) => set({ panelItem: item }),
  closeItem: () => set({ panelItem: null }),

  buyItem: (item) => {
    const s = get()
    if (!s.bramTalked) { set({ panelItem: null }); return } // hard gate (C3)
    if (s.bought.includes(item.id)) { set({ panelItem: null }); return }
    const spendJar = s.allocations.spend
    if (spendJar < item.price) {
      set({ panelItem: null, toast: `That costs $${item.price}, but your SPEND jar only has $${spendJar}.` })
      setTimeout(() => set((x) => (x.toast?.includes('SPEND jar only') ? { toast: null } : {})), 2600)
      return
    }
    const batch = { id: `buy-${item.id}-${Date.now() % 100000}`, from: { x: playerPos.x, y: 1.2, z: playerPos.z }, to: { x: playerPos.x, y: 0.4, z: playerPos.z - 0.5 }, count: Math.max(2, Math.ceil(item.price / 2)) }
    set({
      allocations: { ...s.allocations, spend: spendJar - item.price },
      bought: [...s.bought, item.id],
      panelItem: null,
      coinBatches: [...s.coinBatches, batch],
    })
    get().persist()
  },

  confirmCheckout: () => {
    const s = get()
    if (s.scenarioLocked) return
    const basket = s.bought.map(itemById).filter(Boolean)
    const res = evaluateBasket(basket, s.allocations.spend)
    const hasWant = basket.some((i) => i.type === 'want')
    set({ scenarioLocked: true, panelItem: null, dialog: null, near: null })
    playDayScene(res.scene, { lesson: DAY_LESSON[res.scene], hasWant }, () => {
      get().setPlayerSpeed(1); get().setPlayerPose('idle'); get().clearTint()
      if (res.ok) {
        get().finishWeek1()
      } else {
        // C6: friendly restart - one sequential message, then retry
        const refund = basket.reduce((sum, i) => sum + i.price, 0)
        const storeAttempt = s.storeAttempt + 1
        set((x) => ({
          bought: [], storeAttempt, storeGhost: storeAttempt >= 2, scenarioLocked: false,
          allocations: { ...x.allocations, spend: x.allocations.spend + refund },
        }))
        get().persist()
        // G1/G2: nudge the PRINCIPLE with the child's ACTUAL cart - never a shopping list
        get().showLesson(cartFeedback(basket))
      }
    })
  },

  // C7: tell the player the leftover became SAVINGS - and only after that
  // message is dismissed does the summary appear (pendingWeekComplete).
  finishWeek1: () => {
    const s = get()
    const leftover = s.allocations.spend
    if (leftover > 0) {
      const batch = {
        id: `rollover-${Date.now() % 100000}`,
        from: { x: JARS.spend[0], y: 1.4, z: JARS.spend[1] },
        to: { x: JARS.save[0], y: 1.4, z: JARS.save[1] },
        count: Math.max(3, Math.min(8, leftover)),
      }
      set((x) => ({
        allocations: { ...x.allocations, spend: 0, save: x.allocations.save + leftover },
        coinBatches: [...x.coinBatches, batch],
        jarGlow: 'save',
      }))
    }
    set({ storeMissionDone: true, scenarioLocked: false, pendingWeekComplete: true })
    get().awardBadge('jars', 'JAR MASTER')
    get().persist()
    get().showLesson(leftover > 0
      ? `Nice! The $${leftover} you did not spend went into your Savings! Money you keep becomes savings.`
      : 'Nice shopping! Your jars are ready for next week.', null, false, 'needswants')
  },

  // ---- WEEK 2: THE LEMONADE STAND v4 (Round 5, Parts A + G) ----
  startWeek2: () => {
    const s = get()
    const pool = r2(s.allocations.save + s.allocations.spend)
    set({
      week: 2, objective: 'lemonade', weekComplete: false, pendingWeekComplete: false, lemPhase: 'recap',
      allocations: { ...s.allocations, save: pool, spend: 0 },
      lemRound: 1, lemBundle: null, lemHours: DEFAULT_HOURS, lemPrice: null, lemResult: null,
      lemQuality: QUALITY[0], lemSign: SIGNS[0], lemWageRate: DEFAULT_WAGE_RATE, lemEvent: EVENTS[0],
      lemPerfect: false, lemFeatures: 0, lemCumProfit: 0, lemPoolSeen: false, lemHistory: [], lemTipHistory: [],
      bought: [], storeMissionDone: false, wallet: 0, scenarioState: 'IDLE', scenarioLocked: false,
      banner: null, guide: null, toast: null,
    })
    // E9: Penny is the Module 2 host - she moves to the stand and tends it
    const pa = stage.actors.penny
    pa.homeX = LEMONADE[0] + 1.9; pa.homeZ = LEMONADE[1] + 0.4
    pa.x = pa.tx = pa.homeX; pa.z = pa.tz = pa.homeZ; pa.moving = false
    // v9: the jar audience moves on - Theo and Mia enjoy the lakeside park
    for (const [who, spot] of [['theo', [24, 5.6]], ['mia', [27, 5.8]]]) {
      const a = stage.actors[who]
      if (a) { a.homeX = spot[0]; a.homeZ = spot[1]; a.x = a.tx = spot[0]; a.z = a.tz = spot[1]; a.moving = false }
    }
    get().snapshotLemWeek()
    get().persist()
  },
  recapDone: () => {
    set({ lemPhase: 'toStand', toast: 'Follow your arrow to the LEMONADE STAND.' })
    get().showLesson(SAVE_DIALOG_START, 'lem-save-concept', false, 'jars')
    setTimeout(() => set((s) => (s.toast?.includes('LEMONADE') ? { toast: null } : {})), 3600)
  },
  // G1: Penny (the Module 2 host) states the budget, the goal, and the
  // CORRECTED tax rule (A1) - no price-demand "law" anywhere (A2).
  standIntro: () => {
    const pool = fmtMoney(get().allocations.save)
    get().openDialog('Penny', [
      INTRO_LINE(pool),
      TAX_LINE,
      'Each week: buy supplies from Mr. Bham, set your plan at the stand, and sell. I will tell you exactly what to fix each week!',
    ], () => {
      set({ lemPhase: 'toMarket' })
    })
  },
  // Part F: the start-of-week checkpoint. Everything the rewind restores.
  snapshotLemWeek: () => {
    const s = get()
    set({
      lemSnapshot: {
        save: s.allocations.save, spend: s.allocations.spend,
        round: s.lemRound, event: s.lemEvent, perfect: s.lemPerfect, features: s.lemFeatures,
        cum: s.lemCumProfit,
      },
    })
  },
  openSupplies: () => {
    // Part F: intercept BEFORE the player is stranded - if the pool cannot
    // fund even the smallest supplies, this week rewinds.
    if (get().allocations.save < BUNDLES[0].cost) { get().bankruptcyRewind('lemonade'); return }
    set({ lemPhase: 'supplies' })
  },
  chooseBundle: (id) => {
    const s = get()
    const b = BUNDLES.find((x) => x.id === id)
    if (!b || s.allocations.save < b.cost) return
    set((x) => ({
      allocations: { ...x.allocations, save: r2(x.allocations.save - b.cost) },
      lemBundle: b, lemPhase: 'toStand2',
      coinBatches: [...x.coinBatches, { id: `sup-${Date.now() % 100000}`, from: { x: playerPos.x, y: 1.2, z: playerPos.z }, to: { x: playerPos.x, y: 0.4, z: playerPos.z - 0.5 }, count: 5 }],
    }))
    get().persist()
  },
  openTemplate: () => {
    const s = get()
    if (!s.lemBundle) return
    set({ lemPhase: 'template' })
    // A3/G2: the price formula appears BEFORE the first price decision
    if (!s.lessonSeen['price-formula']) get().showFormula(true)
  },
  // The advisor's price-formula cards - re-openable from the stand any week.
  showFormula: (once = false) => {
    if (once) {
      if (get().lessonSeen['price-formula']) return
      set((x) => ({ lessonSeen: { ...x.lessonSeen, 'price-formula': true } }))
    }
    get().showLesson(PRICE_FORMULA_CARDS[0], null, false, 'business')
    get().showLesson(PRICE_FORMULA_CARDS[1], null, false, 'business')
  },
  setLemPrice: (p) => set({ lemPrice: p === null ? null : r2(Math.max(0.25, Math.min(3, p))) }),
  setLemHours: (h) => set({ lemHours: h }),
  setLemQuality: (id) => set({ lemQuality: QUALITY.find((q) => q.id === id) || QUALITY[0] }),
  setLemSign: (id) => set({ lemSign: SIGNS.find((g) => g.id === id) || SIGNS[0] }),
  setLemWageRate: (w) => set({ lemWageRate: w }),
  confirmPrice: () => {
    const s = get()
    if (!s.lemBundle || s.lemPhase !== 'template' || s.lemPrice === null) return
    // G6: the pool-party scenario waits for the first perfect week
    if (s.lemPerfect && !s.lemPoolSeen) { set({ lemPhase: 'pool' }); return }
    get().startSellDay()
  },
  poolChoice: (choice) => {
    set({ lemPoolSeen: true })
    if (choice === 'work') {
      get().showLesson(POOL_LINES.work)
      npcWalkTo('theo', [playerPos.x + 2, playerPos.z + 1], { emote: '🏊', face: true, onArrive: () => npcHome('theo') })
      get().startSellDay()
    } else {
      set({ lemPhase: 'selling', scenarioLocked: true, near: null })
      get().setTint('#7fb6d8', 2000)
      playTimeline([
        { at: 0, run: () => npcWalkTo('theo', [LEMONADE[0] + 3, LEMONADE[1] + 3], { emote: '🏊', face: true }) },
        { at: 1200, run: () => npcEmote('player', '🏊', 4) },
        { at: 2600, run: () => get().setToast('The stand sat empty all day. $0 earned.'), hold: 1400 },
      ], () => {
        npcHome('theo')
        get().clearTint()
        get().showLesson(POOL_LINES.pool)
        set({ lemPhase: 'toStand2', scenarioLocked: false })
      })
    }
  },
  // A lively selling day - customers stream in and the decision visibly plays
  // out before any numbers appear.
  startSellDay: () => {
    const s = get()
    set({ lemPhase: 'selling', scenarioLocked: true, near: null })
    // recipe extras + sign are paid up front (less-sugar REFUNDS a little)
    const extras = r2(s.lemQuality.addPerCup * s.lemBundle.cups + s.lemSign.cost)
    if (extras !== 0) set((x) => ({ allocations: { ...x.allocations, save: r2(x.allocations.save - extras) } }))
    const levers = { price: s.lemPrice, hours: s.lemHours, bundle: s.lemBundle, quality: s.lemQuality, sign: s.lemSign, wageRate: s.lemWageRate }
    const sim = simulateSales(levers, s.lemEvent)
    const [sx, sz] = LEMONADE
    const front = [sx, sz + 1.8]
    placeNpc('theo', [sx + 7, sz + 4])
    placeNpc('mia', [sx - 7, sz + 4])
    const happy = sim.fraction >= 0.55
    const beats = [
      { at: 0, run: () => npcWalkTo('theo', front, { emote: '🍋', face: true }) },
      { at: 1200, run: () => { sparkleBurst(front, 1.4, 8); set((x) => ({ coinBatches: [...x.coinBatches, { id: `c1-${Date.now() % 100000}`, from: { x: front[0] + 1, y: 1, z: front[1] }, to: { x: sx, y: 1.1, z: sz }, count: 3 }] })) } },
      { at: 1900, run: () => npcWalkTo('mia', [front[0] - 1, front[1]], happy ? { emote: '🍋', face: true } : { emote: '😤', face: true, onArrive: () => npcWalkTo('mia', [sx - 8, sz + 5]) }) },
      { at: 2900, run: () => { if (happy) { sparkleBurst([sx, sz], 1.6, 10); set((x) => ({ coinBatches: [...x.coinBatches, { id: `c2-${Date.now() % 100000}`, from: { x: front[0] - 1, y: 1, z: front[1] }, to: { x: sx, y: 1.1, z: sz }, count: 3 }] })) } else get().setToast('Some customers looked, then walked on this week.') } },
      { at: 4200, run: () => { if (sim.sold > 0) { sparkleBurst([sx, sz], 1.5, 8); set((x) => ({ coinBatches: [...x.coinBatches, { id: `c3-${Date.now() % 100000}`, from: { x: front[0], y: 1, z: front[1] }, to: { x: sx, y: 1.1, z: sz }, count: 4 }] })) } } },
      // Town Tax ritual - ON PROFIT (A1), one coin to the town tin
      { at: 5200, run: () => { if (sim.tax > 0) { set((x) => ({ coinBatches: [...x.coinBatches, { id: `tax-${Date.now() % 100000}`, from: { x: sx, y: 1.2, z: sz }, to: { x: sx - 2.2, y: 0.6, z: sz - 1 }, count: 2 }] })); get().setToast(`Town Tax paid: $${sim.tax.toFixed(2)} (10% of your PROFIT)`) } } },
      { at: 6000, run: () => { npcHome('theo'); npcHome('mia') }, hold: 400 },
    ]
    playTimeline(beats, () => {
      // after-tax sales flow into the ONE pool (costs were paid up front)
      set((x) => ({
        allocations: { ...x.allocations, save: r2(x.allocations.save + sim.revenue - sim.tax) },
        lemResult: { ...sim, price: s.lemPrice, round: x.lemRound, bundle: s.lemBundle, quality: s.lemQuality, sign: s.lemSign, wageRate: s.lemWageRate, event: s.lemEvent },
        lemCumProfit: Math.max(0, r2(x.lemCumProfit + sim.keep)),
        lemHistory: [...x.lemHistory, { round: x.lemRound, sold: sim.sold, price: s.lemPrice, keep: sim.keep }],
        lemPhase: 'recapCard', scenarioLocked: false,
      }))
      get().persist()
    })
  },
  setToast: (t) => {
    set({ toast: t })
    setTimeout(() => set((x) => (x.toast === t ? { toast: null } : {})), 3000)
  },
  // The calm sequential end-of-week flow - one card at a time, exact order.
  lemNext: () => {
    const s = get()
    if (s.lemPhase === 'recapCard') { set({ lemPhase: 'results' }); return }
    if (s.lemPhase === 'results') { set({ lemPhase: 'goalCard' }); return }
    if (s.lemPhase === 'goalCard') {
      const r = s.lemResult
      const levers = { price: r.price, hours: r.hours, bundle: r.bundle || BUNDLES[1], quality: r.quality || QUALITY[0], sign: r.sign || SIGNS[0], wageRate: r.wageRate ?? DEFAULT_WAGE_RATE }
      const tip = nextTip(r, levers, r.event || EVENTS[0], s.lemFeatures, s.lemTipHistory)
      set((x) => ({
        lemPhase: 'tipCard', lemTip: tip.text,
        lemTipHistory: [...x.lemTipHistory, { lever: tip.lever }],
        lemPerfect: x.lemPerfect || tip.perfect, // G6: the gate opens here
      }))
      return
    }
    if (s.lemPhase === 'tipCard') { get().afterRound(); return }
  },
  afterRound: () => {
    const s = get()
    if (s.lemCumProfit >= PROFIT_GOAL) {
      // G7: the CASH-OUT bridge - the same dollars flow into the Money Garden
      const r = s.lemResult
      set({
        lemPhase: 'done', pendingWeekComplete: true,
        lemLedger: r ? { revenue: r.revenue, supplies: r.supplies, wages: r.wages, profit: r.profit, tax: r.tax, keep: r.keep } : null,
      })
      get().setBanner('LEMONADE TYCOON!', 3200)
      get().showLesson(CASHOUT_LINE(fmtMoney(s.lemCumProfit)))
      get().persist()
      return
    }
    const nextRound = s.lemRound + 1
    // G6: after the first perfect week, ONE new thing per week
    let features = s.lemFeatures
    let featureCard = null
    if (s.lemPerfect && features < FEATURE_QUEUE.length) {
      featureCard = FEATURE_CARDS[FEATURE_QUEUE[features]]
      features += 1
    }
    const ev = rollEvent(features >= 3, s.lemEvent?.id)
    set({
      lemRound: nextRound, lemBundle: null, lemResult: null, lemPhase: 'supplies',
      lemEvent: ev, lemFeatures: features,
    })
    get().snapshotLemWeek()
    if (featureCard) get().showLesson(featureCard)
    if (features >= 3) get().showLesson(`TOWN NEWS: ${ev.line}`)
    // Part F: never stranded - if supplies are unaffordable, rewind fires now
    if (get().allocations.save < BUNDLES[0].cost) get().bankruptcyRewind('lemonade')
  },

  // ---- PART F: THE UNIVERSAL BANKRUPTCY-REWIND ----
  // It is IMPOSSIBLE to be stuck at $0 anywhere: when money cannot fund the
  // next required action, one friendly card shows and THIS WEEK ONLY rewinds
  // to its start-of-week snapshot. Wired into Lemonade, Garden, Budget, Bank.
  bankruptcyRewind: (module) => {
    const s = get()
    get().showLesson(BANKRUPTCY_LINE)
    if (module === 'lemonade' && s.lemSnapshot) {
      const snap = s.lemSnapshot
      set((x) => ({
        allocations: { ...x.allocations, save: snap.save, spend: snap.spend },
        lemRound: snap.round, lemEvent: snap.event, lemPerfect: snap.perfect,
        lemFeatures: snap.features, lemCumProfit: snap.cum,
        lemBundle: null, lemResult: null, lemPhase: 'supplies',
      }))
    } else if (module === 'garden' && s.mg?.snapshot) {
      const snap = s.mg.snapshot
      set((x) => ({ mg: { ...x.mg, ...snap, snapshot: snap, phase: 'scenario' } }))
    } else if (module === 'budget' && s.bt?.snapshot) {
      const snap = s.bt.snapshot
      set((x) => ({ bt: { ...x.bt, ...snap, snapshot: snap } }))
    } else if (module === 'bank' && s.bk?.snapshot) {
      const snap = s.bk.snapshot
      set((x) => ({ bk: { ...x.bk, ...snap, snapshot: snap } }))
    }
    get().persist()
  },

  // ---- MODULE 5: THE MONEY GARDEN v6 (Round 8, Part 4) - INVESTING LAST ----
  // The garden now closes the story: the child arrives with the GARDEN piece
  // of their Budget Town split (pocket and bank already decided - no slider
  // here), learns HOW to choose companies via the seed pie, then runs the
  // guided weekly lessons. Honest ~+40% goal on the garden money.
  startGarden: (savedMg = null) => {
    const s0 = get()
    const fresh = () => {
      const companies = {}
      for (const id of COMPANY_IDS) companies[id] = { price: COMPANIES[id].base, owned: 0, history: [COMPANIES[id].base], paid: 0, nbought: 0 }
      const sp = s0.split || defaultSplit(Math.max(10, Math.round(s0.allocations.save)))
      const pool = Math.max(6, r2(sp.garden))
      return {
        week: 1, phase: 'opening', pocket: r2(sp.pocket), cash: pool, bank: r2(sp.bank), companies, buys: [],
        goal: r2(sp.pocket + sp.bank) + Math.max(pool + 6, Math.round(pool * GOAL_RATE)), startTotal: pool,
        ctx: null, fx: {}, snapshot: null, extra: null, hintIdx: 0,
        weekActions: { bought: {}, sold: {}, cashout: false },
        weekLog: [], seen: {},
      }
    }
    const valid = savedMg && savedMg.companies && savedMg.goal
    // Penny goes back to the village square once her module wraps
    const pa = stage.actors.penny
    pa.homeX = NPC_HOME.penny[0]; pa.homeZ = NPC_HOME.penny[1]
    pa.x = pa.tx = pa.homeX; pa.z = pa.tz = pa.homeZ; pa.moving = false
    set({
      week: 5, objective: 'sprout', weekComplete: false, pendingWeekComplete: false,
      mg: valid ? savedMg : fresh(),
      mgPhase: 'toGarden', mgHighlight: null, cards: [], panelPortfolio: false,
      lemPhase: null, scenarioLocked: false, banner: null, guide: null,
      toast: 'THE MONEY GARDEN is open! Follow your arrow to Mr. Sprout.',
    })
    get().persist()
    setTimeout(() => set((s) => (s.toast?.includes('Money Garden') ? { toast: null } : {})), 4200)
  },

  // E on Mr. Sprout - ALWAYS responds. During a decision he re-explains the
  // current lesson (the host rule, E9).
  enterGarden: () => {
    const s = get()
    if (s.mgPhase === 'done') return
    set({ mgPhase: 'rounds' })
    const m = s.mg
    if (!m.seen.intro) {
      set((x) => ({ mg: { ...x.mg, seen: { ...x.mg.seen, intro: true } } }))
      get().pushCards([
        { id: 'o0', speaker: 'Mr. Sprout', text: OPENING[0], buttons: [{ label: 'Next', act: null }] },
        { id: 'o1', speaker: 'Mr. Sprout', text: OPENING[1], buttons: [{ label: 'Next', act: null }] },
        { id: 'o2', speaker: 'Mr. Sprout', text: OPENING[2], buttons: [{ label: 'Plant my seeds!', act: 'wk.new' }] },
      ])
    } else if (m.phase === 'adjust' || m.phase === 'slider') {
      const spec = weekSpec(m.week)
      get().pushCards([{ id: 're', speaker: 'Mr. Sprout', text: spec.intro, buttons: [{ label: 'Got it', act: null }] }])
    } else {
      get().pushCards([{ id: 'resume', speaker: 'Mr. Sprout', text: `Welcome back, gardener! Week ${m.week} awaits.`, buttons: [{ label: 'Continue', act: 'wk.new' }] }])
    }
  },

  mgTotal: () => {
    const m = get().mg
    if (!m) return 0
    let v = (m.pocket || 0) + m.cash + (m.bank || 0)
    for (const id of COMPANY_IDS) v += m.companies[id].owned * m.companies[id].price
    return Math.round(v * 100) / 100
  },

  // ---- Portfolio actions (adjust phase; pocket and Bank Sprout included) ----
  openPortfolio: () => { if (['adjust'].includes(get().mg?.phase)) set({ panelPortfolio: true }) },
  closePortfolio: () => set({ panelPortfolio: false }),
  pfBuy: (id) => {
    const m = get().mg
    const price = m.companies[id].price
    if (m.phase !== 'adjust' || m.cash < price) return
    set((x) => ({
      mg: {
        ...x.mg, cash: r2(x.mg.cash - price),
        companies: { ...x.mg.companies, [id]: { ...x.mg.companies[id], owned: x.mg.companies[id].owned + 1, paid: x.mg.companies[id].paid + price, nbought: x.mg.companies[id].nbought + 1 } },
        buys: [...x.mg.buys, { c: id, price, week: x.mg.week }],
        weekActions: { ...x.mg.weekActions, bought: { ...x.mg.weekActions.bought, [id]: (x.mg.weekActions.bought[id] || 0) + 1 } },
      },
    }))
    sparkleBurst([SPROUT[0] + COMPANIES[id].pos[0], SPROUT[1] + COMPANIES[id].pos[1]], 1.4, 6)
    get().persist()
  },
  pfSell: (id) => {
    const m = get().mg
    const price = m.companies[id].price
    if (m.phase !== 'adjust' || m.companies[id].owned <= 0) return
    set((x) => ({
      mg: {
        ...x.mg, cash: r2(x.mg.cash + price),
        companies: { ...x.mg.companies, [id]: { ...x.mg.companies[id], owned: x.mg.companies[id].owned - 1 } },
        weekActions: { ...x.mg.weekActions, sold: { ...x.mg.weekActions.sold, [id]: (x.mg.weekActions.sold[id] || 0) + 1 } },
      },
    }))
    get().persist()
  },
  // H3: the Bank Sprout row - deposit/withdraw whole dollars, quietly earns.
  pfBank: (delta) => {
    const m = get().mg
    if (m.phase !== 'adjust') return
    if (delta > 0 && m.cash < delta) return
    if (delta < 0 && m.bank < -delta) return
    set((x) => ({ mg: { ...x.mg, cash: r2(x.mg.cash - delta), bank: r2(x.mg.bank + delta) } }))
    get().persist()
  },
  pfPocket: (delta) => {
    const m = get().mg
    if (m.phase !== 'adjust') return
    if (delta > 0 && m.cash < delta) return
    if (delta < 0 && m.pocket < -delta) return
    set((x) => ({ mg: { ...x.mg, cash: r2(x.mg.cash - delta), pocket: r2(x.mg.pocket + delta) } }))
    get().persist()
  },
  pfCashOutAll: () => {
    const m = get().mg
    if (m.phase !== 'adjust') return
    let gained = 0
    const companies = { ...m.companies }
    for (const id of COMPANY_IDS) {
      gained += companies[id].owned * companies[id].price
      companies[id] = { ...companies[id], owned: 0 }
    }
    set((x) => ({
      mg: { ...x.mg, cash: r2(x.mg.cash + gained), companies, weekActions: { ...x.mg.weekActions, cashout: true } },
      panelPortfolio: false,
    }))
    get().persist()
    get().setToast(`Sold all your seeds for $${r2(gained)}.`)
  },

  // ---- the weekly state machine ----
  mgAct: (act) => {
    const g = get()
    if (!act) return
    if (act === 'wk.new') { g.startWeekScenario(); return }
    if (act === 'wk.slider') { set((x) => ({ mg: { ...x.mg, phase: 'slider' } })); return }
    if (act === 'wk.adjust') {
      set((x) => ({ mg: { ...x.mg, phase: 'adjust' } }))
      get().setToast('Make your moves, then press Start the Week.')
      return
    }
    if (act === 'mg.summary') {
      set({ mgPhase: 'summary', mgHighlight: null, panelPortfolio: false })
      get().persist()
      return
    }
    if (act === 'mg.finish') {
      const m = g.mg
      set({ mgPhase: 'done' })
      get().setBanner('MARKET GARDENER!', 3400)
      sparkleBurst([playerPos.x, playerPos.z], 2, 16)
      g.pushCards([
        { id: 'cele', speaker: 'Mr. Sprout', text: COMPLETION_LINE(m.goal), buttons: [{ label: 'Next', act: null }] },
        { id: 'bridge', speaker: 'Mr. Sprout', text: BRIDGE_LINE, buttons: [{ label: 'To the Finale!', act: 'mg.bridge' }] },
      ])
      return
    }
    if (act === 'mg.bridge') {
      g.awardBadge('garden', 'MONEY GARDENER')
      // the whole journey's money sweeps into one wallet, then the finale
      const total = g.mgTotal()
      set((x) => ({ allocations: { ...x.allocations, save: total, spend: 0 } }))
      get().persist()
      g.unlockParty()
      return
    }
  },


  // Part F: the start-of-week checkpoint for the garden.
  snapshotGardenWeek: () => {
    set((x) => ({
      mg: {
        ...x.mg,
        snapshot: JSON.parse(JSON.stringify({
          week: x.mg.week, pocket: x.mg.pocket, cash: x.mg.cash, bank: x.mg.bank,
          companies: x.mg.companies, buys: x.mg.buys,
        })),
      },
    }))
  },

  startWeekScenario: () => {
    const g = get()
    const m = g.mg
    const spec = weekSpec(m.week)
    const ctx = spec.ctx ? spec.ctx(m) : {}
    let companies = m.companies
    if (spec.pre) {
      for (const [cid, amt] of Object.entries(spec.pre(ctx))) companies = scriptedMove(companies, cid, amt).companies
    }
    const fx = spec.fx ? spec.fx(ctx) : {}
    set((x) => ({
      mg: { ...x.mg, ctx, fx, companies, phase: 'scenario', extra: null, weekActions: { bought: {}, sold: {}, cashout: false } },
      mgHighlight: fx.sale || fx.busy || fx.star || fx.dip || fx.shabby || null,
    }))
    get().snapshotGardenWeek()
    get().persist()
    const button = spec.special === 'seeds' ? { label: 'Plant my seeds', act: 'wk.slider' } : { label: 'Make my moves', act: 'wk.adjust' }
    g.pushCards([{ id: `wk${m.week}`, speaker: 'Mr. Sprout', text: spec.intro, learn: spec.learn, buttons: [button] }])
  },

  // Round 8 W1: the SEED PIE - dollars split across the three companies,
  // bought as whole seeds at today's price; change stays as garden cash.
  plantSeeds: (alloc) => {
    const g = get()
    const m = g.mg
    let cash = m.cash
    const companies = JSON.parse(JSON.stringify(m.companies))
    const bought = {}
    for (const id of COMPANY_IDS) {
      const dollars = Math.max(0, Math.min(cash, Math.round(alloc[id] || 0)))
      const n = Math.floor(dollars / companies[id].price)
      if (n > 0) {
        const spent = r2(n * companies[id].price)
        cash = r2(cash - spent)
        companies[id].owned += n
        companies[id].paid = r2(companies[id].paid + spent)
        companies[id].nbought += n
        bought[id] = n
      }
    }
    set((x) => ({
      mg: { ...x.mg, cash, companies, phase: 'simulating', weekActions: { ...x.mg.weekActions, bought } },
      scenarioLocked: true, near: null,
    }))
    // choreography: coin batches fly to each chosen bed and sprout
    const beats = [{ at: 300, run: () => get().setTint('#d9fbf1', 1200) }]
    let t = 700
    for (const id of COMPANY_IDS) {
      if (!bought[id]) continue
      const px = SPROUT[0] + COMPANIES[id].pos[0], pz = SPROUT[1] + COMPANIES[id].pos[1]
      const at = t
      beats.push({ at, run: () => { sparkleBurst([px, pz], 1.5, 10); set((x) => ({ coinBatches: [...x.coinBatches, { id: `plant-${id}-${at}`, from: { x: playerPos.x, y: 1.2, z: playerPos.z }, to: { x: px, y: 0.4, z: pz }, count: 4 }] })) } })
      t += 900
    }
    beats.push({ at: t + 400, run: () => {}, hold: 400 })
    playTimeline(beats, () => {
      set({ scenarioLocked: false })
      get().finishWeekResults()
    })
  },

  startTheWeek: () => {
    const g = get()
    const m = g.mg
    if (!m || m.phase !== 'adjust') return
    const spec = weekSpec(m.week)
    const ctx = m.ctx || {}
    const moves = spec.moves ? spec.moves(ctx, m) : { early: {}, late: {} }
    set((x) => ({ mg: { ...x.mg, phase: 'simulating' }, panelPortfolio: false, scenarioLocked: true, near: null }))
    const wp = (cid) => [SPROUT[0] + COMPANIES[cid].pos[0], SPROUT[1] + COMPANIES[cid].pos[1] + 2.4]
    const applyMoves = (mv) => set((x) => {
      let next = x.mg.companies
      for (const [cid, amt] of Object.entries(mv)) next = scriptedMove(next, cid, amt).companies
      return { mg: { ...x.mg, companies: guardFloor(x.mg, next) } }
    })
    // ---- H8: per-week choreography, built from the week's fx ----
    const beats = [{ at: 300, run: () => get().setTint('#ffe4b8', 1400) }]
    if (ctx.busy || ctx.saleBusy) {
      // customers STREAM into the busy store (research weeks 4-5)
      const target = ctx.busy || ctx.saleBusy
      ;['penny', 'theo', 'mia'].forEach((who, i) => {
        beats.push({ at: 600 + i * 700, run: () => { placeNpc(who, [SPROUT[0] + (i - 1) * 4, SPROUT[1] + 9]); npcWalkTo(who, wp(target), { face: true, onArrive: () => npcPose(who, 'dance1') }) } })
      })
      if (ctx.dusty || ctx.saleEmpty) beats.push({ at: 1500, run: () => get().setToast('Peek in the windows: one store is PACKED, one is empty...') })
    } else if (ctx.hot) {
      // the crowd chases the rocket (week 8)
      ;['penny', 'theo'].forEach((who, i) => {
        beats.push({ at: 700 + i * 500, run: () => { placeNpc(who, [SPROUT[0] + (i - 1) * 5, SPROUT[1] + 9]); npcWalkTo(who, wp(ctx.hot), { emote: '✨', face: true }) } })
      })
    } else if (ctx.shabby) {
      beats.push({ at: 800, run: () => { placeNpc('theo', [SPROUT[0] - 4, SPROUT[1] + 8]); npcWalkTo('theo', wp(ctx.shabby), { emote: '💧', face: true }) } })
    } else if (ctx.dip) {
      beats.push({ at: 800, run: () => { placeNpc('theo', [SPROUT[0] - 4, SPROUT[1] + 8]); npcWalkTo('theo', wp(ctx.dip), { emote: '💧', face: true }) } })
    }
    beats.push({ at: 2200, run: () => { applyMoves(moves.early); Object.keys(moves.early).forEach((cid) => sparkleBurst(wp(cid), 1.6, 6)) } })
    // W6: the SURPRISE BILL flutters down mid-week (the designed sting - the
    // bankruptcy rewind deliberately does NOT fire for this loss)
    if (spec.special === 'surprise') {
      beats.push({ at: 3200, run: () => {
        const st = get().mg
        if (st.pocket >= SURPRISE_BILL) {
          set((x) => ({ mg: { ...x.mg, pocket: r2(x.mg.pocket - SURPRISE_BILL), extra: { billPaid: 'pocket' } } }))
          get().setToast(`SURPRISE BILL: $${SURPRISE_BILL}. Paid from your pocket coins - the garden never felt it!`)
        } else {
          // dig up the biggest seed at a small loss
          let big = null
          for (const id of COMPANY_IDS) if (st.companies[id].owned > 0 && (!big || st.companies[id].price > st.companies[big].price)) big = id
          if (big) {
            set((x) => ({
              mg: {
                ...x.mg, cash: r2(x.mg.cash + Math.max(1, x.mg.companies[big].price - 1) - SURPRISE_BILL + SURPRISE_BILL), pocket: 0,
                companies: { ...x.mg.companies, [big]: { ...x.mg.companies[big], owned: x.mg.companies[big].owned - 1 } },
                extra: { billPaid: 'forced', dug: big },
              },
            }))
            set((x) => ({ mg: { ...x.mg, cash: r2(x.mg.cash - SURPRISE_BILL) } }))
            get().setToast(`SURPRISE BILL: $${SURPRISE_BILL}. No pocket coins - you had to dig up a ${COMPANIES[big].name} seed early!`)
          } else {
            set((x) => ({ mg: { ...x.mg, cash: Math.max(0, r2(x.mg.cash - SURPRISE_BILL)), extra: { billPaid: 'cash' } } }))
            get().setToast(`SURPRISE BILL: $${SURPRISE_BILL}. Paid from your garden cash.`)
          }
        }
      } })
    }
    beats.push({ at: 4400, run: () => { applyMoves(moves.late); Object.keys(moves.late).forEach((cid) => sparkleBurst(wp(cid), 1.6, 8)) } })
    // W7: the sick store CLOSES; seeds inside are lost (capped by the floor)
    if (spec.special === 'bankrupt') {
      beats.push({ at: 5200, run: () => {
        const st = get().mg
        const held = st.companies[ctx.shabby].owned
        if (held > 0) {
          set((x) => {
            const c = { ...x.mg.companies }
            c[ctx.shabby] = { ...c[ctx.shabby], owned: 0, price: COMPANIES[ctx.shabby].base, history: [...c[ctx.shabby].history, COMPANIES[ctx.shabby].base] }
            let total = x.mg.pocket + x.mg.cash + x.mg.bank
            for (const id of COMPANY_IDS) total += c[id].owned * c[id].price
            const top = total < 10 ? r2(10 - total) : 0
            return { mg: { ...x.mg, companies: c, cash: r2(x.mg.cash + top), extra: { lostShares: held } } }
          })
          get().setToast('The shop closed for good. Seeds still inside were lost.')
        }
      } })
    }
    beats.push({ at: 5800, run: () => { COMPANY_IDS.forEach((cid) => { if (get().mg.companies[cid].owned > 0) sparkleBurst(wp(cid), 1.2, 4) }) } })
    beats.push({ at: 6200, run: () => { npcHome('penny'); npcHome('theo'); npcHome('mia') }, hold: 500 })
    playTimeline(beats, () => {
      set({ scenarioLocked: false })
      get().finishWeekResults()
    })
  },

  // H9: ONE feedback card - behavior line, tiny honest numbers, forward nudge.
  finishWeekResults: () => {
    const g = get()
    const m = g.mg
    const spec = weekSpec(m.week)
    const ctx = m.ctx || {}
    const before = m.snapshot
      ? r2(m.snapshot.pocket + m.snapshot.cash + m.snapshot.bank + COMPANY_IDS.reduce((v, id) => v + m.snapshot.companies[id].owned * m.snapshot.companies[id].price, 0))
      : m.startTotal
    // H3: the Bank Sprout quietly pays $1 every couple of weeks
    if (m.week % 2 === 0 && m.bank >= BANK_DRIP_MIN) {
      set((x) => ({ mg: { ...x.mg, bank: r2(x.mg.bank + 1) } }))
      sparkleBurst([SPROUT[0] + 8.5, SPROUT[1] + 3], 1.4, 8)
      get().setToast('Ding! The Bank Sprout paid you $1 for keeping money with it.')
    }
    const mNow = get().mg
    const judged = spec.judge ? spec.judge(mNow, m.weekActions, ctx, mNow.extra) : true
    const top = judged ? (spec.praiseDynamic ? spec.praiseDynamic(mNow, ctx) : spec.praise) : spec.coach
    const total = g.mgTotal()
    const goalMet = total >= mNow.goal && mNow.week >= TOTAL_WEEKS
    set((x) => ({
      mg: { ...x.mg, phase: 'results', week: x.mg.week + 1, fx: {}, extra: null, weekLog: [...x.mg.weekLog, { week: m.week, total, judged }] },
      mgHighlight: null,
    }))
    get().persist()
    g.pushCards([{
      id: 'fb', speaker: 'Mr. Sprout',
      text: top, learn: spec.learn,
      nums: `Your garden: $${before} to $${total} this week.`,
      nudge: judged && spec.nudge ? spec.nudge : (judged ? 'Keep it up!' : spec.nudge),
      buttons: [{ label: goalMet ? 'See my harvest' : 'Next week', act: goalMet ? 'mg.summary' : 'wk.new' }],
    }])
    // Part F: the rewind fires only if the player is truly stranded
    if (!goalMet && total < 3 && COMPANY_IDS.every((id) => get().mg.companies[id].owned === 0)) {
      get().bankruptcyRewind('garden')
    }
  },

  // ---- MODULE 3: BUDGET TOWN v4 (Round 9, Part 5) - A DAY IN THE LIFE ----
  // The child WALKS the cul-de-sac doing life: rent, groceries, the bus, the
  // health jar, an optional want - needs-vs-wants woven into the doing. The
  // leftover flows into the pocket/bank/garden sliders + pie (the climax),
  // then the coins get WALKED to the bank kiosk and garden gate, the flat
  // tire tests the pocket cushion, and the hand-off names the numbers.
  startBudget: (savedBt = null) => {
    const s0 = get()
    const fresh = () => {
      const income = Math.max(14, Math.round(s0.allocations.save + s0.allocations.spend))
      return {
        stage: 'intro', income, basket: [], foodSpent: 0, funSpent: 0, needsSpent: 0,
        leftover: null, split: null, tried: {}, carried: {}, fx: {}, snapshot: null,
      }
    }
    const valid = savedBt && savedBt.stage && savedBt.income
    set({
      week: 3, objective: 'keeper', weekComplete: false, pendingWeekComplete: false,
      bt: valid ? savedBt : fresh(), btPanel: null, mg: null, mgPhase: null, cards: [], scenarioLocked: false, banner: null,
      toast: 'BUDGET TOWN is open! Follow your arrow to the Budget Keeper.',
    })
    set((x) => ({ allocations: { ...x.allocations, save: r2(x.allocations.save + x.allocations.spend), spend: 0 } }))
    if (s0.week === 2) get().awardBadge('lemonade', 'LEMONADE TYCOON')
    get().snapshotBtWeek()
    get().persist()
    setTimeout(() => set((s) => (s.toast?.includes('BUDGET TOWN') ? { toast: null } : {})), 4200)
  },
  snapshotBtWeek: () => {
    set((x) => ({ bt: { ...x.bt, snapshot: JSON.parse(JSON.stringify({ stage: x.bt.stage, income: x.bt.income, leftover: x.bt.leftover, split: x.bt.split })) } }))
  },
  // Talking to the Keeper: the ONE welcome, or a gentle mid-day recap.
  // Continuous flow - beats chain on their own after this.
  enterBudget: () => {
    const g = get()
    const b = g.bt
    if (!b) return
    if (b.stage === 'intro') {
      g.pushCards([{ id: 'bt1', speaker: 'The Budget Keeper', text: DAY_INTRO(fmtMoney(g.allocations.save)), learn: 'budgeting', buttons: [{ label: 'Live one day!', act: 'bt.day' }] }])
    } else if (['house', 'grocery', 'bus', 'clinic', 'fun'].includes(b.stage)) {
      g.pushCards([{ id: 'btmid', speaker: 'The Budget Keeper', text: `Mid-day already! Next stop: ${STOPS[b.stage].title}. Follow your arrow!`, buttons: [{ label: 'On my way', act: null }] }])
    } else if (b.stage === 'options') {
      g.btSummary()
    } else if (b.stage === 'split') {
      g.pushCards([{ id: 'bt2', speaker: 'The Budget Keeper', text: 'Time to split your leftover: pocket, bank, and garden. The pie shows your plan!', learn: 'allocation', buttons: [{ label: 'Open the sliders', act: 'bt.panel' }] }])
    } else if (b.stage === 'carry') {
      g.setToast(CARRY_PROMPT)
    } else if (b.stage === 'emergency') {
      g.pushCards([{ id: 'bt3', speaker: 'The Budget Keeper', text: EMERGENCY_INTRO, learn: 'budgeting', buttons: [{ label: 'Uh oh, what is that?', act: 'bt.emergency' }] }])
    } else {
      g.pushCards([{ id: 'bt4', speaker: 'The Budget Keeper', text: HANDOFF(fmtMoney(b.split.bank), fmtMoney(b.split.garden)), buttons: [{ label: 'To the Bank!', act: 'bt.tobank' }] }])
    }
  },
  // A building was used in the world (E or click). Each stop: tiny one-line
  // card -> pay -> ANIMATED outcome in the town -> one-line takeaway -> next.
  btStop: (key) => {
    const g = get()
    const b = g.bt
    if (!b) return
    if (key === 'kiosk') { g.btCarry('bank'); return }
    if (key === 'gate') { g.btCarry('garden'); return }
    if (b.stage !== key) return
    const S = STOPS[key]
    if (key === 'grocery') { set({ btPanel: 'grocery' }); return }
    if (key === 'fun') {
      g.pushCards([{ id: 'btfun', speaker: 'The Budget Keeper', text: S.line, buttons: [{ label: S.ride, act: 'bt.fun.ride' }, { label: S.save, act: 'bt.fun.save' }] }])
      return
    }
    const act = { house: 'bt.house', bus: 'bt.bus', clinic: 'bt.clinic' }[key]
    g.pushCards([{ id: `bt-${key}`, speaker: S.title, text: S.line, buttons: [{ label: S.button, act }] }])
  },
  _btSpend: (amt) => {
    set((x) => ({ allocations: { ...x.allocations, save: r2(x.allocations.save - amt) } }))
    get().persist()
  },
  _btAdvance: (next) => {
    set((x) => ({ bt: { ...x.bt, stage: next } }))
    get().persist()
    if (NEXT_STOP_TOAST[next]) setTimeout(() => get().setToast(NEXT_STOP_TOAST[next]), 400)
  },
  btHousePay: () => {
    const g = get()
    g._btSpend(RENT_COST)
    const [hx, hz] = btWorld('house')
    set((x) => ({
      bt: { ...x.bt, needsSpent: x.bt.needsSpent + RENT_COST, fx: { ...x.bt.fx, houseLit: true, houseAt: Date.now() } },
      scenarioLocked: true, near: null,
      coinBatches: [...x.coinBatches, { id: `rent-${Date.now() % 100000}`, from: { x: playerPos.x, y: 1.2, z: playerPos.z }, to: { x: hx, y: 1.2, z: hz }, count: 5 }],
    }))
    playTimeline([
      { at: 300, run: () => get().setTint('#fff3d6', 1200) },
      { at: 1400, run: () => { sparkleBurst([hx, hz], 1.8, 12); get().setToast('The lights come on - the family waves!') } },
      { at: 3000, run: () => get().setToast(STOPS.house.takeaway), hold: 600 },
    ], () => {
      set({ scenarioLocked: false })
      get()._btAdvance('grocery')
    })
  },
  btGroceryDone: (ids) => {
    const g = get()
    const items = GROCERY_ITEMS.filter((i) => ids.includes(i.id))
    const cost = items.reduce((v, i) => v + i.cost, 0)
    set({ btPanel: null })
    g._btSpend(cost)
    const [gx, gz] = btWorld('grocery')
    set((x) => ({
      bt: { ...x.bt, basket: ids, foodSpent: cost, needsSpent: x.bt.needsSpent + cost, fx: { ...x.bt.fx, basketAt: Date.now() } },
      scenarioLocked: true, near: null,
      coinBatches: [...x.coinBatches, { id: `food-${Date.now() % 100000}`, from: { x: playerPos.x, y: 1.2, z: playerPos.z }, to: { x: gx, y: 1.2, z: gz }, count: 4 }],
    }))
    playTimeline([
      { at: 300, run: () => get().setTint('#e8f8e0', 1200) },
      { at: 1300, run: () => { sparkleBurst([gx, gz], 1.6, 10); get().setToast('Basket packed! The bags line up out front.') } },
      { at: 2900, run: () => get().setToast(STOPS.grocery.takeaway), hold: 600 },
    ], () => {
      set({ scenarioLocked: false })
      get()._btAdvance('bus')
    })
  },
  btBusGo: () => {
    const g = get()
    g._btSpend(BUS_COST)
    const [bx2, bz2] = btWorld('bus')
    set((x) => ({
      bt: { ...x.bt, needsSpent: x.bt.needsSpent + BUS_COST, fx: { ...x.bt.fx, busAt: Date.now() } },
      scenarioLocked: true, near: null,
    }))
    playTimeline([
      { at: 400, run: () => get().setToast('Here comes the school bus...') },
      { at: 2600, run: () => { sparkleBurst([bx2, bz2], 1.6, 8); get().setToast('All aboard! The kids wave as it rolls away.') } },
      { at: 5200, run: () => get().setToast(STOPS.bus.takeaway), hold: 800 },
    ], () => {
      set({ scenarioLocked: false })
      get()._btAdvance('clinic')
    })
  },
  btClinicPay: () => {
    const g = get()
    g._btSpend(CLINIC_COST)
    const [cx2, cz2] = btWorld('clinic')
    set((x) => ({
      bt: { ...x.bt, needsSpent: x.bt.needsSpent + CLINIC_COST, fx: { ...x.bt.fx, clinicAt: Date.now() } },
      scenarioLocked: true, near: null,
      coinBatches: [...x.coinBatches, { id: `clin-${Date.now() % 100000}`, from: { x: playerPos.x, y: 1.2, z: playerPos.z }, to: { x: cx2 + 1, y: 0.6, z: cz2 + 1.35 }, count: 3 }],
    }))
    playTimeline([
      { at: 300, run: () => get().setTint('#fde8e8', 1000) },
      { at: 1400, run: () => { sparkleBurst([cx2, cz2], 1.5, 8); get().setToast('The doctor gives a thumbs-up!') } },
      { at: 2900, run: () => get().setToast(STOPS.clinic.takeaway), hold: 600 },
    ], () => {
      set({ scenarioLocked: false })
      get()._btAdvance('fun')
    })
  },
  btFun: (ride) => {
    const g = get()
    const [fx2, fz2] = btWorld('fun')
    if (ride) {
      g._btSpend(FUN_COST)
      set((x) => ({
        bt: { ...x.bt, funSpent: FUN_COST, fx: { ...x.bt.fx, wheelAt: Date.now() } },
        scenarioLocked: true, near: null,
      }))
      playTimeline([
        { at: 300, run: () => { sparkleBurst([fx2, fz2], 2, 14); get().setTint('#f3e0ff', 1400) } },
        { at: 2200, run: () => get().setToast('Wheee! The wheel spins and everyone cheers!') },
        { at: 4200, run: () => get().setToast(STOPS.fun.takeawayRide), hold: 600 },
      ], () => {
        set({ scenarioLocked: false, bt: { ...get().bt, stage: 'options' } })
        get().persist()
        get().btSummary()
      })
    } else {
      get().setToast(STOPS.fun.takeawaySave)
      set((x) => ({ bt: { ...x.bt, stage: 'options' } }))
      get().persist()
      setTimeout(() => get().btSummary(), 1400)
    }
  },
  // The Keeper's one-line ledger, then the three homes + sliders (the climax)
  btSummary: () => {
    const g = get()
    const b = g.bt
    const left = Math.max(4, Math.round(g.allocations.save))
    set((x) => ({ bt: { ...x.bt, leftover: left, split: x.bt.split || defaultSplit(left) } }))
    g.pushCards([{
      id: 'btsum', speaker: 'The Budget Keeper',
      text: DAY_SUMMARY(b.needsSpent, b.funSpent, left), learn: 'needswants',
      buttons: [{ label: 'Show me the three homes!', act: 'bt.panel' }],
    }])
  },
  btOpenPanel: () => {
    const b = get().bt
    set({ btPanel: b.stage === 'options' ? 'options' : b.stage === 'split' ? 'split' : null })
  },
  btTryOption: (id) => {
    set((x) => ({ bt: { ...x.bt, tried: { ...x.bt.tried, [id]: true } } }))
  },
  btOptionsDone: () => {
    set((x) => ({ bt: { ...x.bt, stage: 'split' }, btPanel: 'split' }))
    get().persist()
  },
  // the sliders always sum to the LEFTOVER; nudges, never blocks
  btSetSplit: (id, value) => {
    const b = get().bt
    const total = b.leftover
    const v = Math.max(0, Math.min(total, Math.round(value)))
    const others = ['pocket', 'bank', 'garden'].filter((k) => k !== id)
    let rest = total - v
    const o0 = b.split[others[0]], o1 = b.split[others[1]]
    const oSum = o0 + o1
    let n0 = oSum > 0 ? Math.round(rest * (o0 / oSum)) : Math.floor(rest / 2)
    let n1 = rest - n0
    set((x) => ({ bt: { ...x.bt, split: { ...x.bt.split, [id]: v, [others[0]]: n0, [others[1]]: n1 } } }))
  },
  // Confirm: the plan pie card, then the child WALKS the coins home (5.1).
  btConfirmSplit: () => {
    const g = get()
    const b = g.bt
    set({ btPanel: null, split: { ...b.split } })
    set((x) => ({ bt: { ...x.bt, stage: 'carry' } }))
    get().persist()
    g.pushCards([{
      id: 'btplan', speaker: 'The Budget Keeper',
      text: `${SPLIT_CONFIRM} Pocket $${fmtMoney(b.split.pocket)} | Bank $${fmtMoney(b.split.bank)} | Garden $${fmtMoney(b.split.garden)}.`,
      pie: { ...b.split }, learn: 'allocation',
      nudge: CARRY_PROMPT,
      buttons: [{ label: 'Walk the coins!', act: null }],
    }])
  },
  // walk the coins: bank pile to the kiosk, then garden pile to the gate
  btCarry: (kind) => {
    const g = get()
    const b = g.bt
    if (!b || b.stage !== 'carry' || b.carried[kind]) return
    if (kind === 'garden' && !b.carried.bank) { g.setToast('Bank coins first - the kiosk is glowing!'); return }
    const spot = kind === 'bank' ? btWorld('kiosk') : btWorld('gate')
    set((x) => ({
      bt: { ...x.bt, carried: { ...x.bt.carried, [kind]: true }, fx: { ...x.bt.fx, [kind === 'bank' ? 'kioskAt' : 'gateAt']: Date.now() } },
      coinBatches: [...x.coinBatches, { id: `carry-${kind}-${Date.now() % 100000}`, from: { x: playerPos.x, y: 1.2, z: playerPos.z }, to: { x: spot[0], y: 1, z: spot[1] }, count: 5 }],
    }))
    sparkleBurst(spot, 1.6, 10)
    g.setToast(kind === 'bank' ? CARRY_BANK_DONE(fmtMoney(b.split.bank)) : CARRY_GARDEN_DONE(fmtMoney(b.split.garden)))
    get().persist()
    const done = get().bt.carried.bank && get().bt.carried.garden
    if (done) {
      set((x) => ({ bt: { ...x.bt, stage: 'emergency' } }))
      get().persist()
      setTimeout(() => {
        get().pushCards([{ id: 'bt3', speaker: 'The Budget Keeper', text: EMERGENCY_INTRO, learn: 'budgeting', buttons: [{ label: 'Uh oh, what is that?', act: 'bt.emergency' }] }])
      }, 1600)
    }
  },
  // the surprise - covered from POCKET cash (emergency money's job)
  btEmergency: () => {
    const g = get()
    const b = g.bt
    if ((g.split?.pocket ?? b.split.pocket) < EMERGENCY_EVENT.cost) {
      get().showLesson(EMERGENCY_REPLAY)
      set((x) => ({ bt: { ...x.bt, stage: 'split', carried: {} }, btPanel: 'split' }))
      get().persist()
      return
    }
    set({ scenarioLocked: true, near: null })
    set((x) => ({ split: { ...x.split, pocket: r2(x.split.pocket - EMERGENCY_EVENT.cost) }, bt: { ...x.bt, split: { ...x.bt.split, pocket: r2(x.bt.split.pocket - EMERGENCY_EVENT.cost) } } }))
    playTimeline([
      { at: 300, run: () => { get().setTint('#fde8e8', 1200); get().setToast(`${EMERGENCY_EVENT.label} It costs $${EMERGENCY_EVENT.cost}.`) } },
      { at: 1800, run: () => { placeNpc('theo', [playerPos.x + 3, playerPos.z + 2]); npcWalkTo('theo', [playerPos.x + 1, playerPos.z + 1], { emote: '🔧', face: true }) } },
      { at: 3400, run: () => { sparkleBurst([playerPos.x + 1, playerPos.z + 1], 1.6, 10); get().setToast('Tire fixed! Paid from your pocket cash.') } },
      { at: 4400, run: () => npcHome('theo'), hold: 500 },
    ], () => {
      set((x) => ({ scenarioLocked: false, bt: { ...x.bt, stage: 'handoff' } }))
      get().persist()
      get().pushCards([
        { id: 'btem', speaker: 'The Budget Keeper', text: EMERGENCY_PRAISE, learn: 'budgeting', buttons: [{ label: 'Phew! What is next?', act: null }] },
        { id: 'bt4', speaker: 'The Budget Keeper', text: HANDOFF(fmtMoney(get().bt.split.bank), fmtMoney(get().bt.split.garden)), buttons: [{ label: 'To the Bank!', act: 'bt.tobank' }] },
      ])
    })
  },
  btAct: (act) => {
    const g = get()
    if (act === 'bt.day') { g._btAdvance('house'); return }
    if (act === 'bt.panel') { g.btOpenPanel(); return }
    if (act === 'bt.house') { g.btHousePay(); return }
    if (act === 'bt.bus') { g.btBusGo(); return }
    if (act === 'bt.clinic') { g.btClinicPay(); return }
    if (act === 'bt.fun.ride') { g.btFun(true); return }
    if (act === 'bt.fun.save') { g.btFun(false); return }
    if (act === 'bt.next') { g.enterBudget(); return }
    if (act === 'bt.emergency') { g.btEmergency(); return }
    if (act === 'bt.tobank') { g.awardBadge('budget', 'BUDGET BOSS'); g.startBank(); return }
  },

  // ---- MODULE 4: THE BANK OF TAYU v4 (Round 9, Part 6) - LEARN BY DOING ----
  // ONE continuous guided sequence: Bea and the bank cast ACT each lesson out
  // in the world with speech bubbles; the only pop-ups are one-line cards
  // with a choice or a Next button. The child never re-clicks Bea to advance.
  startBank: (savedBk = null) => {
    const s0 = get()
    const sp = s0.split || defaultSplit(Math.round(s0.allocations.save))
    const fresh = () => ({
      week: 1, bankAmount: sp.bank, pocket: sp.pocket, gardenReserve: sp.garden,
      vault: 0, savings: 0, cd: 0, checking: 0,
      trust: 0, seen: {}, fx: {}, snapshot: null,
    })
    const valid = savedBk && savedBk.week && savedBk.bankAmount !== undefined
    set({
      week: 4, objective: 'bea', weekComplete: false,
      bk: valid ? { fx: {}, seen: {}, ...savedBk } : fresh(), bkPanel: null, btPanel: null, mg: null, mgPhase: null, cards: [],
      toast: 'THE BANK OF TAYU is open! Follow your arrow to Banker Bea.',
    })
    get().snapshotBkWeek()
    get().persist()
    setTimeout(() => set((s) => (s.toast?.includes('BANK OF TAYU') ? { toast: null } : {})), 4200)
    get().showLesson(BK_OPEN(fmtMoney(sp.bank)), 'bk-open-line')
  },
  snapshotBkWeek: () => {
    set((x) => ({ bk: { ...x.bk, snapshot: JSON.parse(JSON.stringify({ week: x.bk.week, bankAmount: x.bk.bankAmount, pocket: x.bk.pocket, vault: x.bk.vault, savings: x.bk.savings, cd: x.bk.cd, checking: x.bk.checking, trust: x.bk.trust })) } }))
  },
  bkTotal: () => {
    const k = get().bk
    if (!k) return 0
    return r2(k.pocket + k.gardenReserve + k.bankAmount + k.vault + k.savings + k.cd + k.checking)
  },
  // Talking to Bea: starts the sequence ONCE; afterwards she only recaps.
  enterBank: () => {
    const g = get()
    const k = g.bk
    if (!k) return
    if (!k.seen.intro) {
      set((x) => ({ bk: { ...x.bk, seen: { ...x.bk.seen, intro: true } } }))
      g.bkBeat(k.week || 1)
    } else if (k.week > 6) {
      g.bkAct('bk.finish')
    } else if (g.cards.length === 0 && !g.scenarioLocked) {
      // optional recap - re-enter the current beat (never required)
      g.bkBeat(k.week)
    }
  },
  // ---- the beat engine: each week = bubbles + NPC action + tiny choice ----
  bkBeat: (wk) => {
    const g = get()
    set((x) => ({ bk: { ...x.bk, week: wk } }))
    get().snapshotBkWeek()
    get().persist()
    const [bx, bz] = BANK_DISTRICT
    const L = BK['w' + wk]
    if (wk === 1) {
      npcSay('bea', L.bubble, 4)
      if (get().bk.bankAmount <= 0) { g.bkResolve(1, true); return }
      g.pushCards([{ id: 'bk1', speaker: 'Banker Bea', text: L.card, learn: L.learn, buttons: [{ label: L.give(fmtMoney(get().bk.bankAmount)), act: 'bk.w1' }] }])
    } else if (wk === 2) {
      if (get().bk.vault <= 0 && get().bk.savings + get().bk.cd + get().bk.checking > 0) {
        // already sorted (resume) - straight to the summary
        g.bkResolve(2, true, BK.w2.summary)
        return
      }
      set({ scenarioLocked: true, near: null })
      npcSay('bea', L.bubble, 4.6)
      playTimeline([
        { at: 800, run: () => npcWalkTo('teller', [bx - 3.4, bz + 3.1], { face: true }) },
        { at: 2200, run: () => { npcSay('teller', L.dingChecking, 2.6); sparkleBurst([bx - 3.4, bz + 2.2], 1.2, 4) } },
        { at: 5000, run: () => npcWalkTo('teller', [bx - 1.2, bz + 3.4], { face: true }) },
        { at: 6200, run: () => { npcSay('teller', L.dingSavings, 2.6); sparkleBurst([bx - 1.2, bz + 2.4], 1.5, 8) } },
        { at: 8800, run: () => npcWalkTo('teller', [bx + 1.2, bz + 3.4], { face: true }) },
        { at: 10000, run: () => { set((x) => ({ bk: { ...x.bk, fx: { ...x.bk.fx, cdLockAt: Date.now() } } })); npcSay('teller', L.dingCd, 3.2); sparkleBurst([bx + 1.2, bz + 2.4], 1.7, 12) } },
        { at: 12400, run: () => npcHome('teller'), hold: 300 },
      ], () => {
        set({ scenarioLocked: false })
        g.pushCards([{
          id: 'bk2', speaker: 'Banker Bea', text: L.card, learn: L.learn,
          buttons: [{ label: L.smart, act: 'bk.w2.smart' }, { label: L.safe, act: 'bk.w2.safe' }, { label: L.cash, act: 'bk.w2.cash' }],
        }])
      })
    } else if (wk === 3) {
      npcSay('bea', L.bubble, 4)
      set({ scenarioLocked: true, near: null })
      // the child's avatar walks to the snack stall and taps the card
      moveTarget.x = bx - 6.5; moveTarget.z = bz + 6.2
      playTimeline([
        { at: 2400, run: () => { moveTarget.x = null; moveTarget.z = null } },
        { at: 2600, run: () => {
          set((x) => {
            let { checking, savings } = x.bk
            if (checking < DEBIT_ITEM.cost) { const need = r2(DEBIT_ITEM.cost - checking); savings = r2(Math.max(0, savings - need)); checking = r2(checking + need) }
            return { bk: { ...x.bk, checking: r2(checking - DEBIT_ITEM.cost), savings, fx: { ...x.bk.fx, swipeAt: Date.now() } } }
          })
          npcSay('clerk', L.beep, 3.2)
          sparkleBurst([bx - 6.5, bz + 4.8], 1.5, 8)
        } },
        { at: 5000, run: () => npcSay('bea', 'See the CHECKING gauge drop? Your own money.', 3), hold: 600 },
      ], () => g.bkResolve(3, true))
    } else if (wk === 4) {
      npcSay('bea', L.bubble, 4)
      set({ scenarioLocked: true, near: null })
      playTimeline([
        { at: 900, run: () => { set((x) => ({ bk: { ...x.bk, fx: { ...x.bk.fx, swipe2At: Date.now() } } })); npcSay('clerk', 'Beep! $5 on CREDIT.', 2.8); sparkleBurst([bx - 6.5, bz + 4.8], 1.4, 6) } },
        { at: 3400, run: () => { placeNpc('mailer', [bx + 11, bz + 9]); npcWalkTo('mailer', [playerPos.x + 1.7, playerPos.z + 1], { face: true }) } },
        { at: 5600, run: () => npcSay('mailer', L.bill, 3.4), hold: 700 },
      ], () => {
        set({ scenarioLocked: false })
        g.pushCards([{ id: 'bk4', speaker: 'Banker Bea', text: L.card, learn: L.learn, bars: { price: CARD_PURCHASE, extra: CARD_MIN_PAY }, buttons: [{ label: L.full, act: 'bk.w4.full' }, { label: L.little, act: 'bk.w4.little' }] }])
      })
    } else if (wk === 5) {
      npcSay('bea', L.bubble, 4.4)
      set({ scenarioLocked: true, near: null })
      set((x) => ({ bk: { ...x.bk, fx: { ...x.bk.fx, debtAt: Date.now(), debtMergeAt: null } } }))
      playTimeline([
        { at: 2800, run: () => get().setToast('The little debts grow taller with every late fee...') },
        { at: 4400, run: () => { placeNpc('helper', [bx + 9, bz + 8]); npcWalkTo('helper', [bx + 3.6, bz + 4.8], { face: true }) } },
        { at: 6600, run: () => { set((x) => ({ bk: { ...x.bk, fx: { ...x.bk.fx, debtMergeAt: Date.now() } } })); npcSay('helper', L.merge, 3.8); sparkleBurst([bx + 3.5, bz + 4], 1.8, 14) } },
        { at: 9200, run: () => npcHome('helper'), hold: 300 },
      ], () => g.bkResolve(5, true, BK.w5.summary))
    } else if (wk === 6) {
      set({ scenarioLocked: true, near: null })
      playTimeline([
        { at: 600, run: () => { placeNpc('scammer', [bx - 11, bz + 10]); npcWalkTo('scammer', [playerPos.x - 1.7, playerPos.z + 1.2], { face: true }) } },
        { at: 2900, run: () => npcSay('scammer', L.bubble, 3.8), hold: 900 },
      ], () => {
        set({ scenarioLocked: false })
        g.pushCards([{ id: 'bk6', speaker: 'Banker Bea', text: L.card, learn: L.learn, buttons: [{ label: L.refuse, act: 'bk.w6.refuse' }, { label: L.send, act: 'bk.w6.send' }] }])
      })
    }
  },
  // trust + the one-line summary; the button AUTO-flows into the next beat
  bkResolve: (wk, judged, line = null) => {
    const g = get()
    const L = BK['w' + wk]
    set((x) => ({ scenarioLocked: false, bk: { ...x.bk, trust: Math.min(TRUST_MAX, x.bk.trust + (judged ? 1 : 0)) } }))
    const last = wk >= 6
    const buttons = [{ label: last ? 'Show me my Trust!' : 'Next lesson', act: last ? 'bk.finish' : 'bk.auto' }]
    if (!judged) buttons.unshift({ label: "Let's try that again!", act: 'bk.retry' })
    g.pushCards([{ id: 'bkfb', speaker: 'Banker Bea', text: line || L.summary, learn: L.learn, buttons }])
    get().persist()
  },
  bkAct: (act) => {
    const g = get()
    const [bx, bz] = BANK_DISTRICT
    if (act === 'bk.auto') { g.bkBeat(g.bk.week + 1); return }
    if (act === 'bk.retry') {
      const snap = g.bk.snapshot
      if (snap) set((x) => ({ bk: { ...x.bk, ...JSON.parse(JSON.stringify(snap)), snapshot: snap } }))
      g.bkBeat(get().bk.week)
      return
    }
    if (act === 'bk.w1') {
      // the teller carries the coins to the vault; the door THUNKS shut
      set({ scenarioLocked: true, near: null })
      playTimeline([
        { at: 300, run: () => { set((x) => ({ coinBatches: [...x.coinBatches, { id: `bk1a-${Date.now() % 100000}`, from: { x: playerPos.x, y: 1.2, z: playerPos.z }, to: { x: bx, y: 1, z: bz + 2.6 }, count: 6 }] })) } },
        { at: 1500, run: () => { npcWalkTo('teller', [bx, bz + 1.4], { face: true }); set((x) => ({ coinBatches: [...x.coinBatches, { id: `bk1b-${Date.now() % 100000}`, from: { x: bx, y: 1, z: bz + 2.6 }, to: { x: bx, y: 1.6, z: bz + 0.7 }, count: 6 }] })) } },
        { at: 3100, run: () => {
          set((x) => ({ bk: { ...x.bk, vault: r2(x.bk.vault + x.bk.bankAmount), bankAmount: 0, fx: { ...x.bk.fx, vaultAt: Date.now() } } }))
          npcSay('teller', BK.w1.thunk, 3)
          sparkleBurst([bx, bz + 0.7], 2, 14)
        } },
        { at: 5000, run: () => npcHome('teller'), hold: 300 },
      ], () => g.bkResolve(1, true))
      return
    }
    if (act.startsWith('bk.w2.')) {
      const pick = act.split('.')[2]
      set((x) => {
        const pool = x.bk.vault
        if (pool <= 0) return {}
        let cd = 0, checking = 0
        if (pick === 'smart') { cd = Math.max(1, Math.floor(pool * 0.3)); checking = Math.max(1, Math.floor(pool * 0.25)) }
        else if (pick === 'safe') { checking = Math.max(1, Math.floor(pool * 0.3)) }
        else { checking = pool }
        const savings = r2(pool - cd - checking)
        return { bk: { ...x.bk, vault: 0, savings, cd, checking } }
      })
      set({ scenarioLocked: true, near: null })
      playTimeline([
        { at: 400, run: () => { set((x) => ({ coinBatches: [...x.coinBatches, { id: `bk2-${Date.now() % 100000}`, from: { x: bx, y: 1.6, z: bz + 0.7 }, to: { x: bx - 1.2, y: 1, z: bz + 2.4 }, count: 6 }] })) } },
        { at: 1800, run: () => {
          const k = get().bk
          if (k.savings > 0) { set((x) => ({ bk: { ...x.bk, savings: r2(x.bk.savings + SAVINGS_DING) } })); npcSay('teller', `DING! +$${SAVINGS_DING} interest on savings.`, 3); sparkleBurst([bx - 1.2, bz + 2.4], 1.5, 8) }
        } },
        { at: 3600, run: () => {
          const k = get().bk
          if (k.cd > 0) { set((x) => ({ bk: { ...x.bk, cd: r2(x.bk.cd + CD_DING) } })); npcSay('teller', `DING DING! +$${CD_DING} on the locked CD!`, 3); sparkleBurst([bx + 1.2, bz + 2.4], 1.7, 10) }
        }, hold: 600 },
      ], () => {
        const line = pick === 'smart' ? BK.w2.doneSmart : pick === 'safe' ? BK.w2.doneSafe : BK.w2.doneCash
        g.bkResolve(2, true, line)
      })
      return
    }
    if (act === 'bk.w4.full' || act === 'bk.w4.little') {
      const full = act === 'bk.w4.full'
      const cost = full ? CARD_PURCHASE : CARD_PURCHASE + CARD_MIN_PAY // the grown bill costs $1 more
      set((x) => {
        let { checking, savings, pocket } = x.bk
        let due = cost
        const c1 = Math.min(checking, due); checking = r2(checking - c1); due = r2(due - c1)
        const c2 = Math.min(pocket, due); pocket = r2(pocket - c2); due = r2(due - c2)
        savings = r2(Math.max(0, savings - due))
        return { bk: { ...x.bk, checking, pocket, savings, fx: { ...x.bk.fx, billGrowAt: full ? null : Date.now() } } }
      })
      set({ scenarioLocked: true, near: null })
      playTimeline(full ? [
        { at: 400, run: () => { sparkleBurst([playerPos.x + 1.7, playerPos.z + 1], 1.8, 12); npcSay('mailer', 'Paid in FULL - zero extra!', 3) } },
        { at: 2400, run: () => npcHome('mailer'), hold: 300 },
      ] : [
        { at: 400, run: () => npcSay('mailer', 'Only $1? See you next week...', 3) },
        { at: 2800, run: () => { npcSay('mailer', BK.w4.puff, 3.4); get().setTint('#fde8e8', 1200) } },
        { at: 5400, run: () => { sparkleBurst([playerPos.x + 1.7, playerPos.z + 1], 1.4, 8); npcSay('bea', 'All cleared - $1 went to interest.', 3) } },
        { at: 6800, run: () => npcHome('mailer'), hold: 300 },
      ], () => g.bkResolve(4, full, full ? BK.w4.doneFull : BK.w4.doneLittle))
      return
    }
    if (act === 'bk.w6.refuse' || act === 'bk.w6.send') {
      const refuse = act === 'bk.w6.refuse'
      set({ scenarioLocked: true, near: null })
      playTimeline(refuse ? [
        { at: 300, run: () => { const a = stage.actors.scammer; a.speed = 5; npcHome('scammer'); npcSay('bea', BK.w6.shield, 3.6); npcWalkTo('bea', [playerPos.x - 1, playerPos.z + 1.4], { face: true }) } },
        { at: 2200, run: () => { set((x) => ({ bk: { ...x.bk, fx: { ...x.bk.fx, shieldAt: Date.now() } } })); sparkleBurst([playerPos.x, playerPos.z], 2, 16) } },
        { at: 4200, run: () => { npcHome('bea'); stage.actors.scammer.speed = 2.6 }, hold: 400 },
      ] : [
        { at: 300, run: () => { set((x) => ({ coinBatches: [...x.coinBatches, { id: `sc-${Date.now() % 100000}`, from: { x: playerPos.x, y: 1.2, z: playerPos.z }, to: { x: playerPos.x - 1.7, y: 1, z: playerPos.z + 1.2 }, count: 4 }] })) } },
        { at: 1300, run: () => { npcWalkTo('bea', [playerPos.x - 0.8, playerPos.z + 1.2], { face: true }); npcSay('bea', BK.w6.coach, 3.6) } },
        { at: 2900, run: () => { set((x) => ({ coinBatches: [...x.coinBatches, { id: `scb-${Date.now() % 100000}`, from: { x: playerPos.x - 1.7, y: 1, z: playerPos.z + 1.2 }, to: { x: playerPos.x, y: 1.2, z: playerPos.z }, count: 4 }] })); const a = stage.actors.scammer; a.speed = 5; npcHome('scammer') } },
        { at: 4400, run: () => { set((x) => ({ bk: { ...x.bk, fx: { ...x.bk.fx, shieldAt: Date.now() } } })); sparkleBurst([playerPos.x, playerPos.z], 1.8, 12); npcHome('bea'); stage.actors.scammer.speed = 2.6 }, hold: 400 },
      ], () => g.bkResolve(6, refuse))
      return
    }
    if (act === 'bk.finish') {
      set((x) => ({ bk: { ...x.bk, week: 7, trust: TRUST_MAX } }))
      get().setBanner('TRUST METER: FULL!', 3000)
      sparkleBurst([BANK_DISTRICT[0], BANK_DISTRICT[1]], 2.2, 18)
      g.pushCards([
        { id: 'bktrust', speaker: 'Banker Bea', text: TRUST_NAMED, learn: 'carddebt', buttons: [{ label: 'Next', act: null }] },
        { id: 'bkhand', speaker: 'Banker Bea', text: BK_HANDOFF(fmtMoney(g.bk.gardenReserve)), buttons: [{ label: 'To the Money Garden!', act: 'bk.togarden' }] },
      ])
      return
    }
    if (act === 'bk.togarden') {
      g.awardBadge('bank', 'BANK BUILDER')
      const k = g.bk
      const bankNow = r2(k.vault + k.savings + k.cd + k.checking + k.bankAmount)
      set(() => ({ split: { pocket: k.pocket, bank: bankNow, garden: k.gardenReserve } }))
      get().persist()
      g.startGarden()
      return
    }
  },

  // ---- PART 0: THE ADMIN / DEMO API (Round 6) ----
  // Every jump fully initializes state: map position, host, HUD, money, and
  // prior-module values. Wrapped in try/catch by the panel; these helpers
  // keep the store consistent so nothing is ever half-loaded.
  adminTeleport: (xz) => {
    playerPos.x = xz[0]; playerPos.z = xz[1]
    moveTarget.x = null; moveTarget.z = null
  },
  adminClearUi: () => {
    set({ cards: [], lessons: [], dialog: null, toast: null, panelJar: null, panelItem: null, panelPortfolio: false, btPanel: null, bkPanel: null, weekComplete: false, pendingWeekComplete: false, scenarioLocked: false, helpOpen: false })
    clearTimelines()
  },
  adminJumpModule: (n, atEnd = false) => {
    const g = get()
    g.adminClearUi()
    resetStage()
    if (n === 1) {
      set({ ...g._baseState() })
      g.adminTeleport(SPAWN)
      if (atEnd) {
        set({
          week: 1, mailboxOpened: true, storeMissionDone: true, bramTalked: true,
          allocations: { spend: 2, save: 14, give: 4 }, weekComplete: true, objective: 'done',
        })
      }
    } else if (n === 2) {
      set({ ...g._baseState(), allocations: { spend: 0, save: 28, give: 2 }, mailboxOpened: true })
      g.startWeek2()
      set({ lemPhase: 'supplies' }) // land straight on the first decision
      g.adminTeleport([LEMONADE[0] + 2, LEMONADE[1] + 3])
      if (atEnd) {
        set({ lemRound: 4, lemPerfect: true, lemFeatures: 3, lemCumProfit: 24, allocations: { spend: 0, save: 30, give: 2 } })
        get().snapshotLemWeek()
      }
    } else if (n === 3) {
      set({ ...g._baseState(), allocations: { spend: 0, save: 34, give: 2 }, mailboxOpened: true })
      g.startBudget()
      g.adminTeleport([BUDGET_TOWN[0], BUDGET_TOWN[1] + 8])
      if (atEnd) {
        const sp = { pocket: 6, bank: 12, garden: 16 }
        set((x) => ({ split: sp, bt: { ...x.bt, stage: 'handoff', leftover: 34, split: sp, carried: { bank: true, garden: true } } }))
      }
    } else if (n === 4) {
      set({ ...g._baseState(), allocations: { spend: 0, save: 34, give: 2 }, mailboxOpened: true, split: { pocket: 6, bank: 12, garden: 16 } })
      g.startBank()
      g.adminTeleport([BANK_DISTRICT[0] - 1, BANK_DISTRICT[1] - 6])
      if (atEnd) set((x) => ({ bk: { ...x.bk, week: 6, trust: 5 } }))
    } else if (n === 5) {
      set({ ...g._baseState(), allocations: { spend: 0, save: 36, give: 2 }, mailboxOpened: true, split: { pocket: 6, bank: 14, garden: 16 } })
      g.startGarden()
      g.adminTeleport([SPROUT[0], SPROUT[1] + 10])
      if (atEnd) g.adminJumpWeek(10)
    } else if (n === 6) {
      set({ ...g._baseState(), allocations: { spend: 0, save: 48, give: 2 }, mailboxOpened: true, split: { pocket: 6, bank: 14, garden: 16 } })
      g.startGarden()
      set({ mgPhase: 'done' })
      g.unlockParty()
      g.adminClearUi()
      g.adminTeleport([PARTY_HOUSE[0], PARTY_HOUSE[1] - 6])
    }
    get().persist()
  },
  // Jump to any week WITHIN the current module, with demoable state seeded.
  adminJumpWeek: (n) => {
    const g = get()
    const wk = g.week
    g.adminClearUi()
    if (wk === 2) {
      const round = Math.max(1, n)
      set((x) => ({
        lemRound: round, lemPerfect: round >= 2, lemFeatures: Math.min(3, Math.max(0, round - 1)),
        lemCumProfit: Math.min(28, (round - 1) * 8),
        lemBundle: null, lemResult: null, lemPhase: 'supplies', lemPoolSeen: round > 2,
        allocations: { ...x.allocations, save: Math.max(x.allocations.save, 20) },
      }))
      get().snapshotLemWeek()
    } else if (wk === 3) {
      // Budget Town: 'weeks' are the day's chapters
      set((x) => {
        const nn = Math.max(1, Math.min(4, n))
        const b = { ...x.bt }
        const income = b.income
        if (nn === 1) Object.assign(b, { stage: 'house', basket: [], foodSpent: 0, funSpent: 0, needsSpent: 0, leftover: null, carried: {}, fx: {} })
        if (nn === 2) Object.assign(b, { stage: 'fun', basket: ['milk', 'bread', 'eggs', 'apples'], foodSpent: 5, needsSpent: 5 + 6 + 2 + 2, funSpent: 0, carried: {}, fx: { ...b.fx, houseLit: true } })
        if (nn === 3) Object.assign(b, { stage: 'split', leftover: Math.max(6, income - 15), split: b.split && b.stage >= 'split' ? b.split : null, carried: {} })
        if (nn === 4) Object.assign(b, { stage: 'handoff', leftover: b.leftover || Math.max(6, income - 15) })
        if (nn >= 3 && !b.split) {
          const L = b.leftover
          b.split = { pocket: Math.max(2, Math.round(L * 0.2)), bank: Math.round(L * 0.35), garden: L - Math.max(2, Math.round(L * 0.2)) - Math.round(L * 0.35) }
        }
        const extra = {}
        if (nn === 2) extra.allocations = { ...x.allocations, save: Math.max(6, income - 15) }
        if (nn >= 4) { extra.split = { ...b.split }; b.carried = { bank: true, garden: true } }
        return { bt: b, ...extra }
      })
      get().snapshotBtWeek()
      g.enterBudget()
    } else if (wk === 4) {
      const week = Math.max(1, Math.min(6, n))
      set((x) => {
        const bk = { ...x.bk, week, trust: Math.min(TRUST_MAX, Math.max(x.bk.trust, week - 1)), seen: { ...x.bk.seen, intro: true }, fx: {} }
        // past week 2 the account drawers must be seeded for the demo
        if (week > 2 && bk.vault + bk.savings + bk.cd + bk.checking === 0) {
          const pool = bk.bankAmount
          bk.cd = Math.min(5, Math.floor(pool * 0.3)); bk.checking = Math.min(5, Math.floor(pool * 0.25))
          bk.savings = r2(pool - bk.cd - bk.checking); bk.bankAmount = 0
        } else if (week === 2 && bk.vault === 0 && bk.savings + bk.cd + bk.checking === 0) {
          bk.vault = bk.bankAmount; bk.bankAmount = 0
        }
        return { bk }
      })
      get().snapshotBkWeek()
      g.bkBeat(week)
    } else if (wk === 5) {
      const week = Math.max(1, Math.min(10, n))
      set((x) => {
        const m = { ...x.mg }
        // sensible demo garden: spread holdings + gentle growth
        const c = JSON.parse(JSON.stringify(m.companies))
        if (week > 1 && Object.keys(c).every((id) => c[id].owned === 0)) {
          c.toy.owned = 2; c.snack.owned = 2; c.game.owned = 1
        }
        const holdings = Object.keys(c).reduce((v, id) => v + c[id].owned * c[id].price, 0)
        const cash = Math.max(2, r2(m.startTotal - holdings + (week - 1)))
        return { mg: { ...m, week, phase: 'scenario', cash, companies: c, extra: null, fx: {}, seen: { ...m.seen, intro: true } } }
      })
      get().snapshotGardenWeek()
      g.startWeekScenario()
    }
    get().persist()
  },
  adminCurrentWeek: () => {
    const s = get()
    if (s.week === 2) return { n: s.lemRound, max: 8 }
    if (s.week === 3) {
      const st3 = s.bt?.stage || 'intro'
      const n3 = ['intro', 'house'].includes(st3) ? 1 : ['grocery', 'bus', 'clinic', 'fun'].includes(st3) ? 2 : ['options', 'split'].includes(st3) ? 3 : 4
      return { n: n3, max: 4 }
    }
    if (s.week === 4) return { n: s.bk?.week || 1, max: 6 }
    if (s.week === 5) return { n: Math.min(s.mg?.week || 1, 10), max: 10 }
    return { n: 1, max: 1 }
  },
  adminSetMoney: (v) => {
    const s = get()
    const amt = Math.max(0, r2(v))
    if (s.week === 5 && s.mg) {
      set((x) => ({ mg: { ...x.mg, cash: amt } }))
    } else if (s.week === 4 && s.bk) {
      set((x) => ({ bk: { ...x.bk, savings: amt } }))
    } else {
      set((x) => ({ allocations: { ...x.allocations, save: amt }, wallet: s.week === 1 ? Math.round(amt) : x.wallet }))
    }
    get().persist()
  },
  adminCompleteModule: () => {
    const g = get()
    const wk = g.week
    g.adminClearUi()
    if (wk === 1) g.adminJumpModule(2)
    else if (wk === 2) g.adminJumpModule(3)
    else if (wk === 3) g.adminJumpModule(4)
    else if (wk === 4) g.adminJumpModule(5)
    else if (wk === 5) g.adminJumpModule(6)
  },
  adminUnlockEverything: () => {
    get().unlockParty()
    get().adminClearUi()
    get().setToast('ADMIN: everything unlocked - free roam!')
  },

  // ---- v9 Section 3: MODULE BADGES - collectible, shown on the Guru shelf ----
  awardBadge: (id, label) => {
    const prof = loadProfile() || {}
    const badges = prof.badges || []
    if (badges.includes(id)) return
    saveProfile({ badges: [...badges, id] })
    get().setBanner(`BADGE EARNED: ${label}!`, 3200)
    sparkleBurst([playerPos.x, playerPos.z], 2.2, 16)
    // R12 Part 4: modules can be played in ANY order - the certificate (and
    // the finale) unlock the moment all five badges are earned
    if (badges.length + 1 >= 5 && !get().gameComplete) get().unlockParty()
    if (badges.length === 0) {
      get().showLesson('Your first badge! Finish every module to fill your trophy shelf at the finale.', 'badge-first', true)
    }
  },

  // ---- R9 Part 7: every townsperson answers, many guide (bubble talk) ----
  npcChat: (id) => {
    npcSay(id, npcFirstLine(id), 3)
    setTimeout(() => npcSay(id, SHARED_SECOND, 2.8), 3200)
  },

  // ---- R9 Part 8.2: the whole town celebrates at the Finale Area ----
  finaleCelebrate: () => {
    if (get()._finaleParty) return
    set({ _finaleParty: true })
    const cast = ['penny', 'theo', 'mia', 'bea', 'keeper', 'sprout', 'teller', 'clerk', 'helper', 'wanderer', 'nea', 'scoop']
    const cheers = ['You did it!', 'MONEY GURU!', 'Hip hip HOORAY!', 'The whole journey!', 'So proud of you!', 'Party time!']
    cast.forEach((id, i) => {
      const a = stage.actors[id]
      if (!a) return
      a.speed = 7 // snappy - they RUSH over
      const ang = (i / cast.length) * Math.PI * 2
      npcWalkTo(id, [playerPos.x + Math.cos(ang) * 3.2, playerPos.z + Math.sin(ang) * 3.2], {
        face: true,
        onArrive: () => { a.pose = i % 2 ? 'dance1' : 'dance2'; a.speed = 2.6 },
      })
      if (i < cheers.length) setTimeout(() => npcSay(id, cheers[i], 3), 900 + i * 700)
    })
    sparkleBurst([playerPos.x, playerPos.z], 2.4, 20)
    get().setBanner('EVERYONE CAME TO CELEBRATE YOU!', 3600)
  },

  // ---- Part J: the finale unlock ----
  // Called when the Week 3 summary closes: the mystery house opens for real.
  unlockParty: () => {
    set({ gameComplete: true, weekComplete: false, objective: 'party' })
    saveProfile({ guru: true })
    get().persist()
    get().setBanner('THE FINALE AREA IS OPEN!', 3400)
    get().showLesson('You finished the whole journey. Follow your arrow to the FINALE AREA - the party is for you!', 'party-open')
  },

  // ---- FX setters ----
  setWallet: (n) => set({ wallet: Math.max(0, Math.round(n)) }),
  sayGuide: (line, ms = 2800) => {
    clearTimeout(guideTimer)
    set({ guide: { line } })
    guideTimer = setTimeout(() => set({ guide: null }), ms)
  },
  clearGuide: () => { clearTimeout(guideTimer); set({ guide: null }) },
  setBanner: (text, ms = 2600) => {
    clearTimeout(bannerTimer)
    set({ banner: text })
    bannerTimer = setTimeout(() => set({ banner: null }), ms)
  },
  setTint: (color, ms = 1500) => {
    clearTimeout(tintTimer)
    set({ tint: { color } })
    if (ms > 0) tintTimer = setTimeout(() => set({ tint: null }), ms + 900)
  },
  clearTint: () => { clearTimeout(tintTimer); set({ tint: null }) },
  triggerSun: () => set((s) => ({ sunKey: s.sunKey + 1 })),
  hudShake: () => set((s) => ({ hudShakeKey: s.hudShakeKey + 1 })),
  pulseJar: (jar) => {
    clearTimeout(glowTimer)
    set({ jarGlow: jar })
    glowTimer = setTimeout(() => set({ jarGlow: null }), 1000)
  },
  setPlayerSpeed: (m) => set({ playerSpeedMult: m }),
  setPlayerPose: (p) => set({ playerPose: p }),

  removeBatch: (id) => set((s) => ({ coinBatches: s.coinBatches.filter((b) => b.id !== id) })),

  _baseState: () => ({
    wallet: 0, allocations: { spend: 0, save: 0, give: 0 }, week: 1, objective: 'mailbox',
    mailboxOpened: false, near: null, panelJar: null, toast: null, coinBatches: [], weekComplete: false,
    pendingWeekComplete: false, clickMarker: null, lessons: [], lessonSeen: {}, cards: [],
    scenario: null, scenarioIndex: 0, scenarioState: 'IDLE', scenarioLocked: false, attempt: 0, jarGhost: false,
    dialog: null, panelItem: null, bought: [], bramTalked: false, storeMissionDone: false, storeAttempt: 0, storeGhost: false,
    lemPhase: null, lemRound: 1, lemBundle: null, lemHours: DEFAULT_HOURS, lemPrice: null, lemResult: null,
    lemQuality: QUALITY[0], lemSign: SIGNS[0], lemWageRate: DEFAULT_WAGE_RATE, lemEvent: EVENTS[0], lemPerfect: false, lemFeatures: 0, lemSnapshot: null,
    lemCumProfit: 0, lemPoolSeen: false, lemHistory: [], lemTipHistory: [], lemTip: null,
    mg: null, mgPhase: null, mgHighlight: null, panelPortfolio: false, gameComplete: false, enterParty: false, split: null, _finaleParty: false,
    bt: null, btPanel: null, bk: null, bkPanel: null, helpOpen: false,
    guide: null, banner: null, tint: null, sunKey: 0, hudShakeKey: 0, jarGlow: null, playerSpeedMult: 1, playerPose: 'idle',
  }),

  initWorld: () => {
    playerPos.x = SPAWN[0]; playerPos.y = 1; playerPos.z = SPAWN[1]
    joystick.x = 0; joystick.y = 0; moveTarget.x = null; moveTarget.z = null
    cameraRig.azimuth = 0
    clearTimelines()
    resetStage()
    const saved = loadWallet()
    if (saved && saved.week >= 4) {
      set({
        ...get()._baseState(),
        allocations: { spend: saved.spend, save: saved.save, give: saved.give },
        week: saved.week, mailboxOpened: true, lemCumProfit: saved.lemCum || 0,
        split: saved.split || null,
        gameComplete: !!saved.guru,
      })
      if (saved.week >= 5) get().startGarden(saved.mg)
      else get().startBank(saved.bk)
      if (saved.guru) set({ objective: 'party', mgPhase: 'done', weekComplete: false, toast: null })
      return
    }
    if (saved && saved.week >= 3) {
      set({
        ...get()._baseState(),
        allocations: { spend: saved.spend, save: saved.save, give: saved.give },
        week: 3, mailboxOpened: true, lemCumProfit: saved.lemCum || 0,
        split: saved.split || null,
        gameComplete: !!saved.guru,
      })
      get().startBudget(saved.bt)
      return
    }
    if (saved && saved.week === 2) {
      set({
        ...get()._baseState(),
        allocations: { spend: saved.spend, save: saved.save, give: saved.give },
        week: 2, objective: 'lemonade', mailboxOpened: true, lemPhase: 'recap', lemCumProfit: saved.lemCum || 0,
      })
      get().snapshotLemWeek() // Part F: the rewind always has a checkpoint
      return
    }
    set(get()._baseState())
  },

  reset: () => {
    clearWallet()
    get().initWorld()
  },
}))

export const ALLOWANCE_TOTAL = ALLOWANCE

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__tayu = { useGame, playerPos, joystick, moveTarget, cameraRig }
}
