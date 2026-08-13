import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthShell, Field } from './LoginPage'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Request failed')
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle="We'll email a reset link if the account exists."
    >
      {done ? (
        <div className="space-y-4">
          <p className="rounded-md bg-teal/10 px-3 py-3 text-sm text-teal-dim">
            If that email exists, we sent a password reset link. Check your inbox (and spam).
          </p>
          <Link to="/login" className="inline-block text-sm font-medium text-teal-dim hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <p className="rounded-md bg-critical/10 px-3 py-2 text-sm text-critical">{error}</p>
          )}
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-teal-bright py-2.5 text-sm font-semibold text-ink hover:bg-teal disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
          <p className="text-center text-sm text-muted">
            <Link to="/login" className="font-medium text-teal-dim hover:underline">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  )
}
