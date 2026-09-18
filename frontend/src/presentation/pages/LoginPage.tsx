import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { AuthHero } from '../components/AuthHero'

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
      // @ts-expect-error axios detail
      setError(err?.response?.data?.detail || msg)
    }
  }

  return (
    <div className="auth-page">
      <AuthHero />
      <div className="auth-form-wrap">
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <ThemeToggle />
        </div>
        <form onSubmit={submit} className="auth-card" aria-labelledby="login-title">
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: 'var(--link)' }}>BEM-VINDO DE VOLTA 👋</p>
          <h2 id="login-title" style={{ margin: '6px 0 0', fontSize: 26 }}>Entrar na conta</h2>
          <p style={{ color: 'var(--text-muted)', margin: '6px 0 0', fontSize: 14 }}>Continue sua sequência de estudos de onde parou.</p>
          <label className="field" style={{ marginTop: 18 }}>
            E-mail
            <input className="input" placeholder="voce@email.com" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label className="field" style={{ marginTop: 12 }}>
            Senha
            <input className="input" placeholder="Sua senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          </label>
          {error && <p role="alert" style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}
          <button disabled={loading} type="submit" className="btn btn-dark" style={{ width: '100%', marginTop: 16 }}>{loading ? 'Entrando...' : 'Entrar'}</button>
          <p style={{ fontSize: 14, marginTop: 14, textAlign: 'center' }}>Não tem conta? <Link to="/register">Cadastre-se grátis</Link></p>
        </form>
      </div>
    </div>
  )
}
