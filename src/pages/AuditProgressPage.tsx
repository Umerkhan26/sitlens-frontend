import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApi, type Audit } from '../services/api'

const STAGES = ['queued', 'crawling', 'analyzing', 'generating_ai', 'completed'] as const

const STAGE_LABEL: Record<string, string> = {
  queued: 'Queued',
  crawling: 'Crawling pages',
  analyzing: 'Running analyzers',
  generating_ai: 'Generating AI prompts',
  completed: 'Complete',
}

export function AuditProgressPage() {
  const { id } = useParams()
  const { api } = useApi()
  const navigate = useNavigate()
  const [audit, setAudit] = useState<Audit | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function tick() {
      try {
        const data = await api<{ audit: Audit }>(`/audits/${id}`)
        if (cancelled) return
        setAudit(data.audit)
        if (data.audit.status === 'completed') {
          navigate(`/app/audits/${id}/report`, { replace: true })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load audit')
        }
      }
    }

    void tick()
    const timer = setInterval(() => void tick(), 1500)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [id, api, navigate])

  const status = audit?.status || 'queued'
  const stageIndex = STAGES.indexOf(status as (typeof STAGES)[number])
  const progressPct =
    status === 'failed'
      ? 0
      : status === 'completed'
        ? 100
        : Math.max(8, Math.round(((Math.max(stageIndex, 0) + 0.45) / (STAGES.length - 1)) * 100))

  return (
    <div className="mx-auto max-w-xl">
      <Link to="/app/websites" className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)]">
        ← Websites
      </Link>
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
        Live scan
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Running audit</h1>
      <p className="mt-2 font-mono text-sm text-[var(--fg-subtle)]">
        {audit?.website?.hostname || '…'}
      </p>

      {error && (
        <p className="mt-4 rounded-xl bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      {status === 'failed' && (
        <div className="feature-card mt-8 border-[var(--danger)]/30 px-5 py-5 text-sm">
          <p className="font-medium text-[var(--danger)]">Audit failed</p>
          <p className="mt-1 text-[var(--fg-muted)]">{audit?.errorMessage || 'Unknown error'}</p>
          <Link to="/app/websites" className="mt-4 inline-block text-[var(--accent)] hover:underline">
            Back to websites
          </Link>
        </div>
      )}

      {status !== 'failed' && (
        <>
          <div className="feature-card mt-10 p-5">
            <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
              <span>Progress</span>
              <span className="font-mono text-[var(--accent)]">{progressPct}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--track)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <ol className="mt-8 space-y-3">
            {STAGES.filter((s) => s !== 'completed').map((stage, i) => {
              const done = stageIndex > i || status === 'completed'
              const active = status === stage
              return (
                <li
                  key={stage}
                  className={`feature-card flex items-center gap-3 px-4 py-3.5 text-sm ${
                    active ? 'border-[var(--accent)]/40' : ''
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-[11px] ${
                      active
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                        : done
                          ? 'bg-[var(--surface-3)] text-[var(--fg-muted)]'
                          : 'bg-[var(--surface-2)] text-[var(--fg-subtle)]'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={
                      active
                        ? 'text-[var(--accent)]'
                        : done
                          ? 'text-[var(--fg-muted)]'
                          : 'text-[var(--fg-subtle)]'
                    }
                  >
                    {STAGE_LABEL[stage] || stage}
                  </span>
                  {active && (
                    <span className="ml-auto text-[11px] uppercase tracking-wide text-[var(--accent)]">
                      in progress
                    </span>
                  )}
                  {done && !active && (
                    <span className="ml-auto text-[11px] uppercase tracking-wide text-[var(--fg-subtle)]">
                      done
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </>
      )}
    </div>
  )
}
