import { useEffect, useRef, useState } from 'react'
import { isMuted, toggleMute } from '../services/audio.js'

const LANGUAGES = [
  { code: 'en', short: 'EN', label: 'English' },
  { code: 'es', short: 'ES', label: 'Español' },
  { code: 'fr', short: 'FR', label: 'Français' },
  { code: 'it', short: 'IT', label: 'Italiano' },
  { code: 'de', short: 'DE', label: 'Deutsch' },
  { code: 'pt', short: 'PT', label: 'Português' },
  { code: 'hi', short: 'HI', label: 'हिन्दी' },
  { code: 'mr', short: 'MR', label: 'मराठी' },
  { code: 'bn', short: 'BN', label: 'বাংলা' },
  { code: 'ur', short: 'UR', label: 'اردو' },
  { code: 'ar', short: 'AR', label: 'العربية' },
  { code: 'mn', short: 'MN', label: 'Монгол' },
  { code: 'ru', short: 'RU', label: 'Русский' },
  { code: 'zh-CN', short: '中文', label: '中文' },
  { code: 'ja', short: 'JA', label: '日本語' },
  { code: 'ko', short: 'KO', label: '한국어' },
]

const INCLUDED_LANGUAGES = LANGUAGES.map(({ code }) => code).join(',')

function readCurrentLanguage() {
  const saved = window.localStorage.getItem('tayu-language')
  return LANGUAGES.some(({ code }) => code === saved) ? saved : 'en'
}

function setTranslationCookie(language) {
  const value = language === 'en' ? '/en/en' : `/en/${language}`
  document.cookie = `googtrans=${value};path=/;max-age=31536000;SameSite=Lax`
  if (window.location.hostname.includes('.')) document.cookie = `googtrans=${value};path=/;domain=.${window.location.hostname};max-age=31536000;SameSite=Lax`
}

function hardenTranslationLinks(root = document) {
  root.querySelectorAll?.('a[target="_blank"]').forEach((link) => {
    const rel = new Set(String(link.rel || '').split(/\s+/).filter(Boolean))
    rel.add('noopener')
    rel.add('noreferrer')
    link.rel = [...rel].join(' ')
    link.referrerPolicy = 'strict-origin-when-cross-origin'
  })
}

function LanguageControls() {
  const [open, setOpen] = useState(false)
  const [language, setLanguage] = useState(readCurrentLanguage)
  const menuRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!document.getElementById('google-translate-script')) {
      window.googleTranslateElementInit = () => {
        if (!window.google?.translate || document.querySelector('#google_translate_element select')) return
        new window.google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: INCLUDED_LANGUAGES, autoDisplay: true }, 'google_translate_element')
        hardenTranslationLinks(document.getElementById('google_translate_element'))
      }
      const script = document.createElement('script')
      script.id = 'google-translate-script'
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      script.referrerPolicy = 'strict-origin-when-cross-origin'
      document.head.appendChild(script)
    }

    const target = document.getElementById('google_translate_element')
    const observer = target ? new MutationObserver(() => hardenTranslationLinks(target)) : null
    observer?.observe(target, { childList: true, subtree: true })
    return () => observer?.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const first = menuRef.current?.querySelector('[role="menuitemradio"]')
    first?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const changeLanguage = (nextLanguage) => {
    window.localStorage.setItem('tayu-language', nextLanguage)
    setLanguage(nextLanguage)
    setTranslationCookie(nextLanguage)
    window.location.reload()
  }

  const active = LANGUAGES.find(({ code }) => code === language) || LANGUAGES[0]

  return (
    <div className="notranslate relative mt-2" translate="no">
      <div id="google_translate_element" className="hidden" aria-hidden="true" />
      <button ref={triggerRef} type="button" aria-label={`Choose language. Current language: ${active.label}`} aria-haspopup="menu" aria-controls="tayu-language-menu" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="pointer-events-auto flex min-h-10 w-full items-center justify-center gap-2 rounded-2xl bg-white/95 px-3 py-2 text-sm font-extrabold text-navy shadow-lg transition active:scale-95">
        <span aria-hidden="true">🌐</span><span>Language</span><span className="rounded-lg bg-navy/10 px-2 py-0.5 text-xs">{active.short}</span>
      </button>

      {open && (
        <div id="tayu-language-menu" ref={menuRef} role="menu" aria-label="Choose display language" className="pointer-events-auto absolute left-0 top-full z-[900] mt-2 grid max-h-[65vh] min-w-[270px] grid-cols-2 gap-2 overflow-y-auto rounded-2xl border border-white/30 bg-navy/95 p-2 shadow-2xl backdrop-blur-md sm:grid-cols-3">
          {LANGUAGES.map((item) => (
            <button key={item.code} type="button" role="menuitemradio" aria-checked={language === item.code} onClick={() => changeLanguage(item.code)} className={`rounded-xl px-3 py-2 text-left text-sm font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal active:scale-95 ${language === item.code ? 'bg-mint text-navy' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function MuteButton({ className = '', showLabel = false }) {
  const [muted, setMuted] = useState(isMuted())

  useEffect(() => {
    const sync = () => setMuted(isMuted())
    window.addEventListener('tayu-audio-changed', sync)
    return () => window.removeEventListener('tayu-audio-changed', sync)
  }, [])

  return (
    <div className={`pointer-events-auto inline-flex flex-col ${className}`}>
      <button type="button" aria-label={muted ? 'Turn music on' : 'Turn music off'} aria-pressed={!muted} onClick={() => setMuted(toggleMute())} className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-navy/80 px-3 text-white shadow-lg transition active:scale-95">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#fff" stroke="none" />
          {muted ? <><line x1="16" y1="9" x2="22" y2="15" /><line x1="22" y1="9" x2="16" y2="15" /></> : <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></>}
        </svg>
        {showLabel && <span className="whitespace-nowrap text-sm font-extrabold">Music {muted ? 'off' : 'on'}</span>}
      </button>
      <LanguageControls />
    </div>
  )
}
