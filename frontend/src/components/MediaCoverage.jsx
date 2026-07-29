const FOX_PAGE_URL = 'https://www.fox5dc.com/video/fmc-nsz4uh655jl7z59n'
const WTOP_URL = 'https://wtop.com/fairfax-county/2026/07/fairfax-co-students-write-book-to-help-elementary-kids-learn-about-financial-literacy/'
const VIENNA_LEDGER_URL = 'https://viennaledger.com/articles/oakton-high-students-financial-literacy-book-reaches-12-fairfax-county-schools-and-four-countries-ms24rg90'

export function MediaCoverage({ compact = false, about = false }) {
  const sectionClass = about && !compact
    ? 'mx-auto w-full max-w-3xl px-6 pb-12'
    : 'w-full'
  const titleId = about ? 'media-coverage-title' : undefined

  if (compact) {
    return (
      <section className={sectionClass} aria-labelledby={titleId}>
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2 rounded-2xl border border-navy/10 bg-navy/5 px-3 py-2 backdrop-blur-md">
          <span id={titleId} className="font-display text-[11px] font-extrabold uppercase tracking-[0.18em] text-navy/65">
            As seen on
          </span>
          <a href={FOX_PAGE_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#d71920]/10 px-3 py-1.5 text-xs font-extrabold text-[#b51219] transition hover:bg-[#d71920]/15">
            FOX 5 DC story
          </a>
          <span className="hidden h-4 w-px bg-navy/15 sm:block" aria-hidden="true" />
          <a href={WTOP_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-electric/10 px-3 py-1.5 text-xs font-extrabold text-electric transition hover:bg-electric/15">
            WTOP story
          </a>
          <span className="hidden h-4 w-px bg-navy/15 sm:block" aria-hidden="true" />
          <a href={VIENNA_LEDGER_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-brandpurple/10 px-3 py-1.5 text-xs font-extrabold text-brandpurple transition hover:bg-brandpurple/15">
            Vienna Ledger story
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className={sectionClass} aria-labelledby={titleId}>
      <div className="mx-auto max-w-4xl rounded-3xl border border-navy/10 bg-white/95 p-6 shadow-lg backdrop-blur">
        <div className="text-center">
          <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-electric">As seen in the news</p>
          <h2 id={titleId} className="mt-1 font-display text-2xl font-extrabold text-navy">TAYU on FOX 5 DC, WTOP, and Vienna Ledger</h2>
          <p className="mx-auto mt-2 max-w-2xl text-navy/70">See how our student-led financial-literacy project, children&rsquo;s book, and classroom outreach are reaching families across Fairfax County and beyond.</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border-2 border-[#d71920]/20 bg-[#fff5f5] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-lg bg-[#d71920] px-3 py-1 font-display text-sm font-extrabold text-white">FOX 5 DC</span>
              <span className="text-sm font-extrabold text-[#d71920]">Live feature</span>
            </div>
            <p className="mt-3 font-display text-lg font-extrabold text-navy">The Cash Classroom and TAYU</p>
            <p className="mt-1 text-sm leading-relaxed text-navy/65">See the TAYU team share its mission, book, and financial-literacy work.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={FOX_PAGE_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#d71920] px-3 py-2 text-sm font-extrabold text-white">View FOX 5 page</a>
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
          <a href={VIENNA_LEDGER_URL} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border-2 border-brandpurple/20 bg-brandpurple/5 p-4 transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-lg bg-brandpurple px-3 py-1 font-display text-sm font-extrabold text-white">VIENNA LEDGER</span>
              <span className="text-sm font-extrabold text-brandpurple">Read article →</span>
            </div>
            <p className="mt-3 font-display text-lg font-extrabold text-navy">Book reaches 12 Fairfax schools and four countries</p>
            <p className="mt-1 text-sm leading-relaxed text-navy/65">Read Vienna Ledger&rsquo;s feature on the team&rsquo;s book distribution, classroom impact, and next phase with TAYU.</p>
          </a>
        </div>
      </div>
    </section>
  )
}
