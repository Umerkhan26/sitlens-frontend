import type { ReactNode } from 'react'

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  tone = 'light',
  action,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  tone?: 'light' | 'dark'
  action?: ReactNode
}) {
  const titleCls = tone === 'dark' ? 'text-white' : 'text-ink'
  const subCls = tone === 'dark' ? 'text-white/60' : 'text-muted'
  const eyeCls = tone === 'dark' ? 'text-teal-bright' : 'text-teal'

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className={`font-mono text-[11px] uppercase tracking-[0.2em] ${eyeCls}`}>
            {eyebrow}
          </p>
        )}
        <h2 className={`mt-2 font-display text-3xl tracking-tight sm:text-4xl ${titleCls}`}>
          {title}
        </h2>
        {subtitle && <p className={`mt-3 text-base leading-relaxed ${subCls}`}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="panel rounded-2xl px-5 py-6">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">{label}</p>
      <p className="mt-3 font-display text-4xl tabular-nums text-teal-bright">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-white/35">{hint}</p>}
    </div>
  )
}
