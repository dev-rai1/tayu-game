import { speak } from '../utils/audioNarration.js'
import { useEffect } from 'react'

const JAR_COLOR = { spend: 'text-spend', save: 'text-save', give: 'text-give' }

// One guided step: big emoji, friendly text, optional bullets, continue button.
// Optional text-to-speech narration for early grades.
export default function TutorialStep({ step, name, index, total, onNext, onSkip, audioOn }) {
  const text = (step.text || '').replaceAll('{{name}}', name)
  const audio = (step.audio || '').replaceAll('{{name}}', name)

  useEffect(() => {
    if (audioOn && audio) speak(audio)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id, audioOn])

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex w-full items-center justify-between text-sm text-white/50">
        <span>Step {index + 1} of {total}</span>
        <button onClick={onSkip} className="underline hover:text-white">Skip tutorial (Esc)</button>
      </div>

      <div className="text-8xl" aria-hidden>{step.emoji}</div>

      <p className="text-2xl font-bold leading-relaxed">{text}</p>

      {step.bullets && (
        <ul className="flex w-full flex-col gap-3">
          {step.bullets.map((b) => (
            <li key={b.label} className="card flex items-center gap-3 !py-3 text-left">
              <span className={`text-lg font-extrabold ${JAR_COLOR[b.color]}`}>{b.label}</span>
              <span className="text-white/80">- {b.desc}</span>
            </li>
          ))}
        </ul>
      )}

      <button className="btn-primary mt-2 text-xl" onClick={onNext}>{step.button} →</button>

      {/* progress dots */}
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`h-2 w-2 rounded-full ${i <= index ? 'bg-teal' : 'bg-white/20'}`} />
        ))}
      </div>
    </div>
  )
}
