// BANK OF TAYU v4 (Round 9, Part 6): the decision panels are GONE - every
// lesson is performed by NPCs in the world with speech bubbles, and choices
// arrive as one-line bottom cards. Only the TRUST METER chip remains here.
import { useGame } from './store.js'
import { TRUST_MAX } from '../scenarios/bankModule.js'

// The 6-segment TRUST METER - named as a credit score in the final beat.
export function TrustMeter() {
  const bk = useGame((s) => s.bk)
  const week = useGame((s) => s.week)
  if (week !== 4 || !bk) return null
  return (
    <div
      role="progressbar"
      aria-label="Bank trust meter"
      aria-valuemin={0}
      aria-valuemax={TRUST_MAX}
      aria-valuenow={bk.trust}
      aria-valuetext={`${bk.trust} of ${TRUST_MAX} trust points`}
      className="glass--navy absolute left-4 top-[104px] rounded-2xl px-3 py-2 sm:top-16"
    >
      <div className="text-[10px] font-extrabold tracking-wide text-teal">TRUST METER</div>
      <div className="mt-1 flex gap-1">
        {Array.from({ length: TRUST_MAX }, (_, i) => (
          <div key={i} className="h-3 w-4 rounded-sm transition-all duration-500"
            style={{ background: i < bk.trust ? 'linear-gradient(90deg,#00DCA0,#FFD700)' : 'rgba(255,255,255,0.15)' }} />
        ))}
      </div>
    </div>
  )
}
