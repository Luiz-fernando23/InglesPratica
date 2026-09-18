import { useState } from 'react'
import type { GeneratedItem } from '../../domain/types'
import { SpeakButton } from './SpeakButton'
import { favoritesApi } from '../../infrastructure/api/endpoints'

export function ItemCard({ item, kind, showFavorite }: { item: GeneratedItem; kind?: string; showFavorite?: boolean }) {
  const [fav, setFav] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)

  const toggleFav = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      const next = !(fav ?? false)
      if (next) await favoritesApi.add(item.content_en, item.content_pt, kind ?? 'word')
      else await favoritesApi.removeByContent(item.content_en)
      setFav(next)
    } catch {
      // se já era favorito (409), marca como fav
      setFav(true)
    } finally { setBusy(false) }
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, background: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
        <p style={{ fontSize: 18, fontWeight: 600, margin: 0, color: 'var(--text)', flex: 1 }}>{item.content_en}</p>
        <div style={{ display: 'flex', gap: 6 }}>
          <SpeakButton text={item.content_en} />
          {showFavorite !== false && (
            <button onClick={toggleFav} title="Salvar nos favoritos" aria-label="Favoritar" disabled={busy}
              style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', fontSize: 14 }}>
              {fav ? '⭐' : '☆'}
            </button>
          )}
        </div>
      </div>
      <p style={{ fontSize: 14, margin: '6px 0 0', color: 'var(--text-muted)' }}>{item.content_pt}</p>
    </div>
  )
}
