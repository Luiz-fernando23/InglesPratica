import { useTheme } from '../../context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      onClick={toggle}
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      style={{
        padding: '8px 14px',
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: 'var(--bg-card)',
        color: 'var(--text)',
        cursor: 'pointer',
        fontWeight: 600,
      }}
    >
      {isDark ? '☀️ Claro' : '🌙 Escuro'}
    </button>
  )
}
