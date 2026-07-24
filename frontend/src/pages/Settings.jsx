import { useNavigate } from 'react-router-dom'

// Settings + Glossary + Help hub. Audio is muted by default (accessibility).
export default function Settings() {
  const navigate = useNavigate()
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <button className="btn-secondary" onClick={() => navigate(-1)}>Back</button>
      </div>

      <section className="card flex flex-col gap-3">
        <label className="flex items-center justify-between">
          <span>Sound effects</span>
          <input type="checkbox" />
        </label>
        <label className="flex items-center justify-between">
          <span>Background music</span>
          <input type="checkbox" />
        </label>
        <label className="flex items-center justify-between">
          <span>High-contrast mode</span>
          <input type="checkbox" defaultChecked />
        </label>
      </section>

      {/* TODO: searchable Glossary modal + context-sensitive Help + Learn More links */}
      <section className="card">
        <h2 className="text-xl font-bold">📚 Glossary</h2>
        <p className="text-white/60">Financial terms with kid-friendly definitions go here.</p>
      </section>
    </main>
  )
}
