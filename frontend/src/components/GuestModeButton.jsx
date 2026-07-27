import { useNavigate } from 'react-router-dom'
import { loadProfile, loadWallet } from '../services/walletStore.js'
import { startGuestSession } from '../services/auth.js'

export default function GuestModeButton() {
  const navigate = useNavigate()

  const playAsGuest = () => {
    startGuestSession()
    if (!loadProfile()?.assessment?.pre) {
      navigate('/assessment/pre')
      return
    }
    navigate(loadWallet() ? '/world' : '/avatar')
  }

  return (
    <>
      <button
        type="button"
        onClick={playAsGuest}
        className="btn-primary mt-5 min-h-[56px] w-full text-lg"
      >
        Play in guest mode
      </button>
      <p className="mt-2 text-center text-sm font-semibold text-white/70">
        Skip login and start playing right away.
      </p>

      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-white/15" />
        <span className="text-xs font-extrabold uppercase tracking-wider text-white/70">or use an account</span>
        <span className="h-px flex-1 bg-white/15" />
      </div>
    </>
  )
}
