import { useMemo } from 'react'
import { say } from '../services/speech.js'
import { useGame } from './store.js'

const fmt = (value) => {
  const number = Math.round(Number(value || 0) * 100) / 100
  return Number.isInteger(number) ? String(number) : number.toFixed(2)
}

export function JarPlanCoach() {
  const objective = useGame((state) => state.objective)
  const scenarioState = useGame((state) => state.scenarioState)
  const scenarioLocked = useGame((state) => state.scenarioLocked)
  const scenario = useGame((state) => state.scenario)
  const allocations = useGame((state) => state.allocations)
  const wallet = useGame((state) => state.wallet)

  const status = useMemo(() => {
    const goal = scenario?.spendGoal
    if (!goal) return null
    const spend = Number(allocations?.spend || 0)
    const short = Math.max(0, Math.round((goal.amount - spend) * 100) / 100)
    const covered = short === 0
    const allThree = ['spend', 'save', 'give'].every((key) => Number(allocations?.[key] || 0) > 0)
    const rewardReady = covered && allThree
    return { goal, spend, short, covered, allThree, rewardReady }
  }, [allocations, scenario])

  if (objective !== 'kitchen' || scenarioState !== 'ALLOCATING' || scenarioLocked || !status) return null

  const spoken = status.covered
    ? `Toy goal covered. Spend has ${fmt(status.spend)} dollars for the ${fmt(status.goal.amount)} dollar toy. ${status.allThree ? 'All three jars have a job. Strong plan.' : 'Now give Save and Give a job too.'}`
    : `Toy goal is ${fmt(status.goal.amount)} dollars. Spend has ${fmt(status.spend)} dollars. You are ${fmt(status.short)} dollars short. You can keep adjusting your plan.`

  return (
    <aside
      aria-label="Live jar plan goals"
      className="pointer-events-auto fixed left-1/2 top-[15.25rem] z-[176] w-[min(94vw,30rem)] -translate-x-1/2 rounded-2xl border-2 border-white/20 bg-navy/95 p-3 text-white shadow-xl sm:top-[13.25rem]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-teal">Live plan check</div>
          <div className="font-display text-base font-extrabold">Watch each goal as your dollars move</div>
        </div>
        <button
          type="button"
          onClick={() => say(spoken)}
          className="min-h-[40px] rounded-xl bg-white/10 px-3 text-xs font-extrabold text-teal active:scale-95"
          aria-label="Read the live plan status aloud"
        >
          🔊 Read aloud
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className={`rounded-xl px-2 py-2 ${status.covered ? 'bg-teal text-navy' : 'bg-white/10'}`}>
          <div className="text-xl" aria-hidden="true">🧸</div>
          <div className="text-[10px] font-extrabold uppercase">Toy · ${fmt(status.goal.amount)}</div>
          <div className="mt-1 text-sm font-extrabold">
            {status.covered ? `Covered ✓` : `$${fmt(status.short)} short`}
          </div>
        </div>
        <div className={`rounded-xl px-2 py-2 ${Number(allocations.save || 0) > 0 ? 'bg-white/15' : 'bg-white/5'}`}>
          <div className="text-xl" aria-hidden="true">⭐</div>
          <div className="text-[10px] font-extrabold uppercase">SAVE</div>
          <div className="mt-1 text-sm font-extrabold">${fmt(allocations.save)}</div>
        </div>
        <div className={`rounded-xl px-2 py-2 ${Number(allocations.give || 0) > 0 ? 'bg-white/15' : 'bg-white/5'}`}>
          <div className="text-xl" aria-hidden="true">💜</div>
          <div className="text-[10px] font-extrabold uppercase">GIVE</div>
          <div className="mt-1 text-sm font-extrabold">${fmt(allocations.give)}</div>
        </div>
      </div>

      <div className={`mt-2 rounded-xl px-3 py-2 text-sm font-extrabold ${status.rewardReady ? 'bg-sun text-navy' : 'bg-white/10 text-white'}`}>
        {status.rewardReady
          ? '🏆 Strong three-jar plan: reward-ready!'
          : `🏆 Golden Money Look plan: cover the toy + use all 3 jars · $${fmt(wallet)} left to plan`}
      </div>
    </aside>
  )
}
