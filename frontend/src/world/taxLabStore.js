import { create } from 'zustand'
import { taxStationForStep } from './taxDistrictLayout.js'

export const TAX_WORLD_EVENT = 'tayu-tax-world-action'

export function emitTaxWorld(kind, detail = {}) {
  try {
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(TAX_WORLD_EVENT, { detail: { kind, ...detail } }))
  } catch { /* custom events can be unavailable in tests */ }
}

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
  worldNotice: 'Walk inside Module 7 · TAYU Tax Office and talk to Rex to begin.',
  work: emptyTaxWork(),

  reset: () => set({ phase: 'intro', taxCase: null, candidateCase: null, stepNumber: 1, panel: null, feedback: null, nearbyAction: null, worldNotice: 'Walk inside Module 7 · TAYU Tax Office and talk to Rex to begin.', work: emptyTaxWork() }),

  restore: ({ phase = 'case', taxCase = null, stepNumber = 1 } = {}) => {
    const restoredStep = boundedStep(stepNumber)
    const restoredPhase = phase === 'steps' && taxCase ? 'steps' : 'case'
    set({ phase: restoredPhase, taxCase, candidateCase: null, stepNumber: restoredStep, panel: null, feedback: null, nearbyAction: null, worldNotice: restoredPhase === 'steps' ? `Continue Module 7 inside the Tax Office at ${taxStationForStep(restoredStep).label}.` : 'Meet Ari, Sam, or Jordan inside the Tax Office and choose a taxpayer.', work: emptyTaxWork() })
  },

  openGuide: () => set({ panel: 'guide', feedback: null, nearbyAction: null }),

  startCaseSelection: () => {
    emitTaxWorld('guide-finished')
    set({ phase: 'case', taxCase: null, candidateCase: null, stepNumber: 1, panel: null, feedback: null, nearbyAction: null, worldNotice: 'Walk to Ari, Sam, or Jordan inside the Tax Office. Talk to one taxpayer and inspect the W-2.', work: emptyTaxWork() })
  },

  previewClient: (taxCase) => set({ candidateCase: taxCase, panel: 'client', feedback: null, nearbyAction: null, work: { ...get().work, prediction: null, predictionCorrect: false } }),

  chooseCase: (taxCase) => {
    emitTaxWorld('client-selected', { caseId: taxCase?.id, stepNumber: 1 })
    set({ phase: 'steps', taxCase, candidateCase: null, stepNumber: 1, panel: null, feedback: null, nearbyAction: null, worldNotice: `Case accepted. Watch the taxpayer and W-2 desk react, then walk to ${taxStationForStep(1).label}.`, work: { ...emptyTaxWork(), prediction: get().work.prediction, predictionCorrect: get().work.predictionCorrect, predictionMistakes: get().work.predictionMistakes } })
  },

  openStation: (stepNumber) => {
    const state = get()
    const requested = boundedStep(stepNumber)
    if (state.phase !== 'steps') return false
    if (requested !== state.stepNumber) {
      set({ worldNotice: `That station is not next. Continue at ${taxStationForStep(state.stepNumber).label}.` })
      return false
    }
    set({ panel: taxStationForStep(requested).key, feedback: null, nearbyAction: null })
    return true
  },

  closePanel: () => set({ panel: null, feedback: null }),
  setFeedback: (feedback) => set({ feedback }),
  setNearbyAction: (nearbyAction) => set({ nearbyAction }),
  setWorldNotice: (worldNotice) => set({ worldNotice }),
  setWorkValue: (key, value) => set((state) => ({ work: { ...state.work, [key]: value } })),
  setBracketInput: (key, value) => set((state) => ({ work: { ...state.work, bracketInputs: { ...state.work.bracketInputs, [key]: value } } })),
  addW2Field: (field) => set((state) => ({ work: state.work.selectedW2Fields.includes(field) ? state.work : { ...state.work, selectedW2Fields: [...state.work.selectedW2Fields, field] } })),
  incrementMistake: (key) => set((state) => ({ work: { ...state.work, [key]: Number(state.work[key] || 0) + 1 } })),

  advanceStep: () => {
    const current = get().stepNumber
    emitTaxWorld('step-complete', { stepNumber: current })
    set((state) => {
      if (state.stepNumber >= 6) return { stepNumber: 6, panel: null, feedback: null, nearbyAction: null, worldNotice: 'Return reviewed. Watch Rex and the E-FILE desk react, then finish the filing.' }
      const next = state.stepNumber + 1
      return { stepNumber: next, panel: null, feedback: null, nearbyAction: null, worldNotice: `Nice work. The office reacted to your decision. Now walk to ${taxStationForStep(next).label}.` }
    })
  },

  sign: () => {
    emitTaxWorld('filing', { stepNumber: 6 })
    set((state) => ({ work: { ...state.work, signed: true }, panel: null, worldNotice: 'Watch Rex and the E-FILE desk process your decision.' }))
  },

  complete: () => {
    emitTaxWorld('filed', { stepNumber: 6 })
    set({ phase: 'complete', panel: null, feedback: null, nearbyAction: null, worldNotice: 'Practice return filed! Watch the Tax Office celebrate, then walk back to Rex to finish Module 7.' })
  },
}))
