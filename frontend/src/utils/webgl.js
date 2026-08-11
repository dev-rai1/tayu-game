export function hasWebGL() {
  // TAYU gameplay is 3D-first and should never silently fall back to the
  // test-only 2D world because a conservative capability probe returned a
  // false negative. Some browsers/drivers reject contexts created with
  // failIfMajorPerformanceCaveat even though React Three Fiber can create a
  // perfectly usable context moments later.
  //
  // Probe without that flag for diagnostics, but on a real browser always let
  // the actual <Canvas> make the final decision. If WebGL truly cannot start,
  // the 3D error boundary will report/retry the 3D renderer instead of routing
  // the learner into a different game mode.
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const supported = !!(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    )
    if (!supported && typeof console !== 'undefined') {
      console.warn('[tayu] WebGL capability probe returned false; attempting the 3D renderer anyway.')
    }
  } catch (error) {
    if (typeof console !== 'undefined') console.warn('[tayu] WebGL probe failed; attempting the 3D renderer anyway.', error)
  }
  return true
}
