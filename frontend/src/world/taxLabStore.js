import { create } from 'zustand'

export const emptyTaxWork = () => ({
  wagesFound: false,
  withheldFound: false,
  deductionApplied: false,
  firstBracketDone: false,
  secondBracketDone: false,
  creditApplied: false,
  compared: false,
  reviewW2: false,
  reviewMath: false,
  reviewResult: false,
  signed: false,
})

export const useTaxLab = create((set) => ({
  phase: 'intro',
  taxCase: null,
  stepNumber: 1,
  work: emptyTaxWork(),

  reset: () => set({
    phase: 'intro',
    taxCase: null,
    stepNumber: 1,
    work: emptyTaxWork(),
  }),

  restore: ({ phase = 'case', taxCase = null, stepNumber = 1 } = {}) => set({
    phase: phase === 'steps' ? 'steps' : 'case',
    taxCase,
    stepNumber: Math.max(1, Math.min(6, Number(stepNumber || 1))),
    work: emptyTaxWork(),
  }),

  openCasePicker: () => set({ phase: 'case', taxCase: null, stepNumber: 1, work: emptyTaxWork() }),

  chooseCase: (taxCase) => set({
    phase: 'steps',
    taxCase,
    stepNumber: 1,
    work: emptyTaxWork(),
  }),

  markAction: (key) => set((state) => ({
    work: state.work[key] ? state.work : { ...state.work, [key]: true },
  })),

  toggleReview: (key) => set((state) => ({
    work: { ...state.work, [key]: !state.work[key] },
  })),

  sign: () => set((state) => ({ work: { ...state.work, signed: true } })),

  nextStep: () => set((state) => ({
    stepNumber: Math.min(6, state.stepNumber + 1),
  })),

  complete: () => set({ phase: 'complete' }),
}))
