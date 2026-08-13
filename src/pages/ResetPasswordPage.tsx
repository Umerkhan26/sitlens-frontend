import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthShell, Field } from './LoginPage'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (!token) {
      setError('Reset token missing. Open the link from your email again.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Reset failed')
      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Reset password" subtitle="Choose a new password for your SiteLens account.">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <p className="rounded-md bg-critical/10 px-3 py-2 text-sm text-critical">{error}</p>
        )}
        <Field
          label="New password"
          type="password"
          value={password}
          onChange={setPassword}
          minLength={8}
        />
        <Field
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          minLength={8}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-teal-bright py-2.5 text-sm font-semibold text-ink hover:bg-teal disabled:opacity-60"
        >
          {loading ? 'Updating…' : 'Update password'}
        </button>
        <p className="text-center text-sm text-muted">
          <Link to="/login" className="font-medium text-teal-dim hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
