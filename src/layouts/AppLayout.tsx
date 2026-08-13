import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { useApi, type Usage } from '../services/api'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { Logo } from '../components/ui/Logo'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive
      ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
      : 'text-[var(--fg-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--fg)]'
  }`

export function AppLayout() {
  const { user, logout } = useAuth()
  const { api } = useApi()
  const navigate = useNavigate()
  const [usage, setUsage] = useState<Usage | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    void api<{ usage: Usage }>('/auth/usage')
      .then((res) => setUsage(res.usage))
      .catch(() => setUsage(null))
  }, [api])

  return (
    <div className="page-bg-soft min-h-screen text-[var(--fg)]">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-5">
            <Link to="/app">
              <Logo />
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
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
          <div className="flex items-center gap-2 text-sm">
            {usage && (
              <span className="hidden rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-3 py-1 font-mono text-[11px] text-[var(--accent)] sm:inline">
                {usage.remaining}/{usage.limit} credits
              </span>
            )}
            <ThemeToggle />
            <span className="hidden max-w-[120px] truncate text-[var(--fg-subtle)] md:inline">
              {user?.name || user?.email}
            </span>
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-[var(--fg-muted)] hover:border-[var(--accent)]/40 sm:hidden"
              onClick={() => setMenuOpen((v) => !v)}
            >
              Menu
            </button>
            <button
              type="button"
              className="hidden rounded-lg border border-[var(--border)] px-3 py-1.5 text-[var(--fg-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--fg)] sm:inline"
              onClick={() => {
                logout()
                navigate('/')
              }}
            >
              Sign out
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-[var(--border)] px-5 py-3 sm:hidden">
            <nav className="mx-auto flex max-w-6xl flex-col gap-1">
              <NavLink to="/app" end className={navClass} onClick={() => setMenuOpen(false)}>
                Dashboard
              </NavLink>
              <NavLink to="/app/websites" className={navClass} onClick={() => setMenuOpen(false)}>
                Websites
              </NavLink>
              <NavLink to="/app/settings" className={navClass} onClick={() => setMenuOpen(false)}>
                Settings
              </NavLink>
              <button
                type="button"
                className="mt-2 rounded-lg border border-[var(--border)] px-3 py-2 text-left text-sm text-[var(--fg-muted)]"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
              >
                Sign out
              </button>
            </nav>
          </div>
        )}
      </header>
      <main className="relative mx-auto max-w-6xl px-5 py-10">
        <Outlet />
      </main>
    </div>
  )
}
