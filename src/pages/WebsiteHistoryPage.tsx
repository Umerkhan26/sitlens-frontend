import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useApi, type Audit } from '../services/api'

export function WebsiteHistoryPage() {
  const { id } = useParams()
  const { api } = useApi()
  const [hostname, setHostname] = useState('')
  const [audits, setAudits] = useState<Audit[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const data = await api<{
          website: { hostname: string }
          audits: Audit[]
        }>(`/websites/${id}/history`)
        setHostname(data.website.hostname)
        setAudits(data.audits)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history')
      }
    }
    void load()
  }, [id, api])

  const completed = useMemo(
    () => audits.filter((a) => a.status === 'completed'),
    [audits],
  )

  return (
    <div>
      <Link to="/app/websites" className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)]">
        ← Websites
      </Link>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Timeline
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Audit history</h1>
          <p className="mt-2 font-mono text-sm text-[var(--fg-subtle)]">{hostname}</p>
        </div>
        {completed.length >= 2 && (
          <Link
            to={`/app/audits/${completed[0].id}/compare?previousId=${completed[1].id}`}
            className="btn-primary !rounded-md !px-3.5 !py-2 text-sm"
          >
            Compare latest two
          </Link>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-[var(--danger)]">{error}</p>}

      <div className="mt-8 space-y-3">
        {audits.length === 0 && (
          <p className="text-sm text-[var(--fg-muted)]">No audits yet for this site.</p>
        )}
        {audits.map((a, index) => {
          const previousCompleted = completed.find(
            (c) => c.id !== a.id && new Date(c.createdAt) < new Date(a.createdAt),
          )
          return (
            <div
              key={a.id}
              className="feature-card flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3.5"
            >
              <div>
                <p className="text-sm capitalize text-[var(--fg)]">{a.status}</p>
                <p className="text-xs text-[var(--fg-subtle)]">{new Date(a.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {a.overallScore != null && (
                  <span className="text-lg font-semibold text-[var(--accent)]">{a.overallScore}</span>
                )}
                {a.status === 'completed' ? (
                  <>
                    <Link
                      to={`/app/audits/${a.id}/report`}
                      className="text-sm text-[var(--accent)] hover:underline"
                    >
                      Report
                    </Link>
                    {(previousCompleted || index === 0) && (
                      <Link
                        to={
                          previousCompleted
                            ? `/app/audits/${a.id}/compare?previousId=${previousCompleted.id}`
                            : `/app/audits/${a.id}/compare`
                        }
                        className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] hover:underline"
                      >
                        Compare
                      </Link>
                    )}
                  </>
                ) : a.status !== 'failed' ? (
                  <Link
                    to={`/app/audits/${a.id}`}
                    className="text-sm text-[var(--accent)] hover:underline"
                  >
                    Progress
                  </Link>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
