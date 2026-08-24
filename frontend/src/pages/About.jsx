import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TownBackground } from '../components/TownBackground.jsx'
import { MuteButton } from '../components/MuteButton.jsx'
import { MODULE_CATALOG } from '../constants/modules.js'

const LOGO = '/assets/tayu-logo.webp'
const FOX_PAGE_URL = 'https://www.fox5dc.com/video/fmc-nsz4uh655jl7z59n'
const NBC4_URL = 'https://www.nbcwashington.com/video/news/local/northern-virginia/fairfax-county-students-write-kids-book-about-financial-literacy/4145741/'
const WTOP_URL = 'https://wtop.com/fairfax-county/2026/07/fairfax-co-students-write-book-to-help-elementary-kids-learn-about-financial-literacy/'
const VIENNA_LEDGER_URL = 'https://viennaledger.com/articles/oakton-high-students-financial-literacy-book-reaches-12-fairfax-county-schools-and-four-countries-ms24rg90'
const CONNECTION_URL = 'https://connectionarchives.com/PDF/2026/071526/FxCo%20071526.pdf#page=7'
const VISION_TIMES_URL = 'https://www.secretchina.com/news/b5/2026/08/10/1103211.html'
const WHITE_HOUSE_URL = 'https://lnkd.in/p/epru8TyC'
const NJCFE_URL = 'https://njcfe.org/8-11-26-fairfax-co-students-write-book-to-help-elementary-kids-learn-about-financial-literacy/'
const VA_DECA_IG_URL = 'https://www.instagram.com/p/Da5-8l1jyOR/?img_index=1'
const FCPS_URL = 'https://www.fcps.edu/news/superintendents-weekly-reflections-199'

const CONTACTS = [
  { label: 'Email', href: 'mailto:tayu.finance@gmail.com' },
  { label: 'Instagram', href: 'https://www.instagram.com/tayu.finance' },
  { label: 'Facebook', href: 'https://www.facebook.com/share/1BmGNEpdrV/' },
  { label: 'Book a time', href: 'https://calendly.com/tayu-finance/30min' },
]

const TEAM = [
  { file: 'dev_rai.jpg', name: 'Dev Rai', role: 'Co-Founder, Project Lead', li: 'https://linkedin.com/in/dev-rai-948bb32a9' },
  { file: 'ayush_ranjan.png', name: 'Ayush Ranjan', role: 'Co-Founder, Lead Developer', li: 'https://linkedin.com/in/ayush-ranjan6285' },
  { file: 'austin_chen.png', name: 'Austin Chen', role: 'Co-Founder, Outreach', li: 'https://linkedin.com/in/austin-chen-56028731a' },
  { file: 'gaamaa_hishigsuren.png', name: 'Gaamaa Hishigsuren', role: 'Project Advisor', li: 'https://linkedin.com/in/gaamaa' },
]

const SPONSORS = [
  { name: 'Michael Darcy', org: 'DG Fuel' },
]

const STATS = [
  {
    big: 'Age 7',
    head: 'money habits form early',
    body: 'Cambridge research found core money habits are largely set by age 7. TAYU reaches kids while those habits are still forming.',
    src: 'Cambridge / Money Advice Service',
  },
  {
    big: 'Play first',
    head: 'learn by doing',
    body: 'Kids practice save-vs-spend choices through play, repetition, and instant feedback before real money is at stake.',
    src: 'Early-learning research',
  },
  {
    big: 'K-12 gap',
    head: 'finance is still under-taught',
    body: 'Many students reach high school with limited personal-finance instruction. TAYU starts earlier and grows with them.',
    src: 'FINRA NCFS',
  },
  {
    big: 'It works',
    head: 'education changes outcomes',
    body: 'Financial-ed requirements are linked with stronger credit outcomes and lower delinquency in early adulthood.',
    src: 'FINRA / CEE',
  },
]

