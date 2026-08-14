import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TownBackground } from '../components/TownBackground.jsx'
import { MuteButton } from '../components/MuteButton.jsx'
import { MODULE_CATALOG } from '../constants/modules.js'

// About Us (Round 2, Part A) - persuasive and credible: stat-backed Who We
// Are, the real team with photos and LinkedIn, ONE merged track-record story
// around The Seed That Grew, a Community Partners call to action, an animated
// greeting-NPC background behind a readability scrim, and exactly ONE
// canonical link row (the footer) plus the two Partner CTA buttons.

const LOGO = '/assets/tayu-logo.webp'
const FOX_PAGE_URL = 'https://www.fox5dc.com/video/fmc-nsz4uh655jl7z59n'
const WTOP_URL = 'https://wtop.com/fairfax-county/2026/07/fairfax-co-students-write-book-to-help-elementary-kids-learn-about-financial-literacy/'
const VIENNA_LEDGER_URL = 'https://viennaledger.com/articles/oakton-high-students-financial-literacy-book-reaches-12-fairfax-county-schools-and-four-countries-ms24rg90'
const CONNECTION_URL = 'https://connectionarchives.com/PDF/2026/071526/FxCo%20071526.pdf#page=7'
const VISION_TIMES_URL = 'https://www.secretchina.com/news/b5/2026/08/10/1103211.html'
const WHITE_HOUSE_URL = 'https://lnkd.in/p/epru8TyC'
const NJCFE_URL = 'https://njcfe.org/8-11-26-fairfax-co-students-write-book-to-help-elementary-kids-learn-about-financial-literacy/'

const CONTACTS = [
  { label: 'Email', href: 'mailto:tayu.finance@gmail.com' },
  { label: 'Instagram', href: 'https://www.instagram.com/tayu.finance' },
  { label: 'Facebook', href: 'https://www.facebook.com/share/1BmGNEpdrV/' },
  { label: 'Book a time', href: 'https://calendly.com/tayu-finance/30min' },
]

const TEAM = [
  { file: 'dev_rai.png', name: 'Dev Rai', role: 'Co-Founder, Project Lead', li: 'https://linkedin.com/in/dev-rai-948bb32a9' },
  { file: 'ayush_ranjan.png', name: 'Ayush Ranjan', role: 'Co-Founder, Lead Developer', li: 'https://linkedin.com/in/ayush-ranjan6285' },
  { file: 'austin_chen.png', name: 'Austin Chen', role: 'Co-Founder, Outreach', li: 'https://linkedin.com/in/austin-chen-56028731a' },
  { file: 'gaamaa_hishigsuren.png', name: 'Gaamaa Hishigsuren', role: 'Project Advisor', li: 'https://linkedin.com/in/gaamaa' },
]

// R13 11.5: corporate sponsors - add {name, org?, logo?} entries here to list more
const SPONSORS = [
  { name: 'Michael Darcy', org: 'DG Fuel' },
]

const STATS = [
  {
    big: 'Age 7',
    head: 'when money habits are formed',
    body: 'University of Cambridge research (Whitebread and Bingham, for the UK Money Advice Service) found that core money habits and attitudes are largely set by age seven. TAYU meets kids inside that window, while habits are still forming.',
    src: 'Whitebread and Bingham, University of Cambridge / Money Advice Service',
  },
  {
    big: 'Play first',
    head: 'how young brains actually learn',
    body: 'Young children learn best through play, repetition, and immediate feedback. A child who practices save-versus-spend choices in a game builds the shortcut before real money is ever at stake. Early exposure compounds, just like money.',
    src: 'Psychology of early habit formation',
  },
  {
    big: 'Most students',
    head: 'reach high school with no personal-finance instruction',
    body: 'Surveys repeatedly find that a large majority of American adults say school never prepared them to manage money, and adult financial-literacy quiz scores stay low. Elementary school is the least-served age group of all, which is exactly where TAYU focuses.',
    src: 'FINRA National Financial Capability Study',
  },
  {
    big: 'It works',
    head: 'financial education changes outcomes',
    body: 'Studies of state financial-education mandates link required instruction to better credit outcomes and less delinquency in early adulthood. Starting earlier extends that runway.',
    src: 'FINRA research; Council for Economic Education, Survey of the States',
  },
]

