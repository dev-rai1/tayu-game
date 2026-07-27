// Shared timing rules for short, non-blocking game messages.
// Dialogs and lesson cards already wait for a button; these minimums protect
// captions, banners, and guidance bubbles that still follow animations.
export const MIN_CAPTION_MS = 6500
export const MIN_GUIDANCE_MS = 8000
export const MIN_BANNER_MS = 5500

export function readableMessageMs(text, requestedMs = 0, minimumMs = MIN_CAPTION_MS) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length
  // Give early readers roughly 360 ms per word plus time to notice the box.
  const estimatedMs = Math.min(18000, 1800 + words * 360)
  return Math.max(minimumMs, Number(requestedMs) || 0, estimatedMs)
}
