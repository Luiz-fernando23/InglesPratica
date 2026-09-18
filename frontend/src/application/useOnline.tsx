import { useEffect, useState } from 'react'

export function useOnline() {
  const [online, setOnline] = useState<boolean>(typeof navigator === 'undefined' ? true : navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  return online
}

export function OfflineBanner() {
  const online = useOnline()
  if (online) return null
  return (
    <div style={{ background: '#b45309', color: '#fff', textAlign: 'center', padding: '8px 12px', fontSize: 13, fontWeight: 700, position: 'sticky', top: 0, zIndex: 50 }}>
      📴 Você está offline — mostrando conteúdo salvo. Favoritos serão sincronizados ao voltar.
    </div>
  )
}

export function loadCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : null
  } catch { return null }
}

export function saveCache(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}
