import { useCallback, useState } from 'react'
import { progressApi } from '../infrastructure/api/endpoints'
import type { Stats, Daily } from '../domain/types'

export function useProgress() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [daily, setDaily] = useState<Daily | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, d] = await Promise.all([progressApi.stats(), progressApi.daily()])
      setStats(s); setDaily(d)
    } finally { setLoading(false) }
  }, [])

  return { stats, daily, loading, load }
}
