import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { useApi, type Usage, type Website } from '../services/api'

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="feature-card px-5 py-6">
      <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--fg-subtle)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-[var(--accent)] sm:text-4xl">
        {value}
      </p>
      {hint && <p className="mt-1.5 text-xs text-[var(--fg-subtle)]">{hint}</p>}
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const { api } = useApi()
  const [websites, setWebsites] = useState<Website[]>([])
  const [usage, setUsage] = useState<Usage | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [sitesRes, usageRes] = await Promise.all([
          api<{ websites: Website[] }>('/websites'),
          api<{ usage: Usage }>('/auth/usage'),
        ])
        setWebsites(sitesRes.websites)
        setUsage(usageRes.usage)
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--fg-muted)]">
            Add a website, run an audit, then copy AI fix prompts into Cursor or Claude Code.
          </p>
        </div>
        <Link to="/app/websites" className="btn-primary">
          New audit <span aria-hidden>→</span>
        </Link>
      </div>

      {error && <p className="mt-4 text-sm text-[var(--danger)]">{error}</p>}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Websites" value={String(websites.length)} />
        <StatTile label="Scored sites" value={String(scored.length)} />
        <StatTile label="Avg score" value={avg != null ? String(avg) : '—'} />
        <StatTile
          label="Credits left"
          value={usage ? `${usage.remaining}/${usage.limit}` : '—'}
          hint="Resets weekly"
        />
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Recent websites</h2>
        <Link to="/app/websites" className="text-sm text-[var(--accent)] hover:underline">
          Manage all →
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {websites.length === 0 && (
          <div className="feature-card border-dashed px-6 py-14 text-center">
            <div className="icon-box mx-auto h-12 w-12 !rounded-full text-xl">+</div>
            <p className="mt-5 text-2xl font-semibold tracking-tight">No websites yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--fg-muted)]">
              Paste a URL and SiteLens will crawl, score, and generate fix prompts.
            </p>
            <Link to="/app/websites" className="btn-primary mt-7 inline-flex">
              Add your first URL
            </Link>
          </div>
        )}
        {websites.slice(0, 5).map((site) => (
          <div
            key={site.id}
            className="feature-card flex items-center justify-between px-5 py-4"
          >
            <div>
              <p className="font-medium tracking-tight">{site.hostname}</p>
              <p className="mt-0.5 font-mono text-xs text-[var(--fg-subtle)]">{site.url}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-semibold tabular-nums text-[var(--accent)]">
                {site.latestAudit?.overallScore ?? '—'}
              </p>
              {site.latestAudit?.id ? (
                <Link
                  to={`/app/audits/${site.latestAudit.id}/report`}
                  className="text-[11px] text-[var(--fg-subtle)] hover:text-[var(--accent)]"
                >
                  View report →
                </Link>
              ) : (
                <Link
                  to="/app/websites"
                  className="text-[11px] text-[var(--fg-subtle)] hover:text-[var(--accent)]"
                >
                  Run audit →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
