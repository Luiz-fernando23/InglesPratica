import { useCallback, useState } from 'react'
import { favoritesApi } from '../infrastructure/api/endpoints'
import type { Favorite } from '../domain/types'

export function useFavorites() {
  const [items, setItems] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (kind?: string) => {
    setLoading(true); setError(null)
    try {
      const res = await favoritesApi.list(kind)
      setItems(res.items)
    } catch (e: unknown) {
      // @ts-ignore
      setError(e?.response?.data?.detail || 'Erro ao carregar favoritos')
    } finally { setLoading(false) }
  }, [])

  const toggle = useCallback(async (content_en: string, content_pt: string, kind: string, isFav: boolean) => {
    try {
      if (isFav) {
        await favoritesApi.removeByContent(content_en)
        setItems(prev => prev.filter(f => f.content_en.toLowerCase() !== content_en.toLowerCase()))
      } else {
        const fav = await favoritesApi.add(content_en, content_pt, kind)
        setItems(prev => [fav, ...prev])
      }
    } catch (e: unknown) {
      // @ts-ignore
      const detail = e?.response?.data?.detail
      // já favoritado em outra sessão: apenas recarrega
      if (typeof detail === 'string' && detail.includes('favoritos')) await refresh()
      else throw e
    }
  }, [refresh])

  return { items, loading, error, refresh, toggle }
}
