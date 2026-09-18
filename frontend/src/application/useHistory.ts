import { useState, useCallback } from 'react'
import { historyApi } from '../infrastructure/api/endpoints'
import type { PaginatedHistory } from '../domain/types'

export function useHistory() {
  const [data, setData] = useState<PaginatedHistory | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (params: { page?: number; page_size?: number; type?: string; q?: string } = {}) => {
    setLoading(true); setError(null)
    try {
      const res = await historyApi.list(params)
      setData(res)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro')
    } finally { setLoading(false) }
  }, [])

  return { data, loading, error, fetch }
}
