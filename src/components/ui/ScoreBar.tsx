export function ScoreBar({
  label,
  value,
}: {
  label: string
  value: number | null | undefined
}) {
  const n = value ?? 0
  const has = value != null
  const pct = has ? Math.min(100, Math.max(0, n)) : 0

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-3.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--fg-muted)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-[var(--fg)] sm:text-[1.65rem]">
        {has ? n : '—'}
      </p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--track)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
