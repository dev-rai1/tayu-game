import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#eef8ff] px-6 py-12 text-navy">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-2xl" aria-labelledby="not-found-title">
        <img src="/assets/tayu-logo.webp" alt="TAYU" className="mx-auto h-16 w-16 rounded-2xl" />
        <p className="mt-5 font-display text-sm font-extrabold uppercase tracking-[0.18em] text-electric">404</p>
        <h1 id="not-found-title" className="mt-2 font-display text-4xl font-extrabold">Page not found</h1>
        <p className="mt-3 font-semibold leading-relaxed text-navy/70">That TAYU page does not exist or may have moved. Your saved learning progress has not been changed.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex min-h-[48px] items-center justify-center px-6">Return to TAYU home</Link>
      </section>
    </main>
  )
}
