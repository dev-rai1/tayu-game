import { loadProfile } from './walletStore.js'

export function playVaultThunk() {
  if (typeof window === 'undefined' || loadProfile()?.muted) return
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return
  let ctx
  try {
    ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(115, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(48, ctx.currentTime + 0.16)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.24)
    setTimeout(() => ctx.close().catch(() => {}), 350)
  } catch {
    try { ctx?.close?.() } catch { /* no-op */ }
  }
}
