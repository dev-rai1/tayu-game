import { create } from 'zustand'
import { taxStationForStep } from './taxDistrictLayout.js'

export const emptyTaxWork = () => ({
  prediction: null,
  predictionCorrect: false,
  predictionMistakes: 0,
  selectedW2Fields: [],
  w2Mistakes: 0,
  deductionTarget: null,
  deductionApplied: false,
  deductionMistakes: 0,
  bracketInputs: {
    firstIncome: '',
    secondIncome: '',
    firstTax: '',
    secondTax: '',
  },
  bracketValidated: false,
  bracketMistakes: 0,
  creditTarget: null,
  creditFinalInput: '',
  creditApplied: false,
  creditMistakes: 0,
  reconcileKind: null,
  reconcileAmount: '',
  compared: false,
  reconcileMistakes: 0,
  reviewField: null,
  reviewCorrection: '',
  reviewCorrected: false,
  reviewMistakes: 0,
  signatureText: '',
  signed: false,
})

const boundedStep = (stepNumber) => Math.max(1, Math.min(6, Number(stepNumber || 1)))

export const useTaxLab = create((set, get) => ({
  phase: 'intro',
  taxCase: null,
  candidateCase: null,
  stepNumber: 1,
  panel: null,
  feedback: null,
  nearbyAction: null,
  worldNotice: 'You are at the TAYU Tax Office. Talk to Rex the Assessor to start Module 7.',
  work: emptyTaxWork(),

  reset: () => set({
    phase: 'intro',
    taxCase: null,
    candidateCase: null,
    stepNumber: 1,
    panel: null,
    feedback: null,
    nearbyAction: null,
    worldNotice: 'You are at the TAYU Tax Office. Talk to Rex the Assessor to start Module 7.',
    work: emptyTaxWork(),
  }),

  restore: ({ phase = 'case', taxCase = null, stepNumber = 1 } = {}) => {
    const restoredStep = boundedStep(stepNumber)
    const restoredPhase = phase === 'steps' && taxCase ? 'steps' : 'case'
    set({
      phase: restoredPhase,
      taxCase,
      candidateCase: null,
      stepNumber: restoredStep,
      panel: null,
      feedback: null,
      nearbyAction: null,
      worldNotice: restoredPhase === 'steps'
        ? `Continue the Module 7 return at the ${taxStationForStep(restoredStep).label}.`
        : 'Meet one of the three taxpayers waiting inside the Tax Office.',
      work: emptyTaxWork(),
    })
  },

  openGuide: () => set({ panel: 'guide', feedback: null, nearbyAction: null }),

  startCaseSelection: () => set({
    phase: 'case',
    taxCase: null,
    candidateCase: null,
    stepNumber: 1,
    panel: null,
    feedback: null,
    nearbyAction: null,
    worldNotice: 'Walk up to Ari, Sam, or Jordan inside the Tax Office. Talk to one taxpayer and decide what the W-2 actually proves.',
    work: emptyTaxWork(),
  }),

  previewClient: (taxCase) => set({
    candidateCase: taxCase,
    panel: 'client',
    feedback: null,
    nearbyAction: null,
    work: { ...get().work, prediction: null, predictionCorrect: false },
  }),

  chooseCase: (taxCase) => set({
    phase: 'steps',
    taxCase,
    candidateCase: null,
    stepNumber: 1,
    // Return to the 3D office after the learner makes the client decision.
    // The W-2 desk animates in the room and the learner walks to it instead of
    // being thrown straight into another full-screen question panel.
    panel: null,
    feedback: null,
    nearbyAction: null,
    worldNotice: `Case accepted. Watch the W-2 desk react, then walk over to ${taxStationForStep(1).label}.`,
    work: { ...emptyTaxWork(), prediction: get().work.prediction, predictionCorrect: get().work.predictionCorrect, predictionMistakes: get().work.predictionMistakes },
  }),

  openStation: (stepNumber) => {
    const state = get()
    const requested = boundedStep(stepNumber)
    if (state.phase !== 'steps') return false
    if (requested !== state.stepNumber) {
      set({ worldNotice: `That station is not next. Continue at the ${taxStationForStep(state.stepNumber).label}.` })
      return false
    }
    set({ panel: taxStationForStep(requested).key, feedback: null, nearbyAction: null })
    return true
  },

  closePanel: () => set({ panel: null, feedback: null }),

  setFeedback: (feedback) => set({ feedback }),
  setNearbyAction: (nearbyAction) => set({ nearbyAction }),

  setWorkValue: (key, value) => set((state) => ({
    work: { ...state.work, [key]: value },
  })),

  setBracketInput: (key, value) => set((state) => ({
    work: {
      ...state.work,
      bracketInputs: { ...state.work.bracketInputs, [key]: value },
    },
  })),

  addW2Field: (field) => set((state) => ({
    work: state.work.selectedW2Fields.includes(field)
      ? state.work
      : { ...state.work, selectedW2Fields: [...state.work.selectedW2Fields, field] },
  })),

  incrementMistake: (key) => set((state) => ({
    work: { ...state.work, [key]: Number(state.work[key] || 0) + 1 },
  })),

  advanceStep: () => set((state) => {
    if (state.stepNumber >= 6) {
      return {
        stepNumber: 6,
        panel: null,
        feedback: null,
        nearbyAction: null,
        worldNotice: 'Return reviewed. Watch the filing area react, then finish at the E-FILE DESK.',
      }
    }

    const next = state.stepNumber + 1
    const nextStation = taxStationForStep(next)
    return {
      stepNumber: next,
      // Every completed decision hands control back to the physical Tax Office.
      // The next station's prop/glow is animated in-world so Module 7 plays as a
      // building sequence rather than a chain of question screens.
      panel: null,
      feedback: null,
      nearbyAction: null,
      worldNotice: `Good work. Watch the office react, then walk to the ${nextStation.label}.`,
    }
  }),

  sign: () => set((state) => ({ work: { ...state.work, signed: true } })),

  complete: () => set({
    phase: 'complete',
    panel: 'complete',
    feedback: null,
    nearbyAction: null,
    worldNotice: 'Practice return filed. Review it with Rex, then finish Module 7.',
  }),
}))
