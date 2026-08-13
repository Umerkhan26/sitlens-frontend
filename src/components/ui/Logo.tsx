type LogoProps = {
  className?: string
  showWordmark?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 22,
  md: 28,
  lg: 36,
}

/** SiteLens mark — spark + lens aperture (PromptAudit-style icon + wordmark). */
export function Logo({ className = '', showWordmark = true, size = 'md' }: LogoProps) {
  const px = sizes[size]
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect width="32" height="32" rx="9" fill="var(--accent)" />
        <path
          d="M16 7.5l1.1 3.4h3.6l-2.9 2.1 1.1 3.4-2.9-2.1-2.9 2.1 1.1-3.4-2.9-2.1h3.6L16 7.5z"
          fill="#041016"
          opacity="0.95"
        />
        <circle cx="16" cy="20.5" r="4.2" stroke="#041016" strokeWidth="1.6" fill="none" />
        <circle cx="16" cy="20.5" r="1.6" fill="#041016" />
      </svg>
      {showWordmark && (
        <span className="text-[1.05rem] font-semibold tracking-tight text-[var(--fg)]">
          SiteLens
        </span>
      )}
    </span>
  )
}
