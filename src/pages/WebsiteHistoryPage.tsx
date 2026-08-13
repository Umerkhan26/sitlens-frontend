import { useEffect, useState } from 'react'
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

  return (
    <div>
      <Link to="/app/websites" className="text-sm text-white/45 hover:text-teal-bright">
        ← Websites
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Audit history</h1>
      <p className="mt-1 font-mono text-sm text-white/50">{hostname}</p>

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      <div className="mt-8 space-y-3">
        {audits.length === 0 && (
          <p className="text-sm text-white/50">No audits yet for this site.</p>
        )}
        {audits.map((a) => (
          <div
            key={a.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-ink-soft px-4 py-3"
          >
            <div>
              <p className="text-sm capitalize text-white/80">{a.status}</p>
              <p className="text-xs text-white/40">{new Date(a.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-4">
              {a.overallScore != null && (
                <span className="text-lg font-semibold text-teal-bright">{a.overallScore}</span>
              )}
              {a.status === 'completed' ? (
                <Link
                  to={`/app/audits/${a.id}/report`}
                  className="text-sm text-teal-bright hover:underline"
                >
                  Report
                </Link>
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
        ))}
      </div>
    </div>
  )
}
