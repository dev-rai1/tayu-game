// Frame-driven timeline engine. Every consequence scene (jars AND store) is a
// list of beats fed through here - NO scattered setTimeouts (Rule 5). Beats run
// in order at their `at` offset (ms); the timeline finishes `hold` ms after the
// last beat, then fires onDone.
//
//   playTimeline([{ at:0, run:()=>... }, { at:1200, run:()=>..., hold:600 }], done)
//
// tickTimelines(delta) must be called exactly once per frame (ConsequenceStage).

const active = []

export function playTimeline(beats, onDone) {
  if (!beats || !beats.length) { onDone?.(); return }
  active.push({
    beats: beats.map((b) => ({ ...b, ran: false })),
    t: 0,
    onDone,
  })
}

export function tickTimelines(delta) {
  if (!active.length) return
  // v9 FIX C: clamp delta so a lag spike or a background tab returning can
  // never fire every beat at once against stale state
  const ms = Math.min(delta, 0.1) * 1000
  for (let i = active.length - 1; i >= 0; i--) {
    const tl = active[i]
    tl.t += ms
    for (const b of tl.beats) {
      if (!b.ran && tl.t >= b.at) { b.ran = true; try { b.run() } catch (e) { /* keep the timeline alive */ console.error('beat error', e) } }
    }
    const last = tl.beats[tl.beats.length - 1]
    if (tl.beats.every((b) => b.ran) && tl.t >= last.at + (last.hold || 0)) {
      active.splice(i, 1)
      // v9 FIX A: a thrown completion callback logs and continues - it must
      // NEVER crash the frame loop (this was the Budget Town freeze)
      try { tl.onDone?.() } catch (e) { console.error('[tayu] timeline onDone error', e) }
    }
  }
}

export function clearTimelines() { active.length = 0 }
export function activeTimelines() { return active.length }

// Exposed in ALL builds (Round 6 Part 0): the Admin/Demo panel's
// Fast-Forward and auto-play speed control drive scenes through this hook.
if (typeof window !== 'undefined') {
  window.__tayuTL = { tickTimelines, clearTimelines, active }
}