// Photo with graceful initials fallback (drop the real files in /assets/team/).
function TeamPhoto({ file, name }) {
  const [broken, setBroken] = useState(false)
  if (broken) {
    return (
      <div className="mx-auto grid h-24 w-24 place-items-center rounded-2xl bg-electric font-display text-2xl font-extrabold text-white">
        {name.split(' ').map((w) => w[0]).join('')}
      </div>
    )
  }
  return (
    <img
      src={`/assets/team/${file}`}
      alt={name}
      onError={() => setBroken(true)}
      className="mx-auto h-24 w-24 rounded-2xl object-cover shadow"
    />
  )
}

function BookCover() {
  const [broken, setBroken] = useState(false)
  if (broken) {
    return (
      <div className="grid h-52 w-40 shrink-0 place-items-center rounded-xl p-3 text-center shadow-lg" style={{ background: 'linear-gradient(160deg,#00DCA0,#1464F0)' }}>
        <div>
          <div className="font-display text-lg font-extrabold leading-tight text-white">The Seed That Grew</div>
          <div className="mt-2 text-3xl">
            <span className="inline-block h-8 w-8 rounded-full bg-[#FFD700]" />
          </div>
          <div className="mt-2 text-[10px] font-bold text-white/80">A story about investing</div>
        </div>
      </div>
    )
  }
  return <img src="/assets/book/seed-cover.png" alt="The Seed That Grew book cover" onError={() => setBroken(true)} className="h-52 w-40 shrink-0 rounded-xl object-cover shadow-lg" />
}

