const MODULES = ['jars', 'lemonade', 'budget', 'bank', 'garden']
const MODULE_LABEL = {
  jars: 'Market & Jars',
  lemonade: 'Lemonade Stand',
  budget: 'Budget Town',
  bank: 'Bank of TAYU',
  garden: 'Money Garden',
}

function countType(session, type) {
  return Object.entries(session?.eventCounts || {}).reduce(
    (sum, [key, value]) => sum + (key.endsWith(`:${type}`) ? Number(value || 0) : 0),
    0,
  )
}

export function summarizeLearningSessions(sessions = []) {
  const totals = {
    attempts: 0,
    incorrect: 0,
    retries: 0,
    completions: 0,
    stoppedByModule: Object.fromEntries(MODULES.map((moduleName) => [moduleName, 0])),
    attemptsByModule: Object.fromEntries(MODULES.map((moduleName) => [moduleName, 0])),
    completionsByModule: Object.fromEntries(MODULES.map((moduleName) => [moduleName, 0])),
  }

  for (const session of sessions) {
    totals.attempts += countType(session, 'choice_attempt')
    totals.retries += countType(session, 'retry_prompt')
    totals.completions += countType(session, 'module_complete')

    for (const event of session.learningEvents || []) {
      if (event.type === 'choice_attempt' && event.outcome === 'incorrect') totals.incorrect += 1
    }

    for (const moduleName of MODULES) {
      totals.attemptsByModule[moduleName] += Number(session.eventCounts?.[`${moduleName}:choice_attempt`] || 0)
      totals.completionsByModule[moduleName] += Number(session.eventCounts?.[`${moduleName}:module_complete`] || 0)
    }

    if (session.endedAt && MODULES.includes(session.lastModule)) {
      totals.stoppedByModule[session.lastModule] += 1
    }
  }

  return totals
}

function Metric({ label, value, detail }) {
  return (
    <div className="rounded-xl bg-black/20 p-4">
      <div className="text-2xl font-extrabold text-teal">{value}</div>
      <div className="mt-1 text-xs font-extrabold uppercase tracking-wide text-white/60">{label}</div>
      {detail && <div className="mt-1 text-xs text-white/45">{detail}</div>}
    </div>
  )
}

export default function PlaytestBehaviorSummary({ sessions = [] }) {
  const summary = summarizeLearningSessions(sessions)

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="font-display text-xl font-extrabold">Playtest behavior</h2>
      <p className="mt-1 text-sm font-semibold text-white/55">Measured from real choice outcomes, retry clues, module completions, and the last module in ended sessions.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Recorded choices" value={summary.attempts} />
        <Metric label="Incorrect outcomes" value={summary.incorrect} detail="outcomes marked for revision" />
        <Metric label="Retry clues shown" value={summary.retries} />
        <Metric label="Module completions" value={summary.completions} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {MODULES.map((moduleName) => (
          <div key={moduleName} className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-extrabold text-teal">{MODULE_LABEL[moduleName]}</div>
            <div className="mt-3 text-sm font-bold text-white/75">Choices: {summary.attemptsByModule[moduleName]}</div>
            <div className="mt-1 text-sm font-bold text-white/75">Completions: {summary.completionsByModule[moduleName]}</div>
            <div className="mt-1 text-sm font-bold text-white/75">Sessions ended here: {summary.stoppedByModule[moduleName]}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
