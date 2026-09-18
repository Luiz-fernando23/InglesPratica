import { useEffect, useState } from 'react'
import { useFavorites } from '../../application/useFavorites'
import { SpeakButton } from '../components/SpeakButton'
import { ImportCard, syncOutbox } from '../components/ImportCard'
import { favoritesApi } from '../../infrastructure/api/endpoints'
import { AppLayout } from '../layouts/AppLayout'

export function FavoritesPage() {
  const { items, loading, refresh } = useFavorites()
  const [filter, setFilter] = useState('')
  const [synced, setSynced] = useState(0)

  useEffect(() => {
    refresh()
    syncOutbox().then(n => { if (n) { setSynced(n); refresh() } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const remove = async (id: string) => {
    await favoritesApi.remove(id)
    await refresh()
  }

  const shown = items.filter(f =>
    !filter || f.content_en.toLowerCase().includes(filter.toLowerCase()) || f.content_pt.toLowerCase().includes(filter.toLowerCase()),
  )

  return (
    <AppLayout title={`Favoritos (${items.length})`}>
      <main style={{ display: 'grid', gap: 16 }}>
        {synced > 0 && <p style={{ fontSize: 13, background: 'var(--accent-bg)', color: 'var(--accent-text)', padding: '8px 12px', borderRadius: 8, margin: 0 }}>🔄 {synced} itens offline sincronizados!</p>}
        <ImportCard onDone={refresh} />
        <input placeholder="Buscar em favoritos..." value={filter} onChange={e => setFilter(e.target.value)} aria-label="Buscar em favoritos"
          className="input" />
        {loading && <p>Carregando...</p>}
        {!loading && shown.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Nenhum favorito ainda. Toque na ☆ dos cards ou importe sua lista acima.</p>}
        <div style={{ display: 'grid', gap: 12 }}>
          {shown.map(f => (
            <div key={f.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 17, flex: 1 }}>{f.content_en}</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <SpeakButton text={f.content_en} />
                  <button onClick={() => remove(f.id)} title="Remover" aria-label={`Remover ${f.content_en}`} style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
              <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>{f.content_pt}</p>
              <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--accent-bg)', color: 'var(--accent-text)', padding: '2px 8px', borderRadius: 6 }}>{f.kind === 'phrase' ? 'FRASE' : 'PALAVRA'}</span>
            </div>
          ))}
        </div>
      </main>
    </AppLayout>
  )
}
