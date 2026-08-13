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
      <Link to="/app/websites" className="text-sm text-white/45 hover:text-teal-bright">
        ← Websites
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Audit history</h1>
          <p className="mt-1 font-mono text-sm text-white/50">{hostname}</p>
        </div>
        {completed.length >= 2 && (
          <Link
            to={`/app/audits/${completed[0].id}/compare?previousId=${completed[1].id}`}
            className="rounded-md bg-teal-bright px-3.5 py-2 text-sm font-semibold text-ink hover:bg-teal"
          >
            Compare latest two
          </Link>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      <div className="mt-8 space-y-3">
        {audits.length === 0 && (
          <p className="text-sm text-white/50">No audits yet for this site.</p>
        )}
        {audits.map((a, index) => {
          const previousCompleted = completed.find(
            (c) => c.id !== a.id && new Date(c.createdAt) < new Date(a.createdAt),
          )
          return (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-ink-soft px-4 py-3"
            >
              <div>
                <p className="text-sm capitalize text-white/80">{a.status}</p>
                <p className="text-xs text-white/40">{new Date(a.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {a.overallScore != null && (
                  <span className="text-lg font-semibold text-teal-bright">{a.overallScore}</span>
                )}
                {a.status === 'completed' ? (
                  <>
                    <Link
                      to={`/app/audits/${a.id}/report`}
                      className="text-sm text-teal-bright hover:underline"
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
                        className="text-sm text-white/55 hover:text-teal-bright hover:underline"
                      >
                        Compare
                      </Link>
                    )}
                  </>
                ) : a.status !== 'failed' ? (
                  <Link
                    to={`/app/audits/${a.id}`}
                    className="text-sm text-teal-bright hover:underline"
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
