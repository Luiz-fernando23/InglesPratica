import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'

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
      // @ts-ignore
      setError(err?.response?.data?.detail || 'Falha no cadastro')
    }
  }

  const inputStyle: React.CSSProperties = { width: '100%', marginTop: 12, padding: 10, borderRadius: 8, border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text)' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-soft)', padding: 16, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeToggle />
      </div>
      <form onSubmit={submit} style={{ background: 'var(--bg-card)', padding: 32, borderRadius: 16, width: '100%', maxWidth: 400, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Criar conta</h1>
        <input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required style={{ ...inputStyle, marginTop: 20 }} />
        <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
        <input placeholder="Senha (mín 6)" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
        {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}
        <button disabled={loading} type="submit" style={{ width: '100%', marginTop: 16, padding: 12, borderRadius: 8, background: 'var(--btn-dark-bg)', color: 'var(--bg-card)', border: 0, cursor: 'pointer', fontWeight: 600 }}>{loading ? 'Criando...' : 'Cadastrar'}</button>
        <p style={{ fontSize: 14, marginTop: 12, textAlign: 'center' }}><Link to="/login">Já tenho conta</Link></p>
      </form>
    </div>
  )
}
