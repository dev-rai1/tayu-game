import { useMemo, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameState } from '../hooks/useGameState.jsx'
import PhaserGame from '../game/PhaserGame.jsx'
import Stage1Childhood from '../components/Stage1Childhood.jsx'
import Stage2Business from '../components/Stage2Business.jsx'
import Stage3YoungAdult from '../components/Stage3YoungAdult.jsx'

const STAGE_NAME = { 1: 'Childhood', 2: 'Teen Hustle', 3: 'Young Adult' }
const ROADBLOCK_STAGE = { bank: 1, business: 2, job: 3 }

// Phase 1 world: walk MoneyVille, press E at a roadblock to open its activity.
export default function GameScreen() {
  const navigate = useNavigate()
  const { state } = useGameState()
  const [near, setNear] = useState(null)
  const [modal, setModal] = useState(null) // 'bank' | 'business' | 'job'
  const [toast, setToast] = useState('')
  const controlsRef = useRef(null)
  const toastTimer = useRef(null)

  const avatar = useMemo(
    () => ({ color: state.player.avatarColor, icon: state.player.avatarIcon, name: state.player.name || 'You' }),
    [state.player]
  )

  const flash = (msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const handleInteract = (id) => {
    if (modal) return
    const reqStage = ROADBLOCK_STAGE[id]
    if (!reqStage) {
      flash('🚧 Coming in a future update!')
      return
    }
    if (state.completed) return flash('🎉 You finished the game - check your results!')
    if (reqStage < state.stage) return flash('✓ You already completed this.')
    if (reqStage > state.stage) return flash(`🔒 Reach ${STAGE_NAME[reqStage]} first - finish ${STAGE_NAME[state.stage]}.`)
    setModal(id)
  }

  const closeModal = () => setModal(null)

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#1b3326]">
      <PhaserGame
        avatar={avatar}
        stage={state.stage}
        paused={!!modal}
        onNear={setNear}
        onInteract={handleInteract}
        controlsRef={controlsRef}
      />

      {/* HUD top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <div className="card !p-3 text-sm">
          <span className="text-2xl">{avatar.icon}</span>{' '}
          <span className="font-bold">{avatar.name}</span>
          <div className="text-white/60">Stage {state.stage}: {STAGE_NAME[state.stage]}</div>
        </div>
        <div className="card !p-3 text-right">
          <div className="text-xs text-white/60">Net Worth</div>
          <div className="text-2xl font-extrabold text-save">${state.netWorth.toLocaleString()}</div>
        </div>
      </div>

      {/* controls hint */}
      <div className="pointer-events-none absolute bottom-3 left-3 hidden rounded-xl bg-black/40 px-3 py-2 text-xs text-white/70 sm:block">
        <b>WASD / Arrows</b> to move · <b>E</b> to enter a building
      </div>

      {/* interaction prompt */}
      {near && !modal && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center sm:bottom-16">
          <div className="rounded-2xl bg-highlight px-5 py-2 font-bold text-tayubg shadow-lg">
            {near.soon ? `🚧 ${near.label} (soon)` : `Press E - ${near.label}`}
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div className="pointer-events-none absolute inset-x-0 top-24 flex justify-center">
          <div className="rounded-2xl bg-black/80 px-5 py-2 text-white shadow-lg">{toast}</div>
        </div>
      )}

      {/* mobile controls */}
      <MobileControls controlsRef={controlsRef} hidden={!!modal} />

      {/* activity modal */}
      {modal && (
        <div className="absolute inset-0 z-20 flex items-start justify-center overflow-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl py-6">
            <button className="btn-secondary mb-3" onClick={closeModal}>← Back to town</button>
            {modal === 'bank' && <Stage1Childhood onComplete={closeModal} />}
            {modal === 'business' && <Stage2Business onComplete={closeModal} />}
            {modal === 'job' && <Stage3YoungAdult onComplete={() => { closeModal(); navigate('/results') }} />}
          </div>
        </div>
      )}
    </div>
  )
}

// Simple touch D-pad + interact button for phones/tablets.
function MobileControls({ controlsRef, hidden }) {
  if (hidden) return null
  const set = (x, y) => controlsRef.current?.joystick(x === 0 && y === 0 ? null : { x, y })
  const Btn = ({ x, y, label, cls }) => (
    <button
      className={`grid h-12 w-12 select-none place-items-center rounded-xl bg-white/20 text-xl font-bold text-white active:bg-white/40 ${cls}`}
      onPointerDown={(e) => { e.preventDefault(); set(x, y) }}
      onPointerUp={() => set(0, 0)}
      onPointerLeave={() => set(0, 0)}
      onPointerCancel={() => set(0, 0)}
    >{label}</button>
  )
  return (
    <div className="absolute inset-x-0 bottom-4 flex items-end justify-between px-4 sm:hidden">
      <div className="grid grid-cols-3 grid-rows-3 gap-1">
        <span /> <Btn x={0} y={-1} label="↑" /> <span />
        <Btn x={-1} y={0} label="←" /> <span /> <Btn x={1} y={0} label="→" />
        <span /> <Btn x={0} y={1} label="↓" /> <span />
      </div>
      <button
        className="grid h-16 w-16 select-none place-items-center rounded-full bg-highlight text-lg font-extrabold text-tayubg active:scale-95"
        onPointerDown={(e) => { e.preventDefault(); controlsRef.current?.interact() }}
      >E</button>
    </div>
  )
}
