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
  if (value == null || value === 0) return 'text-white/45'
  const good = invert ? value < 0 : value > 0
  return good ? 'text-teal-bright' : 'text-red-300'
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

  if (error) return <p className="text-sm text-red-300">{error}</p>
  if (!data) return <p className="text-sm text-white/50">Loading comparison…</p>

  const comparison = data.comparison

  return (
    <div>
      <Link
        to={data.website ? `/app/websites/${data.website.id}` : '/app/websites'}
        className="text-sm text-white/45 hover:text-teal-bright"
      >
        ← History
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Audit comparison</h1>
      <p className="mt-1 font-mono text-sm text-white/50">{data.website?.hostname}</p>

      {!comparison && (
        <div className="mt-8 rounded-lg border border-white/10 bg-ink-soft px-5 py-6">
          <p className="text-sm text-white/70">{data.message}</p>
          <Link
            to={`/app/audits/${data.current.id}/report`}
            className="mt-4 inline-block text-sm text-teal-bright hover:underline"
          >
            Open current report
          </Link>
        </div>
      )}

      {comparison && data.previous && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-ink-soft px-4 py-5">
              <p className="text-xs uppercase tracking-wide text-white/45">Previous</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-white/80">
                {comparison.overall.previous ?? '—'}
              </p>
              <p className="mt-1 text-xs text-white/40">
                {new Date(data.previous.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-ink-soft px-4 py-5">
              <p className="text-xs uppercase tracking-wide text-white/45">Current</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-teal-bright">
                {comparison.overall.current ?? '—'}
              </p>
              <p className="mt-1 text-xs text-white/40">
                {new Date(data.current.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-teal-bright/30 bg-teal-bright/10 px-4 py-5">
              <p className="text-xs uppercase tracking-wide text-white/45">Improvement</p>
              <p
                className={`mt-2 text-3xl font-semibold tabular-nums ${deltaClass(comparison.overall.delta)}`}
              >
                {formatDelta(comparison.overall.delta)}
              </p>
              <p className="mt-1 text-xs text-white/40">Overall score delta</p>
            </div>
          </div>

          <h2 className="mt-10 text-lg font-medium">Category scores</h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Previous</th>
                  <th className="px-4 py-3 font-medium">Current</th>
                  <th className="px-4 py-3 font-medium">Delta</th>
                </tr>
              </thead>
              <tbody>
                {(['seo', 'technical', 'geo', 'aeo'] as const).map((key) => {
                  const row = comparison.scores[key]
                  return (
                    <tr key={key} className="border-b border-white/5">
                      <td className="px-4 py-3 uppercase text-white/70">{key}</td>
                      <td className="px-4 py-3 tabular-nums text-white/55">
                        {row?.previous ?? '—'}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-white/90">
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
              className="rounded-md border border-white/15 px-3.5 py-2 text-white/70 hover:border-teal-bright/40"
            >
              Previous report
            </Link>
            <Link
              to={`/app/audits/${data.current.id}/report`}
              className="rounded-md bg-teal-bright px-3.5 py-2 font-semibold text-ink hover:bg-teal"
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
    <div className="rounded-lg border border-white/10 bg-ink-soft px-4 py-4">
      <p className="text-xs uppercase tracking-wide text-white/45">{label}</p>
      <p
        className={`mt-2 text-2xl font-semibold tabular-nums ${
          good ? 'text-teal-bright' : warn ? 'text-amber-300' : 'text-white'
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
        <p className="mt-3 text-sm text-white/45">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li
              key={item.code}
              className="rounded-lg border border-white/10 bg-ink-soft px-4 py-3 text-sm"
            >
              <span
                className={`mr-2 text-[11px] uppercase ${
                  tone === 'good'
                    ? 'text-teal-bright'
                    : tone === 'warn'
                      ? 'text-amber-300'
                      : 'text-white/40'
                }`}
              >
                {item.category}
              </span>
              <span className="text-white/85">{item.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
