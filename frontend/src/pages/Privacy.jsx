import { Link } from 'react-router-dom'

const Section = ({ title, children }) => (
  <section className="rounded-3xl border border-navy/10 bg-white p-5 shadow-sm sm:p-6">
    <h2 className="font-display text-xl font-extrabold text-navy">{title}</h2>
    <div className="mt-3 space-y-3 font-semibold leading-relaxed text-navy/75">{children}</div>
  </section>
)

export default function Privacy() {
  return (
    <main className="min-h-screen bg-[#eef8ff] px-5 py-10 text-navy sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-12 w-12 rounded-xl" />
            <span className="font-display text-2xl font-extrabold">TAYU</span>
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link to="/cookies" className="rounded-xl border-2 border-navy/15 bg-white px-4 py-2 text-sm font-extrabold text-navy">Storage notice</Link>
            <Link to="/" className="rounded-xl bg-navy px-4 py-2 text-sm font-extrabold text-white">Back to TAYU home</Link>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-navy p-6 text-white shadow-xl sm:p-8">
          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal">Privacy notice</div>
          <h1 className="mt-2 font-display text-4xl font-extrabold">Privacy at TAYU</h1>
          <p className="mt-3 max-w-3xl font-semibold leading-relaxed text-white/80">This page explains the data handled by the current TAYU web app and the steps TAYU takes to protect account, classroom, and learning information.</p>
          <p className="mt-3 text-sm font-bold text-white/65">Last updated: August 6, 2026</p>
        </div>

        <div className="mt-6 grid gap-4">
          <Section title="Information used to create and run an account">
            <p>TAYU may receive an email address, account role, grade band, school or organization name, class code, password credentials handled by Firebase Authentication, and answers about how a user found TAYU.</p>
            <p>The app also stores game progress, selected avatar, player name, assessments, badges, assigned learning path, and classroom settings needed to provide the experience.</p>
          </Section>
          <Section title="Optional analytics">
            <p>Student, guest, and unverified individual accounts use necessary storage only while TAYU completes its parent and school authorization workflow.</p>
            <p>When an authorized educator or administrator allows optional analytics, TAYU may record an account or session identifier, page path, referring website host, device category, session length, current module, time by module, and limited learning-event details such as attempts or outcomes.</p>
            <p>Choosing “Necessary only” keeps account, security, preference, and progress storage working without these optional analytics writes.</p>
          </Section>
          <Section title="Why the information is used">
            <p>Information is used to authenticate accounts, restore progress, support classrooms, select age-appropriate learning paths, provide assessments and certificates, secure administrative areas, troubleshoot the app, and improve lessons when optional analytics are permitted.</p>
          </Section>
          <Section title="Service providers and access">
            <p>The current app uses Firebase services for authentication and database functions. Authorized TAYU administrators and educators may access information needed for account support, classroom administration, product testing, and progress reporting.</p>
            <p>Access to protected classroom and administrative data is enforced by Firebase security rules in addition to interface-level route checks.</p>
          </Section>
          <Section title="Children and parent or school authorization">
            <p>TAYU is designed for students, including children under 13. A grade selection can identify that a user is under 13. TAYU therefore uses parent notice and consent or valid school-authorized educational use where required before collecting personal information from those children.</p>
            <p>TAYU also provides a process for a parent or guardian to request review, correction, or deletion of a child’s information and to stop future collection where required.</p>
          </Section>
          <Section title="Retention, deletion, and security">
            <p>TAYU keeps information only as long as it is needed for the purpose described, account support, security, or legal obligations.</p>
            <p>Users, parents, guardians, schools, and educators can request access, correction, or deletion by contacting the TAYU team. Identity and authority may need to be verified before a request is completed.</p>
          </Section>
          <Section title="Contact">
            <p>Privacy questions or requests can be sent to <a className="font-extrabold text-electric underline underline-offset-4" href="mailto:tayu.finance@gmail.com">tayu.finance@gmail.com</a>.</p>
          </Section>
        </div>
      </div>
    </main>
  )
}
