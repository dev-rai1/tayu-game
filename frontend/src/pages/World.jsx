import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameState } from '../hooks/useGameState.jsx'
import { GameWorld } from '../world/GameWorld.jsx'
import { Hud } from '../world/Hud.jsx'
import { MobileControls, isTouch } from '../world/MobileControls.jsx'
import { useGame } from '../world/store.js'
import { loadProfile } from '../services/walletStore.js'
import { crossfadeTo } from '../services/audio.js'

// Full-screen 3D world page (Module 1, Week 1).
export default function World() {
  const navigate = useNavigate()
  const { state, dispatch } = useGameState()
  const [faded, setFaded] = useState(false)
  const [welcome, setWelcome] = useState(true)
  const initWorld = useGame((s) => s.initWorld)
  const enterParty = useGame((s) => s.enterParty)

  useEffect(() => {
    if (enterParty) {
      useGame.setState({ enterParty: false })
      navigate('/guru') // K: certificate IMMEDIATELY on entry
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
    const t2 = setTimeout(() => setWelcome(false), 4500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
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
      <GameWorld avatar={state.avatar} />
      <Hud playerName={state.player.name || 'friend'} onContinue={onContinue} />
      {isTouch && <MobileControls />}

      {/* welcome popup */}
      {welcome && (
        <div className="pointer-events-none absolute inset-x-0 top-24 z-[120] flex justify-center">
          <div className="rounded-2xl bg-navy/90 px-6 py-3 text-center text-white shadow-xl">
            <p className="font-bold">Welcome to your neighborhood, {state.player.name || 'friend'}!</p>
            <p className="text-sm text-white/70">Follow the arrows - they'll show you where to go next!</p>
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
