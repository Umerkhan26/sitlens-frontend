import { useState, type FormEvent } from 'react'
import { useApi } from '../services/api'
import { useAuth } from '../features/auth/AuthContext'

export function SettingsPage() {
  const { user, updateUser } = useAuth()
  const { api } = useApi()
  const [name, setName] = useState(user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSaveProfile(e: FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const data = await api<{ user: { id: string; name: string; email: string } }>(
        '/auth/profile',
        {
          method: 'PATCH',
          body: JSON.stringify({ name }),
        },
      )
      updateUser(data.user)
      setMessage('Profile updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  async function onChangePassword(e: FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await api('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      setCurrentPassword('')
      setNewPassword('')
      setMessage('Password updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
        Account
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-2 text-sm text-[var(--fg-muted)]">Manage your SiteLens account.</p>

      {error && (
        <p className="mt-4 rounded-xl bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--accent)]">
          {message}
        </p>
      )}

      <form onSubmit={onSaveProfile} className="feature-card mt-8 space-y-4 p-5">
        <h2 className="font-semibold tracking-tight">Profile</h2>
        <label className="block text-sm">
          <span className="text-[var(--fg-muted)]">Email</span>
          <input
            value={user?.email || ''}
            disabled
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-[var(--fg-subtle)]"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--fg-muted)]">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg)] px-3 py-2.5 text-[var(--fg)] outline-none focus:border-[var(--accent)]"
          />
        </label>
        <button type="submit" disabled={loading} className="btn-primary !rounded-xl disabled:opacity-60">
          Save profile
        </button>
      </form>

      <form onSubmit={onChangePassword} className="feature-card mt-6 space-y-4 p-5">
        <h2 className="font-semibold tracking-tight">Change password</h2>
        <label className="block text-sm">
          <span className="text-[var(--fg-muted)]">Current password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg)] px-3 py-2.5 text-[var(--fg)] outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--fg-muted)]">New password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg)] px-3 py-2.5 text-[var(--fg)] outline-none focus:border-[var(--accent)]"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="btn-ghost !rounded-xl disabled:opacity-60"
        >
          Update password
        </button>
      </form>
    </div>
  )
}
