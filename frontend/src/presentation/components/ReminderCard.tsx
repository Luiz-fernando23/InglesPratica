import { useEffect, useState } from 'react'

const KEY = 'reminder'
interface Reminder { enabled: boolean; time: string; lastFired: string }

function read(): Reminder {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Reminder
  } catch { /* ignore */ }
  return { enabled: false, time: '08:00', lastFired: '' }
}

export function ReminderCard() {
  const [rem, setRem] = useState<Reminder>(read)
  const [support] = useState(() => 'Notification' in window)
  const [perm, setPerm] = useState<string>(typeof Notification !== 'undefined' ? Notification.permission : 'denied')

  const save = (r: Reminder) => {
    setRem(r)
    try { localStorage.setItem(KEY, JSON.stringify(r)) } catch { /* ignore */ }
  }

  const enable = async () => {
    if (!support) return
    const p = await Notification.requestPermission()
    setPerm(p)
    if (p === 'granted') save({ ...rem, enabled: true })
  }

  useEffect(() => {
    if (!rem.enabled || perm !== 'granted') return
    const tick = () => {
      const now = new Date()
      const today = now.toISOString().slice(0, 10)
      const [h, m] = rem.time.split(':').map(Number)
      if (now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m)) {
        if (rem.lastFired !== today) {
          try { new Notification('Inglês na Mão 📚', { body: 'Hora de praticar! Sua sequência conta com hoje. 🔥' }) } catch { /* ignore */ }
          const next = { ...rem, lastFired: today }
          setRem(next)
          try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* ignore */ }
        }
      }
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [rem, perm])

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
      <p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>⏰ Lembrete diário</p>
      {!support && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Este navegador não suporta notificações.</p>}
      {support && perm !== 'granted' && (
        <button onClick={enable} style={{ marginTop: 8, padding: '8px 14px', borderRadius: 8, border: 0, background: '#4f46e5', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
          Ativar lembrete
        </button>
      )}
      {support && perm === 'granted' && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
          <input type="time" value={rem.time} onChange={e => save({ ...rem, time: e.target.value })}
            style={{ padding: 8, borderRadius: 8, border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text)' }} />
          <label style={{ fontSize: 13, fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="checkbox" checked={rem.enabled} onChange={e => save({ ...rem, enabled: e.target.checked })} style={{ width: 16, height: 16 }} />
            Ativo
          </label>
          {rem.enabled && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Avisa todo dia às {rem.time} com o app aberto/instalado.</span>}
        </div>
      )}
    </div>
  )
}
