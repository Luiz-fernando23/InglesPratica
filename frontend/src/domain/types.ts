export interface User { id: string; name: string; email: string; }
export interface GeneratedItem { id: string; content_en: string; content_pt: string; order_index: number; }
export interface GenerationBatch { id: string; type: 'phrase' | 'word'; created_at: string; items: GeneratedItem[]; exhausted?: boolean; }
export interface PaginatedHistory { total: number; page: number; page_size: number; items: GenerationBatch[]; }
export interface GenerateOptions { count?: number; allow_repeat?: boolean; exclude?: string[]; level?: string; }
export interface Favorite { id: string; content_en: string; content_pt: string; kind: string; created_at: string; }
export interface DayCount { date: string; batches: number; items: number; }
export interface Stats { total_batches: number; total_items: number; total_favorites: number; current_streak_days: number; best_streak_days: number; last_7_days: DayCount[]; }
export interface Daily { date: string; word_en: string; word_pt: string; phrase_en: string; phrase_pt: string; already_seen_word: boolean; already_seen_phrase: boolean; }
