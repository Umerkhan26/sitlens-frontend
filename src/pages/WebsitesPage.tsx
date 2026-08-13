import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, useApi, type Usage, type Website } from '../services/api'
import {
  clearPendingAuditUrl,
  getPendingAuditUrl,
  setPendingAuditUrl,
} from '../lib/pendingAudit'

export function WebsitesPage() {
  const { api } = useApi()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [websites, setWebsites] = useState<Website[]>([])
  const [usage, setUsage] = useState<Usage | null>(null)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [existingWebsiteId, setExistingWebsiteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [runningId, setRunningId] = useState<string | null>(null)
  const [handoffBusy, setHandoffBusy] = useState(false)
  const handoffStarted = useRef(false)

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

  useEffect(() => {
    const fromQuery = searchParams.get('startAudit')?.trim() || ''
    const pending = fromQuery || getPendingAuditUrl() || ''
    if (!pending || handoffStarted.current) return
    handoffStarted.current = true
    setUrl(pending)
    setPendingAuditUrl(pending)
    if (fromQuery) {
      const next = new URLSearchParams(searchParams)
      next.delete('startAudit')
      setSearchParams(next, { replace: true })
    }
    void startAuditNow(pending)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function startAuditNow(targetUrl: string) {
    setError('')
    setExistingWebsiteId(null)
    setHandoffBusy(true)
    setRunningId('handoff')
    try {
      const data = await api<{ audit: { id: string } }>('/websites/audit-now', {
        method: 'POST',
        body: JSON.stringify({ url: targetUrl }),
      })
      clearPendingAuditUrl()
      navigate(`/app/audits/${data.audit.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start audit')
      setRunningId(null)
      setHandoffBusy(false)
    }
  }

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
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Library
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Websites</h1>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            Add a site once. To scan again, click{' '}
            <span className="text-[var(--fg)]">Run audit</span>.
          </p>
        </div>
        {usage && (
          <p className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-3 py-1.5 font-mono text-xs text-[var(--accent)]">
            {usage.remaining}/{usage.limit} credits
          </p>
        )}
      </div>

      {handoffBusy && (
        <div className="feature-card mt-6 flex items-center gap-3 px-4 py-3.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
          <p className="text-sm text-[var(--accent)]">Starting audit from your landing URL…</p>
        </div>
      )}

      <form
        onSubmit={onAdd}
        className="feature-card mt-8 flex flex-col gap-3 p-2.5 sm:flex-row sm:items-center"
      >
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
          className="min-w-0 flex-1 rounded-xl border-0 bg-transparent px-4 py-3 font-mono text-sm text-[var(--fg)] outline-none placeholder:text-[var(--fg-subtle)]"
        />
        <button
          type="submit"
          disabled={saving || handoffBusy}
          className="btn-primary !rounded-xl disabled:opacity-60"
        >
          {saving ? 'Adding…' : 'Add website'}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          <p>{error}</p>
          {existingWebsiteId && (
            <button
              type="button"
              disabled={runningId === existingWebsiteId || (usage != null && usage.remaining <= 0)}
              onClick={() => void onRunAudit(existingWebsiteId)}
              className="btn-primary mt-3 !rounded-xl disabled:opacity-60"
            >
              {runningId === existingWebsiteId ? 'Starting…' : 'Run audit instead'}
            </button>
          )}
        </div>
      )}

      <div className="mt-10 space-y-3">
        {loading && <p className="text-sm text-[var(--fg-muted)]">Loading…</p>}
        {!loading && websites.length === 0 && (
          <div className="feature-card border-dashed px-6 py-14 text-center">
            <p className="text-xl font-semibold">No websites yet</p>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">Add your first URL above to begin.</p>
          </div>
        )}
        {websites.map((site) => (
          <div
            key={site.id}
            className="feature-card flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium tracking-tight">{site.name || site.hostname}</p>
              <p className="mt-0.5 font-mono text-xs text-[var(--fg-subtle)]">{site.url}</p>
              {site.latestAudit?.overallScore != null && (
                <p className="mt-2 text-sm">
                  <span className="text-lg font-semibold text-[var(--accent)]">
                    {site.latestAudit.overallScore}
                  </span>
                  <Link
                    to={`/app/audits/${site.latestAudit.id}/report`}
                    className="ml-2 text-[var(--fg-subtle)] underline-offset-2 hover:text-[var(--accent)] hover:underline"
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
                className="btn-primary !rounded-xl !py-2 disabled:opacity-60"
              >
                {runningId === site.id
                  ? 'Starting…'
                  : usage != null && usage.remaining <= 0
                    ? 'No credits'
                    : 'Run audit'}
              </button>
              <Link
                to={`/app/websites/${site.id}`}
                className="btn-ghost !rounded-xl !py-2"
              >
                History
              </Link>
              <button
                type="button"
                onClick={() => void onDelete(site.id)}
                className="rounded-xl border border-[var(--border)] px-3.5 py-2 text-sm text-[var(--fg-subtle)] hover:border-[var(--danger)]/40 hover:text-[var(--danger)]"
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
