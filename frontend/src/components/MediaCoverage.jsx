const FOX_URL = 'https://www.youtube.com/watch?v=HjfuUGCowW4'
const WTOP_URL = 'https://wtop.com/fairfax-county/2026/07/fairfax-co-students-write-book-to-help-elementary-kids-learn-about-financial-literacy/'

export function MediaCoverage({ compact = false, about = false }) {
  return (
    <section className={about ? 'mx-auto w-full max-w-3xl px-6 pb-12' : 'w-full'} aria-labelledby={about ? 'media-coverage-title' : undefined}>
      <div className={`mx-auto rounded-3xl border border-navy/10 bg-white/95 shadow-lg backdrop-blur ${compact ? 'max-w-2xl p-4' : 'max-w-3xl p-6'}`}>
        <div className="text-center">
          <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-electric">Featured in the news</p>
          <h2 id={about ? 'media-coverage-title' : undefined} className={`mt-1 font-display font-extrabold text-navy ${compact ? 'text-xl' : 'text-2xl'}`}>
            TAYU on FOX 5 and WTOP
          </h2>
          {!compact && <p className="mx-auto mt-2 max-w-2xl text-navy/70">See how our student-led financial-literacy project, children&rsquo;s book, and classroom outreach are reaching families across Fairfax County and beyond.</p>}
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
