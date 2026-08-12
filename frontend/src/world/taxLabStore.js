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
  bracketInputs: { firstIncome: '', secondIncome: '', firstTax: '', secondTax: '' },
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
  worldNotice: 'Stay in the town and walk to the TAYU Tax Office. Rex the Assessor is waiting at the counter.',
  work: emptyTaxWork(),

  reset: () => set({ phase: 'intro', taxCase: null, candidateCase: null, stepNumber: 1, panel: null, feedback: null, nearbyAction: null, worldNotice: 'Stay in the town and walk to the TAYU Tax Office. Rex the Assessor is waiting at the counter.', work: emptyTaxWork() }),

  restore: ({ phase = 'case', taxCase = null, stepNumber = 1 } = {}) => {
    const restoredStep = boundedStep(stepNumber)
    const restoredPhase = phase === 'steps' && taxCase ? 'steps' : 'case'
    set({
      phase: restoredPhase, taxCase, candidateCase: null, stepNumber: restoredStep, panel: null, feedback: null, nearbyAction: null,
      worldNotice: restoredPhase === 'steps' ? `Walk through the Tax Office district to the ${taxStationForStep(restoredStep).label}.` : 'Meet one of the three taxpayers waiting outside the Tax Office.',
      work: emptyTaxWork(),
    })
  },

  openGuide: () => set({ panel: 'guide', feedback: null, nearbyAction: null }),
  startCaseSelection: () => set({ phase: 'case', taxCase: null, candidateCase: null, stepNumber: 1, panel: null, feedback: null, nearbyAction: null, worldNotice: 'Walk up to Ari, Sam, or Jordan. Talk to one taxpayer and decide what the W-2 actually proves.', work: emptyTaxWork() }),
  previewClient: (taxCase) => set({ candidateCase: taxCase, panel: 'client', feedback: null, nearbyAction: null, work: { ...get().work, prediction: null, predictionCorrect: false } }),
  chooseCase: (taxCase) => set({ phase: 'steps', taxCase, candidateCase: null, stepNumber: 1, panel: null, feedback: null, nearbyAction: null, worldNotice: `Case accepted. Walk to the ${taxStationForStep(1).label} in this same district.`, work: { ...emptyTaxWork(), prediction: get().work.prediction, predictionCorrect: get().work.predictionCorrect, predictionMistakes: get().work.predictionMistakes } }),

  openStation: (stepNumber) => {
    const state = get()
    const requested = boundedStep(stepNumber)
    if (state.phase !== 'steps') return false
    if (requested !== state.stepNumber) {
      set({ worldNotice: `That station is not next. Walk to the ${taxStationForStep(state.stepNumber).label}.` })
      return false
    }
    set({ panel: taxStationForStep(requested).key, feedback: null, nearbyAction: null })
    return true
  },

  closePanel: () => set({ panel: null, feedback: null }),
  setFeedback: (feedback) => set({ feedback }),
  setNearbyAction: (nearbyAction) => set({ nearbyAction }),
  setWorkValue: (key, value) => set((state) => ({ work: { ...state.work, [key]: value } })),
  setBracketInput: (key, value) => set((state) => ({ work: { ...state.work, bracketInputs: { ...state.work.bracketInputs, [key]: value } } })),
  addW2Field: (field) => set((state) => ({ work: state.work.selectedW2Fields.includes(field) ? state.work : { ...state.work, selectedW2Fields: [...state.work.selectedW2Fields, field] } })),
  incrementMistake: (key) => set((state) => ({ work: { ...state.work, [key]: Number(state.work[key] || 0) + 1 } })),

  advanceStep: () => set((state) => {
    const next = Math.min(6, state.stepNumber + 1)
    return { stepNumber: next, panel: null, feedback: null, nearbyAction: null, worldNotice: state.stepNumber >= 6 ? 'Return reviewed. Stay in the district and finish filing at the E-FILE DESK.' : `Good work. Walk to the ${taxStationForStep(next).label}.` }
  }),
  sign: () => set((state) => ({ work: { ...state.work, signed: true } })),
  complete: () => set({ phase: 'complete', panel: 'complete', feedback: null, nearbyAction: null, worldNotice: 'Practice return filed. Talk to Rex or finish Module 7.' }),
}))
