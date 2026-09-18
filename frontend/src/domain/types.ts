export interface User { id: string; name: string; email: string; }
export interface GeneratedItem { id: string; content_en: string; content_pt: string; order_index: number; }
export interface GenerationBatch { id: string; type: 'phrase' | 'word'; created_at: string; items: GeneratedItem[]; exhausted?: boolean; }
export interface PaginatedHistory { total: number; page: number; page_size: number; items: GenerationBatch[]; }
export interface GenerateOptions { count?: number; allow_repeat?: boolean; exclude?: string[]; }
