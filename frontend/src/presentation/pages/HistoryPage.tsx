import { useEffect, useState } from 'react'
import { useHistory } from '../../application/useHistory'
import { Link } from 'react-router-dom'
import { ItemCard } from '../components/ItemCard'
import { ThemeToggle } from '../components/ThemeToggle'

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
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 700 }}>← Voltar</Link>
        <h1 style={{ margin: 0, fontSize: 18 }}>Histórico</h1>
        <ThemeToggle />
      </header>
      <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
        <input placeholder="🔎 Buscar no histórico (inglês ou português)..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text)', marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={() => { setFilter(''); setPage(1) }} style={filterBtn(filter === '')}>Todos</button>
          <button onClick={() => { setFilter('phrase'); setPage(1) }} style={filterBtn(filter === 'phrase')}>Frases</button>
          <button onClick={() => { setFilter('word'); setPage(1) }} style={filterBtn(filter === 'word')}>Palavras</button>
        </div>

        {loading && <p>Carregando...</p>}
        {!loading && data && data.items.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Nenhum histórico ainda. Gere frases ou palavras no dashboard.</p>}

        <div style={{ display: 'grid', gap: 16 }}>
          {data?.items.map(batch => (
            <div key={batch.id} style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
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
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, alignItems: 'center' }}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)' }}>Anterior</button>
            <span style={{ padding: '8px 12px' }}>Página {page} de {Math.ceil(data.total / data.page_size)}</span>
            <button disabled={page >= Math.ceil(data.total / data.page_size)} onClick={() => setPage(p => p + 1)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)' }}>Próxima</button>
          </div>
        )}
      </main>
    </div>
  )
}
