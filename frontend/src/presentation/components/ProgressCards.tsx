import type { Daily, Stats } from '../../domain/types'
import { SpeakButton } from './SpeakButton'

export function DailyCard({ daily }: { daily: Daily | null }) {
  if (!daily) return null
  return (
    <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', borderRadius: 16, padding: 20 }}>
      <p style={{ margin: 0, fontSize: 12, opacity: 0.85, fontWeight: 700 }}>📌 PALAVRA DO DIA · {new Date(daily.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <h2 style={{ margin: 0, fontSize: 26 }}>{daily.word_en}</h2>
        <span style={{ background: 'rgba(255,255,255,.2)', borderRadius: 8, padding: '2px 8px' }}><SpeakButton text={daily.word_en} /></span>
      </div>
      <p style={{ margin: '4px 0 12px', opacity: 0.9 }}>{daily.word_pt}{daily.already_seen_word ? ' · você já viu 👀' : ' · nova ✨'}</p>
      <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 12, padding: 12 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>"{daily.phrase_en}"</p>
        <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.9 }}>{daily.phrase_pt}</p>
      </div>
    </div>
  )
}

export function StatsCards({ stats }: { stats: Stats | null }) {
  if (!stats) return null
  const card = (label: string, value: string | number, sub?: string) => (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, textAlign: 'center', flex: '1 1 100px' }}>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{value}</p>
      <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{label}{sub ? ` · ${sub}` : ''}</p>
    </div>
  )
  const maxWeek = Math.max(1, ...stats.last_7_days.map(d => d.items))
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {card('🔥 sequência', `${stats.current_streak_days}d`, `recorde ${stats.best_streak_days}d`)}
        {card('📚 itens', stats.total_items)}
        {card('⭐ favoritos', stats.total_favorites)}
        {card('🗂️ lotes', stats.total_batches)}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'end', marginTop: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
        {stats.last_7_days.map(d => (
          <div key={d.date} style={{ flex: 1, textAlign: 'center' }} title={`${d.date}: ${d.items} itens`}>
            <div style={{ height: 64, display: 'flex', alignItems: 'end', justifyContent: 'center' }}>
              <div style={{ width: '70%', height: `${Math.max(6, (d.items / maxWeek) * 56)}px`, background: d.items ? '#4f46e5' : 'var(--border)', borderRadius: 4 }} />
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 10, color: 'var(--text-muted)' }}>{d.date.slice(5)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
