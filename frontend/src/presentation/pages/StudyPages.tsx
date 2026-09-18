import { useEffect, useMemo, useState } from 'react'
import { favoritesApi, historyApi } from '../../infrastructure/api/endpoints'
import { SpeakButton } from '../components/SpeakButton'
import { AppLayout } from '../layouts/AppLayout'
import type { GeneratedItem } from '../../domain/types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function useDeck() {
  const [deck, setDeck] = useState<GeneratedItem[]>([])
  const [source, setSource] = useState('')
  useEffect(() => {
    (async () => {
      const favs = await favoritesApi.list().catch(() => ({ items: [] as never[] }))
      const favItems = (favs.items as { content_en: string; content_pt: string }[]).map((f, i) => ({ id: `fav-${i}`, content_en: f.content_en, content_pt: f.content_pt, order_index: i }))
      if (favItems.length >= 4) { setDeck(shuffle(favItems)); setSource(`⭐ ${favItems.length} favoritos`); return }
      const hist = await historyApi.list({ page: 1, page_size: 5 }).catch(() => null)
      const hItems = (hist?.items ?? []).flatMap(b => b.items)
      if (hItems.length >= 4) { setDeck(shuffle(hItems)); setSource(`📚 ${hItems.length} do histórico`) ; return }
      setDeck([]); setSource('vazio')
    })()
  }, [])
  return { deck: useMemo(() => deck, [deck]), source, reshuffle: () => setDeck(d => shuffle(d)) }
}

export function StudyPage() {
  const { deck, source, reshuffle } = useDeck()
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('known') || '{}') } catch { return {} }
  })
  const card = deck[idx]
  const mark = (ok: boolean) => {
    if (!card) return
    const next = { ...known, [card.content_en.toLowerCase()]: ok }
    setKnown(next)
    try { localStorage.setItem('known', JSON.stringify(next)) } catch { /* ignore */ }
    setFlipped(false)
    setIdx(i => (i + 1) % Math.max(deck.length, 1))
  }
  const knownCount = Object.values(known).filter(Boolean).length

  return (
    <AppLayout title="Flashcards">
      <main style={{ display: 'grid', gap: 12, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Baralho: {source} · {knownCount} marcadas como “sei” · toque no card para virar</p>
        {!card && <p style={{ color: 'var(--text-muted)' }}>Gere frases/palavras ou favorite itens para montar seu baralho (mín. 4).</p>}
        {card && (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{idx + 1} / {deck.length}</p>
            <div onClick={() => setFlipped(f => !f)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 48, minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
              {!flipped ? (
                <>
                  <p style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{card.content_en}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>toque para ver a tradução</p>
                  <div><SpeakButton text={card.content_en} /></div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{card.content_pt}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>{card.content_en}</p>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button onClick={() => mark(false)} style={{ flex: 1, padding: 14, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', fontWeight: 700 }}>❌ Ainda não</button>
              <button onClick={() => mark(true)} style={{ flex: 1, padding: 14, borderRadius: 12, border: 0, background: '#16a34a', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>✅ Sei!</button>
            </div>
            <button onClick={() => { reshuffle(); setIdx(0); setFlipped(false) }} className="btn" style={{ marginTop: 12 }}>🔀 Embaralhar</button>
          </>
        )}
      </main>
    </AppLayout>
  )
}

export function QuizPage() {
  const { deck, source, reshuffle } = useDeck()
  const [qIdx, setQIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [pick, setPick] = useState<string | null>(null)

  const question = deck.length ? deck[qIdx % deck.length] : null
  const options = useMemo(() => {
    if (!question || deck.length < 4) return []
    const others = shuffle(deck.filter(d => d.content_en !== question.content_en)).slice(0, 3)
    return shuffle([question, ...others])
  }, [question, deck])

  const answer = (opt: GeneratedItem) => {
    if (pick || !question) return
    setPick(opt.content_en)
    if (opt.content_en === question.content_en) setScore(s => s + 1)
  }
  const next = () => { setPick(null); setQIdx(i => i + 1) }

  return (
    <AppLayout title={`Quiz · ${score} pts`}>
      <main style={{ display: 'grid', gap: 12 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Fonte: {source} · questão {deck.length ? (qIdx % deck.length) + 1 : 0}</p>
        {!question && <p style={{ color: 'var(--text-muted)' }}>Você precisa de ao menos 4 itens (favoritos ou histórico) para o quiz.</p>}
        {question && (
          <>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Como se diz em inglês?</p>
              <h2 style={{ margin: '8px 0 0' }}>{question.content_pt}</h2>
            </div>
            <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
              {options.map(o => {
                const isRight = pick && o.content_en === question.content_en
                const isWrong = pick === o.content_en && o.content_en !== question.content_en
                return (
                  <button key={o.content_en} onClick={() => answer(o)} disabled={!!pick}
                    style={{ padding: 14, borderRadius: 12, textAlign: 'left', fontSize: 16, fontWeight: 600, cursor: pick ? 'default' : 'pointer',
                      border: isRight ? '2px solid #16a34a' : isWrong ? '2px solid #dc2626' : '1px solid var(--border)',
                      background: isRight ? '#ecfdf5' : 'var(--bg-card)', color: 'var(--text)' }}>
                    {o.content_en} {isRight ? '✅' : isWrong ? '❌' : ''}
                  </button>
                )
              })}
            </div>
            {pick && (
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button onClick={next} className="btn btn-primary" style={{ flex: 1 }}>Próxima →</button>
                <button onClick={() => { reshuffle(); setQIdx(0); setPick(null); setScore(0) }} className="btn" aria-label="Embaralhar e recomeçar">🔀</button>
              </div>
            )}
          </>
        )}
      </main>
    </AppLayout>
  )
}
