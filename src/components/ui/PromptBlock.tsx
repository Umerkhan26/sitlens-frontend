import { useState } from 'react'

export function PromptBlock({
  prompt,
  className = '',
  compact = false,
}: {
  prompt: string
  onCopied?: () => void
  className?: string
  compact?: boolean
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)] ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]" />
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--fg-subtle)]">
            AI fix prompt
          </p>
        </div>
        <button
          type="button"
          onClick={() => void copy()}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--fg-muted)] hover:border-[var(--accent)] hover:text-[var(--fg)]"
        >
          {copied ? 'Copied' : 'Copy prompt'}
        </button>
      </div>
      <pre
        className={`overflow-x-auto p-4 font-mono leading-relaxed text-[var(--accent)] ${
          compact ? 'max-h-40 text-[11px]' : 'text-xs'
        }`}
      >
        {prompt}
      </pre>
    </div>
  )
}
