import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getReadingBand, READING_BANDS, setReadingBand } from '../services/readingPreferences.js'

const OPTIONS = [
  {
    id: READING_BANDS.YOUNGER,
    title: 'Younger reader',
    grades: 'Usually K–5',
    copy: 'Keeps auto-clearing character captions on screen longer and uses younger copy when a lesson provides it.',
  },
  {
    id: READING_BANDS.OLDER,
    title: 'Older reader',
    grades: 'Usually grades 6–12',
    copy: 'Uses the standard caption pace and older copy when a lesson provides it.',
  },
]

export default function Settings() {
  const navigate = useNavigate()
  const [band, setBand] = useState(() => getReadingBand())

  const choose = (value) => {
    setReadingBand(value)
    setBand(value)
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-5 py-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-12 w-12 rounded-xl" />
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal">Player options</p>
            <h1 className="font-display text-3xl font-extrabold">Settings</h1>
          </div>
        </div>
        <button className="btn-secondary" onClick={() => navigate(-1)}>Back</button>
      </div>

      <section className="rounded-3xl border-2 border-teal/35 bg-white/5 p-5">
        <h2 className="font-display text-2xl font-extrabold">Reading level</h2>
        <p className="mt-2 font-semibold text-white/70">
          TAYU chooses a starting level from the selected grade. The player can change it here at any time.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {OPTIONS.map((option) => {
            const selected = band === option.id
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => choose(option.id)}
                className={`min-h-[150px] rounded-2xl border-2 p-4 text-left transition active:scale-[0.99] ${selected ? 'border-teal bg-teal text-navy' : 'border-white/15 bg-black/20 text-white hover:border-white/35'}`}
              >
                <span className="block font-display text-xl font-extrabold">{option.title}</span>
                <span className={`mt-1 block text-xs font-extrabold uppercase tracking-wide ${selected ? 'text-navy/65' : 'text-teal'}`}>{option.grades}</span>
                <span className={`mt-3 block text-sm font-semibold ${selected ? 'text-navy/80' : 'text-white/70'}`}>{option.copy}</span>
                <span className="mt-3 block text-sm font-extrabold">{selected ? 'Selected' : 'Choose this level'}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="rounded-3xl bg-white/5 p-5">
        <h2 className="font-display text-xl font-extrabold">Audio and help</h2>
        <p className="mt-2 font-semibold text-white/70">
          Use the speaker button for music and the Read aloud button on lesson cards. The question-mark menu inside the world replays the controls and learning resources.
        </p>
      </section>
    </main>
  )
}
