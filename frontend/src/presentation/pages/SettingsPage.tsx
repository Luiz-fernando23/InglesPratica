import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { ReminderCard } from '../components/ReminderCard'
import { PushCard } from '../components/PushCard'
import { AppLayout } from '../layouts/AppLayout'

export function SettingsPage() {
  const { logout } = useAuth()
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <AppLayout title="Ajustes">
      <section className="card" aria-labelledby="notify-title">
        <h2 id="notify-title" className="card-title">🔔 Lembretes</h2>
        <p className="card-sub">Ative o aviso diário e o push — funciona mesmo com o app fechado se o PWA estiver instalado.</p>
        <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
          <ReminderCard />
          <PushCard />
        </div>
      </section>

      <section className="card" aria-labelledby="appear-title">
        <h2 id="appear-title" className="card-title">🎨 Aparência</h2>
        <p className="card-sub">Tema atual: {isDark ? 'escuro' : 'claro'}. A escolha fica salva no aparelho.</p>
        <button className="btn" style={{ marginTop: 12 }} onClick={toggle}>
          {isDark ? '☀️ Usar tema claro' : '🌙 Usar tema escuro'}
        </button>
      </section>

      <section className="card" aria-labelledby="install-title">
        <h2 id="install-title" className="card-title">📲 Instalar no celular</h2>
        <p className="card-sub">Android (Chrome): ⋮ → Adicionar à tela inicial → Instalar. iPhone (Safari): Compartilhar → Adicionar à Tela de Início.</p>
      </section>

      <section className="card" aria-labelledby="account-title">
        <h2 id="account-title" className="card-title">👤 Conta</h2>
        <p className="card-sub">Sair apaga apenas a sessão deste aparelho. Seus dados ficam salvos.</p>
        <button className="btn btn-dark" style={{ marginTop: 12, width: '100%' }} onClick={logout}>
          🚪 Sair da conta
        </button>
      </section>
    </AppLayout>
  )
}
