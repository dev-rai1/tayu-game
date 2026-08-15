const r2 = (value) => Math.round(Number(value || 0) * 100) / 100

export function moneyGardenHarvestSummary(mg = {}) {
  const companies = Object.values(mg?.companies || {})
  const stockValue = r2(companies.reduce((sum, company) => sum + Math.max(0, Number(company?.owned || 0)) * Math.max(0, Number(company?.price || 0)), 0))
  const startingInvestment = r2(Math.max(0, Number(mg?.startTotal || 0)))
  const readyCash = r2(Math.max(0, Number(mg?.cash || 0)))
  const endingInvestmentValue = r2(readyCash + stockValue)
  const profit = r2(endingInvestmentValue - startingInvestment)
  const roiPercent = startingInvestment > 0 ? r2((profit / startingInvestment) * 100) : 0

  return {
    startingInvestment,
    stockValue,
    readyCash,
    endingInvestmentValue,
    profit,
    roiPercent,
  }
}

export function bondCompletionSummary(bondStreet = {}) {
  const principal = r2(Math.max(0, Number(bondStreet?.principal || 0)))
  const interest = r2(Math.max(0, Number(bondStreet?.interest || 0)))
  const ending = r2(Math.max(0, Number(bondStreet?.ending || principal + interest)))
  const roiPercent = principal > 0 ? r2((interest / principal) * 100) : 0

  return {
    principal,
    interest,
    ending,
    profit: interest,
    roiPercent,
    allocations: bondStreet?.allocations || {},
    investedInMuni: Boolean(bondStreet?.investedInMuni),
  }
}

export function journeyIncomeCarryover(wallet = {}, profile = {}) {
  const lemonadeProfit = r2(Math.max(0, Number(wallet?.lemCum || 0)))
  const garden = wallet?.mg?.harvest || {}
  const realizedCapitalGain = r2(Math.max(0, Number(garden?.realizedCapitalGain || 0)))
  const bondInterest = r2(Math.max(0, Number(profile?.bondStreet?.interest || 0)))

  return {
    lemonadeProfit,
    realizedCapitalGain,
    bondInterest,
    totalPracticeIncome: r2(lemonadeProfit + realizedCapitalGain + bondInterest),
    gardenDecision: garden?.decision || null,
    investedInMuni: Boolean(profile?.bondStreet?.investedInMuni),
  }
}
