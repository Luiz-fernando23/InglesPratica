import { useCallback, useState } from 'react'
import { progressApi } from '../infrastructure/api/endpoints'
import type { Stats, Daily } from '../domain/types'

export function useProgress() {
  const [stats, setStats] = useState<Stats | null>(() => {
    try { return JSON.parse(localStorage.getItem('stats-cache') || 'null') } catch { return null }
  })
  const [daily, setDaily] = useState<Daily | null>(() => {
    try { return JSON.parse(localStorage.getItem('daily-cache') || 'null') } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, d] = await Promise.all([progressApi.stats(), progressApi.daily()])
      setStats(s); setDaily(d)
      try {
        localStorage.setItem('stats-cache', JSON.stringify(s))
        localStorage.setItem('daily-cache', JSON.stringify(d))
      } catch { /* ignore */ }
    } finally { setLoading(false) }
  }, [])

  return { stats, daily, loading, load }
}
