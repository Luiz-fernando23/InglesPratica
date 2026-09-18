import { useEffect, useState } from 'react'
import { pushApi } from '../../infrastructure/api/endpoints'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export function PushCard() {
  const [supported] = useState(() => 'serviceWorker' in navigator && 'PushManager' in window)
  const [enabled, setEnabled] = useState(false)
  const [time, setTime] = useState(() => localStorage.getItem('push-time') || '08:00')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!supported) return
    navigator.serviceWorker.ready.then(reg => reg.pushManager.getSubscription()).then(sub => setEnabled(!!sub)).catch(() => {})
  }, [supported])

  const subscribe = async () => {
    setBusy(true); setMsg(null)
    try {
      const { public_key, enabled: serverOn } = await pushApi.vapidKey()
      if (!serverOn || !public_key) { setMsg('⚠️ Push não configurado no servidor.'); return }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(public_key),
      })
      const json = sub.toJSON()
      await pushApi.subscribe(sub.endpoint, { p256dh: json.keys!.p256dh!, auth: json.keys!.auth! }, time)
      localStorage.setItem('push-time', time)
      setEnabled(true)
      setMsg('✅ Push ativado! Você receberá o lembrete mesmo com o app fechado.')
    } catch (e: unknown) {
      setMsg('❌ Não foi possível ativar. Verifique a permissão de notificações.')
    } finally { setBusy(false) }
  }

  const unsubscribe = async () => {
    setBusy(true); setMsg(null)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await pushApi.unsubscribe(sub.endpoint).catch(() => {})
        await sub.unsubscribe()
      }
      setEnabled(false)
      setMsg('Push desativado.')
    } finally { setBusy(false) }
  }

  const sendTest = async () => {
    setBusy(true); setMsg(null)
    try {
      const res = await pushApi.test()
      setMsg(res.devices ? `📨 Teste enviado (${res.results.join(', ')})` : 'Nenhum aparelho inscrito.')
    } catch {
      setMsg('❌ Falha ao enviar teste.')
    } finally { setBusy(false) }
  }

  const changeTime = async (t: string) => {
    setTime(t)
    localStorage.setItem('push-time', t)
    if (enabled) {
      try {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          const json = sub.toJSON()
          await pushApi.subscribe(sub.endpoint, { p256dh: json.keys!.p256dh!, auth: json.keys!.auth! }, t)
        }
      } catch { /* ignore */ }
    }
  }

  if (!supported) return null

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
      <p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>📲 Push no celular</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 8px' }}>Avisa mesmo com o app fechado (precisa instalar o PWA e permitir).</p>
      {!enabled ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="time" value={time} onChange={e => setTime(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text)' }} />
          <button onClick={subscribe} disabled={busy}
            style={{ padding: '8px 14px', borderRadius: 8, border: 0, background: '#4f46e5', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            {busy ? 'Ativando...' : 'Ativar push'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="time" value={time} onChange={e => changeTime(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text)' }} />
          <button onClick={sendTest} disabled={busy}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', fontWeight: 700, cursor: 'pointer' }}>
            Enviar teste
          </button>
          <button onClick={unsubscribe} disabled={busy}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', cursor: 'pointer' }}>
            Desativar
          </button>
        </div>
      )}
      {msg && <p style={{ fontSize: 13, marginTop: 8 }}>{msg}</p>}
    </div>
  )
}
