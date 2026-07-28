// Original TAYU procedural soundtrack. No third-party recordings are used.
import { loadProfile, saveProfile } from './walletStore.js'

const NORMAL_GAIN = 0.035
const PARTY_GAIN = 0.065
const LOOKAHEAD_MS = 100
const SCHEDULE_AHEAD_SECONDS = 0.3

const MODES = {
  loading: {
    bpm: 76,
    chords: [[261.63, 329.63, 392], [220, 261.63, 329.63], [174.61, 220, 261.63], [196, 246.94, 293.66]],
    melody: [659.25, null, 587.33, null, 523.25, null, 587.33, null],
  },
  town: {
    bpm: 82,
    chords: [[261.63, 329.63, 392], [293.66, 349.23, 440], [220, 261.63, 329.63], [246.94, 293.66, 369.99]],
    melody: [659.25, 783.99, null, 698.46, 659.25, null, 587.33, null],
  },
  party: {
    bpm: 94,
    chords: [[261.63, 329.63, 392], [349.23, 440, 523.25], [293.66, 369.99, 440], [392, 493.88, 587.33]],
    melody: [783.99, 880, 987.77, null, 880, 783.99, 698.46, 783.99],
  },
}

const savedMuted = loadProfile()?.muted
const state = {
  started: false,
  // Music is on by default for new players. Existing mute choices are respected.
  muted: savedMuted === undefined ? false : Boolean(savedMuted),
  mode: 'loading',
  context: null,
  master: null,
  timer: null,
  nextNoteAt: 0,
  step: 0,
  gestureArmed: false,
}

function emitChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tayu-audio-changed', { detail: { muted: state.muted, mode: state.mode } }))
  }
}

function ensureContext() {
  if (state.context || typeof window === 'undefined') return state.context
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return null
  state.context = new AudioContextClass()
  state.master = state.context.createGain()
  state.master.gain.value = state.muted ? 0 : (state.mode === 'party' ? PARTY_GAIN : NORMAL_GAIN)
  state.master.connect(state.context.destination)
  state.context.addEventListener?.('statechange', () => {
    if (state.context?.state === 'running' && !state.muted) startScheduler()
  })
  return state.context
}

function envelope(gain, at, peak, duration) {
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), at + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)
}

function tone(freq, at, duration, peak = 0.16, type = 'sine', detune = 0) {
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
  osc.stop(at + duration + 0.04)
}

function softKick(at) {
  const ctx = ensureContext()
  if (!ctx || !state.master) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(95, at)
  osc.frequency.exponentialRampToValueAtTime(48, at + 0.12)
  envelope(gain, at, 0.18, 0.16)
  osc.connect(gain)
  gain.connect(state.master)
  osc.start(at)
  osc.stop(at + 0.2)
}

function softHat(at) {
  const ctx = ensureContext()
  if (!ctx || !state.master) return
  const length = Math.max(1, Math.floor(ctx.sampleRate * 0.035))
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length)
  const source = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  source.buffer = buffer
  filter.type = 'highpass'
  filter.frequency.value = 4200
  envelope(gain, at, state.mode === 'party' ? 0.035 : 0.02, 0.04)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(state.master)
  source.start(at)
}

function scheduleStep(at) {
  const config = MODES[state.mode] || MODES.loading
  const beat = 60 / config.bpm
  const eighth = beat / 2
  const barStep = state.step % 8
  const chord = config.chords[Math.floor(state.step / 8) % config.chords.length]
  if (barStep === 0) {
    chord.forEach((freq, index) => tone(freq, at, beat * 1.8, 0.055, index === 1 ? 'triangle' : 'sine', index * 2))
    tone(chord[0] / 2, at, beat * 1.2, 0.09, 'sine')
  }
  if (barStep === 0 || barStep === 4) softKick(at)
  if (barStep % 2 === 1) softHat(at)
  const note = config.melody[barStep]
  if (note) tone(note, at, eighth * 0.72, state.mode === 'party' ? 0.075 : 0.045, 'triangle')
  state.step += 1
  state.nextNoteAt += eighth
}

function scheduler() {
  const ctx = ensureContext()
  if (!ctx || ctx.state !== 'running') return
  while (state.nextNoteAt < ctx.currentTime + SCHEDULE_AHEAD_SECONDS) scheduleStep(state.nextNoteAt)
}

function startScheduler() {
  const ctx = ensureContext()
  if (!ctx || state.timer) return
  state.nextNoteAt = Math.max(ctx.currentTime + 0.05, state.nextNoteAt || 0)
  state.timer = window.setInterval(scheduler, LOOKAHEAD_MS)
  scheduler()
}

async function resume() {
  const ctx = ensureContext()
  if (!ctx) return false
  try {
    if (ctx.state !== 'running') await ctx.resume()
    if (ctx.state === 'running') {
      startScheduler()
      return true
    }
  } catch {
    armFirstGesture()
  }
  return false
}

function setMasterGain() {
  if (!state.master || !state.context) return
  const target = state.muted ? 0 : (state.mode === 'party' ? PARTY_GAIN : NORMAL_GAIN)
  state.master.gain.cancelScheduledValues(state.context.currentTime)
  state.master.gain.linearRampToValueAtTime(target, state.context.currentTime + 0.15)
}

export function armFirstGesture() {
  if (state.gestureArmed || typeof window === 'undefined') return
  state.gestureArmed = true
  const kick = async () => {
    state.gestureArmed = false
    window.removeEventListener('pointerdown', kick, true)
    window.removeEventListener('keydown', kick, true)
    if (!state.muted) {
      await resume()
      setMasterGain()
    }
  }
  window.addEventListener('pointerdown', kick, { capture: true })
  window.addEventListener('keydown', kick, { capture: true })
}

export function initAutoplay() {
  state.started = true
  if (!state.muted) resume()
  armFirstGesture()
  setMasterGain()
  emitChange()
}

export function startMusic(name = 'loading') {
  state.started = true
  state.mode = name === 'town1' || name === 'town2' || name === 'town3' ? 'town' : (MODES[name] ? name : 'loading')
  state.step = 0
  resume()
  setMasterGain()
  armFirstGesture()
  emitChange()
}

export function crossfadeTo(name) {
  const next = name === 'town1' || name === 'town2' || name === 'town3' ? 'town' : (MODES[name] ? name : 'loading')
  state.started = true
  if (state.mode !== next) {
    state.mode = next
    state.step = 0
  }
  resume()
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
  if (!state.muted) resume()
  setMasterGain()
  armFirstGesture()
  emitChange()
  return state.muted
}

export function celebrateWithMusic() {
  state.muted = false
  saveProfile({ muted: false })
  crossfadeTo('party')
  emitChange()
  return state.muted
}

if (import.meta.env.DEV && typeof window !== 'undefined') window.__tayuAudio = state
