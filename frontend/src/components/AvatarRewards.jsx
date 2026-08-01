import { MODULE_CHECKS, BADGE_ORDER } from '../constants/moduleChecks.js'
import { loadProfile } from '../services/walletStore.js'

const REWARD_LOOKS = {
  jars: {
    label: 'Golden Money Look',
    patch: { shirtColor: 'yellow', accessories: ['necklace'] },
    detail: 'Golden shirt and money necklace',
  },
  lemonade: {
    label: 'Lemonade Stand Look',
    patch: { shirtColor: 'yellow', accessories: ['hat'] },
    detail: 'Sunny shirt and lemonade cap',
  },
  budget: {
    label: 'Budget Planner Look',
    patch: { shirtColor: 'blue', accessories: ['backpack'] },
    detail: 'Planner-blue shirt and backpack',
  },
  bank: {
    label: 'Trust Shield Look',
    patch: { shirtColor: 'teal', accessories: ['necklace'] },
    detail: 'Trust-teal shirt and gold necklace',
  },
  garden: {
    label: 'Money Garden Look',
    patch: { shirtColor: 'green', accessories: ['hat', 'necklace'] },
    detail: 'Sprout-green shirt, crown cap, and necklace',
  },
}

export function rewardLookForBadge(badge) {
  return REWARD_LOOKS[badge] || null
}

export default function AvatarRewards({ onApply }) {
  const earned = new Set(loadProfile()?.badges || [])

  return (
    <section aria-labelledby="module-rewards-title" className="mt-5 border-t border-white/10 pt-5">
      <h2 id="module-rewards-title" className="font-display text-xl font-extrabold text-sun">Module reward looks</h2>
      <p className="mt-1 text-sm font-semibold leading-relaxed text-white/70">
        Finish modules to unlock looks you can wear in the game. Applying a look changes only your character appearance.
      </p>

      <div className="mt-3 grid gap-2">
        {BADGE_ORDER.map((badge) => {
          const check = MODULE_CHECKS[badge]
          const look = rewardLookForBadge(badge)
          const unlocked = earned.has(badge)

          return (
            <div key={badge} className={`rounded-2xl border p-3 ${unlocked ? 'border-sun/50 bg-sun/10' : 'border-white/10 bg-black/15 opacity-70'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <span className="text-3xl" aria-hidden="true">{check.cosmetic.icon}</span>
                  <div className="min-w-0">
                    <p className="font-extrabold text-white">{look.label}</p>
                    <p className="text-xs font-bold text-white/65">Module {check.moduleNumber}: {check.title}</p>
                    <p className="mt-1 text-sm font-semibold text-white/75">{unlocked ? look.detail : 'Locked until this module is complete'}</p>
                  </div>
                </div>
                {unlocked ? (
                  <button
                    type="button"
                    onClick={() => onApply(look.patch)}
                    className="min-h-[42px] shrink-0 rounded-xl bg-sun px-3 text-sm font-extrabold text-navy active:scale-95"
                    aria-label={`Wear ${look.label}`}
                  >
                    Wear
                  </button>
                ) : (
                  <span className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white/60">Locked</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
