import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm ${isActive ? 'text-teal-bright' : 'text-white/60 hover:text-white'}`

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-8">
            <Link to="/app" className="font-display text-xl tracking-tight text-teal-bright">
              SiteLens
            </Link>
            <nav className="hidden items-center gap-5 sm:flex">
              <NavLink to="/app" end className={navClass}>
                Dashboard
              </NavLink>
              <NavLink to="/app/websites" className={navClass}>
                Websites
              </NavLink>
              <NavLink to="/app/settings" className={navClass}>
                Settings
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/70">
            <span className="hidden sm:inline">{user?.email}</span>
            <button
              type="button"
              className="rounded-md border border-white/15 px-3 py-1.5 hover:border-teal-bright/50 hover:text-white"
              onClick={() => {
                logout()
                navigate('/')
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  )
}
