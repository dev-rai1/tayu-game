import { Link } from 'react-router-dom'

export default function Accessibility() {
  return (
    <main className="min-h-screen bg-[#eef8ff] px-5 py-10 text-navy sm:px-6">
      <section className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-xl sm:p-8" aria-labelledby="accessibility-title">
        <Link to="/" className="flex items-center gap-3">
          <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-12 w-12 rounded-xl" />
          <span className="font-display text-2xl font-extrabold">TAYU</span>
        </Link>
        <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-electric">Accessibility</p>
        <h1 id="accessibility-title" className="mt-2 font-display text-4xl font-extrabold">Playing TAYU your way</h1>
        <div className="mt-5 space-y-4 font-semibold leading-relaxed text-navy/75">
          <p>TAYU supports keyboard navigation, visible focus states, descriptive labels, reduced-motion preferences, audio controls, and an accessible 2D game mode for players who do not use the 3D world.</p>
          <p>If something is difficult to use with a keyboard, screen reader, touch input, or another assistive technology, please tell us what happened and which page you were using.</p>
          <p>Email <a href="mailto:tayu.finance@gmail.com" className="font-extrabold text-electric underline underline-offset-4">tayu.finance@gmail.com</a> for accessibility help or feedback.</p>
        </div>
        <Link to="/" className="mt-7 inline-flex rounded-xl bg-navy px-5 py-3 font-extrabold text-white">Back to TAYU home</Link>
      </section>
    </main>
  )
}
