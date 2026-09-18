import { useEffect, useState } from 'react'
import { useHistory } from '../../application/useHistory'
import { ItemCard } from '../components/ItemCard'
import { AppLayout } from '../layouts/AppLayout'

export function HistoryPage() {
  const { data, loading, fetch } = useHistory()
  const [filter, setFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const id = setTimeout(() => { setDebounced(search.trim()); setPage(1) }, 400)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => { fetch({ page, page_size: 10, type: filter || undefined, q: debounced || undefined }) }, [page, filter, debounced, fetch])

  const filterBtn = (active: boolean): React.CSSProperties => ({
    padding: '8px 12px',
    borderRadius: 8,
    border: active ? '2px solid var(--link)' : '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text)',
    cursor: 'pointer',
  })

  return (
    <AppLayout title="Histórico">
      <section className="card" aria-labelledby="history-filter-title">
        <h2 id="history-filter-title" className="card-title" style={{ fontSize: 16 }}>Buscar e filtrar</h2>
        <input placeholder="🔎 Buscar no histórico (inglês ou português)..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Buscar no histórico"
          className="input" style={{ marginTop: 12 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button onClick={() => { setFilter(''); setPage(1) }} style={filterBtn(filter === '')}>Todos</button>
          <button onClick={() => { setFilter('phrase'); setPage(1) }} style={filterBtn(filter === 'phrase')}>Frases</button>
          <button onClick={() => { setFilter('word'); setPage(1) }} style={filterBtn(filter === 'word')}>Palavras</button>
        </div>

        {loading && <p>Carregando...</p>}
        {!loading && data && data.items.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Nenhum histórico ainda. Gere frases ou palavras em Praticar.</p>}

        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          {data?.items.map(batch => (
            <div key={batch.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, background: batch.type === 'phrase' ? 'var(--accent-bg)' : 'var(--accent-green-bg)', color: batch.type === 'phrase' ? 'var(--accent-text)' : 'var(--accent-green-text)', padding: '4px 8px', borderRadius: 6, fontSize: 12 }}>{batch.type === 'phrase' ? 'FRASES' : 'PALAVRAS'}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(batch.created_at).toLocaleString('pt-BR')}</span>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {batch.items.map(item => <ItemCard key={item.id} item={item} />)}
              </div>
            </div>
          ))}
        </div>

        {data && data.total > data.page_size && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
            <span style={{ padding: '8px 12px', fontSize: 14 }}>Página {page} de {Math.ceil(data.total / data.page_size)}</span>
            <button className="btn" disabled={page >= Math.ceil(data.total / data.page_size)} onClick={() => setPage(p => p + 1)}>Próxima</button>
          </div>
        )}
      </section>
    </AppLayout>
  )
}
