import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameState } from '../hooks/useGameState.jsx'
import { GameWorld } from '../world/GameWorld.jsx'
import { Hud } from '../world/Hud.jsx'
import { MobileControls } from '../world/MobileControls.jsx'
import { usesTouchControls } from '../world/controlMode.js'
import { useGame } from '../world/store.js'
import { loadProfile } from '../services/walletStore.js'
import { crossfadeTo } from '../services/audio.js'
import { AccessibleWorld } from '../world/AccessibleWorld.jsx'
import { PersistentCoach } from '../world/PersistentCoach.jsx'
import { hasWebGL } from '../utils/webgl.js'

// Full-screen 3D world page (Module 1, Week 1).
export default function World() {
  const navigate = useNavigate()
  const { state, dispatch } = useGameState()
  const [faded, setFaded] = useState(false)
  const [welcome, setWelcome] = useState(true)
  const initWorld = useGame((s) => s.initWorld)
  const enterParty = useGame((s) => s.enterParty)
  const [use3D] = useState(hasWebGL)

  useEffect(() => {
    if (enterParty) {
      useGame.setState({ enterParty: false })
      navigate(loadProfile()?.assessment?.post ? '/guru' : '/assessment/post')
    }
  }, [enterParty, navigate])

  // No name in memory? Repair it from the saved profile (B2: Continue must
  // remember the player) - only send to the creator if no profile exists at all.
  useEffect(() => {
    if (state.player.name) return
    const prof = loadProfile()
    if (prof?.name) {
      if (prof.avatar) dispatch({ type: 'SET_AVATAR', payload: prof.avatar })
      dispatch({ type: 'SET_PLAYER', payload: { name: prof.name } })
    } else {
      navigate('/avatar', { replace: true })
    }
  }, [state.player.name, navigate, dispatch])

  useEffect(() => {
    // resumes a saved Week 2 (persistent wallet), else starts Week 1 fresh
    initWorld()
    // R12 Part 4: a module picked on /modules jumps straight in
    const jump = localStorage.getItem('tayu-jump-module')
    if (jump) {
      localStorage.removeItem('tayu-jump-module')
      setTimeout(() => { try { useGame.getState().adminJumpModule(Number(jump)) } catch (e) { console.error(e) } }, 400)
    }
    crossfadeTo('town') // F2: loading theme fades into the town theme
    const t1 = setTimeout(() => setFaded(true), 60)
    return () => clearTimeout(t1)
  }, [initWorld])

  const onContinue = () => {
    const g = useGame.getState()
    if (g.week === 1) { g.startWeek2(); return } // Week 1 → Week 2 (lemonade)
    if (g.week === 2) { g.startBudget(); return } // Week 2 → Budget Town (Round 8 order)
    // Part J: all stages complete - the mystery house unlocks, the player stays
    dispatch({ type: 'COMPLETE_MODULE1', allocation: g.allocations, badge: 'Week 3 Complete' })
    g.unlockParty()
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-navy">
      {use3D ? <GameWorld avatar={state.avatar} /> : <AccessibleWorld />}
      <Hud playerName={state.player.name || 'friend'} onContinue={onContinue} />
      <PersistentCoach />
      {use3D && usesTouchControls && <MobileControls />}

      {/* Welcome instructions wait for the player instead of disappearing on a timer. */}
      {welcome && (
        <div className="pointer-events-auto absolute inset-0 z-[520] flex items-center justify-center bg-navy/35 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="world-welcome-title" className="w-full max-w-md rounded-3xl border-2 border-teal bg-navy/95 px-6 py-5 text-center text-white shadow-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal">🗺️ Your map mission</p>
            <p id="world-welcome-title" className="mt-2 text-xl font-extrabold">Welcome to your neighborhood, {state.player.name || 'friend'}!</p>
            <p className="mt-2 text-base font-semibold leading-relaxed text-white/85">
              {use3D
                ? <><b className="text-sun">Follow the glowing arrows.</b> Each stop unlocks the next part of your money adventure.</>
                : <><b className="text-sun">Use the step buttons.</b> They show you exactly where to go next.</>}
            </p>
            <button type="button" onClick={() => setWelcome(false)} className="btn-primary mt-5 min-h-[56px] w-full text-lg">
              Start exploring
            </button>
          </div>
        </div>
      )}

      {/* spawn fade-in */}
      <div
        className="pointer-events-none absolute inset-0 z-[130] bg-black transition-opacity duration-1000"
        style={{ opacity: faded ? 0 : 1 }}
      />
    </div>
  )
}
