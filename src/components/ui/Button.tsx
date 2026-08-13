import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variantClass: Record<Variant, string> = {
  primary:
    'bg-teal-bright text-ink hover:bg-teal shadow-[0_0_0_1px_rgba(45,212,191,0.25)] hover:shadow-[0_0_24px_rgba(45,212,191,0.25)]',
  secondary:
    'border border-white/15 bg-white/5 text-white hover:border-teal-bright/40 hover:bg-white/8',
  ghost: 'text-white/70 hover:text-white hover:bg-white/5',
  danger: 'border border-red-400/25 text-red-300 hover:border-red-400/50 hover:bg-critical/10',
}

const sizeClass: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-sm',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: Variant
  size?: Size
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
