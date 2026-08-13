import type { ReactNode } from 'react'

export function FilterChip({
  active,
  onClick,
  children,
  tone = 'neutral',
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  tone?: 'neutral' | 'accent'
}) {
  const activeCls =
    tone === 'accent'
      ? 'bg-[var(--accent)] text-[#041016] shadow-[0_0_20px_var(--accent-glow)]'
      : 'bg-[var(--surface-3)] text-[var(--fg)] border-[var(--border-strong)]'
  const idleCls =
    'border border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--border-strong)] hover:text-[var(--fg)]'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition ${
        active ? activeCls : idleCls
      }`}
    >
      {children}
    </button>
  )
}
