import { useState } from 'react'
import { isMuted, toggleMute } from '../services/audio.js'

// The always-visible speaker toggle (F2). Simple inline SVG icons - no emojis.
export function MuteButton({ className = '' }) {
  const [muted, setMuted] = useState(isMuted())
  return (
    <button
      aria-label={muted ? 'Unmute music' : 'Mute music'}
      onClick={() => setMuted(toggleMute())}
      className={`pointer-events-auto grid h-11 w-11 place-items-center rounded-2xl bg-navy/80 shadow-lg transition active:scale-95 ${className}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#fff" stroke="none" />
        {muted ? (
          <>
            <line x1="16" y1="9" x2="22" y2="15" />
            <line x1="22" y1="9" x2="16" y2="15" />
          </>
        ) : (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </>
        )}
      </svg>
    </button>
  )
}
