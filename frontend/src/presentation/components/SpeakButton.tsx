import { speak } from '../../infrastructure/speech/speak'

export function SpeakButton({ text, lang }: { text: string; lang?: string }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); speak(text, lang ?? 'en-US') }}
      title="Ouvir pronúncia"
      aria-label={`Ouvir ${text}`}
      style={{
        border: '1px solid var(--border)',
        background: 'var(--bg-card)',
        borderRadius: 8,
        padding: '4px 8px',
        cursor: 'pointer',
        fontSize: 14,
      }}
    >
      🔊
    </button>
  )
}
