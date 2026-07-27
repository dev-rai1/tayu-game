const FOX_URL = 'https://www.youtube.com/watch?v=HjfuUGCowW4'
const WTOP_URL = 'https://wtop.com/fairfax-county/2026/07/fairfax-co-students-write-book-to-help-elementary-kids-learn-about-financial-literacy/'

export function MediaCoverage({ compact = false, about = false }) {
  const sectionClass = about && !compact
    ? 'mx-auto w-full max-w-3xl px-6 pb-12'
    : 'w-full'
  const titleId = about ? 'media-coverage-title' : undefined

  if (compact) {
    return (
      <section className={sectionClass} aria-labelledby={titleId}>
        <div className="mx-auto grid max-w-5xl items-center gap-3 rounded-3xl border border-navy/10 bg-white/95 p-3 shadow-lg backdrop-blur md:grid-cols-[minmax(180px,0.75fr)_1fr_1fr]">
          <div className="px-2 text-center md:text-left">
            <p className="font-display text-[11px] font-extrabold uppercase tracking-[0.18em] text-electric">Featured in the news</p>
            <h2 id={titleId} className="mt-1 font-display text-lg font-extrabold text-navy">TAYU on FOX 5 + WTOP</h2>
          </div>

          <a href={FOX_URL} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border-2 border-[#d71920]/20 bg-[#fff5f5] px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-lg bg-[#d71920] px-3 py-1 font-display text-xs font-extrabold text-white">FOX 5 DC</span>
              <span className="text-xs font-extrabold text-[#d71920]">Watch feature →</span>
            </div>
            <p className="mt-2 text-sm font-bold text-navy">Live television feature</p>
          </a>

          <a href={WTOP_URL} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border-2 border-electric/20 bg-[#f2f7ff] px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-lg bg-electric px-3 py-1 font-display text-xs font-extrabold text-white">WTOP</span>
              <span className="text-xs font-extrabold text-electric">Read article →</span>
            </div>
            <p className="mt-2 text-sm font-bold text-navy">Fairfax students teach financial literacy</p>
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className={sectionClass} aria-labelledby={titleId}>
      <div className="mx-auto max-w-3xl rounded-3xl border border-navy/10 bg-white/95 p-6 shadow-lg backdrop-blur">
        <div className="text-center">
          <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-electric">Featured in the news</p>
          <h2 id={titleId} className="mt-1 font-display text-2xl font-extrabold text-navy">
            TAYU on FOX 5 and WTOP
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-navy/70">See how our student-led financial-literacy project, children&rsquo;s book, and classroom outreach are reaching families across Fairfax County and beyond.</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a href={FOX_URL} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border-2 border-[#d71920]/20 bg-[#fff5f5] p-4 transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-lg bg-[#d71920] px-3 py-1 font-display text-sm font-extrabold text-white">FOX 5</span>
              <span className="text-sm font-extrabold text-[#d71920]">Watch feature →</span>
            </div>
            <p className="mt-3 font-display text-lg font-extrabold text-navy">Live television feature</p>
            <p className="mt-1 text-sm leading-relaxed text-navy/65">Watch the TAYU team share its mission, book, and financial-literacy work on FOX 5 DC.</p>
          </a>
          <a href={WTOP_URL} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border-2 border-electric/20 bg-[#f2f7ff] p-4 transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-lg bg-electric px-3 py-1 font-display text-sm font-extrabold text-white">WTOP</span>
              <span className="text-sm font-extrabold text-electric">Read article →</span>
            </div>
            <p className="mt-3 font-display text-lg font-extrabold text-navy">Fairfax students teach financial literacy</p>
            <p className="mt-1 text-sm leading-relaxed text-navy/65">Read WTOP&rsquo;s story about the team&rsquo;s children&rsquo;s book and work helping elementary students learn money skills.</p>
          </a>
        </div>
      </div>
    </section>
  )
}
