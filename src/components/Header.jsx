import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-nova-card/50 px-8 py-4 backdrop-blur-sm">
      <div>
        <h2 className="text-lg font-semibold text-white">Nova Words Admin</h2>
        {user?.email && (
          <p className="text-nova-muted text-sm">{user.email}</p>
        )}
      </div>
      <button
        type="button"
        onClick={logout}
        className="rounded-nova bg-nova-gold px-4 py-2 text-sm font-semibold text-nova-bg transition-colors hover:bg-nova-gold-dark"
      >
        Logout
      </button>
    </header>
  )
}
