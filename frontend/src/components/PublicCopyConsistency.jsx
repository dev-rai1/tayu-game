import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Keep older static/help copy aligned with the public module numbering. The
// canonical catalog is Module 5A/5B = Money Garden and Module 6 = Tax Lab.
const PHRASE_REPLACEMENTS = [
  [
    'five playable core money modules',
    'six core money modules, with Money Garden split into 5A and 5B',
  ],
  [
    'six core money modules, with Money Garden split into 6A and 6B',
    'six core money modules, with Money Garden split into 5A and 5B',
  ],
  ['Money Garden — Modules 6A + 6B', 'Money Garden — Modules 5A + 5B'],
  ['Module 6A', 'Module 5A'],
  ['Module 6B', 'Module 5B'],
  ['Finish Module 5 first', 'Finish Module 5 first'],
  [
    'Take $1 moves Pocket/Bank money to READY TO INVEST. Tuck $1 or Put in $1 moves READY TO INVEST cash into Pocket/Bank. Sell returns money to READY TO INVEST.',
    'Use Move to Ready to Invest to bring Pocket or Bank Sprout money back for investing. Use Move to Pocket or Move to Bank Sprout to set cash aside. Sell returns money to READY TO INVEST.',
  ],
  [
    'If money is in Pocket or Bank Sprout, Take $1 moves it back to READY TO INVEST.',
    'If money is in Pocket or Bank Sprout, move it back to READY TO INVEST before buying shares.',
  ],
  [
    'Tuck $1 moves READY TO INVEST cash into Pocket; Take $1 brings Pocket money back when you want to invest it.',
    'Move cash to Pocket when you may need it soon; move it back to READY TO INVEST when you are ready to buy shares.',
  ],
  ['ready to plant', 'READY TO INVEST'],
]

function normalizeText(root = document.body) {
  if (!root) return
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)

  nodes.forEach((node) => {
    let text = node.nodeValue || ''
    let changed = false
    PHRASE_REPLACEMENTS.forEach(([from, to]) => {
      if (!text.includes(from) || from === to) return
      text = text.replaceAll(from, to)
      changed = true
    })
    if (changed) node.nodeValue = text
  })
}

export function PublicCopyConsistency() {
  const { pathname } = useLocation()

  useEffect(() => {
    normalizeText()
    const observer = new MutationObserver(() => normalizeText())
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [pathname])

  return null
}
