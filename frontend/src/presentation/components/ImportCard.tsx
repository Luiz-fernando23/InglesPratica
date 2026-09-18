import { useState } from 'react'
import { favoritesApi } from '../../infrastructure/api/endpoints'

export function parseImportLines(raw: string, kind: string) {
  const items: { content_en: string; content_pt: string; kind: string }[] = []
  for (const line of raw.split('\n')) {
    const t = line.trim()
    if (!t) continue
    const m = t.match(/^(.*?)\s*(=| - |:|\||\t|;)\s*(.+)$/)
    if (!m) continue
    const en = m[1].trim()
    const pt = m[3].trim()
    if (en && pt) items.push({ content_en: en, content_pt: pt, kind })
  }
  return items
}

export function ImportCard({ onDone }: { onDone: () => void }) {
  const [raw, setRaw] = useState('')
  const [kind, setKind] = useState('word')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const preview = parseImportLines(raw, kind)

  const send = async () => {
    if (!preview.length || busy) return
    setBusy(true); setMsg(null)
    try {
      const res = await favoritesApi.bulk(preview.slice(0, 200))
      setMsg(`✅ ${res.added} importados${res.skipped ? ` · ${res.skipped} já existiam` : ''}`)
      setRaw('')
      onDone()
    } catch (e: unknown) {
      // offline: guarda na fila para sincronizar depois
      try {
        const q = JSON.parse(localStorage.getItem('fav-outbox') || '[]')
        q.push(...preview.slice(0, 200))
        localStorage.setItem('fav-outbox', JSON.stringify(q))
        setMsg('📴 Sem conexão — lista guardada e será sincronizada ao voltar.')
        setRaw('')
      } catch {
        // @ts-ignore
        setMsg(e?.response?.data?.detail || 'Erro ao importar')
      }
    } finally { setBusy(false) }
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <p style={{ margin: 0, fontWeight: 800 }}>📥 Importar minha lista</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 8px' }}>
        Cole uma por linha: <code>house = casa</code> · aceita <code>=</code>, <code>-</code>, <code>:</code>, <code>|</code> ou <code>;</code>
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {(['word', 'phrase'] as const).map(k => (
          <button key={k} onClick={() => setKind(k)}
            style={{ padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13,
              border: kind === k ? '2px solid var(--link)' : '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)' }}>
            {k === 'word' ? 'Palavras' : 'Frases'}
          </button>
        ))}
        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>{preview.length} detectados</span>
      </div>
      <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={5} placeholder={'house = casa\nbook = livro\nto run = correr'}
        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text)', resize: 'vertical' }} />
      <button onClick={send} disabled={busy || !preview.length}
        style={{ marginTop: 8, padding: '10px 16px', borderRadius: 8, border: 0, background: preview.length ? '#4f46e5' : 'var(--border)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
        {busy ? 'Importando...' : `Importar ${preview.length} itens`}
      </button>
      {msg && <p style={{ fontSize: 13, marginTop: 8 }}>{msg}</p>}
    </div>
  )
}

export async function syncOutbox(): Promise<number> {
  let q: { content_en: string; content_pt: string; kind: string }[] = []
  try { q = JSON.parse(localStorage.getItem('fav-outbox') || '[]') } catch { return 0 }
  if (!q.length) return 0
  try {
    const res = await favoritesApi.bulk(q.slice(0, 200))
    const rest = q.slice(200)
    localStorage.setItem('fav-outbox', JSON.stringify(rest))
    return res.added
  } catch { return 0 }
}
