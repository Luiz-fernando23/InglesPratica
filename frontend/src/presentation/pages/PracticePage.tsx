import { useEffect, useState } from 'react'
import { useGenerate } from '../../application/useGenerate'
import { useProgress } from '../../application/useProgress'
import { ItemCard } from '../components/ItemCard'
import { AppLayout } from '../layouts/AppLayout'

export function PracticePage() {
  const { data, loading, error, generate } = useGenerate()
  const { load } = useProgress()
  const [count, setCount] = useState(10)
  const [allowRepeat, setAllowRepeat] = useState(false)
  const [excludeRaw, setExcludeRaw] = useState('')
  const [level, setLevel] = useState('')

  useEffect(() => { if (data) load() }, [data, load])

  const opts = { count, allow_repeat: allowRepeat, excludeRaw, level: level || undefined }

  return (
    <AppLayout title="Praticar">
      <section className="card" aria-labelledby="practice-title">
        <h2 id="practice-title" className="card-title">O que deseja praticar hoje?</h2>
        <p className="card-sub">Frases e palavras aleatórias, sem repetir o que você já viu. Toque em 🔊 para ouvir, ☆ para salvar.</p>

        <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
            <label className="field" style={{ flex: '1 1 160px' }}>
              Quantidade (1–25)
              <input
                className="input" type="number" min={1} max={25} value={count}
                onChange={e => setCount(Math.max(1, Math.min(25, Number(e.target.value) || 1)))}
              />
            </label>
            <label className="field" style={{ flex: '1 1 160px' }}>
              Nível
              <select className="input" value={level} onChange={e => setLevel(e.target.value)}>
                <option value="">Todos</option>
                <option value="basic">Básico</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
              </select>
            </label>
          </div>

          <label className="field">
            Excluir palavras (separadas por vírgula)
            <input
              className="input" placeholder="ex: book, rain, journey"
              value={excludeRaw} onChange={e => setExcludeRaw(e.target.value)}
            />
          </label>

          <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, fontWeight: 600, minHeight: 'var(--tap-min)' }}>
            <input type="checkbox" checked={allowRepeat} onChange={e => setAllowRepeat(e.target.checked)} style={{ width: 20, height: 20 }} />
            Permitir repetição
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          <button className="btn btn-dark" style={{ flex: '1 1 200px' }} onClick={() => generate('phrases', opts)} disabled={loading}>
            {loading ? 'Gerando...' : `Gerar ${count} frases`}
          </button>
          <button className="btn btn-primary" style={{ flex: '1 1 200px' }} onClick={() => generate('words', opts)} disabled={loading}>
            {loading ? 'Gerando...' : `Gerar ${count} palavras`}
          </button>
        </div>
        {error && <p role="alert" style={{ color: 'var(--danger)' }}>{error}</p>}
      </section>

      {data && (
        <section aria-live="polite">
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {data.type === 'phrase' ? 'Frases' : 'Palavras'} geradas em {new Date(data.created_at).toLocaleString('pt-BR')}
            {' · '}{data.items.length} itens
          </p>
          {data.exhausted && (
            <p style={{ fontSize: 13, background: 'var(--accent-bg)', color: 'var(--accent-text)', padding: '10px 12px', borderRadius: 10 }}>
              Acabaram os itens novos com esses filtros — mostrando o que restava. Ative “Permitir repetição” ou limpe as palavras excluídas para gerar mais.
            </p>
          )}
          <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            {data.items.map(item => <ItemCard key={item.id} item={item} kind={data.type === 'phrase' ? 'phrase' : 'word'} />)}
          </div>
        </section>
      )}
    </AppLayout>
  )
}
