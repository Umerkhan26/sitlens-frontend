import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { useApi, type Website } from '../services/api'

export function DashboardPage() {
  const { user } = useAuth()
  const { api } = useApi()
  const [websites, setWebsites] = useState<Website[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await api<{ websites: Website[] }>('/websites')
        setWebsites(data.websites)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      }
    }
    void load()
  }, [api])

  const scored = websites.filter((w) => w.latestAudit?.overallScore != null)
  const avg =
    scored.length > 0
      ? Math.round(
          scored.reduce((sum, w) => sum + (w.latestAudit?.overallScore || 0), 0) / scored.length,
        )
      : null

  return (
    <div>
      <h1 className="text-2xl font-semibold">Welcome{user?.name ? `, ${user.name}` : ''}</h1>
      <p className="mt-2 max-w-xl text-sm text-white/60">
        Add a website, run an audit, then copy AI fix prompts into Cursor or Claude Code.
      </p>

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Websites', value: String(websites.length) },
          { label: 'Scored sites', value: String(scored.length) },
          { label: 'Avg score', value: avg != null ? String(avg) : '—' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-white/10 bg-ink-soft px-4 py-5">
            <p className="text-xs uppercase tracking-wide text-white/45">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-teal-bright">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium">Recent websites</h2>
        <Link
          to="/app/websites"
          className="rounded-md bg-teal-bright px-4 py-2 text-sm font-semibold text-ink hover:bg-teal"
        >
          Manage websites
        </Link>
      </div>

      <div className="mt-4 space-y-2">
        {websites.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/15 px-6 py-10 text-center text-sm text-white/50">
            No websites yet.{' '}
            <Link to="/app/websites" className="text-teal-bright hover:underline">
              Add your first URL
            </Link>
          </div>
        )}
        {websites.slice(0, 5).map((site) => (
          <div
            key={site.id}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-ink-soft px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{site.hostname}</p>
              <p className="font-mono text-xs text-white/40">{site.url}</p>
            </div>
            <span className="text-lg font-semibold text-teal-bright">
              {site.latestAudit?.overallScore ?? '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
