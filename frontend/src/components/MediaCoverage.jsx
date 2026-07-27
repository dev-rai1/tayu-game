const FOX_PAGE_URL = 'https://www.fox5dc.com/video/fmc-nsz4uh655jl7z59n'
const FOX_VIDEO_URL = 'https://www.youtube.com/watch?v=HjfuUGCowW4'
const WTOP_URL = 'https://wtop.com/fairfax-county/2026/07/fairfax-co-students-write-book-to-help-elementary-kids-learn-about-financial-literacy/'

export function MediaCoverage({ compact = false, about = false }) {
  const sectionClass = about && !compact
    ? 'mx-auto w-full max-w-3xl px-6 pb-12'
    : 'w-full'
  const titleId = about ? 'media-coverage-title' : undefined

  if (compact) {
    return (
      <section className={sectionClass} aria-labelledby={titleId}>
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-gradient-to-r from-[#d71920] via-navy to-electric p-[2px] shadow-xl">
          <div className="grid items-stretch gap-3 rounded-[1.85rem] bg-white/95 p-4 backdrop-blur md:grid-cols-[minmax(190px,0.72fr)_1fr_1fr]">
            <div className="flex flex-col justify-center px-2 text-center md:text-left">
              <p className="font-display text-[11px] font-extrabold uppercase tracking-[0.2em] text-electric">As seen in the news</p>
              <h2 id={titleId} className="mt-1 font-display text-xl font-extrabold leading-tight text-navy">TAYU in the spotlight</h2>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-navy/60">See the student-led story behind our game, book, and classroom impact.</p>
            </div>

            <div className="rounded-2xl border border-[#d71920]/20 bg-[#fff6f6] p-4 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-lg bg-[#d71920] px-3 py-1 font-display text-xs font-extrabold text-white">FOX 5 DC</span>
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-[#d71920]">Live feature</span>
              </div>
              <p className="mt-2 font-display text-base font-extrabold text-navy">The Cash Classroom and TAYU</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={FOX_PAGE_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#d71920] px-3 py-2 text-xs font-extrabold text-white transition hover:opacity-90">View FOX 5 page →</a>
                <a href={FOX_VIDEO_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[#d71920]/25 bg-white px-3 py-2 text-xs font-extrabold text-[#b51219] transition hover:bg-[#fff0f0]">Watch clip</a>
              </div>
            </div>

            <a href={WTOP_URL} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-electric/20 bg-[#f2f7ff] p-4 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-lg bg-electric px-3 py-1 font-display text-xs font-extrabold text-white">WTOP NEWS</span>
                <span className="text-xs font-extrabold text-electric">Read article →</span>
              </div>
              <p className="mt-2 font-display text-base font-extrabold text-navy">Fairfax students teach financial literacy</p>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-navy/60">Read about the team&rsquo;s book and work with elementary students.</p>
            </a>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={sectionClass} aria-labelledby={titleId}>
      <div className="mx-auto max-w-3xl rounded-3xl border border-navy/10 bg-white/95 p-6 shadow-lg backdrop-blur">
        <div className="text-center">
          <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-electric">As seen in the news</p>
          <h2 id={titleId} className="mt-1 font-display text-2xl font-extrabold text-navy">TAYU on FOX 5 DC and WTOP</h2>
          <p className="mx-auto mt-2 max-w-2xl text-navy/70">See how our student-led financial-literacy project, children&rsquo;s book, and classroom outreach are reaching families across Fairfax County and beyond.</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-[#d71920]/20 bg-[#fff5f5] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-lg bg-[#d71920] px-3 py-1 font-display text-sm font-extrabold text-white">FOX 5 DC</span>
              <span className="text-sm font-extrabold text-[#d71920]">Live feature</span>
            </div>
            <p className="mt-3 font-display text-lg font-extrabold text-navy">The Cash Classroom and TAYU</p>
            <p className="mt-1 text-sm leading-relaxed text-navy/65">Watch the TAYU team share its mission, book, and financial-literacy work.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={FOX_PAGE_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#d71920] px-3 py-2 text-sm font-extrabold text-white">View FOX 5 page</a>
              <a href={FOX_VIDEO_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[#d71920]/25 bg-white px-3 py-2 text-sm font-extrabold text-[#b51219]">Watch clip</a>
            </div>
          </div>
          <a href={WTOP_URL} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border-2 border-electric/20 bg-[#f2f7ff] p-4 transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-lg bg-electric px-3 py-1 font-display text-sm font-extrabold text-white">WTOP NEWS</span>
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
