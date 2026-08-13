import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, useApi, type Usage, type Website } from '../services/api'

export function WebsitesPage() {
  const { api } = useApi()
  const navigate = useNavigate()
  const [websites, setWebsites] = useState<Website[]>([])
  const [usage, setUsage] = useState<Usage | null>(null)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [existingWebsiteId, setExistingWebsiteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [runningId, setRunningId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const [sitesRes, usageRes] = await Promise.all([
        api<{ websites: Website[] }>('/websites'),
        api<{ usage: Usage }>('/auth/usage'),
      ])
      setWebsites(sitesRes.websites)
      setUsage(usageRes.usage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load websites')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onAdd(e: FormEvent) {
    e.preventDefault()
    setError('')
    setExistingWebsiteId(null)
    setSaving(true)
    try {
      await api('/websites', { method: 'POST', body: JSON.stringify({ url }) })
      setUrl('')
      await load()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const data = err.data as { websiteId?: string; message?: string }
        setExistingWebsiteId(data.websiteId || null)
        setError(
          data.message ||
            'This website is already added. Use Run audit to scan it again.',
        )
      } else {
        setError(err instanceof Error ? err.message : 'Could not add website')
      }
    } finally {
      setSaving(false)
    }
  }

  async function onRunAudit(websiteId: string) {
    setError('')
    setExistingWebsiteId(null)
    setRunningId(websiteId)
    try {
      const data = await api<{ audit: { id: string } }>(`/websites/${websiteId}/audits`, {
        method: 'POST',
      })
      navigate(`/app/audits/${data.audit.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start audit')
      setRunningId(null)
    }
  }

  async function onDelete(websiteId: string) {
    if (!confirm('Remove this website?')) return
    try {
      await api(`/websites/${websiteId}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete website')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Websites</h1>
          <p className="mt-1 text-sm text-white/55">
            Add a new site once. To scan again, click <span className="text-white/80">Run audit</span>.
          </p>
        </div>
        {usage && (
          <p className="text-sm text-white/50">
            Credits:{' '}
            <span className="font-semibold text-teal-bright">
              {usage.remaining}/{usage.limit}
            </span>{' '}
            this week
          </p>
        )}
      </div>

      <form onSubmit={onAdd} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="url"
          required
          placeholder="https://example.com"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            setExistingWebsiteId(null)
            setError('')
          }}
          className="min-w-0 flex-1 rounded-md border border-white/15 bg-ink-soft px-4 py-3 font-mono text-sm outline-none focus:border-teal-bright"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-teal-bright px-5 py-3 text-sm font-semibold text-ink hover:bg-teal disabled:opacity-60"
        >
          {saving ? 'Adding…' : 'Add website'}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-md bg-critical/15 px-3 py-3 text-sm text-red-300">
          <p>{error}</p>
          {existingWebsiteId && (
            <button
              type="button"
              disabled={runningId === existingWebsiteId || (usage != null && usage.remaining <= 0)}
              onClick={() => void onRunAudit(existingWebsiteId)}
              className="mt-3 rounded-md bg-teal-bright px-3.5 py-2 text-sm font-semibold text-ink hover:bg-teal disabled:opacity-60"
            >
              {runningId === existingWebsiteId ? 'Starting…' : 'Run audit instead'}
            </button>
          )}
        </div>
      )}

      <div className="mt-10 space-y-3">
        {loading && <p className="text-sm text-white/50">Loading…</p>}
        {!loading && websites.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/15 px-6 py-12 text-center text-sm text-white/50">
            No websites yet. Add your first URL above.
          </div>
        )}
        {websites.map((site) => (
          <div
            key={site.id}
            className="flex flex-col gap-4 rounded-lg border border-white/10 bg-ink-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{site.name || site.hostname}</p>
              <p className="mt-0.5 font-mono text-xs text-white/45">{site.url}</p>
              {site.latestAudit?.overallScore != null && (
                <p className="mt-2 text-sm text-teal-bright">
                  Latest score: {site.latestAudit.overallScore}
                  <Link
                    to={`/app/audits/${site.latestAudit.id}/report`}
                    className="ml-2 text-white/50 underline-offset-2 hover:underline"
                  >
                    View report
                  </Link>
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={runningId === site.id || (usage != null && usage.remaining <= 0)}
                onClick={() => void onRunAudit(site.id)}
                className="rounded-md bg-teal-bright px-3.5 py-2 text-sm font-semibold text-ink hover:bg-teal disabled:opacity-60"
              >
                {runningId === site.id
                  ? 'Starting…'
                  : usage != null && usage.remaining <= 0
                    ? 'No credits'
                    : 'Run audit'}
              </button>
              <Link
                to={`/app/websites/${site.id}`}
                className="rounded-md border border-white/15 px-3.5 py-2 text-sm text-white/80 hover:border-teal-bright/40"
              >
                History
              </Link>
              <button
                type="button"
                onClick={() => void onDelete(site.id)}
                className="rounded-md border border-white/10 px-3.5 py-2 text-sm text-white/45 hover:border-red-400/40 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
