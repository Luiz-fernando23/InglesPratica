import { useState } from 'react'
import { generationApi } from '../infrastructure/api/endpoints'
import type { GenerationBatch, GenerateOptions } from '../domain/types'

function parseExclude(raw: string): string[] {
  return raw.split(/[,\n;]/).map(w => w.trim()).filter(Boolean)
}

export function useGenerate() {
  const [data, setData] = useState<GenerationBatch | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async (
    kind: 'phrases' | 'words',
    opts?: GenerateOptions & { excludeRaw?: string },
  ) => {
    setLoading(true); setError(null)
    try {
      const exclude = opts?.exclude ?? (opts?.excludeRaw ? parseExclude(opts.excludeRaw) : [])
      const payload: GenerateOptions = {
        count: opts?.count ?? 10,
        allow_repeat: opts?.allow_repeat ?? false,
        exclude,
      }
      const res = kind === 'phrases' ? await generationApi.phrases(payload) : await generationApi.words(payload)
      setData(res)
    } catch (e: unknown) {
      // @ts-ignore axios
      const detail = e?.response?.data?.detail
      const msg = typeof detail === 'string' ? detail : (e instanceof Error ? e.message : 'Erro ao gerar')
      setError(msg)
    } finally { setLoading(false) }
  }
  return { data, loading, error, generate, parseExclude }
}
