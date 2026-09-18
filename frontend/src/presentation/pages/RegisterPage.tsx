import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { AuthHero } from '../components/AuthHero'

export function RegisterPage() {
  const { register, loading } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try { await register(name, email, password); nav('/dashboard') } catch (err: unknown) {
      // @ts-expect-error axios detail
      setError(err?.response?.data?.detail || 'Falha no cadastro')
    }
  }

  return (
    <div className="auth-page">
      <AuthHero />
      <div className="auth-form-wrap">
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <ThemeToggle />
        </div>
        <form onSubmit={submit} className="auth-card" aria-labelledby="register-title">
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: 'var(--link)' }}>COMECE GRÁTIS 🚀</p>
          <h2 id="register-title" style={{ margin: '6px 0 0', fontSize: 26 }}>Criar conta</h2>
          <p style={{ color: 'var(--text-muted)', margin: '6px 0 0', fontSize: 14 }}>Leva 30 segundos e sua sequência já começa hoje.</p>
          <label className="field" style={{ marginTop: 18 }}>
            Nome
            <input className="input" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
          </label>
          <label className="field" style={{ marginTop: 12 }}>
            E-mail
            <input className="input" placeholder="voce@email.com" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label className="field" style={{ marginTop: 12 }}>
            Senha (mín 6)
            <input className="input" placeholder="Crie uma senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
          </label>
          {error && <p role="alert" style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}
          <button disabled={loading} type="submit" className="btn btn-dark" style={{ width: '100%', marginTop: 16 }}>{loading ? 'Criando...' : 'Cadastrar'}</button>
          <p style={{ fontSize: 14, marginTop: 14, textAlign: 'center' }}><Link to="/login">Já tenho conta</Link></p>
        </form>
      </div>
    </div>
  )
}