const FEATURED = [
  {
    label: 'FOX 5 DC',
    title: 'Live TV feature',
    note: 'Live segment on our work.',
    href: FOX_PAGE_URL,
    badge: 'bg-[#d71920] text-white',
    card: 'border-[#d71920]/20 bg-[#d71920]/5',
  },
  {
    label: 'NBC4 Washington',
    title: 'Live TV feature',
    note: 'Live studio feature on The Seed That Grew.',
    href: NBC4_URL,
    badge: 'bg-[#1f4e8c] text-white',
    card: 'border-[#1f4e8c]/20 bg-[#1f4e8c]/5',
  },
  {
    label: 'White House',
    title: 'Recognition letter',
    note: 'Letter recognizing our impact.',
    href: WHITE_HOUSE_URL,
    badge: 'bg-navy text-white',
    card: 'border-navy/15 bg-navy/5',
  },
  {
    label: 'WTOP',
    title: 'News feature',
    note: 'Book + classroom outreach.',
    href: WTOP_URL,
    badge: 'bg-electric text-white',
    card: 'border-electric/20 bg-electric/5',
  },
  {
    label: 'Vienna Ledger',
    title: 'Local feature',
    note: 'Schools + global reach.',
    href: VIENNA_LEDGER_URL,
    badge: 'bg-brandpurple text-white',
    card: 'border-brandpurple/20 bg-brandpurple/5',
  },
  {
    label: 'Connection',
    title: 'County feature',
    note: 'Book launch + VA DECA win.',
    href: CONNECTION_URL,
    badge: 'bg-teal text-navy',
    card: 'border-teal/30 bg-teal/5',
  },
  {
    label: 'Vision Times',
    title: 'Intl. feature',
    note: 'Chinese-language coverage.',
    href: VISION_TIMES_URL,
    badge: 'bg-navy text-white',
    card: 'border-navy/15 bg-navy/5',
  },
  {
    label: 'VA DECA',
    title: '1st in VA + IG spotlight',
    note: 'State champs; featured on VA DECA IG.',
    href: VA_DECA_IG_URL,
    badge: 'bg-[#FFD700] text-navy',
    card: 'border-[#b8860b]/25 bg-[#FFD700]/10',
  },
  {
    label: 'FCPS',
    title: 'Superintendent spotlight',
    note: 'Featured in Dr. Reid’s weekly reflections.',
    href: FCPS_URL,
    badge: 'bg-electric text-white',
    card: 'border-electric/20 bg-electric/5',
  },
  {
    label: 'NJCFE',
    title: 'Finance-ed feature',
    note: 'Book + classroom impact.',
    href: NJCFE_URL,
    badge: 'bg-teal text-navy',
    card: 'border-teal/30 bg-teal/5',
  },
]

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
            Back to game
          </Link>
        </header>

        <main className="mx-auto flex max-w-3xl flex-col gap-12 px-6 pb-16 pt-4">
          <section>
            <h1 className="font-display text-3xl font-extrabold text-navy">Who we are</h1>
            <p className="mt-3 text-lg leading-relaxed text-navy/80">
              TAYU is our DECA project: a 3D game teaching money skills across elementary, middle, and high school through play.
            </p>
            <p className="mt-3 text-lg font-semibold leading-relaxed text-navy">
              We build strong money habits early, then expand into more advanced, gamified content for older students.
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
          </section>

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

          <section className="rounded-3xl bg-white p-6 shadow-md">
            <h2 className="font-display text-2xl font-extrabold text-navy">Our track record</h2>

            <div className="mt-4 rounded-3xl border border-navy/10 bg-white/95 p-5 shadow-md">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-lg font-extrabold text-navy">Featured &amp; recognized</h3>
                <span className="text-xs font-bold text-navy/45">Swipe / scroll →</span>
              </div>
              <div className="mt-4 flex flex-nowrap gap-3 overflow-x-auto pb-2">
                {FEATURED.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group w-52 shrink-0 rounded-2xl border-2 p-4 transition hover:-translate-y-1 hover:shadow-md ${item.card}`}
                  >
                    <div className={`inline-flex rounded-lg px-2.5 py-1 font-display text-xs font-extrabold ${item.badge}`}>
                      {item.label}
                    </div>
                    <h4 className="mt-2 font-display text-base font-extrabold leading-tight text-navy">{item.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-navy/60">{item.note}</p>
                    <div className="mt-2 text-xs font-extrabold text-electric">View →</div>
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-5 sm:flex-row">
              <BookCover />
              <div>
                <p className="text-lg leading-relaxed text-navy/85">
                  Our team wrote <b className="text-navy">The Seed That Grew</b>, a kids&rsquo; investing book used in our Cash Classroom sessions. It has been translated into <b>7 languages</b> and shared across <b>5 countries</b>.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href="https://www.amazon.com/Seed-That-Grew-Story-Investing/dp/B0FZ9CNLJV/" target="_blank" rel="noopener" className="rounded-2xl bg-navy px-4 py-2 text-sm font-bold text-white hover:bg-electric">
                    Amazon
                  </a>
                </div>
                <p className="mt-4 rounded-2xl bg-navy px-4 py-3 font-display text-base font-extrabold text-white">
                  The book teaches by reading. TAYU teaches by playing.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-md">
            <h2 className="font-display text-2xl font-extrabold text-navy">For teachers &amp; classrooms</h2>
            <p className="mt-2 text-navy/75">
              Each module is a 10-20 min activity with a clear start/finish, Chromebook/tablet support, read-aloud, auto-save, and minimal data collection.
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
            <p className="mt-3 text-sm text-navy/60">Built to support teachers, not replace them.</p>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-md">
            <h2 className="font-display text-2xl font-extrabold text-navy">Contact</h2>
            <p className="mt-2 text-navy/75">Want to bring TAYU into a classroom, event, or partnership?</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {CONTACTS.map((c) => (
                <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-electric px-4 py-2 text-sm font-bold text-white hover:bg-teal hover:text-navy">
                  {c.label}
                </a>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-md">
            <h2 className="font-display text-2xl font-extrabold text-navy">Sponsors</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {SPONSORS.map((s) => (
                <div key={s.name} className="rounded-2xl bg-navy/5 p-4">
                  <div className="font-display text-base font-extrabold text-navy">{s.name}</div>
                  <div className="text-sm font-semibold text-navy/60">{s.org}</div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
