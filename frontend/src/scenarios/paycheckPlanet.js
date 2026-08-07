export const TOTAL_TAX_STEPS = 6
// Compatibility with existing progress/analytics code that still uses the old name.
export const TOTAL_PAYCHECK_WEEKS = TOTAL_TAX_STEPS

export const GAME_STANDARD_DEDUCTION = 9000
export const FIRST_BRACKET_LIMIT = 5000
export const FIRST_BRACKET_RATE = 0.10
export const SECOND_BRACKET_RATE = 0.12

export const TAX_CASES = [
  {
    id: 'library',
    label: 'LIBRARY JOB W-2',
    note: 'Smaller wages · simple return',
    wages: 12000,
    withheld: 400,
    credit: 50,
    x: -2.6,
  },
  {
    id: 'camp',
    label: 'CAMP JOB W-2',
    note: 'Middle wages · small refund',
    wages: 18000,
    withheld: 900,
    credit: 150,
    x: 0,
  },
  {
    id: 'design',
    label: 'DESIGN GIG W-2',
    note: 'Higher wages · amount due',
    wages: 24000,
    withheld: 1200,
    credit: 250,
    x: 2.6,
  },
]

export const TAX_INTRO_STEPS = [
  'Read a sample W-2 and find wages plus federal tax withheld.',
  'Subtract the game deduction to find taxable income.',
  'Use two simple tax brackets to calculate tax.',
  'Subtract a tax credit from the tax you calculated.',
  'Compare tax withheld with final tax to find a refund or amount due.',
  'Review the return and file the finished practice return.',
]

const dollars = (value) => `$${Math.max(0, Math.round(Number(value || 0))).toLocaleString('en-US')}`
const unique = (values) => [...new Set(values.map((value) => Math.max(0, Math.round(Number(value || 0)))))]

export function taxableIncomeFor(taxCase) {
  if (!taxCase) return 0
  return Math.max(0, Math.round(taxCase.wages - GAME_STANDARD_DEDUCTION))
}

export function bracketTax(taxableIncome) {
  const taxable = Math.max(0, Math.round(Number(taxableIncome || 0)))
  const first = Math.min(FIRST_BRACKET_LIMIT, taxable)
  const second = Math.max(0, taxable - FIRST_BRACKET_LIMIT)
  return Math.round(first * FIRST_BRACKET_RATE + second * SECOND_BRACKET_RATE)
}

export function taxReturnMath(taxCase) {
  if (!taxCase) {
    return {
      wages: 0,
      withheld: 0,
      deduction: GAME_STANDARD_DEDUCTION,
      taxableIncome: 0,
      firstBracketIncome: 0,
      secondBracketIncome: 0,
      taxBeforeCredits: 0,
      credit: 0,
      finalTax: 0,
      refund: 0,
      amountDue: 0,
    }
  }

  const taxableIncome = taxableIncomeFor(taxCase)
  const firstBracketIncome = Math.min(FIRST_BRACKET_LIMIT, taxableIncome)
  const secondBracketIncome = Math.max(0, taxableIncome - FIRST_BRACKET_LIMIT)
  const taxBeforeCredits = bracketTax(taxableIncome)
  const credit = Math.max(0, Math.round(Number(taxCase.credit || 0)))
  const finalTax = Math.max(0, taxBeforeCredits - credit)
  const difference = Math.round(Number(taxCase.withheld || 0) - finalTax)

  return {
    wages: Math.round(taxCase.wages),
    withheld: Math.round(taxCase.withheld),
    deduction: GAME_STANDARD_DEDUCTION,
    taxableIncome,
    firstBracketIncome,
    secondBracketIncome,
    taxBeforeCredits,
    credit,
    finalTax,
    refund: Math.max(0, difference),
    amountDue: Math.max(0, -difference),
  }
}

function moneyChoice(id, value, correct = false) {
  return { id, label: dollars(value), correct }
}

function resultLabel(math) {
  if (math.refund > 0) return `${dollars(math.refund)} REFUND`
  if (math.amountDue > 0) return `${dollars(math.amountDue)} AMOUNT DUE`
  return '$0 EVEN'
}

