import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFavorites } from '../../application/useFavorites'
import { ThemeToggle } from '../components/ThemeToggle'
import { SpeakButton } from '../components/SpeakButton'
import { favoritesApi } from '../../infrastructure/api/endpoints'

export function FavoritesPage() {
  const { items, loading, refresh } = useFavorites()
  const [filter, setFilter] = useState('')

  useEffect(() => { refresh() }, [refresh])

  const remove = async (id: string) => {
    await favoritesApi.remove(id)
    await refresh()
  }

  const shown = items.filter(f =>
    !filter || f.content_en.toLowerCase().includes(filter.toLowerCase()) || f.content_pt.toLowerCase().includes(filter.toLowerCase()),
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 700 }}>← Voltar</Link>
        <h1 style={{ margin: 0, fontSize: 18 }}>⭐ Favoritos ({items.length})</h1>
        <ThemeToggle />
      </header>
      <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
        <input placeholder="Buscar em favoritos..." value={filter} onChange={e => setFilter(e.target.value)}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text)', marginBottom: 16 }} />
        {loading && <p>Carregando...</p>}
        {!loading && shown.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Nenhum favorito ainda. Toque na ☆ dos cards para salvar e revisar aqui.</p>}
        <div style={{ display: 'grid', gap: 12 }}>
          {shown.map(f => (
            <div key={f.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 17, flex: 1 }}>{f.content_en}</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <SpeakButton text={f.content_en} />
                  <button onClick={() => remove(f.id)} title="Remover" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
              <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>{f.content_pt}</p>
              <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--accent-bg)', color: 'var(--accent-text)', padding: '2px 8px', borderRadius: 6 }}>{f.kind === 'phrase' ? 'FRASE' : 'PALAVRA'}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
