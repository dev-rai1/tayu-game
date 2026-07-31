import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MODULE_CATALOG } from '../constants/modules.js'
import { useGame } from './store.js'

export function WorldMenu() {
  const navigate = useNavigate()
  const week = useGame((s) => s.week)
  const restartModule = useGame((s) => s.adminJumpModule)
  const [open, setOpen] = useState(false)
  const [confirmRestart, setConfirmRestart] = useState(false)
  const module = MODULE_CATALOG.find((item) => item.n === week)

  const close = () => {
    setOpen(false)
    setConfirmRestart(false)
  }

  const restart = () => {
    restartModule(week)
    close()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="fixed right-[calc(0.75rem+env(safe-area-inset-right,0px))] top-[calc(4.5rem+env(safe-area-inset-top,0px))] z-[480] min-h-[44px] rounded-2xl border-2 border-white/30 bg-navy/90 px-4 text-sm font-extrabold text-white shadow-xl backdrop-blur-sm active:scale-95"
      >
        Menu
      </button>

      {open && (
        <div className="fixed inset-0 z-[700] grid place-items-center bg-navy/70 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="world-menu-title"
            aria-describedby="world-menu-description"
            className="w-full max-w-sm rounded-3xl border-2 border-white/20 bg-navy p-6 text-white shadow-2xl"
          >
            <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-teal">Module {week}</div>
            <h2 id="world-menu-title" className="mt-1 font-display text-2xl font-extrabold">{module?.title || 'Game menu'}</h2>
            <p id="world-menu-description" className="mt-2 text-sm font-semibold leading-relaxed text-white/75">
              You can leave whenever you need to. Completed modules stay available on the module map so you can play them again.
            </p>

            {confirmRestart ? (
              <div className="mt-5 rounded-2xl border border-sun/40 bg-sun/10 p-4">
                <div className="font-extrabold text-sun">Start this module over?</div>
                <p className="mt-1 text-sm font-semibold text-white/75">Your progress inside this module will reset. Earlier completed modules and badges stay saved.</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button type="button" onClick={() => setConfirmRestart(false)} className="min-h-[48px] rounded-xl bg-white/10 px-4 font-extrabold">Go back</button>
                  <button type="button" onClick={restart} className="min-h-[48px] rounded-xl bg-sun px-4 font-extrabold text-navy">Restart module</button>
                </div>
              </div>
            ) : (
              <div className="mt-5 grid gap-2">
                <button type="button" onClick={close} className="min-h-[52px] rounded-2xl bg-teal px-4 font-extrabold text-navy">Keep playing</button>
                <button type="button" onClick={() => navigate('/modules')} className="min-h-[52px] rounded-2xl bg-white/10 px-4 font-extrabold text-white">Exit to module map</button>
                <button type="button" onClick={() => setConfirmRestart(true)} className="min-h-[48px] rounded-2xl border border-white/20 px-4 font-extrabold text-white/90">Start this module over</button>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  )
}
