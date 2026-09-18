import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ThemeToggle } from '../components/ThemeToggle'
import { OfflineBanner } from '../../application/useOnline'

const NAV = [
  { to: '/dashboard', icon: '🏠', label: 'Início', desc: 'Resumo do dia' },
  { to: '/practice', icon: '🎲', label: 'Praticar', desc: 'Gerar frases e palavras' },
  { to: '/study', icon: '📖', label: 'Flashcards', desc: 'Revisar baralho' },
  { to: '/quiz', icon: '📝', label: 'Quiz', desc: 'Testar vocabulário' },
  { to: '/favorites', icon: '⭐', label: 'Favoritos', desc: 'Itens salvos' },
  { to: '/history', icon: '🕘', label: 'Histórico', desc: 'Gerações passadas' },
  { to: '/settings', icon: '⚙️', label: 'Ajustes', desc: 'Lembretes e conta' },
]

export function AppLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { logout } = useAuth()

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="app-shell with-sidebar">
      <header className="app-header">
        <button
          className="icon-btn drawer-only"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          aria-controls="app-drawer"
          onClick={() => setOpen(o => !o)}
        >
          {open ? '✕' : '☰'}
        </button>
        <Link to="/dashboard" className="app-brand" aria-label="Inglês na Mão - Início">
          <span className="app-brand-mark" aria-hidden>🇺🇸</span>
          <span>Inglês na Mão</span>
        </Link>
        <h1 style={{ flex: 1, textAlign: 'center' }}>{title}</h1>
        <ThemeToggle />
      </header>

      {open && (
        <button className="app-drawer-scrim" aria-label="Fechar menu" onClick={() => setOpen(false)} />
      )}

      <nav id="app-drawer" className={`app-drawer${open ? ' open' : ''}`} aria-label="Menu principal">
        <div className="app-drawer-head">
          <span style={{ fontWeight: 800 }}>Menu</span>
          <button className="icon-btn drawer-only" aria-label="Fechar menu" onClick={() => setOpen(false)}>✕</button>
        </div>
        <div className="app-nav">
          {NAV.map(item => {
            const active = pathname === item.to || (item.to === '/dashboard' && pathname === '/')
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`app-nav-link${active ? ' active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="nav-icon" aria-hidden>{item.icon}</span>
                <span>{item.label}<small>{item.desc}</small></span>
              </Link>
            )
          })}
        </div>
        <div className="app-drawer-foot">
          <button className="btn" style={{ width: '100%' }} onClick={logout}>
            🚪 Sair da conta
          </button>
        </div>
      </nav>

      <div className="app-main">
        <OfflineBanner />
        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}
