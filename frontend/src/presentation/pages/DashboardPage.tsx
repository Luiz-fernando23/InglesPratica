import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../../application/useProgress'
import { DailyCard, StatsCards } from '../components/ProgressCards'
import { AppLayout } from '../layouts/AppLayout'

const SHORTCUTS = [
  { to: '/practice', icon: '🎲', label: 'Praticar', desc: 'Gerar conteúdo novo' },
  { to: '/study', icon: '📖', label: 'Flashcards', desc: 'Revisar baralho' },
  { to: '/quiz', icon: '📝', label: 'Quiz', desc: 'Testar vocabulário' },
  { to: '/favorites', icon: '⭐', label: 'Favoritos', desc: 'Ver salvos' },
  { to: '/history', icon: '🕘', label: 'Histórico', desc: 'Ver gerações' },
  { to: '/settings', icon: '⚙️', label: 'Ajustes', desc: 'Lembretes e conta' },
]

export function DashboardPage() {
  const { stats, daily, load } = useProgress()

  useEffect(() => { load() }, [load])

  return (
    <AppLayout title="Início">
      <DailyCard daily={daily} />
      <StatsCards stats={stats} />

      <section className="card" aria-labelledby="shortcuts-title">
        <h2 id="shortcuts-title" className="card-title">Continuar aprendendo</h2>
        <p className="card-sub">Escolha por onde seguir — o gerador agora mora em Praticar.</p>
        <div className="grid-actions" style={{ marginTop: 14 }}>
          {SHORTCUTS.map(s => (
            <Link key={s.to} to={s.to} className="quick-link">
              <span style={{ fontSize: 24 }} aria-hidden>{s.icon}</span>
              <span>{s.label}<small>{s.desc}</small></span>
            </Link>
          ))}
        </div>
      </section>
    </AppLayout>
  )
}
