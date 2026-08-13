import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useApi, type Audit, type Issue } from '../services/api'

const SEVERITY_STYLE: Record<string, string> = {
  critical: 'bg-critical/20 text-red-300',
  high: 'bg-high/20 text-amber-300',
  medium: 'bg-white/10 text-sky-200',
  low: 'bg-white/5 text-white/60',
}

export function AuditReportPage() {
  const { id } = useParams()
  const { api } = useApi()
  const [audit, setAudit] = useState<Audit | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [filter, setFilter] = useState<'all' | Issue['severity']>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | Issue['category']>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const [auditRes, issuesRes] = await Promise.all([
          api<{ audit: Audit }>(`/audits/${id}`),
          api<{ issues: Issue[] }>(`/audits/${id}/issues`),
        ])
        setAudit(auditRes.audit)
        setIssues(issuesRes.issues)
        if (issuesRes.issues[0]) setExpanded(issuesRes.issues[0].id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report')
      }
    }
    void load()
  }, [id, api])

  const filtered = useMemo(() => {
    return issues.filter((i) => {
      if (filter !== 'all' && i.severity !== filter) return false
      if (categoryFilter !== 'all' && i.category !== categoryFilter) return false
      return true
    })
  }, [issues, filter, categoryFilter])

  async function copyPrompt(issue: Issue) {
    if (!issue.fixPrompt) return
    await navigator.clipboard.writeText(issue.fixPrompt)
    setCopied(issue.id)
    setTimeout(() => setCopied(null), 1500)
  }

  async function copyAllPrompts() {
    const blocks = filtered
      .filter((i) => i.fixPrompt)
      .map(
        (i, idx) =>
          `## ${idx + 1}. [${i.severity.toUpperCase()} / ${i.category}] ${i.title}\n\n${i.fixPrompt}`,
      )
    if (blocks.length === 0) return
    await navigator.clipboard.writeText(blocks.join('\n\n---\n\n'))
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 1500)
  }

  if (error) {
    return <p className="text-sm text-red-300">{error}</p>
  }

  if (!audit) {
    return <p className="text-sm text-white/50">Loading report…</p>
  }

  if (audit.status !== 'completed') {
    return (
      <div>
        <p className="text-sm text-white/60">Audit is still {audit.status}.</p>
        <Link to={`/app/audits/${audit.id}`} className="mt-3 inline-block text-teal-bright">
          View progress
        </Link>
      </div>
    )
  }

  const scoreCards = [
    { label: 'Overall', value: audit.overallScore },
    { label: 'SEO', value: audit.scores?.seo },
    { label: 'Technical', value: audit.scores?.technical },
    { label: 'Perf', value: audit.scores?.performance },
    { label: 'GEO', value: audit.scores?.geo },
    { label: 'AEO', value: audit.scores?.aeo },
    { label: 'AI Vis', value: audit.scores?.aiVisibility },
    { label: 'A11y', value: audit.scores?.accessibility },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/app/websites" className="text-sm text-white/45 hover:text-teal-bright">
            ← Websites
          </Link>
          <h1 className="mt-3 text-2xl font-semibold">Audit report</h1>
          <p className="mt-1 font-mono text-sm text-white/50">
            {audit.website?.hostname}
            {audit.crawlSummary?.finalUrl ? ` · ${audit.crawlSummary.finalUrl}` : ''}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-xs text-white/40">
            {new Date(audit.createdAt).toLocaleString()}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => void copyAllPrompts()}
              className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:border-teal-bright/40"
            >
              {copiedAll ? 'Copied all' : 'Copy all prompts'}
            </button>
            {audit.website?.id && (
              <Link
                to={`/app/audits/${audit.id}/compare`}
                className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:border-teal-bright/40"
              >
                Compare with previous
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
        {scoreCards.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-white/10 bg-ink-soft px-4 py-5 text-center"
          >
            <p className="text-3xl font-semibold tabular-nums text-teal-bright">
              {s.value ?? '—'}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-white/45">{s.label}</p>
          </div>
        ))}
      </div>

      {audit.crawlSummary?.pagesCrawled != null && (
        <p className="mt-4 text-sm text-white/50">
          Crawled {audit.crawlSummary.pagesCrawled} page
          {audit.crawlSummary.pagesCrawled === 1 ? '' : 's'}
          {audit.crawlSummary.pages && audit.crawlSummary.pages.length > 0
            ? ` · ${audit.crawlSummary.pages
                .slice(0, 3)
                .map((p) => {
                  try {
                    return new URL(p.url).pathname || '/'
                  } catch {
                    return p.url
                  }
                })
                .join(', ')}${audit.crawlSummary.pages.length > 3 ? '…' : ''}`
            : ''}
        </p>
      )}

      {audit.issueCount && (
        <p className="mt-4 text-sm text-white/50">
          {audit.issueCount.critical} critical · {audit.issueCount.high} high ·{' '}
          {audit.issueCount.medium} medium · {audit.issueCount.low} low
        </p>
      )}

      <div className="mt-8 space-y-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              'all',
              'seo',
              'technical',
              'performance',
              'geo',
              'aeo',
              'aiVisibility',
              'accessibility',
            ] as const
          ).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoryFilter(c)}
              className={`rounded-md px-3 py-1.5 text-xs uppercase ${
                categoryFilter === c
                  ? 'bg-white/15 text-white'
                  : 'border border-white/10 text-white/50 hover:border-white/25'
              }`}
            >
              {c === 'all'
                ? 'All categories'
                : c === 'aiVisibility'
                  ? 'AI Vis'
                  : c === 'accessibility'
                    ? 'A11y'
                    : c === 'performance'
                      ? 'Perf'
                      : c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-md px-3 py-1.5 text-xs capitalize ${
                filter === s
                  ? 'bg-teal-bright text-ink'
                  : 'border border-white/10 text-white/60 hover:border-white/25'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <p className="rounded-lg border border-white/10 px-4 py-8 text-center text-sm text-white/50">
            No issues in this filter. Nice work.
          </p>
        )}
        {filtered.map((issue) => {
          const open = expanded === issue.id
          return (
            <div key={issue.id} className="rounded-lg border border-white/10 bg-ink-soft">
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
                onClick={() => setExpanded(open ? null : issue.id)}
              >
                <div>
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-medium capitalize ${SEVERITY_STYLE[issue.severity]}`}
                  >
                    {issue.severity}
                  </span>
                  <span className="ml-2 text-[11px] uppercase tracking-wide text-white/35">
                    {issue.category}
                  </span>
                  <p className="mt-2 font-medium">{issue.title}</p>
                </div>
                <span className="text-white/35">{open ? '−' : '+'}</span>
              </button>
              {open && (
                <div className="border-t border-white/10 px-4 py-4 text-sm">
                  <p className="text-white/70">{issue.whyItMatters}</p>
                  <p className="mt-3 text-xs uppercase tracking-wide text-white/35">Evidence</p>
                  <p className="mt-1 font-mono text-xs text-white/55">{issue.evidence}</p>
                  <p className="mt-3 text-xs uppercase tracking-wide text-white/35">Fix</p>
                  <p className="mt-1 text-white/70">{issue.recommendation}</p>
                  {issue.fixPrompt && (
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wide text-white/35">
                          AI fix prompt
                        </p>
                        <button
                          type="button"
                          onClick={() => void copyPrompt(issue)}
                          className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-medium hover:border-teal-bright/50"
                        >
                          {copied === issue.id ? 'Copied' : 'Copy prompt'}
                        </button>
                      </div>
                      <pre className="overflow-x-auto rounded-md bg-ink p-3 font-mono text-[11px] leading-relaxed text-teal-bright/85">
                        {issue.fixPrompt}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
