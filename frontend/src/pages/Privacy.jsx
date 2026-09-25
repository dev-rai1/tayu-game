import { Link } from 'react-router-dom'

function Section({ title, children }) {
  return (
    <section className="border-t border-navy/10 py-6 first:border-t-0 first:pt-0">
      <h2 className="font-display text-xl font-extrabold text-navy">{title}</h2>
      <div className="mt-3 space-y-3 text-sm font-semibold leading-relaxed text-navy/75 sm:text-base">{children}</div>
    </section>
  )
}

export default function Privacy() {
  return (
    <main className="min-h-screen bg-[#eef8ff] px-5 py-8 text-navy sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-11 w-11 rounded-xl" />
            <span className="font-display text-2xl font-extrabold">TAYU</span>
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm font-extrabold">
            <Link to="/cookies" className="underline underline-offset-4">Cookies & storage</Link>
            <Link to="/" className="underline underline-offset-4">Back home</Link>
          </nav>
        </header>

        <article className="mt-8 bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-9">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-electric">Privacy notice</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold">Privacy at TAYU</h1>
          <p className="mt-4 text-base font-semibold leading-relaxed text-navy/75">
            TAYU collects only the information it needs to run accounts, save learning progress, support classrooms, and keep the app working. Optional analytics are separate and are not available to student, guest, or unverified individual accounts.
          </p>
          <p className="mt-3 text-sm font-bold text-navy/55">Last updated: September 24, 2026</p>

          <div className="mt-8">
            <Section title="What TAYU uses">
              <p>
                Depending on the account, TAYU may use an email address, account role, grade band, school or organization name, class code, and information about how the user found TAYU. Password authentication is handled through Firebase Authentication.
              </p>
              <p>
                TAYU also saves information needed for the learning experience, such as game progress, avatar, player name, assessments, badges, learning path, reading settings, and classroom settings.
              </p>
            </Section>

            <Section title="Optional analytics">
              <p>
                Optional analytics can be enabled only for an authorized educator or administrator who chooses to allow them. Student, guest, and unverified individual accounts use necessary storage only.
              </p>
              <p>
                When allowed, analytics may record a visitor or session identifier, page path, referring website host, device category, session length, current module, time by module, and limited learning events such as attempts or outcomes.
              </p>
            </Section>

            <Section title="Why the information is used">
              <p>
                TAYU uses this information to sign users in, restore progress, support classroom assignments, select recommended learning paths, provide assessments and certificates, secure restricted areas, troubleshoot problems, and provide account or classroom support.
              </p>
              <p>
                Analytics information is used only when optional analytics have been allowed.
              </p>
            </Section>

            <Section title="Children and school use">
              <p>
                TAYU is designed for students, including children under 13. Where required, TAYU uses parent or guardian consent or valid school-authorized educational use before collecting personal information from a child.
              </p>
              <p>
                A parent, guardian, school, or educator can contact TAYU to request review, correction, or deletion of information when applicable. TAYU may need to verify the requester’s identity or authority before completing a request.
              </p>
            </Section>

            <Section title="Who can access information">
              <p>
                TAYU uses Firebase services for authentication and database functions. Authorized TAYU administrators and educators may access information needed for account support, classroom administration, progress reporting, security, or product testing.
              </p>
              <p>
                Protected classroom and administrative data is also restricted by Firebase security rules.
              </p>
            </Section>

            <Section title="Retention and security">
              <p>
                TAYU keeps information only as long as it is needed for the purposes above, account support, security, or legal obligations. Users and authorized adults or schools can request access, correction, or deletion where applicable.
              </p>
            </Section>

            <Section title="Contact">
              <p>
                Privacy questions or requests can be sent to{' '}
                <a className="font-extrabold text-electric underline underline-offset-4" href="mailto:tayu.finance@gmail.com">
                  tayu.finance@gmail.com
                </a>.
              </p>
            </Section>
          </div>
        </article>
      </div>
    </main>
  )
}