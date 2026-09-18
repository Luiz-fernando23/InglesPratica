import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'

export function LoginPage() {
  const { login, loading } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('demo@ingles.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try { await login(email, password); nav('/dashboard') } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha no login'
      // axios error
      // @ts-ignore
      setError(err?.response?.data?.detail || msg)
    }
  }

  const inputStyle: React.CSSProperties = { width: '100%', marginTop: 12, padding: 10, borderRadius: 8, border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text)' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-soft)', padding: 16, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeToggle />
      </div>
      <form onSubmit={submit} style={{ background: 'var(--bg-card)', padding: 32, borderRadius: 16, width: '100%', maxWidth: 400, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Inglês na Mão</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Entre para continuar</p>
        <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ ...inputStyle, marginTop: 20 }} />
        <input placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
        {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}
        <button disabled={loading} type="submit" style={{ width: '100%', marginTop: 16, padding: 12, borderRadius: 8, background: 'var(--btn-dark-bg)', color: 'var(--bg-card)', border: 0, cursor: 'pointer', fontWeight: 600 }}>{loading ? 'Entrando...' : 'Entrar'}</button>
        <p style={{ fontSize: 14, marginTop: 12, textAlign: 'center' }}>Não tem conta? <Link to="/register">Cadastre-se</Link></p>
      </form>
    </div>
  )
}
