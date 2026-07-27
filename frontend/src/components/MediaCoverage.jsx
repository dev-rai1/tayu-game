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
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-2 rounded-2xl border border-navy/10 bg-navy/5 px-3 py-2 backdrop-blur-md">
          <span id={titleId} className="font-display text-[11px] font-extrabold uppercase tracking-[0.18em] text-navy/65">
            As seen on
          </span>
          <a href={FOX_PAGE_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#d71920]/10 px-3 py-1.5 text-xs font-extrabold text-[#b51219] transition hover:bg-[#d71920]/15">
            FOX 5 DC story
          </a>
          <a href={FOX_VIDEO_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl px-2 py-1.5 text-xs font-bold text-navy/65 underline-offset-2 hover:text-navy hover:underline">
            Watch clip
          </a>
          <span className="hidden h-4 w-px bg-navy/15 sm:block" aria-hidden="true" />
          <a href={WTOP_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-electric/10 px-3 py-1.5 text-xs font-extrabold text-electric transition hover:bg-electric/15">
            WTOP story
          </a>
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
