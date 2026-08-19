import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useApi, type Audit, type Issue } from '../services/api'
import { ScoreBar } from '../components/ui/ScoreBar'
import { FilterChip } from '../components/ui/FilterChip'
import { PromptBlock } from '../components/ui/PromptBlock'
import {
  buildFixQueueClipboard,
  categoryLabel,
  downloadMarkdownReport,
  printPdfReport,
  sortIssuesBySeverity,
} from '../lib/reportExport'

const SEVERITY_STYLE: Record<string, string> = {
  critical: 'bg-[var(--danger)]/15 text-[var(--danger)]',
  high: 'bg-amber-500/15 text-amber-400',
  medium: 'bg-sky-500/15 text-sky-300',
  low: 'bg-[var(--surface-3)] text-[var(--fg-muted)]',
}

function chipCategoryLabel(c: string) {
  if (c === 'aiVisibility') return 'AI Vis'
  if (c === 'accessibility') return 'A11y'
  if (c === 'performance') return 'Perf'
  return c
}

export function AuditReportPage() {
  const { id } = useParams()
  const { api } = useApi()
  const [audit, setAudit] = useState<Audit | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [filter, setFilter] = useState<'all' | Issue['severity']>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | Issue['category']>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)
  const [error, setError] = useState('')
  const [exportNote, setExportNote] = useState('')

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
        const first = sortIssuesBySeverity(issuesRes.issues)[0]
        if (first) setExpanded(first.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report')
      }
    }
    void load()
  }, [id, api])

  const queued = useMemo(() => sortIssuesBySeverity(issues), [issues])

  const filtered = useMemo(() => {
    return queued.filter((i) => {
      if (filter !== 'all' && i.severity !== filter) return false
      if (categoryFilter !== 'all' && i.category !== categoryFilter) return false
      return true
    })
  }, [queued, filter, categoryFilter])

  async function copyAllPrompts() {
    if (!audit) return
    const text = buildFixQueueClipboard(audit, queued)
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 1500)
  }

  function downloadMd() {
    if (!audit) return
    downloadMarkdownReport(audit, queued)
    setExportNote('Markdown downloaded')
    setTimeout(() => setExportNote(''), 1600)
  }

  function downloadPdf() {
    if (!audit) return
    printPdfReport(audit, queued)
    setExportNote('Print dialog — choose Save as PDF')
    setTimeout(() => setExportNote(''), 2800)
  }

  if (error) return <p className="text-sm text-[var(--danger)]">{error}</p>
  if (!audit) return <p className="text-sm text-[var(--fg-muted)]">Loading report…</p>

  if (audit.status !== 'completed') {
    return (
      <div className="feature-card px-5 py-6">
        <p className="text-sm text-[var(--fg-muted)]">Audit is still {audit.status}.</p>
        <Link to={`/app/audits/${audit.id}`} className="mt-3 inline-block text-[var(--accent)]">
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

  const counts = audit.issueCount

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/app/websites" className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)]">
            ← Websites
          </Link>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Report
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Audit report</h1>
          <p className="mt-2 font-mono text-sm text-[var(--fg-subtle)]">
            {audit.website?.hostname}
            {audit.crawlSummary?.finalUrl ? ` · ${audit.crawlSummary.finalUrl}` : ''}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-xs text-[var(--fg-subtle)]">
            {new Date(audit.createdAt).toLocaleString()}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={downloadMd}
              className="btn-ghost !rounded-xl !py-2 text-xs"
            >
              Download Markdown
            </button>
            <button type="button" onClick={downloadPdf} className="btn-ghost !rounded-xl !py-2 text-xs">
              Download PDF
            </button>
            <button
              type="button"
              onClick={() => void copyAllPrompts()}
              className="btn-ghost !rounded-xl !py-2 text-xs"
            >
              {copiedAll ? 'Copied queue' : 'Copy all prompts'}
            </button>
            {audit.website?.id && (
              <Link
                to={`/app/audits/${audit.id}/compare`}
                className="btn-ghost !rounded-xl !py-2 text-xs"
              >
                Compare with previous
              </Link>
            )}
          </div>
          {exportNote && <p className="text-[11px] text-[var(--accent)]">{exportNote}</p>}
        </div>
      </div>

      <div className="product-frame mt-8 overflow-hidden">
        <div className="grid grid-cols-2 gap-2.5 p-4 sm:grid-cols-4 lg:grid-cols-8">
          {scoreCards.map((s) => (
            <ScoreBar key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      </div>

      <div className="feature-card mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 text-sm">
        {audit.crawlSummary?.pagesCrawled != null && (
          <p className="text-[var(--fg-muted)]">
            Crawled{' '}
            <span className="text-[var(--fg)]">{audit.crawlSummary.pagesCrawled}</span> page
            {audit.crawlSummary.pagesCrawled === 1 ? '' : 's'}
          </p>
        )}
        {counts && (
          <div className="flex flex-wrap gap-3 font-mono text-xs">
            <span className="text-[var(--danger)]">{counts.critical} critical</span>
            <span className="text-amber-400">{counts.high} high</span>
            <span className="text-sky-300">{counts.medium} medium</span>
            <span className="text-[var(--fg-subtle)]">{counts.low} low</span>
          </div>
        )}
      </div>

      {queued.length > 0 && (
        <div className="feature-card mt-4 overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Fix queue
              </p>
              <p className="mt-1 text-sm text-[var(--fg-muted)]">
                Critical first. Copy the whole queue, or pick one item.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void copyAllPrompts()}
              className="btn-primary !rounded-xl !py-2 text-xs"
            >
              {copiedAll ? 'Copied queue' : `Copy ${queued.filter((i) => i.fixPrompt).length} prompts`}
            </button>
          </div>
          <ol className="divide-y divide-[var(--border)]">
            {queued.map((issue, idx) => (
              <li key={issue.id}>
                <button
                  type="button"
                  className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-[var(--surface-2)]"
                  onClick={() => setExpanded(issue.id)}
                >
                  <span className="mt-0.5 w-6 shrink-0 font-mono text-xs text-[var(--fg-subtle)]">
                    {idx + 1}
                  </span>
                  <span
                    className={`mt-0.5 shrink-0 rounded px-2 py-0.5 text-[10px] font-medium capitalize ${SEVERITY_STYLE[issue.severity]}`}
                  >
                    {issue.severity}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium tracking-tight">{issue.title}</span>
                    <span className="mt-0.5 block text-[11px] text-[var(--fg-subtle)]">
                      {categoryLabel(issue.category)}
                      {issue.fixPrompt ? '' : ' · no prompt'}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
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
            <FilterChip
              key={c}
              active={categoryFilter === c}
              onClick={() => setCategoryFilter(c)}
            >
              {c === 'all' ? 'All categories' : chipCategoryLabel(c)}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((s) => (
            <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)} tone="accent">
              {s}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <div className="feature-card px-4 py-10 text-center text-sm text-[var(--fg-muted)]">
            No issues in this filter. Nice work.
          </div>
        )}
        {filtered.map((issue) => {
          const open = expanded === issue.id
          const queueNum = queued.findIndex((i) => i.id === issue.id) + 1
          return (
            <div
              key={issue.id}
              className={`feature-card overflow-hidden ${
                open ? 'border-[var(--accent)]/35' : ''
              }`}
            >
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
                onClick={() => setExpanded(open ? null : issue.id)}
              >
                <div>
                  <span className="mr-2 font-mono text-xs text-[var(--fg-subtle)]">{queueNum}.</span>
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-medium capitalize ${SEVERITY_STYLE[issue.severity]}`}
                  >
                    {issue.severity}
                  </span>
                  <span className="ml-2 text-[11px] uppercase tracking-wide text-[var(--fg-subtle)]">
                    {chipCategoryLabel(issue.category)}
                  </span>
                  <p className="mt-2 font-medium tracking-tight">{issue.title}</p>
                </div>
                <span className="mt-1 text-[var(--accent)]">{open ? '−' : '+'}</span>
              </button>
              {open && (
                <div className="border-t border-[var(--border)] px-4 py-4 text-sm">
                  <p className="leading-relaxed text-[var(--fg-muted)]">{issue.whyItMatters}</p>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-[var(--fg-subtle)]">
                    Evidence
                  </p>
                  <p className="mt-1 font-mono text-xs text-[var(--fg-muted)]">{issue.evidence}</p>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-[var(--fg-subtle)]">
                    Fix
                  </p>
                  <p className="mt-1 leading-relaxed text-[var(--fg-muted)]">
                    {issue.recommendation}
                  </p>
                  {issue.fixPrompt && (
                    <div className="mt-5">
                      <PromptBlock prompt={issue.fixPrompt} />
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
