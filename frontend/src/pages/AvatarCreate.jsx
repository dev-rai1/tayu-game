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

// Self-contained 3D character creator. On tablets, the quick-start actions stay
// above the optional customization list so a child never has to finish every
// appearance choice before entering the game.
export default function AvatarCreate() {
  const navigate = useNavigate()
  const { state, dispatch } = useGameState()
  const [avatar, setAvatar] = useState(state.avatar || DEFAULT_AVATAR)
  const [name, setName] = useState(state.player.name || '')
  const [nameTouched, setNameTouched] = useState(false)
  const [use3D] = useState(hasWebGL)

  const patch = (p) => setAvatar((a) => ({ ...a, ...p }))

  const confirm = (nextAvatar = avatar) => {
    setNameTouched(true)
    if (!isValidName(name)) return
    dispatch({ type: 'SET_AVATAR', payload: nextAvatar })
    dispatch({ type: 'SET_AVATAR_URL', url: null })
    dispatch({ type: 'SET_PLAYER', payload: { name: name.trim() } })
    saveProfile({ name: name.trim(), avatar: nextAvatar })
    navigate('/world')
  }

  const surpriseAndEnter = () => {
    const nextAvatar = randomAvatar()
    setAvatar(nextAvatar)
    confirm(nextAvatar)
  }

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden overflow-y-auto bg-navy text-white">
      <div className="fixed inset-0">
        <TownBackground theme="excited" scrim={0.5} />
      </div>

      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/10 bg-navy/80 px-4 py-3 backdrop-blur-md sm:px-5 sm:py-4">
        <div className="flex items-center gap-2">
          <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-10 w-10 rounded-2xl shadow-lg sm:h-11 sm:w-11" />
          <MuteButton />
        </div>
        <span className="rounded-2xl bg-navy/90 px-3 py-1.5 text-center font-display text-base font-bold text-white sm:px-4 sm:text-lg">Make Your Character</span>
        <span className="w-10 sm:w-11" />
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl gap-4 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] xl:grid-cols-[300px_minmax(0,1fr)_280px] xl:items-stretch">
        <section
          aria-label="Optional character options"
          className="card order-3 !p-4 xl:order-1 xl:max-h-[calc(100dvh-7.5rem)] xl:overflow-y-auto"
          style={{ background: 'rgba(7,23,72,0.92)' }}
        >
          <h2 className="mb-1 font-display text-xl font-extrabold text-white">Customize more</h2>
          <p className="mb-4 text-sm font-semibold leading-relaxed text-white/70">These choices only change how your character looks. You can skip all of them.</p>
          <AvatarCustomizer avatar={avatar} onChange={patch} />
        </section>

        <section aria-label="Live character preview" className="order-1 min-h-[38dvh] overflow-hidden rounded-3xl shadow-xl sm:min-h-[48dvh] xl:order-2 xl:min-h-[calc(100dvh-8.5rem)]">
          {use3D ? (
            <AvatarPreview avatar={avatar} />
          ) : (
            <div className="flex h-full min-h-[38dvh] flex-col items-center justify-center bg-navy/90 p-6 text-center sm:min-h-[48dvh]">
              <div className="grid h-32 w-32 place-items-center rounded-full bg-teal/20 text-6xl" aria-hidden="true">●</div>
              <h2 className="mt-5 font-display text-2xl font-extrabold text-teal">Your character is ready</h2>
              <p className="mt-2 max-w-sm font-semibold text-white/80">
                This device cannot show the 3D preview. Your selected appearance is still saved, and the game will use accessible 2D navigation.
              </p>
            </div>
          )}
        </section>

        <section
          aria-label="Quick start"
          className="card order-2 flex flex-col gap-4 !p-4 xl:order-3 xl:max-h-[calc(100dvh-7.5rem)]"
          style={{ background: 'rgba(7,23,72,0.92)' }}
        >
          <div className="rounded-2xl bg-teal/10 px-3 py-3 text-sm font-bold leading-relaxed text-white/90">
            Ready to play? Enter a name and use this character. Customizing is optional.
          </div>
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
              {nameTouched && !isValidName(name) ? 'Please type at least one letter.' : 'Only your name is required. Every appearance choice is optional.'}
            </p>
          </div>
          <button
            type="button"
            className="btn-primary min-h-[58px] text-lg disabled:opacity-40"
            disabled={!isValidName(name)}
            onClick={() => confirm()}
          >
            Use This Character →
          </button>
          <button
            type="button"
            className="btn-secondary min-h-[52px] disabled:opacity-40"
            disabled={!isValidName(name)}
            onClick={surpriseAndEnter}
          >
            Surprise Me & Enter
          </button>
          <button type="button" className="min-h-[44px] rounded-xl bg-white/10 px-3 text-sm font-extrabold text-white/80 active:scale-95" onClick={() => setAvatar(randomAvatar())}>
            Shuffle the Look
          </button>
        </section>
      </main>
    </div>
  )
}
