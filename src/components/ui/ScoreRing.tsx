import type { CSSProperties } from 'react'

function scoreColor(value: number) {
  if (value >= 85) return '#2dd4bf'
  if (value >= 70) return '#67e8f9'
  if (value >= 50) return '#f59e0b'
  return '#ef4444'
}

export function ScoreRing({
  label,
  value,
  delay = 0,
  size = 'md',
  tone = 'dark',
}: {
  label: string
  value: number | null | undefined
  delay?: number
  size?: 'sm' | 'md' | 'lg'
  tone?: 'dark' | 'light'
}) {
  const n = value ?? 0
  const has = value != null
  const dims = size === 'lg' ? 96 : size === 'sm' ? 64 : 76
  const r = size === 'lg' ? 36 : size === 'sm' ? 22 : 28
  const stroke = size === 'lg' ? 7 : 6
  const c = 2 * Math.PI * r
  const offset = has ? c - (Math.min(100, Math.max(0, n)) / 100) * c : c
  const color = has ? scoreColor(n) : tone === 'dark' ? '#334155' : '#cbd5e1'
  const track = tone === 'dark' ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
  const labelCls = tone === 'dark' ? 'text-white/45' : 'text-muted'
  const valueCls = tone === 'dark' ? 'text-white' : 'text-ink'
  const shell =
    tone === 'dark'
      ? 'border-white/10 bg-white/[0.03] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]'
      : 'border-ink/6 bg-white shadow-sm'

  return (
    <div
      className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2.5 py-3.5 sm:px-3 sm:py-4 ${shell}`}
      style={{ minWidth: dims + 8 }}
    >
      <svg width={dims} height={dims} viewBox={`0 0 ${dims} ${dims}`} className="-rotate-90">
        <circle
          cx={dims / 2}
          cy={dims / 2}
          r={r}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
        />
        <circle
          cx={dims / 2}
          cy={dims / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          className={has ? 'score-ring' : undefined}
          style={
            {
              strokeDashoffset: offset,
              '--score-offset': offset,
              animationDelay: `${delay}s`,
            } as CSSProperties
          }
        />
      </svg>
      <p className={`text-xl font-semibold tabular-nums ${valueCls}`}>
        {has ? n : '—'}
      </p>
      <p className={`text-center text-[11px] uppercase tracking-[0.14em] ${labelCls}`}>
        {label}
      </p>
    </div>
  )
}
