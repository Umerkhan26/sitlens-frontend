import { Link, useNavigate } from 'react-router-dom'
import { useState, type FormEvent, type ReactNode } from 'react'
import { useAuth } from '../features/auth/AuthContext'
import { setPendingAuditUrl, websitesStartPath, withAuditUrl } from '../lib/pendingAudit'
import { ScoreBar } from '../components/ui/ScoreBar'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { Logo } from '../components/ui/Logo'
import { DemoVideo } from '../components/ui/DemoVideo'

const SCORES = [
  { label: 'Overall', value: 72 },
  { label: 'SEO', value: 81 },
  { label: 'GEO', value: 58 },
  { label: 'AEO', value: 64 },
  { label: 'AI Visibility', value: 47 },
  { label: 'Technical', value: 88 },
]

const FEATURES: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: 'SEO, GEO & AEO in one pass',
    body: 'Titles, meta, headings, canonicals, sitemap, schema, OG, Twitter — plus generative and answer-engine coverage.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
        <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Production-ready AI prompts',
    body: 'Every issue ships with a prompt tuned for Cursor, Claude Code, Codex CLI or Gemini CLI. One click, one paste.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M8 8h8M8 12h5M7 4h10a2 2 0 0 1 2 2v12l-4-2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Scores that mean something',
    body: 'Weighted, category-specific scoring — not vibes. Understand exactly where to invest next.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 20V10M10 20V4M16 20v-7M22 20H2"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: 'Complete issue reports',
    body: 'Every issue has severity, why it matters, evidence, and a concrete fix path.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Sub-60 second reports',
    body: 'Crawl, analyze, and generate prompts in one shot. No configuration, no accounts to link.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M13 2L4 14h7l-1 8 10-14h-7l0-6z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Yours only',
    body: 'Reports are private to your account. Nothing is shared or resold.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

const STEPS = [
  ['01', 'Paste a URL', 'Point SiteLens at any public page.'],
  ['02', 'We crawl & analyze', 'SEO, GEO, AEO, technical, accessibility, AI visibility.'],
  ['03', 'We generate prompts', 'One production-ready prompt per issue for your AI agent.'],
  ['04', 'Paste. Fix. Ship.', 'Copy into Cursor, Claude Code, Codex or Gemini CLI.'],
]

const FAQ = [
  [
    'Which AI coding agents do the prompts work with?',
    'Cursor, Claude Code, Codex CLI, Gemini CLI, Windsurf, and any tool that accepts a natural-language coding prompt.',
  ],
  ['Is my data private?', 'Audits are scoped to your account. Nothing is shared or resold.'],
  [
    'How many audits can I run?',
    'During the free beta, every account gets 5 audits every 7 days. Credits reset each week.',
  ],
  [
    'Does it modify my site?',
    'No. SiteLens is read-only — you decide when and how to apply each prompt.',
  ],
]

const SAMPLE_PROMPT = `You are working on the marketing site at example.com. Add a unique meta
description of 140–160 characters to <head> of the home page that includes
the primary keyword. Preserve all existing meta tags and layout...`

