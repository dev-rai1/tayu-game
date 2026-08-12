import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const PHRASE_REPLACEMENTS = [
  ['five playable core money modules', 'seven core money modules, with Money Garden split into 5A and 5B'],
  ['six core money modules, with Money Garden split into 5A and 5B', 'seven core money modules, with Money Garden split into 5A and 5B'],
  ['six core money modules, with Money Garden split into 6A and 6B', 'seven core money modules, with Money Garden split into 5A and 5B'],
  ['Money Garden — Modules 6A + 6B', 'Money Garden — Modules 5A + 5B'], ['Module 6A', 'Module 5A'], ['Module 6B', 'Module 5B'],
  ['Money Garden → Finale', 'Money Garden → Bond Street → Tax Office → Finale'], ['Money Garden → Paycheck Planet → Finale', 'Money Garden → Bond Street → Tax Office → Finale'], ['Paycheck Planet · Tax Town', 'The TAYU Tax Office'],
  ['You saved, you shopped smart, you gave, you ran a business, you invested, you budgeted, and you banked. That makes you a true MONEY GURU.', 'You saved, you shopped smart, you gave, you ran a business, you invested in stocks and bonds, you budgeted, you banked, and you paid your taxes. That makes you a true MONEY GURU.'],
  ['You saved, you shopped smart, you gave, you ran a business, you invested in stocks and bonds, you budgeted, you banked, and you filed a practice tax return. That makes you a true MONEY GURU.', 'You saved, you shopped smart, you gave, you ran a business, you invested in stocks and bonds, you budgeted, you banked, and you paid your taxes. That makes you a true MONEY GURU.'],
  ['Mastered saving, smart spending, giving, running a business, investing, budgeting, and banking.', 'Mastered saving, smart spending, giving, running a business, investing in stocks and bonds, budgeting, banking, and filing a tax return.'],
  ['Mastered saving, smart spending, giving, running a business, investing in stocks and bonds, budgeting, banking, and filing a practice tax return.', 'Mastered saving, smart spending, giving, running a business, investing in stocks and bonds, budgeting, banking, and filing a tax return.'],
  ['I can grow money with patience in the garden.', 'I can compare stock ownership with bond lending and understand how taxes affect my money.'], ['ready to plant', 'READY TO INVEST'],
]
function normalizeText(root = document.body) {
  if (!root) return
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  nodes.forEach((node) => {
    let text = node.nodeValue || '', changed = false
    PHRASE_REPLACEMENTS.forEach(([from, to]) => { if (text.includes(from)) { text = text.replaceAll(from, to); changed = true } })
    const parent = node.parentElement
    if (parent?.closest('[data-tax-field-ui="true"], [data-tax-station-panel="true"]')) {
      const next = text.replaceAll('Maya · Tax Guide', 'Rex · Tax Assessor').replaceAll('Welcome to the Tax Lab', 'Welcome to the TAYU Tax Office').replaceAll('Tax Lab', 'Tax Office').replaceAll('Finish Module 5', 'Finish Module 7').replaceAll('Finish Module 6', 'Finish Module 7').replaceAll('Module 5 complete', 'Module 7 complete').replaceAll('Module 6 complete', 'Module 7 complete').replaceAll('Module 5 ·', 'Module 7 ·').replaceAll('Module 6 ·', 'Module 7 ·')
      if (next !== text) { text = next; changed = true }
    }
    if (text.trim() === 'Finale Area' || text.trim() === '7. Finale Area') { text = '8. Finale Area'; changed = true }
    if (changed) node.nodeValue = text
  })
}
export function PublicCopyConsistency() {
  const { pathname } = useLocation()
  useEffect(() => { normalizeText(); const observer = new MutationObserver(() => normalizeText()); observer.observe(document.body, { childList: true, subtree: true, characterData: true }); return () => observer.disconnect() }, [pathname])
  return null
}
