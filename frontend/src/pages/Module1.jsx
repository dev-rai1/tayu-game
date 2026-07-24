import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameState } from '../hooks/useGameState.jsx'
import TutorialStep from '../components/TutorialStep.jsx'
import JarAllocation from '../components/JarAllocation.jsx'
import { TUTORIAL_STEPS } from '../constants/tutorialSteps.js'
import { stopSpeaking } from '../utils/audioNarration.js'

// Module 1 flow controller: guided walkthrough → jar allocation → badge.
export default function Module1() {
  const navigate = useNavigate()
  const { state, dispatch } = useGameState()
  const name = state.player.name || 'friend'

  const [phase, setPhase] = useState('tutorial') // tutorial | jars | badge
  const [stepIdx, setStepIdx] = useState(0)
  const [audioOn, setAudioOn] = useState(false)
  const [allocation, setAllocation] = useState(null)

  // Esc skips the tutorial.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && phase === 'tutorial') skipTutorial() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  useEffect(() => () => stopSpeaking(), [])

  const nextStep = () => {
    if (stepIdx + 1 < TUTORIAL_STEPS.length) setStepIdx((i) => i + 1)
    else { stopSpeaking(); setPhase('jars') }
  }
  const skipTutorial = () => { stopSpeaking(); setPhase('jars') }

  const confirmJars = (jars) => {
    setAllocation(jars)
    dispatch({ type: 'COMPLETE_MODULE1', allocation: jars, badge: 'Allocation Expert' })
    setPhase('badge')
  }

  return (
    <div className="min-h-screen bg-navy text-white">
      <header className="flex items-center justify-between bg-navy px-5 py-3 shadow-md">
        <span className="font-display text-xl font-extrabold text-electric">TAYU</span>
        <span className="text-sm font-bold text-white/80">Module 1: Childhood Choices</span>
        <button
          onClick={() => setAudioOn((v) => !v)}
          className={`rounded-lg px-3 py-1 text-sm font-bold ${audioOn ? 'bg-teal text-navy' : 'bg-white/10 text-white'}`}
        >
          🔊 {audioOn ? 'On' : 'Off'}
        </button>
      </header>

      {phase === 'tutorial' && (
        <TutorialStep
          step={TUTORIAL_STEPS[stepIdx]}
          name={name}
          index={stepIdx}
          total={TUTORIAL_STEPS.length}
          audioOn={audioOn}
          onNext={nextStep}
          onSkip={skipTutorial}
        />
      )}

      {phase === 'jars' && <JarAllocation playerName={name} onConfirm={confirmJars} />}

      {phase === 'badge' && (
        <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center gap-5 p-6 text-center">
          <div className="text-8xl">🏅</div>
          <h1 className="font-display text-3xl font-extrabold text-teal">Allocation Expert!</h1>
          <p className="text-lg text-white/80">Amazing work, {name}! You split your $20 wisely.</p>
          <div className="card grid w-full grid-cols-3 gap-3">
            <Stat label="Spend" value={`$${allocation.spend}`} color="text-spend" />
            <Stat label="Save" value={`$${allocation.save}`} color="text-save" />
            <Stat label="Give" value={`$${allocation.give}`} color="text-give" />
          </div>
          <p className="text-sm text-white/60">You've earned the <b className="text-teal">Allocation Expert</b> badge. 🎉</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="btn-secondary" onClick={() => { setPhase('tutorial'); setStepIdx(0); setAllocation(null) }}>Play again</button>
            <button className="btn-primary" onClick={() => navigate('/')}>Back to start</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-white/50">{label}</div>
    </div>
  )
}