export default function About() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-navy">
      {/* A6: greeting NPCs behind a soft white scrim so text stays readable */}
      <div className="fixed inset-0">
        <TownBackground theme="greet" scrim={0.84} />
      </div>

      <div className="relative z-10">
        <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-3">
              <img src={LOGO} alt="TAYU" className="h-12 w-12 rounded-2xl shadow" />
              <span className="font-display text-2xl font-extrabold text-navy">TAYU</span>
            </Link>
            <MuteButton />
          </div>
          <Link to="/" className="rounded-xl bg-electric px-4 py-2 text-sm font-bold text-white hover:bg-teal hover:text-navy">
            Back to the game
          </Link>
        </header>

        <main className="mx-auto flex max-w-3xl flex-col gap-12 px-6 pb-16 pt-4">
          {/* A3 - Who We Are, with the statistics and psychology of starting early */}
          <section>
            <h1 className="font-display text-3xl font-extrabold text-navy">Who we are</h1>
            <p className="mt-3 text-lg leading-relaxed text-navy/80">
              TAYU is our DECA project: a 3D game that teaches money skills across three
              school levels &mdash; elementary, middle, and high school &mdash; by letting kids play it.
            </p>
            <p className="mt-3 text-lg font-semibold leading-relaxed text-navy">
              We are focused on building a strong foundation from elementary school, closing the
              existing gap, and offering more enhanced and gamified content for middle and high
              school students to complement any existing content they may be able to access.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {STATS.map((s) => (
                <div key={s.big} className="rounded-3xl bg-white p-5 shadow-md">
                  <div className="font-display text-2xl font-extrabold text-electric">{s.big}</div>
                  <div className="font-bold text-navy">{s.head}</div>
                  <p className="mt-2 text-sm leading-relaxed text-navy/75">{s.body}</p>
                  <p className="mt-2 text-[11px] text-navy/45">{s.src}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-lg font-semibold leading-relaxed text-navy">
              Providing financial literacy at an early age, including from the elementary school
              level, and strengthening it through middle and high school, will contribute to more
              financially responsible citizens and a better economy.
            </p>
          </section>

          {/* A2 - Meet the Team */}
          <section>
            <h2 className="font-display text-2xl font-extrabold text-navy">Meet the team</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TEAM.map((m) => (
                <div key={m.name} className="rounded-3xl bg-white p-5 text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg">
                  <TeamPhoto file={m.file} name={m.name} />
                  <div className="mt-3 font-display text-base font-extrabold text-navy">{m.name}</div>
                  <div className="text-sm font-bold text-electric">{m.role}</div>
                  <a href={m.li} target="_blank" rel="noopener" className="mt-1 inline-block text-xs font-bold text-navy/60 underline underline-offset-2 hover:text-electric">
                    LinkedIn
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* A4 - ONE track-record story, book front and center */}
          <section className="rounded-3xl bg-white p-6 shadow-md">
            <h2 className="font-display text-2xl font-extrabold text-navy">Our track record</h2>
            {/* C2: the championship lives with the proof, not the mission */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-display text-lg font-extrabold text-navy shadow-md" style={{ background: 'linear-gradient(120deg,#FFD700,#ffe98a)', border: '2px solid #b8860b' }}>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-navy text-base text-[#FFD700]">1</span>
              State Champions - 2026 Virginia DECA State Leadership Conference
            </div>
            <div className="mt-4 flex flex-col gap-5 sm:flex-row">
              <BookCover />
              <div>
                <p className="text-lg leading-relaxed text-navy/85">
                  Our team wrote and published <b className="text-navy">The Seed That Grew</b>, a
                  children&rsquo;s book about investing. We brought it into elementary classrooms
                  ourselves through our Cash Classroom sessions, reading with students and running
                  live financial-literacy lessons. Then we took it global: the book was translated
                  into <b>seven languages</b> (English, Hindi, Marathi, Chinese, Mongolian, Spanish, and Russian) and
                  distributed to students and schools across <b>five countries</b> (the United
                  States, India, China, Kazakhstan, and Australia). The book is also available on
                  Amazon, making it accessible to readers beyond the schools and communities we
                  have worked with.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href="https://www.amazon.com/Seed-That-Grew-Story-Investing/dp/B0FZ9CNLJV/" target="_blank" rel="noopener" className="rounded-2xl bg-navy px-4 py-2 text-sm font-bold text-white hover:bg-electric">
                    View on Amazon
                  </a>
                </div>
                <p className="mt-4 rounded-2xl bg-navy px-4 py-3 font-display text-base font-extrabold text-white">
                  The book taught kids by reading. TAYU teaches them by playing.
                </p>
              </div>
            </div>
            {/* R13 11.4: media coverage, embedded inline */}
            <div className="mt-6 rounded-3xl border border-navy/10 bg-white/95 p-5 shadow-md">
              <h3 className="font-display text-lg font-extrabold text-navy">Recognized by the White House and NJCFE · Featured in FOX 5 DC, WTOP, Vienna Ledger, Connection Newspapers &amp; Vision Times</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <a href={WHITE_HOUSE_URL} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border-2 border-navy/20 bg-navy/5 p-5 transition hover:-translate-y-1 hover:bg-navy/10 hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-lg bg-navy px-3 py-1 font-display text-sm font-extrabold text-white">White House Recognition</span>
                    <span className="text-sm font-extrabold text-navy">View recognition →</span>
                  </div>
                  <h4 className="mt-3 font-display text-lg font-extrabold leading-tight text-navy">Recognition from the White House</h4>
                  <p className="mt-2 text-sm leading-relaxed text-navy/65">View the White House recognition of our financial-literacy work and community impact.</p>
                </a>
                <a href={NJCFE_URL} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border-2 border-teal/30 bg-teal/5 p-5 transition hover:-translate-y-1 hover:bg-teal/10 hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-lg bg-teal px-3 py-1 font-display text-sm font-extrabold text-navy">NJCFE Recognition</span>
                    <span className="text-sm font-extrabold text-navy">Read feature →</span>
                  </div>
                  <h4 className="mt-3 font-display text-lg font-extrabold leading-tight text-navy">National Jump$tart Coalition financial-education recognition</h4>
                  <p className="mt-2 text-sm leading-relaxed text-navy/65">Read NJCFE&rsquo;s feature on our book, elementary-school outreach, and financial-literacy mission.</p>
                </a>
                <a href={WTOP_URL} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border-2 border-electric/20 bg-electric/5 p-5 transition hover:-translate-y-1 hover:bg-electric/10 hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-lg bg-electric px-3 py-1 font-display text-sm font-extrabold text-white">WTOP News</span>
                    <span className="text-sm font-extrabold text-electric">Read article →</span>
                  </div>
                  <h4 className="mt-3 font-display text-lg font-extrabold leading-tight text-navy">Fairfax students teach financial literacy</h4>
                  <p className="mt-2 text-sm leading-relaxed text-navy/65">Read WTOP&rsquo;s feature about our book, classroom outreach, and mission.</p>
                </a>
                <a href={VIENNA_LEDGER_URL} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border-2 border-brandpurple/20 bg-brandpurple/5 p-5 transition hover:-translate-y-1 hover:bg-brandpurple/10 hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-lg bg-brandpurple px-3 py-1 font-display text-sm font-extrabold text-white">Vienna Ledger</span>
                    <span className="text-sm font-extrabold text-brandpurple">Read article →</span>
                  </div>
                  <h4 className="mt-3 font-display text-lg font-extrabold leading-tight text-navy">Book reaches 12 Fairfax County schools and four countries</h4>
                  <p className="mt-2 text-sm leading-relaxed text-navy/65">Read Vienna Ledger&rsquo;s feature about our book distribution, classroom impact, and expansion through TAYU.</p>
                </a>
                <a href={CONNECTION_URL} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border-2 border-teal/30 bg-teal/5 p-5 transition hover:-translate-y-1 hover:bg-teal/10 hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-lg bg-teal px-3 py-1 font-display text-sm font-extrabold text-navy">Connection Newspapers</span>
                    <span className="text-sm font-extrabold text-navy">Read article →</span>
                  </div>
                  <h4 className="mt-3 font-display text-lg font-extrabold leading-tight text-navy">Oakton High Trio Plant the Seeds of Wealth in Global Book Launch</h4>
                  <p className="mt-2 text-sm leading-relaxed text-navy/65">Read The Connection&rsquo;s feature on our classroom results, global book launch, Virginia DECA win, and next phase with TAYU.</p>
                </a>
                <a href={VISION_TIMES_URL} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border-2 border-navy/15 bg-navy/5 p-5 transition hover:-translate-y-1 hover:bg-navy/10 hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-lg bg-navy px-3 py-1 font-display text-sm font-extrabold text-white">Vision Times · Chinese</span>
                    <span className="text-sm font-extrabold text-navy">Read article →</span>
                  </div>
                  <h4 className="mt-3 font-display text-lg font-extrabold leading-tight text-navy">Fairfax County students create a financial-literacy picture book for elementary students</h4>
                  <p className="mt-2 text-sm leading-relaxed text-navy/65">Read the international Chinese-language feature on our 274-book, 17-school outreach and the next step with a financial-literacy game.</p>
                </a>
              </div>
              <div className="mt-5 rounded-2xl border border-navy/10 bg-navy/5 p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-xs font-extrabold uppercase tracking-[0.16em] text-navy/60">FOX 5 DC video</p>
                    <h4 className="font-display text-lg font-extrabold text-navy">Watch the feature</h4>
                  </div>
                  <a href={FOX_PAGE_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#d71920] px-4 py-2 text-sm font-extrabold text-white hover:opacity-90">
                    Open FOX 5 page
                  </a>
                </div>
                <div className="overflow-hidden rounded-2xl shadow-md" style={{ position: 'relative', paddingTop: '56.25%' }}>
                  <iframe
                    src="https://www.youtube.com/embed/HjfuUGCowW4"
                    title="TAYU on FOX 5 DC"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </section>

          {/* A5 - Community Partners call to action */}
          {/* R10 v8 6.4: the teacher-facing map of what each module teaches */}
          <section className="rounded-3xl bg-white p-6 shadow-md">
            <h2 className="font-display text-2xl font-extrabold text-navy">For teachers and classrooms</h2>
            <p className="mt-2 text-navy/75">
              Each TAYU module is a self-contained 10-20 minute activity with a clear start and finish -
              built for tablets and shared Chromebooks, with read-aloud for early readers, progress that
              saves automatically, and no data collected beyond a first name. The concepts each module covers:
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {MODULE_CATALOG.map((module) => (
                <div key={module.n} className="rounded-2xl bg-navy/5 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-display text-sm font-extrabold text-electric">{module.n}. {module.title}</div>
                    <div className="rounded-full bg-electric/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-electric">{module.grades}</div>
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-navy/75">{module.desc}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-navy/60">
              Grounded in the Cambridge finding that money habits form by age 7: concrete, hands-on choices with
              immediate feedback - never lectures. A printable certificate marks full completion.
            </p>
          </section>

          <section className="rounded-3xl p-7 text-center shadow-md" style={{ background: 'linear-gradient(135deg, #d9fbf1, #dceafe)' }}>
            <h2 className="font-display text-2xl font-extrabold text-navy">Partner with us</h2>
            <p className="mx-auto mt-3 max-w-xl text-lg leading-relaxed text-navy/85">
              We partner with community organizations to run TAYU sessions with their kids. We come
              in (or join virtually), teach financial literacy, and run live demos of the game.
              We would love to work with schools, institutions, libraries, virtual camps, summer
              camps, after-school programs, scout troops, and community organizations.
              <b> Sessions are free.</b>
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a href="mailto:tayu.finance@gmail.com" className="rounded-2xl bg-electric px-6 py-3 text-base font-extrabold text-white hover:bg-teal hover:text-navy">
                Email Us
              </a>
              <a href="https://calendly.com/tayu-finance/30min" target="_blank" rel="noopener" className="rounded-2xl bg-navy px-6 py-3 text-base font-extrabold text-white hover:bg-electric">
                Schedule a Demo Call
              </a>
            </div>
          </section>

          {/* C1: follow CTAs - a small friendly card, distinct from the footer's plain links */}
          {/* R12 2.4: new accounts land here first - the clear door into play */}
          <section className="rounded-3xl bg-white p-6 text-center shadow-md">
            <h2 className="font-display text-xl font-extrabold text-navy">Ready when you are</h2>
            <p className="mt-2 text-navy/70">TAYU is a free K-12 teacher resource, beginning with five playable core money modules and expanding for middle and high school.</p>
            <a href="/avatar" className="btn-primary mt-4 inline-block min-h-[56px] px-10 text-lg leading-[56px]">Play the Game</a>
            <p className="mt-4 text-sm font-bold text-navy/60">After you play, share your feedback:</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSc4IgEETBk_Serp_OM0FQNH0o91OAOvbsjWK_DAGMVtz64aEw/viewform" target="_blank" rel="noopener" className="rounded-xl bg-electric px-5 py-3 text-sm font-extrabold text-white active:scale-95">Teacher Feedback</a>
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSdfko_Uc7k7xuMRDY_ZO1mzOrqK72cgybKUjy5Mk7OkS-9w_w/viewform" target="_blank" rel="noopener" className="rounded-xl bg-brandpurple px-5 py-3 text-sm font-extrabold text-white active:scale-95">Student Feedback</a>
            </div>
          </section>

          {/* R13 11.5: corporate sponsors - anyone contributing over $200 can be listed */}
          <section className="rounded-3xl bg-white p-6 text-center shadow-md">
            <h2 className="font-display text-2xl font-extrabold text-navy">Our sponsors</h2>
            <p className="mx-auto mt-2 max-w-xl text-navy/70">
              TAYU is supported by generous sponsors. Contributors of more than $200 are proudly listed here.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {SPONSORS.map((sp) => (
                <div key={sp.name} className="rounded-2xl border-2 border-navy/10 bg-navy/5 px-6 py-4">
                  {sp.logo
                    ? <img src={sp.logo} alt={sp.name} className="mx-auto h-12 object-contain" />
                    : <div className="font-display text-lg font-extrabold text-navy">{sp.name}</div>}
                  {sp.org && <div className="mt-1 text-sm font-bold text-electric">{sp.org}</div>}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-navy/60">
              Interested in sponsoring? <a href="mailto:tayu.finance@gmail.com" className="font-bold text-electric underline underline-offset-2">Get in touch.</a>
            </p>
          </section>

          <section className="rounded-3xl bg-white p-6 text-center shadow-md">
            <h2 className="font-display text-xl font-extrabold text-navy">Follow our journey</h2>
            <p className="mx-auto mt-2 max-w-md text-navy/75">
              Follow us on social media for updates, sessions, and new releases.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <a href="https://www.instagram.com/tayu.finance" target="_blank" rel="noopener" className="flex items-center gap-2 rounded-2xl px-6 py-3 text-base font-extrabold text-white transition hover:opacity-90" style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="#fff" /></svg>
                Instagram
              </a>
              <a href="https://www.facebook.com/share/1BmGNEpdrV/" target="_blank" rel="noopener" className="flex items-center gap-2 rounded-2xl bg-[#1877F2] px-6 py-3 text-base font-extrabold text-white transition hover:opacity-90">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                Facebook
              </a>
            </div>
          </section>
        </main>

        {/* A1/A7 - THE one canonical link row */}
        <footer className="py-6">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-6">
            <img src={LOGO} alt="TAYU" className="h-8 w-8 rounded-xl" />
            {/* A3: plain borderless link row - no box, no pills */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
              {CONTACTS.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener" className="text-sm font-bold text-electric underline-offset-4 hover:underline">
                  {l.label}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2 text-xs font-bold text-navy/50">
              {TEAM.map((m) => (
                <a key={m.name} href={m.li} target="_blank" rel="noopener" className="hover:text-electric">
                  {m.name.split(' ')[0]}&rsquo;s LinkedIn
                </a>
              ))}
            </div>
            <p className="text-xs text-navy/40">TAYU. Learn money by playing it.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}