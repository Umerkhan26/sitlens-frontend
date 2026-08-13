const PENDING_AUDIT_KEY = 'sitelens_pending_audit_url'

export function setPendingAuditUrl(url: string) {
  const trimmed = url.trim()
  if (!trimmed) return
  sessionStorage.setItem(PENDING_AUDIT_KEY, trimmed)
}

export function getPendingAuditUrl(): string | null {
  return sessionStorage.getItem(PENDING_AUDIT_KEY)
}

export function clearPendingAuditUrl() {
  sessionStorage.removeItem(PENDING_AUDIT_KEY)
}

/** Build auth/app path while preserving an optional audit URL. */
export function withAuditUrl(path: string, url: string | null | undefined) {
  if (!url?.trim()) return path
  const q = new URLSearchParams({ url: url.trim() })
  return `${path}?${q.toString()}`
}

export function websitesStartPath(url: string) {
  const q = new URLSearchParams({ startAudit: url.trim() })
  return `/app/websites?${q.toString()}`
}
