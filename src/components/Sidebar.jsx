import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
  { to: '/worlds', label: 'Worlds & Levels', icon: '🌍' },
  { to: '/words', label: 'Words Manager', icon: '📝' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-white/10 bg-nova-card">
      <div className="border-b border-white/10 px-6 py-5">
        <h1 className="text-xl font-bold text-nova-gold">Nova Words</h1>
        <p className="text-nova-muted mt-1 text-xs">Admin Panel</p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-nova px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-nova-gold/20 text-nova-gold'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <span aria-hidden="true">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
