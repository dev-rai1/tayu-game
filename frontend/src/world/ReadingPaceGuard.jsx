import { useEffect, useMemo, useState } from 'react'
import { useGame } from './store.js'

const MIN_READ_MS = 1600
const MAX_READ_MS = 4500

export function readingUnlockMs(text) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length
  return Math.max(MIN_READ_MS, Math.min(MAX_READ_MS, 1200 + words * 90))
}

export function ReadingPaceGuard() {
  const dialog = useGame((s) => s.dialog)
  const lessons = useGame((s) => s.lessons)
  const cards = useGame((s) => s.cards)
  const lemPhase = useGame((s) => s.lemPhase)
  const lemRound = useGame((s) => s.lemRound)
  const lemTip = useGame((s) => s.lemTip)
  const [unlockAt, setUnlockAt] = useState(0)
  const [now, setNow] = useState(Date.now())

  const activeMessage = useMemo(() => {
    if (dialog) {
      return {
        key: `dialog:${dialog.name}:${dialog.index}`,
        text: dialog.lines?.[dialog.index] || '',
      }
    }
    if (lessons[0]) return { key: `lesson:${lessons[0].id}`, text: lessons[0].text }
    if (cards[0]) return { key: `card:${cards[0].id}`, text: [cards[0].text, cards[0].nums, cards[0].nudge].filter(Boolean).join(' ') }
    if (['recapCard', 'results', 'goalCard', 'tipCard'].includes(lemPhase)) {
      return {
        key: `lemonade:${lemRound}:${lemPhase}`,
        text: lemPhase === 'tipCard' ? lemTip : 'Review this result before continuing to the next step.',
      }
    }
    return null
  }, [cards, dialog, lemPhase, lemRound, lemTip, lessons])

  useEffect(() => {
    if (!activeMessage) {
      setUnlockAt(0)
      return undefined
    }
    const nextUnlock = Date.now() + readingUnlockMs(activeMessage.text)
    setNow(Date.now())
    setUnlockAt(nextUnlock)
    const timer = window.setInterval(() => setNow(Date.now()), 200)
    return () => window.clearInterval(timer)
  }, [activeMessage?.key])

  const locked = Boolean(activeMessage && now < unlockAt)

  useEffect(() => {
    if (!locked) return undefined
    const stopFastAdvance = (event) => {
      if (!['KeyE', 'Enter', 'Space'].includes(event.code)) return
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation?.()
    }
    window.addEventListener('keydown', stopFastAdvance, true)
    return () => window.removeEventListener('keydown', stopFastAdvance, true)
  }, [locked])

  if (!locked) return null
  const seconds = Math.max(1, Math.ceil((unlockAt - now) / 1000))

  return (
    <div className="pointer-events-auto fixed inset-0 z-[610]" aria-live="polite" aria-label="Reading time">
      <div className="absolute inset-x-0 bottom-5 flex justify-center px-4">
        <div className="rounded-full border-2 border-sun bg-navy/95 px-5 py-2 text-sm font-extrabold text-white shadow-2xl">
          Take a moment to read · Continue unlocks in {seconds}s
        </div>
      </div>
    </div>
  )
}
