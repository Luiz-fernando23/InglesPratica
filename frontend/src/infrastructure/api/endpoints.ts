import api from './client'
import type { GenerationBatch, PaginatedHistory, GenerateOptions } from '../../domain/types'

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }).then(r => r.data),
  register: (name: string, email: string, password: string) => api.post('/auth/register', { name, email, password }).then(r => r.data),
  refresh: (refresh_token: string) => api.post('/auth/refresh', { refresh_token }).then(r => r.data),
}

export const generationApi = {
  phrases: (opts?: GenerateOptions): Promise<GenerationBatch> => api.post('/generation/phrases', {
    count: opts?.count ?? 10,
    allow_repeat: opts?.allow_repeat ?? false,
    exclude: opts?.exclude ?? [],
  }).then(r => r.data),
  words: (opts?: GenerateOptions): Promise<GenerationBatch> => api.post('/generation/words', {
    count: opts?.count ?? 10,
    allow_repeat: opts?.allow_repeat ?? false,
    exclude: opts?.exclude ?? [],
  }).then(r => r.data),
}

export const historyApi = {
  list: (params: { page?: number; page_size?: number; type?: string }): Promise<PaginatedHistory> => api.get('/history', { params }).then(r => r.data),
  detail: (id: string): Promise<GenerationBatch> => api.get(`/history/${id}`).then(r => r.data),
}
