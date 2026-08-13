import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useApi } from '../services/api'

type IssueLite = {
  code: string
  title: string
  category: string
  severity: string
}

type CompareResponse = {
  website: { id: string; hostname: string; url: string; name?: string } | null
  current: {
    id: string
    overallScore?: number
    scores?: Record<string, number | undefined>
    issueCount?: { critical: number; high: number; medium: number; low: number }
    createdAt: string
  }
  previous: {
    id: string
    overallScore?: number
    scores?: Record<string, number | undefined>
    issueCount?: { critical: number; high: number; medium: number; low: number }
    createdAt: string
  } | null
  comparison: {
    overall: { previous: number | null; current: number | null; delta: number | null }
    scores: Record<
      string,
      { previous: number | null; current: number | null; delta: number | null }
    >
    issueCountDelta: {
      critical: number | null
      high: number | null
      medium: number | null
      low: number | null
    }
    resolved: IssueLite[]
    newIssues: IssueLite[]
    stillOpen: IssueLite[]
    summary: { resolvedCount: number; newCount: number; stillOpenCount: number }
  } | null
  message: string | null
}

function formatDelta(value: number | null | undefined) {
  if (value == null) return '—'
  if (value > 0) return `+${value}`
  return String(value)
}

function deltaClass(value: number | null | undefined, invert = false) {
  if (value == null || value === 0) return 'text-[var(--fg-muted)]'
  const good = invert ? value < 0 : value > 0
  return good ? 'text-[var(--accent)]' : 'text-[var(--danger)]'
}

export function AuditComparePage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const previousId = searchParams.get('previousId') || undefined
  const { api } = useApi()
  const [data, setData] = useState<CompareResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const qs = previousId ? `?previousId=${encodeURIComponent(previousId)}` : ''
        const res = await api<CompareResponse>(`/audits/${id}/compare${qs}`)
        setData(res)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load comparison')
      }
    }
    void load()
  }, [id, previousId, api])

  if (error) return <p className="text-sm text-[var(--danger)]">{error}</p>
  if (!data) return <p className="text-sm text-[var(--fg-muted)]">Loading comparison…</p>

  const comparison = data.comparison

  return (
    <div>
      <Link
        to={data.website ? `/app/websites/${data.website.id}` : '/app/websites'}
        className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)]"
      >
        ← History
      </Link>
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
        Delta
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Audit comparison</h1>
      <p className="mt-2 font-mono text-sm text-[var(--fg-subtle)]">{data.website?.hostname}</p>

      {!comparison && (
        <div className="feature-card mt-8 rounded-xl px-5 py-6">
          <p className="text-sm text-[var(--fg-muted)]">{data.message}</p>
          <Link
            to={`/app/audits/${data.current.id}/report`}
            className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline"
          >
            Open current report
          </Link>
        </div>
      )}

      {comparison && data.previous && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="feature-card rounded-xl px-4 py-5">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">Previous</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--fg)]">
                {comparison.overall.previous ?? '—'}
              </p>
              <p className="mt-1 text-xs text-[var(--fg-subtle)]">
                {new Date(data.previous.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="feature-card rounded-xl px-4 py-5">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">Current</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--accent)]">
                {comparison.overall.current ?? '—'}
              </p>
              <p className="mt-1 text-xs text-[var(--fg-subtle)]">
                {new Date(data.current.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="feature-card rounded-xl border-[var(--accent)]/30 bg-[var(--accent-soft)] px-4 py-5">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">Improvement</p>
              <p
                className={`mt-2 text-3xl font-semibold tabular-nums ${deltaClass(comparison.overall.delta)}`}
              >
                {formatDelta(comparison.overall.delta)}
              </p>
              <p className="mt-1 text-xs text-[var(--fg-subtle)]">Overall score delta</p>
            </div>
          </div>

          <h2 className="mt-10 text-lg font-medium tracking-tight">Category scores</h2>
          <div className="feature-card mt-4 overflow-x-auto rounded-xl">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-[var(--border)] text-[11px] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Previous</th>
                  <th className="px-4 py-3 font-medium">Current</th>
                  <th className="px-4 py-3 font-medium">Delta</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    'seo',
                    'technical',
                    'performance',
                    'geo',
                    'aeo',
                    'aiVisibility',
                    'accessibility',
                  ] as const
                ).map((key) => {
                  const row = comparison.scores[key]
                  return (
                    <tr key={key} className="border-b border-[var(--border)]">
                      <td className="px-4 py-3 uppercase text-[var(--fg-muted)]">
                        {key === 'aiVisibility'
                          ? 'AI Vis'
                          : key === 'accessibility'
                            ? 'A11y'
                            : key === 'performance'
                              ? 'Perf'
                              : key}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[var(--fg-muted)]">
                        {row?.previous ?? '—'}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[var(--fg)]">
                        {row?.current ?? '—'}
                      </td>
                      <td
                        className={`px-4 py-3 tabular-nums font-medium ${deltaClass(row?.delta)}`}
                      >
                        {formatDelta(row?.delta)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Stat label="Resolved issues" value={comparison.summary.resolvedCount} good />
            <Stat label="Still open" value={comparison.summary.stillOpenCount} />
            <Stat label="New issues" value={comparison.summary.newCount} warn />
          </div>

          <IssueSection title="Resolved" items={comparison.resolved} empty="No issues resolved yet." tone="good" />
          <IssueSection title="New issues" items={comparison.newIssues} empty="No new issues." tone="warn" />
          <IssueSection title="Still open" items={comparison.stillOpen} empty="Nothing left open from last time." />

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <Link
              to={`/app/audits/${data.previous.id}/report`}
              className="rounded-md border border-[var(--border)] px-3.5 py-2 text-[var(--fg-muted)] hover:border-[var(--accent)]/40"
            >
              Previous report
            </Link>
            <Link
              to={`/app/audits/${data.current.id}/report`}
              className="btn-primary !rounded-md !px-3.5 !py-2"
            >
              Current report
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  good,
  warn,
}: {
  label: string
  value: number
  good?: boolean
  warn?: boolean
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">{label}</p>
      <p
        className={`mt-2 text-2xl font-semibold tabular-nums ${
          good ? 'text-[var(--accent)]' : warn ? 'text-amber-400' : 'text-[var(--fg)]'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function IssueSection({
  title,
  items,
  empty,
  tone,
}: {
  title: string
  items: IssueLite[]
  empty: string
  tone?: 'good' | 'warn'
}) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--fg-muted)]">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li
              key={item.code}
              className="feature-card rounded-xl px-4 py-3 text-sm"
            >
              <span
                className={`mr-2 text-[11px] uppercase ${
                  tone === 'good'
                    ? 'text-[var(--accent)]'
                    : tone === 'warn'
                      ? 'text-amber-400'
                      : 'text-[var(--fg-subtle)]'
                }`}
              >
                {item.category}
              </span>
              <span className="text-[var(--fg)]">{item.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
