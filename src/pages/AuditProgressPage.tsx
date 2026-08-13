import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApi, type Audit } from '../services/api'

const STAGES = [
  'queued',
  'crawling',
  'analyzing',
  'generating_ai',
  'completed',
] as const

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

  return (
    <div className="mx-auto max-w-xl">
      <Link to="/app/websites" className="text-sm text-white/45 hover:text-teal-bright">
        ← Websites
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Running audit</h1>
      <p className="mt-1 font-mono text-sm text-white/50">
        {audit?.website?.hostname || '…'}
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-critical/15 px-3 py-2 text-sm text-red-300">{error}</p>
      )}

      {status === 'failed' && (
        <div className="mt-6 rounded-lg border border-red-400/30 bg-critical/10 px-4 py-4 text-sm">
          <p className="font-medium text-red-300">Audit failed</p>
          <p className="mt-1 text-white/60">{audit?.errorMessage || 'Unknown error'}</p>
          <Link to="/app/websites" className="mt-3 inline-block text-teal-bright hover:underline">
            Back to websites
          </Link>
        </div>
      )}

      {status !== 'failed' && (
        <ol className="mt-10 space-y-4">
          {STAGES.filter((s) => s !== 'completed').map((stage, i) => {
            const done = stageIndex > i || status === 'completed'
            const active = status === stage
            return (
              <li
                key={stage}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
                  active
                    ? 'border-teal-bright/50 bg-teal-bright/10 text-teal-bright'
                    : done
                      ? 'border-white/10 text-white/50'
                      : 'border-white/5 text-white/30'
                }`}
              >
                <span className="font-mono text-xs">{String(i + 1).padStart(2, '0')}</span>
                <span className="capitalize">{stage.replace('_', ' ')}</span>
                {active && <span className="ml-auto text-xs opacity-70">in progress</span>}
                {done && !active && <span className="ml-auto text-xs opacity-50">done</span>}
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
