import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { Logo } from '../components/ui/Logo'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import {
  getPendingAuditUrl,
  setPendingAuditUrl,
  websitesStartPath,
  withAuditUrl,
} from '../lib/pendingAudit'

function useAuditHandoffUrl() {
  const [params] = useSearchParams()
  const fromQuery = params.get('url')?.trim() || ''
  const [auditUrl, setAuditUrl] = useState(() => fromQuery || getPendingAuditUrl() || '')

  useEffect(() => {
    if (fromQuery) {
      setPendingAuditUrl(fromQuery)
      setAuditUrl(fromQuery)
    }
  }, [fromQuery])

  return auditUrl
}

function afterAuthPath(auditUrl: string) {
  if (auditUrl) return websitesStartPath(auditUrl)
  return '/app'
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const auditUrl = useAuditHandoffUrl()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(afterAuthPath(auditUrl))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle={
        auditUrl
          ? `Sign in and we’ll start auditing ${auditUrl}.`
          : 'Sign in to run audits and view your reports.'
      }
    >
      <form onSubmit={onSubmit} className="space-y-3">
        {error && (
          <p className="rounded-lg bg-[var(--danger)]/10 px-3 py-2 text-xs text-[var(--danger)]">
            {error}
          </p>
        )}
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="Password" type="password" value={password} onChange={setPassword} />
        <div className="-mt-0.5 text-right">
          <Link to="/forgot-password" className="text-xs font-medium text-[var(--accent)] hover:underline">
            Forgot password?
          </Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full !rounded-lg !py-2.5 disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--fg-muted)]">
        New here?{' '}
        <Link
          to={withAuditUrl('/register', auditUrl || null)}
          className="font-semibold text-[var(--accent)] hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const auditUrl = useAuditHandoffUrl()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, email, password)
      navigate(afterAuthPath(auditUrl))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle={
        auditUrl
          ? `Free beta — then we’ll audit ${auditUrl}.`
          : '5 audits every week during beta. No credit card.'
      }
    >
      <form onSubmit={onSubmit} className="space-y-3">
        {error && (
          <p className="rounded-lg bg-[var(--danger)]/10 px-3 py-2 text-xs text-[var(--danger)]">
            {error}
          </p>
        )}
        <Field label="Name" type="text" value={name} onChange={setName} />
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          minLength={8}
        />
        <button type="submit" disabled={loading} className="btn-primary w-full !rounded-lg !py-2.5 disabled:opacity-60">
          {loading ? 'Creating account…' : auditUrl ? 'Create account & audit' : 'Start free'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--fg-muted)]">
        Already have an account?{' '}
        <Link
          to={withAuditUrl('/login', auditUrl || null)}
          className="font-semibold text-[var(--accent)] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="relative flex min-h-[100svh] items-center justify-center bg-[var(--bg)] px-4 py-6">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="relative w-full max-w-[22rem]">
        <Link
          to="/"
          className="mb-4 inline-flex text-xs text-[var(--fg-muted)] transition hover:text-[var(--accent)]"
        >
          ← Back home
        </Link>
        <div className="product-frame p-5 sm:p-6">
          <Logo size="sm" />
          <h1 className="mt-4 text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-xs leading-relaxed text-[var(--fg-muted)]">{subtitle}</p>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function Field({
  label,
  type,
  value,
  onChange,
  minLength,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  minLength?: number
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-[var(--fg-muted)]">{label}</span>
      <input
        type={type}
        required
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
      />
    </label>
  )
}
