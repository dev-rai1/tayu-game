const r2 = (value) => Math.round(Number(value || 0) * 100) / 100

export function lemonadePrimaryCorrection(result, levers, analysis) {
  const plan = analysis?.plan
  if (!plan) {
    return {
      lever: 'plan',
      action: 'Change one choice, then compare the new result with this round.',
    }
  }

  const priceGap = r2(levers.price - plan.price)
  if (Math.abs(priceGap) >= 0.25) {
    return priceGap > 0
      ? { lever: 'price', action: 'Lower the price first, then test the same plan again.' }
      : { lever: 'price', action: 'Raise the price first, then test the same plan again.' }
  }

  if (result.missed >= 2) {
    return { lever: 'batch', action: 'Choose a larger batch first so more waiting customers can buy.' }
  }

  if (result.leftover >= 2) {
    return { lever: 'batch', action: 'Choose a smaller batch first so fewer cups are left over.' }
  }

  if (levers.hours !== plan.hours) {
    return levers.hours < plan.hours
      ? { lever: 'hours', action: 'Stay open longer first, then compare how many customers buy.' }
      : { lever: 'hours', action: 'Try fewer open hours first so wages cost less.' }
  }

  if (levers.quality.id !== plan.quality.id) {
    return { lever: 'quality', action: 'Change only the recipe quality first, then compare demand and cost.' }
  }

  if (levers.sign.id !== plan.sign.id) {
    return { lever: 'sign', action: 'Change only the sign first, then compare its cost with the extra customers.' }
  }

  if (Math.abs(priceGap) > 0.05) {
    return priceGap > 0
      ? { lever: 'price', action: 'Lower the price a little first, then compare the result.' }
      : { lever: 'price', action: 'Raise the price a little first, then compare the result.' }
  }

  return {
    lever: 'plan',
    action: 'Keep the strongest choices and change only one small part of the plan.',
  }
}
