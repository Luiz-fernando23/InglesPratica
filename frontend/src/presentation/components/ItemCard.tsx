import type { GeneratedItem } from '../../domain/types'

export function ItemCard({ item }: { item: GeneratedItem }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, background: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
      <p style={{ fontSize: 18, fontWeight: 600, margin: 0, color: 'var(--text)' }}>{item.content_en}</p>
      <p style={{ fontSize: 14, margin: '6px 0 0', color: 'var(--text-muted)' }}>{item.content_pt}</p>
    </div>
  )
}
