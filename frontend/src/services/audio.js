// Original TAYU procedural soundtrack. No third-party recordings or melodies are used.
import { loadProfile, saveProfile } from './walletStore.js'

const NORMAL_GAIN = 0.12
const PARTY_GAIN = 0.18
const LOOKAHEAD_MS = 100
const SCHEDULE_AHEAD_SECONDS = 0.3
const BARS_PER_THEME = 8

const THEMES = {
  loading: {
    bpm: 76,
    chords: [[261.63, 329.63, 392], [220, 261.63, 329.63], [174.61, 220, 261.63], [196, 246.94, 293.66]],
    melody: [659.25, null, 587.33, null, 523.25, null, 587.33, null],
    lead: 'sine',
  },
  sunnyTown: {
    bpm: 82,
    chords: [[261.63, 329.63, 392], [293.66, 349.23, 440], [220, 261.63, 329.63], [246.94, 293.66, 369.99]],
    melody: [659.25, 783.99, null, 698.46, 659.25, null, 587.33, null],
    lead: 'triangle',
  },
  littleGarden: {
    bpm: 78,
    chords: [[261.63, 329.63, 392], [196, 261.63, 329.63], [220, 277.18, 329.63], [174.61, 220, 261.63]],
    melody: [523.25, 587.33, 659.25, null, 698.46, 659.25, 587.33, null],
    lead: 'sine',
  },
  cozyMarket: {
    bpm: 86,
    chords: [[293.66, 369.99, 440], [246.94, 311.13, 369.99], [261.63, 329.63, 392], [220, 277.18, 329.63]],
    melody: [587.33, null, 659.25, 698.46, null, 659.25, 587.33, 523.25],
    lead: 'triangle',
  },
  cloudWalk: {
    bpm: 74,
    chords: [[261.63, 329.63, 392], [329.63, 392, 493.88], [293.66, 369.99, 440], [220, 329.63, 392]],
    melody: [783.99, null, 698.46, null, 659.25, 587.33, 659.25, null],
    lead: 'sine',
  },
  playfulSteps: {
    bpm: 88,
    chords: [[261.63, 329.63, 392], [349.23, 440, 523.25], [293.66, 369.99, 440], [246.94, 311.13, 369.99]],
    melody: [659.25, 698.46, 783.99, null, 698.46, 659.25, 587.33, null],
    lead: 'triangle',
  },
  party: {
    bpm: 94,
    chords: [[261.63, 329.63, 392], [349.23, 440, 523.25], [293.66, 369.99, 440], [392, 493.88, 587.33]],
    melody: [783.99, 880, 987.77, null, 880, 783.99, 698.46, 783.99],
    lead: 'triangle',
  },
}

const PLAY_THEMES = ['sunnyTown', 'littleGarden', 'cozyMarket', 'cloudWalk', 'playfulSteps']
const savedMuted = loadProfile()?.muted

const state = {
  started: false,
  muted: savedMuted === undefined ? false : Boolean(savedMuted),
  mode: 'loading',
  theme: 'loading',
  themeIndex: 0,
  barsInTheme: 0,
  context: null,
  master: null,
  compressor: null,
  timer: null,
  nextNoteAt: 0,
  step: 0,
  gestureArmed: false,
}

function emitChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tayu-audio-changed', {
      detail: { muted: state.muted, mode: state.mode, theme: state.theme, running: state.context?.state === 'running' },
    }))
  }
}

function targetGain() {
  if (state.muted) return 0
  return state.mode === 'party' ? PARTY_GAIN : NORMAL_GAIN
}

function ensureContext() {
  if (state.context || typeof window === 'undefined') return state.context
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return null

  state.context = new AudioContextClass()
  state.master = state.context.createGain()
  state.compressor = state.context.createDynamicsCompressor()
  state.compressor.threshold.value = -26
  state.compressor.knee.value = 24
  state.compressor.ratio.value = 5
  state.compressor.attack.value = 0.005
  state.compressor.release.value = 0.3
  state.master.gain.value = 0
  state.master.connect(state.compressor)
  state.compressor.connect(state.context.destination)
  state.nextNoteAt = state.context.currentTime + 0.05

  state.context.addEventListener?.('statechange', () => {
    if (state.context?.state === 'running') {
      startScheduler()
      setMasterGain()
    }
    emitChange()
  })
  return state.context
}

function envelope(gain, at, peak, duration) {
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), at + 0.025)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)
}

function tone(freq, at, duration, peak = 0.12, type = 'sine', detune = 0) {
  const ctx = ensureContext()
  if (!ctx || !state.master) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, at)
  osc.detune.setValueAtTime(detune, at)
  envelope(gain, at, peak, duration)
  osc.connect(gain)
  gain.connect(state.master)
  osc.start(at)
  osc.stop(at + duration + 0.05)
}

function softKick(at) {
  const ctx = ensureContext()
  if (!ctx || !state.master) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(82, at)
  osc.frequency.exponentialRampToValueAtTime(46, at + 0.13)
  envelope(gain, at, 0.11, 0.17)
  osc.connect(gain)
  gain.connect(state.master)
  osc.start(at)
  osc.stop(at + 0.21)
}

