export function AuthHero() {
  return (
    <div className="auth-hero" aria-hidden={false}>
      <div className="auth-badges" aria-label="Destaques do app">
        <span className="auth-badge">🇧🇷🇺🇸 PT-BR → EN</span>
        <span className="auth-badge">📴 Funciona offline</span>
        <span className="auth-badge">🔔 Lembrete diário</span>
      </div>
      <h1>Inglês na Mão</h1>
      <p>Pratique todo dia com frases e palavras aleatórias, flashcards, quiz e favoritos — sem repetir o que você já viu.</p>
      <svg className="auth-hero-art" viewBox="0 0 420 260" role="img" aria-label="Ilustração de estudo de inglês no celular">
        <rect x="8" y="8" width="404" height="244" rx="24" fill="rgba(255,255,255,0.14)" />
        <rect x="40" y="36" width="180" height="188" rx="18" fill="#ffffff" />
        <rect x="60" y="58" width="140" height="18" rx="9" fill="#4f46e5" opacity="0.9" />
        <rect x="60" y="86" width="110" height="12" rx="6" fill="#c7d2fe" />
        <rect x="60" y="106" width="140" height="44" rx="10" fill="#eef2ff" />
        <circle cx="80" cy="128" r="10" fill="#4f46e5" />
        <rect x="98" y="121" width="80" height="10" rx="5" fill="#6366f1" />
        <rect x="98" y="135" width="56" height="8" rx="4" fill="#a5b4fc" />
        <rect x="60" y="162" width="64" height="26" rx="13" fill="#16a34a" />
        <rect x="132" y="162" width="68" height="26" rx="13" fill="#e5e7eb" />
        <rect x="248" y="60" width="132" height="70" rx="14" fill="#0f172a" opacity="0.85" />
        <circle cx="270" cy="95" r="12" fill="#fbbf24" />
        <rect x="290" y="86" width="70" height="10" rx="5" fill="#ffffff" />
        <rect x="290" y="101" width="48" height="8" rx="4" fill="#94a3b8" />
        <rect x="248" y="142" width="132" height="70" rx="14" fill="#ffffff" opacity="0.95" />
        <rect x="264" y="158" width="60" height="12" rx="6" fill="#4f46e5" />
        <rect x="264" y="176" width="100" height="8" rx="4" fill="#cbd5e1" />
        <circle cx="352" cy="52" r="14" fill="#fbbf24" opacity="0.9" />
        <circle cx="52" cy="228" r="8" fill="#ffffff" opacity="0.7" />
      </svg>
      <div className="auth-badges">
        <span className="auth-badge">🎲 Sem repetição</span>
        <span className="auth-badge">📖 Flashcards + Quiz</span>
        <span className="auth-badge">⭐ Favoritos</span>
      </div>
    </div>
  )
}
