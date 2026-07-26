import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameState } from '../hooks/useGameState.jsx'
import { saveProfile } from '../services/walletStore.js'
import { TownBackground } from '../components/TownBackground.jsx'
import { MuteButton } from '../components/MuteButton.jsx'
import AvatarCustomizer from '../components/AvatarCustomizer.jsx'
import AvatarPreview from '../components/AvatarPreview.jsx'
import { DEFAULT_AVATAR, randomAvatar } from '../constants/avatarOptions.js'
import { isValidName } from '../utils/validators.js'
import { hasWebGL } from '../utils/webgl.js'

// Self-contained 3D character creator: options (left) · live 3D preview (center)
// · name + actions (right). Fully customizable, works on any device/network.
export default function AvatarCreate() {
  const navigate = useNavigate()
  const { state, dispatch } = useGameState()
  const [avatar, setAvatar] = useState(state.avatar || DEFAULT_AVATAR)
  const [name, setName] = useState(state.player.name || '')
  const [nameTouched, setNameTouched] = useState(false)
  const [use3D] = useState(hasWebGL)

  const patch = (p) => setAvatar((a) => ({ ...a, ...p }))

  const confirm = () => {
    setNameTouched(true)
    if (!isValidName(name)) return
    dispatch({ type: 'SET_AVATAR', payload: avatar })
    dispatch({ type: 'SET_AVATAR_URL', url: null }) // use the built-in 3D character
    dispatch({ type: 'SET_PLAYER', payload: { name: name.trim() } })
    saveProfile({ name: name.trim(), avatar }) // Continue must remember the player (B2)
    navigate('/world')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-navy text-white">
      {/* B4: the 'excited' animated town behind the builder - NPCs running,
          jumping, cheering. A soft scrim keeps the 3D preview clearly on top. */}
      <div className="absolute inset-0">
        <TownBackground theme="excited" scrim={0.5} />
      </div>
      <header className="relative z-10 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-11 w-11 rounded-2xl shadow-lg" />
          <MuteButton />
        </div>
        <span className="rounded-2xl bg-navy/85 px-4 py-1.5 font-display text-lg font-bold text-white">Create Your Character</span>
        <span className="w-11" />
      </header>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-4 p-4 lg:grid-cols-[300px_1fr_280px]">
        {/* Left - options */}
        <div className="card max-h-[74vh] !p-4" style={{ background: 'rgba(7,23,72,0.92)' }}>
          <AvatarCustomizer avatar={avatar} onChange={patch} />
        </div>

        {/* Center - 3D preview */}
        <div className="min-h-[52vh] overflow-hidden rounded-3xl shadow-xl lg:min-h-[74vh]">
          {use3D ? (
            <AvatarPreview avatar={avatar} />
          ) : (
            <div className="flex h-full min-h-[52vh] flex-col items-center justify-center bg-navy/90 p-6 text-center">
              <div className="grid h-32 w-32 place-items-center rounded-full bg-teal/20 text-6xl" aria-hidden="true">●</div>
              <h2 className="mt-5 font-display text-2xl font-extrabold text-teal">Your character is ready</h2>
              <p className="mt-2 max-w-sm font-semibold text-white/80">
                This device cannot show the 3D preview. Your selected appearance is still saved, and the game will use accessible 2D navigation.
              </p>
            </div>
          )}
        </div>

        {/* Right - name + actions */}
        <div className="card flex flex-col gap-4 !p-4" style={{ background: 'rgba(7,23,72,0.92)' }}>
          <div>
            <label htmlFor="name" className="text-sm font-bold text-teal">Your name</label>
            <input
              id="name"
              value={name}
              maxLength={16}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setNameTouched(true)}
              onKeyDown={(e) => e.key === 'Enter' && confirm()}
              aria-invalid={nameTouched && !isValidName(name)}
              aria-describedby="name-help"
              placeholder="Alex"
              className="mt-1 w-full rounded-xl border-2 border-white/20 bg-navy/85 px-3 py-2 text-lg font-bold text-white placeholder-white/40"
            />
            <p id="name-help" className={`mt-1 text-xs font-bold ${nameTouched && !isValidName(name) ? 'text-red-200' : 'text-white/75'}`}>
              {nameTouched && !isValidName(name) ? 'Please type at least one letter.' : 'Type your name, then press Enter or choose Enter World.'}
            </p>
          </div>
          <button className="btn-secondary" onClick={() => setAvatar(randomAvatar())}>Randomize</button>
          <button className="btn-primary disabled:opacity-40" disabled={!isValidName(name)} onClick={confirm}>
            Enter World →
          </button>
        </div>
      </div>
    </div>
  )
}
