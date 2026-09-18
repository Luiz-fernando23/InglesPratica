import { useEffect, useState } from 'react'
import { useGenerate } from '../../application/useGenerate'
import { useProgress } from '../../application/useProgress'
import { ItemCard } from '../components/ItemCard'
import { ThemeToggle } from '../components/ThemeToggle'
import { DailyCard, StatsCards } from '../components/ProgressCards'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function DashboardPage() {
  const { data, loading, error, generate } = useGenerate()
  const { stats, daily, load } = useProgress()
  const { logout } = useAuth()
  const [count, setCount] = useState(10)
  const [allowRepeat, setAllowRepeat] = useState(false)
  const [excludeRaw, setExcludeRaw] = useState('')

  useEffect(() => { load() }, [load])
  useEffect(() => { if (data) load() }, [data]) // eslint-disable-line

  const opts = { count, allow_repeat: allowRepeat, excludeRaw }

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-card)',
    borderRadius: 16,
    padding: 24,
    boxShadow: 'var(--shadow)',
    border: '1px solid var(--border)',
  }
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    border: '1px solid var(--input-border)',
    background: 'var(--input-bg)',
    color: 'var(--text)',
  }
  const navBtn = (to: string, label: string): React.CSSProperties => ({
    padding: '10px 14px', borderRadius: 10, background: 'var(--bg-card)',
    border: '1px solid var(--border)', color: 'var(--text)',
    textDecoration: 'none', fontWeight: 700, fontSize: 14,
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 90 }}>
      <header style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Inglês na Mão</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ThemeToggle />
          <button onClick={logout} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', cursor: 'pointer' }}>Sair</button>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: 16, display: 'grid', gap: 16 }}>
        <DailyCard daily={daily} />
        <StatsCards stats={stats} />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/study" style={navBtn('/study', '📖')}>📖 Flashcards</Link>
          <Link to="/quiz" style={navBtn('/quiz', '📝')}>📝 Quiz</Link>
          <Link to="/favorites" style={navBtn('/favorites', '⭐')}>⭐ Favoritos</Link>
          <Link to="/history" style={navBtn('/history', '🕘')}>🕘 Histórico</Link>
        </div>

        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <h2 style={{ margin: 0 }}>O que deseja praticar hoje?</h2>
          <p style={{ color: 'var(--text-muted)' }}>Frases aleatórias, sem repetir o que você já viu. Toque em 🔊 para ouvir, ☆ para salvar.</p>

          <div style={{ display: 'grid', gap: 12, marginTop: 20, textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
              <label style={{ flex: '1 1 160px', fontSize: 14, fontWeight: 600 }}>
                Quantidade (1-25)
                <input
                  type="number" min={1} max={25} value={count}
                  onChange={e => setCount(Math.max(1, Math.min(25, Number(e.target.value) || 1)))}
                  style={{ ...inputStyle, marginTop: 6 }}
                />
              </label>
              <label style={{ flex: '1 1 200px', display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, fontWeight: 600, padding: '10px 0' }}>
                <input
                  type="checkbox" checked={allowRepeat}
                  onChange={e => setAllowRepeat(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                Permitir repetição
              </label>
            </div>

            <label style={{ fontSize: 14, fontWeight: 600 }}>
              Excluir palavras (separadas por vírgula)
              <input
                placeholder="ex: book, rain, journey"
                value={excludeRaw}
                onChange={e => setExcludeRaw(e.target.value)}
                style={{ ...inputStyle, marginTop: 6 }}
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            <button onClick={() => generate('phrases', opts)} disabled={loading} style={{ flex: '1 1 200px', maxWidth: 320, padding: 20, borderRadius: 12, border: 0, background: loading ? '#9ca3af' : 'var(--btn-dark-bg)', color: loading ? '#fff' : 'var(--bg-card)', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Gerando...' : `Gerar ${count} frases`}
            </button>
            <button onClick={() => generate('words', opts)} disabled={loading} style={{ flex: '1 1 200px', maxWidth: 320, padding: 20, borderRadius: 12, border: 0, background: loading ? '#9ca3af' : '#4f46e5', color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Gerando...' : `Gerar ${count} palavras`}
            </button>
          </div>
          {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        </div>

        {data && (
          <div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {data.type === 'phrase' ? 'Frases' : 'Palavras'} geradas em {new Date(data.created_at).toLocaleString('pt-BR')}
              {' · '}{data.items.length} itens
            </p>
            {data.exhausted && (
              <p style={{ fontSize: 13, background: 'var(--accent-bg)', color: 'var(--accent-text)', padding: '8px 12px', borderRadius: 8 }}>
                Acabaram os itens novos com esses filtros — mostrando o que restava. Ative "Permitir repetição" ou limpe as palavras excluídas para gerar mais.
              </p>
            )}
            <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
              {data.items.map(item => <ItemCard key={item.id} item={item} kind={data.type === 'phrase' ? 'phrase' : 'word'} />)}
            </div>
          </div>
        )}
      </main>

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg-header)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-around', padding: '8px 4px calc(8px + env(safe-area-inset-bottom))' }}>
        {[
          ['/dashboard', '🏠', 'Início'],
          ['/study', '📖', 'Estudar'],
          ['/quiz', '📝', 'Quiz'],
          ['/favorites', '⭐', 'Salvos'],
          ['/history', '🕘', 'Histórico'],
        ].map(([to, icon, label]) => (
          <Link key={to} to={to} style={{ textDecoration: 'none', color: 'var(--text)', fontSize: 11, fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 20 }}>{icon}</span>{label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