function softHat(at) {
  const ctx = ensureContext()
  if (!ctx || !state.master) return
  const length = Math.max(1, Math.floor(ctx.sampleRate * 0.03))
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length)
  const source = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  source.buffer = buffer
  filter.type = 'highpass'
  filter.frequency.value = 4400
  envelope(gain, at, state.mode === 'party' ? 0.025 : 0.012, 0.035)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(state.master)
  source.start(at)
}

function rotateTheme() {
  if (state.mode !== 'town') return
  state.themeIndex = (state.themeIndex + 1) % PLAY_THEMES.length
  state.theme = PLAY_THEMES[state.themeIndex]
  state.barsInTheme = 0
  emitChange()
}

function scheduleStep(at) {
  const config = THEMES[state.theme] || THEMES.loading
  const beat = 60 / config.bpm
  const eighth = beat / 2
  const barStep = state.step % 8
  const chord = config.chords[Math.floor(state.step / 8) % config.chords.length]

  if (barStep === 0) {
    chord.forEach((freq, index) => tone(freq, at, beat * 1.75, 0.038, index === 1 ? 'triangle' : 'sine', index * 2))
    tone(chord[0] / 2, at, beat * 1.15, 0.055, 'sine')
  }
  if (barStep === 0 || barStep === 4) softKick(at)
  if (barStep % 2 === 1) softHat(at)

  const note = config.melody[barStep]
  if (note) tone(note, at, eighth * 0.72, state.mode === 'party' ? 0.055 : 0.03, config.lead || 'triangle')

  state.step += 1
  state.nextNoteAt += eighth

  if (state.step % 8 === 0) {
    state.barsInTheme += 1
    if (state.barsInTheme >= BARS_PER_THEME) rotateTheme()
  }
}

function scheduler() {
  const ctx = ensureContext()
  if (!ctx || ctx.state !== 'running') return
  if (state.muted) {
    state.nextNoteAt = ctx.currentTime + 0.05
    return
  }
  while (state.nextNoteAt < ctx.currentTime + SCHEDULE_AHEAD_SECONDS) scheduleStep(state.nextNoteAt)
}

function startScheduler() {
  const ctx = ensureContext()
  if (!ctx || state.timer) return
  state.nextNoteAt = Math.max(ctx.currentTime + 0.05, state.nextNoteAt || 0)
  state.timer = window.setInterval(scheduler, LOOKAHEAD_MS)
  scheduler()
}

function setMasterGain(immediate = false) {
  if (!state.master || !state.context) return
  const now = state.context.currentTime
  const gain = state.master.gain
  gain.cancelScheduledValues(now)
  gain.setValueAtTime(gain.value, now)
  if (immediate) gain.setValueAtTime(targetGain(), now)
  else gain.linearRampToValueAtTime(targetGain(), now + 0.35)
}

async function resumeAudio() {
  const ctx = ensureContext()
  if (!ctx) return false
  try {
    if (ctx.state !== 'running') await ctx.resume()
    if (ctx.state === 'running') {
      startScheduler()
      setMasterGain()
      emitChange()
      return true
    }
  } catch { /* retry on the next user gesture */ }
  armFirstGesture()
  emitChange()
  return false
}

export function armFirstGesture() {
  if (state.gestureArmed || typeof window === 'undefined') return
  state.gestureArmed = true
  const gestures = ['pointerdown', 'keydown', 'touchstart']
  const kick = async () => {
    gestures.forEach((eventName) => window.removeEventListener(eventName, kick, true))
    state.gestureArmed = false
    const running = await resumeAudio()
    if (!running) armFirstGesture()
  }
  gestures.forEach((eventName) => window.addEventListener(eventName, kick, { capture: true, passive: eventName !== 'keydown' }))
}

export function initAutoplay() {
  state.started = true
  armFirstGesture()
  emitChange()
}

function setMode(name) {
  const next = name === 'town1' || name === 'town2' || name === 'town3' || name === 'town' ? 'town' : (name === 'party' ? 'party' : 'loading')
  state.mode = next
  state.theme = next === 'town' ? PLAY_THEMES[state.themeIndex] : next
  state.step = 0
  state.barsInTheme = 0
  state.nextNoteAt = state.context ? state.context.currentTime + 0.05 : 0
}

export function startMusic(name = 'loading') {
  state.started = true
  setMode(name)
  resumeAudio()
  setMasterGain()
  armFirstGesture()
  emitChange()
}

export function crossfadeTo(name) {
  const priorMode = state.mode
  setMode(name)
  if (priorMode === state.mode && state.mode === 'town') return
  resumeAudio()
  setMasterGain()
  armFirstGesture()
  emitChange()
}

export function isMuted() {
  return state.muted
}

export function toggleMute() {
  state.muted = !state.muted
  saveProfile({ muted: state.muted })
  if (!state.muted) state.nextNoteAt = state.context ? state.context.currentTime + 0.05 : 0
  resumeAudio().then(() => setMasterGain())
  armFirstGesture()
  emitChange()
  return state.muted
}

export function celebrateWithMusic() {
  state.muted = false
  state.started = true
  setMode('party')
  saveProfile({ muted: false })
  resumeAudio().then(() => setMasterGain())
  armFirstGesture()
  emitChange()
  return state.muted
}

if (import.meta.env.DEV && typeof window !== 'undefined') window.__tayuAudio = state