export function LandingPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [copied, setCopied] = useState(false)

  function goAudit(target?: string) {
    const trimmed = (target ?? url).trim()
    if (trimmed) setPendingAuditUrl(trimmed)
    if (token) {
      navigate(trimmed ? websitesStartPath(trimmed) : '/app/websites')
      return
    }
    navigate(withAuditUrl('/register', trimmed || null))
  }

  function onAudit(e: FormEvent) {
    e.preventDefault()
    goAudit()
  }

  async function copySample() {
    await navigator.clipboard.writeText(SAMPLE_PROMPT)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="page-bg min-h-screen text-[var(--fg)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href="#top" className="shrink-0">
            <Logo />
          </a>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 text-sm text-[var(--fg-muted)] md:flex">
            <a href="#features" className="transition-colors hover:text-[var(--fg)]">
              Features
            </a>
            <a href="#how" className="transition-colors hover:text-[var(--fg)]">
              How it works
            </a>
            <a href="#demo" className="transition-colors hover:text-[var(--fg)]">
              Demo
            </a>
            <a href="#faq" className="transition-colors hover:text-[var(--fg)]">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {token ? (
              <Link to="/app" className="btn-primary !px-3.5 !py-2 text-xs sm:text-sm">
                Open app <span aria-hidden>→</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] sm:inline"
                >
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary !px-3.5 !py-2 text-xs sm:text-sm">
                  Start free <span aria-hidden>→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="grid-zone relative px-5 pb-10 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="animate-fade-up font-display text-4xl font-semibold tracking-tight text-[var(--fg)] sm:text-5xl md:text-6xl">
            Site<span className="text-[var(--accent)]">Lens</span>
          </p>
          <h1 className="animate-fade-up-delay mt-4 text-2xl font-medium leading-snug tracking-tight text-[var(--fg-muted)] sm:text-3xl md:text-[2rem]">
            Audit any website. Fix it with{' '}
            <span className="gradient-text font-semibold">AI prompts.</span>
          </h1>
          <p className="animate-fade-up-delay-2 mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--fg-muted)] sm:text-base">
            Scores for SEO, GEO, AEO, AI visibility and technical health — plus a copy-paste fix
            prompt for every issue.
          </p>

          <form
            onSubmit={onAudit}
            className="animate-fade-up-delay-2 mx-auto mt-8 flex max-w-lg flex-col gap-2.5 sm:flex-row sm:items-stretch"
          >
            <label className="sr-only" htmlFor="audit-url">
              Website URL
            </label>
            <input
              id="audit-url"
              type="url"
              placeholder="https://your-site.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="min-w-0 flex-1 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-3 font-mono text-sm text-[var(--fg)] outline-none placeholder:text-[var(--fg-subtle)] focus:border-[var(--accent)]"
            />
            <button type="submit" className="btn-primary whitespace-nowrap !px-6">
              Audit free <span aria-hidden>→</span>
            </button>
          </form>

          <p className="animate-fade-up-delay-3 mt-4 text-xs text-[var(--fg-subtle)]">
            Free beta · 5 audits/week ·{' '}
            <a href="#demo" className="text-[var(--fg-muted)] underline-offset-2 hover:text-[var(--accent)] hover:underline">
              Watch the demo
            </a>
          </p>
        </div>

        <div className="animate-fade-up-delay-3 relative z-10 mx-auto mt-14 max-w-4xl">
          <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[var(--accent)]/8 blur-3xl" />
          <div className="product-frame relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>
                <p className="font-mono text-xs text-[var(--fg-subtle)]">audit://example.com</p>
              </div>
              <p className="text-xs text-[var(--ok)]">Complete · 24s</p>
            </div>

            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                {SCORES.map((s, i) => (
                  <div key={s.label} style={{ animationDelay: `${0.35 + i * 0.06}s` }} className="animate-fade-up">
                    <ScoreBar label={s.label} value={s.value} />
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="rounded-md bg-[var(--danger)]/15 px-2 py-0.5 text-[11px] font-medium text-[var(--danger)]">
                      Critical
                    </span>
                    <p className="mt-2 text-base font-semibold tracking-tight">
                      Missing meta description
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copySample()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--fg-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--fg)]"
                  >
                    {copied ? 'Copied' : 'Copy prompt'}
                  </button>
                </div>
                <pre className="mt-4 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4 font-mono text-[11px] leading-relaxed text-[var(--accent)] sm:text-xs">
                  {SAMPLE_PROMPT}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features — borderless blocks */}
      <section id="features" className="px-5 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            Features
          </p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Ship AI-native web quality
          </h2>
          <p className="mt-3 max-w-xl text-[var(--fg-muted)]">
            Rank in Google, show up in AI answers, and clear the technical bar — in one pass.
          </p>
          <div className="mt-12 grid gap-x-10 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-block">
                <span className="icon-box">{f.icon}</span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            URL → fixed site in minutes
          </h2>
          <p className="mt-3 max-w-lg text-[var(--fg-muted)]">
            No setup. No integrations. Paste a URL and start shipping fixes.
          </p>
          <ol className="step-rail mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS.map(([n, t, d]) => (
              <li key={n} className="relative">
                <span className="relative z-[1] inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--accent)]/40 bg-[var(--bg)] font-mono text-xs font-medium text-[var(--accent)]">
                  {n}
                </span>
                <h3 className="mt-4 font-semibold tracking-tight">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="relative overflow-hidden px-5 py-20 sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,var(--hero-glow),transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-[var(--accent)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
            2-minute demo
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            See SiteLens in action
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[var(--fg-muted)]">
            One URL → full report + copy-paste AI fix prompts.
          </p>
        </div>
        <div className="relative mx-auto mt-10 max-w-2xl">
          <DemoVideo />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-5 pb-20 sm:pb-24">
        <div className="mx-auto max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Answers first</h2>
          <div className="mt-10 divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {FAQ.map(([q, a], i) => {
              const open = openFaq === i
              return (
                <div key={q}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                  >
                    <span className="font-medium tracking-tight">{q}</span>
                    <span
                      className={`font-mono text-lg text-[var(--fg-muted)] transition-transform ${open ? 'rotate-45' : ''}`}
                    >
                      +
                    </span>
                  </button>
                  {open && (
                    <p className="pb-5 text-sm leading-relaxed text-[var(--fg-muted)]">{a}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 pb-20">
        <div className="cta-band mx-auto max-w-4xl px-6 py-14 text-center sm:px-10 sm:py-16">
          <p className="font-display text-2xl font-semibold tracking-tight text-[var(--accent)] sm:text-3xl">
            SiteLens
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Free during beta. No credit card.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[var(--fg-muted)]">
            5 full audits every week — with AI prompts for every issue.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register" className="btn-primary inline-flex">
              Start free <span aria-hidden>→</span>
            </Link>
            <a href="#demo" className="btn-ghost">
              Watch demo
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <div className="flex flex-wrap gap-5 text-sm text-[var(--fg-muted)]">
            <a href="#features" className="hover:text-[var(--fg)]">
              Features
            </a>
            <a href="#demo" className="hover:text-[var(--fg)]">
              Demo
            </a>
            <a href="#faq" className="hover:text-[var(--fg)]">
              FAQ
            </a>
            <Link to="/login" className="hover:text-[var(--fg)]">
              Sign in
            </Link>
          </div>
          <span className="text-xs text-[var(--fg-subtle)]">© 2026 SiteLens</span>
        </div>
      </footer>
    </div>
  )
}