export function filingStepFor(taxCase, stepNumber) {
  const math = taxReturnMath(taxCase)
  const step = Math.max(1, Math.min(TOTAL_TAX_STEPS, Number(stepNumber || 1)))

  if (step === 1) {
    return {
      step,
      title: 'Read the W-2',
      eyebrow: 'Step 1 · income document',
      prompt: 'Which W-2 numbers belong on this practice return?',
      explanation: `Box 1 wages are ${dollars(math.wages)}. Box 2 federal income tax withheld is ${dollars(math.withheld)}.`,
      hint: 'On a W-2, Box 1 is wages and Box 2 is federal income tax withheld.',
      choices: [
        { id: 'swap', label: `${dollars(math.withheld)} wages · ${dollars(math.wages)} withheld`, correct: false },
        { id: 'right', label: `${dollars(math.wages)} wages · ${dollars(math.withheld)} withheld`, correct: true },
        { id: 'net', label: `${dollars(math.wages - math.withheld)} wages · $0 withheld`, correct: false },
      ],
    }
  }

  if (step === 2) {
    const wrong = unique([math.wages, math.taxableIncome + math.withheld, Math.max(0, math.taxableIncome - 1000)])
      .filter((value) => value !== math.taxableIncome)
    return {
      step,
      title: 'Find taxable income',
      eyebrow: 'Step 2 · subtraction',
      prompt: `${dollars(math.wages)} wages − ${dollars(math.deduction)} game deduction = ?`,
      explanation: `Taxable income is ${dollars(math.wages)} − ${dollars(math.deduction)} = ${dollars(math.taxableIncome)}.`,
      hint: 'Subtract the deduction from wages. Do not subtract withholding here.',
      choices: [
        moneyChoice('wrong-a', wrong[0] ?? math.wages),
        moneyChoice('right', math.taxableIncome, true),
        moneyChoice('wrong-b', wrong[1] ?? math.taxableIncome + 1000),
      ],
    }
  }

  if (step === 3) {
    const firstTax = Math.round(math.firstBracketIncome * FIRST_BRACKET_RATE)
    const secondTax = Math.round(math.secondBracketIncome * SECOND_BRACKET_RATE)
    return {
      step,
      title: 'Use the tax brackets',
      eyebrow: 'Step 3 · multiplication + addition',
      prompt: math.secondBracketIncome > 0
        ? `${dollars(math.firstBracketIncome)} × 10% + ${dollars(math.secondBracketIncome)} × 12% = ?`
        : `${dollars(math.firstBracketIncome)} × 10% = ?`,
      explanation: math.secondBracketIncome > 0
        ? `${dollars(firstTax)} + ${dollars(secondTax)} = ${dollars(math.taxBeforeCredits)} tax before credits.`
        : `${dollars(math.firstBracketIncome)} × 10% = ${dollars(math.taxBeforeCredits)} tax before credits.`,
      hint: 'Only the dollars above the first $5,000 use the 12% practice rate.',
      choices: [
        moneyChoice('all-ten', Math.round(math.taxableIncome * FIRST_BRACKET_RATE)),
        moneyChoice('right', math.taxBeforeCredits, true),
        moneyChoice('all-twelve', Math.round(math.taxableIncome * SECOND_BRACKET_RATE)),
      ],
    }
  }

  if (step === 4) {
    return {
      step,
      title: 'Apply the tax credit',
      eyebrow: 'Step 4 · subtract a credit',
      prompt: `${dollars(math.taxBeforeCredits)} tax − ${dollars(math.credit)} practice credit = ?`,
      explanation: `A credit reduces tax directly: ${dollars(math.taxBeforeCredits)} − ${dollars(math.credit)} = ${dollars(math.finalTax)} final tax.`,
      hint: 'A credit comes off the tax itself. Subtract it after calculating bracket tax.',
      choices: [
        moneyChoice('add-credit', math.taxBeforeCredits + math.credit),
        moneyChoice('right', math.finalTax, true),
        moneyChoice('ignore-credit', math.taxBeforeCredits),
      ],
    }
  }

  if (step === 5) {
    const correct = resultLabel(math)
    return {
      step,
      title: 'Refund or amount due?',
      eyebrow: 'Step 5 · compare',
      prompt: `${dollars(math.withheld)} withheld − ${dollars(math.finalTax)} final tax = ?`,
      explanation: math.refund > 0
        ? `Withholding is ${dollars(math.refund)} more than final tax, so this practice return gets a ${dollars(math.refund)} refund.`
        : math.amountDue > 0
          ? `Final tax is ${dollars(math.amountDue)} more than withholding, so this practice return has ${dollars(math.amountDue)} due.`
          : 'Withholding exactly matches final tax, so there is no refund and nothing due.',
      hint: 'If withholding is bigger, the difference is a refund. If final tax is bigger, the difference is due.',
      choices: [
        { id: 'flip', label: math.refund > 0 ? `${dollars(math.refund)} AMOUNT DUE` : `${dollars(math.amountDue)} REFUND`, correct: false },
        { id: 'right', label: correct, correct: true },
        { id: 'withheld', label: `${dollars(math.withheld)} REFUND`, correct: false },
      ],
    }
  }

  return {
    step,
    title: 'Review and file',
    eyebrow: 'Step 6 · final check',
    prompt: 'Which summary matches the return you just completed?',
    explanation: `Wages ${dollars(math.wages)} · taxable income ${dollars(math.taxableIncome)} · final tax ${dollars(math.finalTax)} · ${resultLabel(math).toLowerCase()}.`,
    hint: 'Check the W-2 numbers, taxable income, final tax, and refund/due before filing.',
    choices: [
      {
        id: 'gross-tax',
        label: `Tax = all wages (${dollars(math.wages)}) · refund = withholding`,
        correct: false,
      },
      {
        id: 'right',
        label: `${dollars(math.taxableIncome)} taxable · ${dollars(math.finalTax)} final tax · ${resultLabel(math)}`,
        correct: true,
      },
      {
        id: 'skip-credit',
        label: `${dollars(math.taxableIncome)} taxable · ${dollars(math.taxBeforeCredits)} final tax · no comparison`,
        correct: false,
      },
    ],
  }
}

export function taxResultSummary(taxCase) {
  const math = taxReturnMath(taxCase)
  return math.refund > 0
    ? `RETURN FILED · ${dollars(math.refund)} PRACTICE REFUND`
    : math.amountDue > 0
      ? `RETURN FILED · ${dollars(math.amountDue)} PRACTICE AMOUNT DUE`
      : 'RETURN FILED · EVEN'
}
