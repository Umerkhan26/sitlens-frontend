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
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-white/55">Manage your SiteLens account.</p>

      {error && (
        <p className="mt-4 rounded-md bg-critical/15 px-3 py-2 text-sm text-red-300">{error}</p>
      )}
      {message && (
        <p className="mt-4 rounded-md bg-teal-bright/10 px-3 py-2 text-sm text-teal-bright">
          {message}
        </p>
      )}

      <form onSubmit={onSaveProfile} className="mt-8 space-y-4 rounded-lg border border-white/10 bg-ink-soft p-5">
        <h2 className="font-medium">Profile</h2>
        <label className="block text-sm">
          <span className="text-white/60">Email</span>
          <input
            value={user?.email || ''}
            disabled
            className="mt-1.5 w-full rounded-md border border-white/10 bg-ink px-3 py-2.5 text-white/50"
          />
        </label>
        <label className="block text-sm">
          <span className="text-white/60">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1.5 w-full rounded-md border border-white/15 bg-ink px-3 py-2.5 outline-none focus:border-teal-bright"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-teal-bright px-4 py-2 text-sm font-semibold text-ink hover:bg-teal disabled:opacity-60"
        >
          Save profile
        </button>
      </form>

      <form
        onSubmit={onChangePassword}
        className="mt-6 space-y-4 rounded-lg border border-white/10 bg-ink-soft p-5"
      >
        <h2 className="font-medium">Change password</h2>
        <label className="block text-sm">
          <span className="text-white/60">Current password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="mt-1.5 w-full rounded-md border border-white/15 bg-ink px-3 py-2.5 outline-none focus:border-teal-bright"
          />
        </label>
        <label className="block text-sm">
          <span className="text-white/60">New password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="mt-1.5 w-full rounded-md border border-white/15 bg-ink px-3 py-2.5 outline-none focus:border-teal-bright"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md border border-white/15 px-4 py-2 text-sm hover:border-teal-bright/40 disabled:opacity-60"
        >
          Update password
        </button>
      </form>
    </div>
  )
}
