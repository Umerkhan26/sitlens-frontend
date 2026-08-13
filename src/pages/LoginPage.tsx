import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
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
      navigate('/app')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Sign in" subtitle="Welcome back to SiteLens.">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <p className="rounded-md bg-critical/10 px-3 py-2 text-sm text-critical">{error}</p>
        )}
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="Password" type="password" value={password} onChange={setPassword} />
        <div className="-mt-2 text-right">
          <Link to="/forgot-password" className="text-xs font-medium text-teal-dim hover:underline">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-teal-bright py-2.5 text-sm font-semibold text-ink hover:bg-teal disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        No account?{' '}
        <Link to="/register" className="font-medium text-teal-dim hover:underline">
          Start free
        </Link>
      </p>
    </AuthShell>
  )
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
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
      navigate('/app')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Start free" subtitle="5 audits per week during beta.">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <p className="rounded-md bg-critical/10 px-3 py-2 text-sm text-critical">{error}</p>
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
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-teal-bright py-2.5 text-sm font-semibold text-ink hover:bg-teal disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-teal-dim hover:underline">
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
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="grid-atmosphere hidden items-center justify-center p-12 lg:flex">
        <div>
          <p className="font-display text-5xl text-teal-bright">SiteLens</p>
          <p className="mt-4 max-w-sm text-white/70">
            Audit. Explain. Copy a fix prompt into your AI coding agent.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-mist px-5 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="font-display text-2xl text-teal lg:hidden">
            SiteLens
          </Link>
          <h1 className="mt-6 text-2xl font-semibold lg:mt-0">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
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
      <span className="font-medium">{label}</span>
      <input
        type={type}
        required
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-md border border-ink/10 bg-white px-3 py-2.5 outline-none focus:border-teal"
      />
    </label>
  )
}
