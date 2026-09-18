import api from './client'
import type { GenerationBatch, PaginatedHistory, GenerateOptions, Favorite, Stats, Daily } from '../../domain/types'

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

export const favoritesApi = {
  list: (kind?: string): Promise<{ total: number; items: Favorite[] }> => api.get('/favorites', { params: kind ? { kind } : {} }).then(r => r.data),
  add: (content_en: string, content_pt: string, kind: string): Promise<Favorite> => api.post('/favorites', { content_en, content_pt, kind }).then(r => r.data),
  bulk: (items: { content_en: string; content_pt: string; kind: string }[]): Promise<{ added: number; skipped: number; items: Favorite[] }> => api.post('/favorites/bulk', { items }).then(r => r.data),
  remove: (id: string) => api.delete(`/favorites/${id}`).then(r => r.data),
  removeByContent: (content_en: string) => api.delete('/favorites/by-content', { params: { content_en } }).then(r => r.data),
}

export const progressApi = {
  stats: (): Promise<Stats> => api.get('/progress/stats').then(r => r.data),
  daily: (): Promise<Daily> => api.get('/progress/daily').then(r => r.data),
}
