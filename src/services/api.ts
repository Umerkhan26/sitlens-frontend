import { useCallback } from 'react'
import { useAuth } from '../features/auth/AuthContext'

export class ApiError extends Error {
  status: number
  data: unknown
  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.status = status
    this.data = data
  }
}

export function useApi() {
  const { token, logout } = useAuth()

  const api = useCallback(
    async <T,>(path: string, init?: RequestInit): Promise<T> => {
      const res = await fetch(`/api${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init?.headers || {}),
        },
      })

      const data = await res.json().catch(() => ({}))
      if (res.status === 401) {
        logout()
        throw new ApiError((data as { message?: string }).message || 'Unauthorized', 401, data)
      }
      if (!res.ok) {
        throw new ApiError(
          (data as { message?: string }).message || 'Request failed',
          res.status,
          data,
        )
      }
      return data as T
    },
    [token, logout],
  )

  return { api }
}

export type Website = {
  id: string
  url: string
  hostname: string
  name?: string
  createdAt: string
  latestAudit?: {
    id: string
    overallScore?: number
    scores?: {
      seo?: number
      technical?: number
      geo?: number
      aeo?: number
      aiVisibility?: number
      accessibility?: number
    }
    createdAt: string
  } | null
}

export type Audit = {
  id: string
  status: string
  overallScore?: number
  scores?: {
    seo?: number
    technical?: number
    geo?: number
    aeo?: number
    aiVisibility?: number
    accessibility?: number
  }
  issueCount?: { critical: number; high: number; medium: number; low: number }
  errorMessage?: string
  crawlSummary?: {
    finalUrl?: string
    statusCode?: number
    title?: string | null
    redirected?: boolean
    pagesCrawled?: number
    pages?: {
      url: string
      statusCode: number
      title: string | null
      metaDescription: string | null
      h1Count: number
      canonical: string | null
    }[]
  }
  createdAt: string
  updatedAt: string
  website?: {
    id: string
    url: string
    hostname: string
    name?: string
  } | null
}

export type Usage = {
  used: number
  limit: number
  remaining: number
  resetsAt?: string
}

export type Issue = {
  id: string
  code: string
  category: 'seo' | 'technical' | 'geo' | 'aeo' | 'aiVisibility' | 'accessibility'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  whyItMatters: string
  evidence: string
  recommendation: string
  fixPrompt?: string
  scoreImpact: number
}
