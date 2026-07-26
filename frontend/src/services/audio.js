// Music v3 (Round 5, Part B): ONE global AudioManager owns every track.
// Three musical identities, all original TAYU compositions bundled with the
// app (fully royalty-free):
//   lobby ('loading')  - one playful loop for Welcome/About/builder
//   game  ('town')     - a ROTATING PLAYLIST of same-vibe tracks, shuffled,
//                        1.8s crossfades, never the same track twice in a row
//   party ('party')    - the Money Guru celebration song (finale only)
// B1: the mute toggle flips a single master flag that sets `.muted` on EVERY
// registered Audio element instantly - landing page included. No orphans:
// every element is created through el(), which registers it.
import { loadProfile, saveProfile } from './walletStore.js'

const TRACKS = {
  loading: '/assets/music/loading_theme.wav',
  town1: '/assets/music/town_theme.wav',
  town2: '/assets/music/town_theme_2.wav',
  town3: '/assets/music/town_theme_3.wav',
  party: '/assets/music/money_song.wav',
}
const PLAYLIST = ['town1', 'town2', 'town3']
// Keep music comfortably behind narration and gameplay sounds. HTMLAudioElement
// volume is perceptual enough that 0.16 is substantially gentler than the old
// 0.4 setting while still being easy to hear on laptop speakers.
const BASE_VOL = 0.16
const XFADE_MS = 1800

const state = {
  started: false,
  muted: !!loadProfile()?.muted,
  els: {}, // name -> HTMLAudioElement (the registry - ALL audio lives here)
  current: null,
  playlist: false, // true while the in-game rotation is active
  order: [], // shuffled upcoming track names
  fadeTimer: null,
  gestureArmed: false,
}

function el(name) {
  if (!state.els[name]) {
    const a = new Audio(TRACKS[name])
    a.loop = name === 'loading' || name === 'party' // playlist tracks hand off instead
    a.volume = 0
    a.muted = state.muted // B1: every new element inherits the master flag
    // rotation: as a playlist track nears its end, crossfade into the next
    a.addEventListener('timeupdate', () => {
      if (!state.playlist || state.current !== name) return
      if (a.duration && a.duration - a.currentTime < XFADE_MS / 1000 && !a._handoff) {
        a._handoff = true
        fadeBetween(name, nextInPlaylist(), XFADE_MS)
      }
    })
    a.addEventListener('play', () => { a._handoff = false })
    state.els[name] = a
  }
  return state.els[name]
}

// Fisher-Yates over the playlist, re-dealt when it runs dry; the first card of
// a fresh deal may never repeat the track that just finished.
function nextInPlaylist() {
  if (state.order.length === 0) {
    const deck = [...PLAYLIST]
    for (let i = deck.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0
      ;[deck[i], deck[j]] = [deck[j], deck[i]]
    }
    if (deck[0] === state.current && deck.length > 1) [deck[0], deck[1]] = [deck[1], deck[0]]
    state.order = deck
  }
  return state.order.shift()
}

function tryPlay(a) {
  const p = a.play()
  if (p?.catch) p.catch(() => armGestureStart())
}

// B1: if autoplay is blocked, the FIRST gesture of any kind starts the music.
const GESTURES = ['pointerdown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'wheel']
function armGestureStart() {
  if (state.gestureArmed) return
  state.gestureArmed = true
  const fire = () => {
    for (const g of GESTURES) window.removeEventListener(g, fire)
    state.gestureArmed = false
    if (state.current) {
      const a = el(state.current)
      a.volume = BASE_VOL
      tryPlay(a)
    }
  }
  for (const g of GESTURES) window.addEventListener(g, fire, { passive: true })
}

// Honest autoplay attempt at site load (called from App mount). Muted players
// still get the track rolling silently - unmuting resumes instantly.
// v9 0.2: browsers block sound until the first user gesture - so the FIRST
// pointer or key event anywhere unlocks audio and starts the current track
// in that same handler. Music then persists across routes (the audio
// elements live at module scope, never inside a component that unmounts).
let gestureArmed = false
export function armFirstGesture() {
  if (gestureArmed || typeof window === 'undefined') return
  gestureArmed = true
  const kick = () => {
    try {
      if (state.muted) return
      if (state.current) {
        const a = state.els[state.current]
        if (a && a.paused) a.play().catch(() => {})
      } else {
        startMusic(/^\/(world)/.test(window.location.pathname) ? 'town1' : 'loading')
      }
    } catch { /* audio unavailable */ }
  }
  window.addEventListener('pointerdown', kick, { once: true, capture: true })
  window.addEventListener('keydown', kick, { once: true, capture: true })
}

export function initAutoplay() {
  if (state.started) return
  startMusic('loading')
}

export function startMusic(name = 'loading') {
  state.started = true
  if (name === 'town') { state.playlist = true; name = nextInPlaylist() }
  else if (name !== 'town1' && name !== 'town2' && name !== 'town3') state.playlist = false
  state.current = name
  const a = el(name)
  a.volume = BASE_VOL
  tryPlay(a)
}

function fadeBetween(fromName, toName, ms) {
  const from = fromName ? el(fromName) : null
  const to = el(toName)
  state.current = toName
  to.volume = 0
  if (!to.loop) to.currentTime = 0
  tryPlay(to)
  clearInterval(state.fadeTimer)
  const steps = 24
  let i = 0
  state.fadeTimer = setInterval(() => {
    i++
    const p = i / steps
    if (from) from.volume = Math.max(0, BASE_VOL * (1 - p))
    to.volume = Math.min(BASE_VOL, BASE_VOL * p)
    if (i >= steps) {
      clearInterval(state.fadeTimer)
      if (from && from !== to) from.pause()
    }
  }, ms / steps)
}

// Cross-fade to another musical identity ('loading' | 'town' | 'party').
export function crossfadeTo(name, ms = 1500) {
  if (!state.started) { startMusic(name); return }
  if (name === 'town') {
    if (state.playlist) return // already rotating
    state.playlist = true
    fadeBetween(state.current, nextInPlaylist(), ms)
    return
  }
  state.playlist = false
  if (state.current === name) return
  fadeBetween(state.current, name, ms)
}

export function isMuted() { return state.muted }

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__tayuAudio = state // debug handle: inspect els/current/muted in dev
}

// THE master switch (B1): flips `.muted` on every registered element at once.
// Playback keeps rolling silently, so unmute is instant, on any screen.
export function toggleMute() {
  state.muted = !state.muted
  saveProfile({ muted: state.muted })
  for (const el2 of Object.values(state.els)) el2.muted = state.muted
  if (!state.muted && state.started && state.current) {
    const cur = el(state.current)
    cur.volume = BASE_VOL
    tryPlay(cur) // in case the track never got a gesture to start
  }
  return state.muted
}
