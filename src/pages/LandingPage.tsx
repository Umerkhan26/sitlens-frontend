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
  const [openFaq, setOpenFaq] = useState<number | null>(null)
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
      {/* Nav — flush to top, no extra padding above */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href="#top" className="shrink-0">
            <Logo />
          </a>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 text-sm text-[var(--fg-muted)] md:flex">
            <a href="#features" className="hover:text-[var(--fg)]">
              Features
            </a>
            <a href="#how" className="hover:text-[var(--fg)]">
              How it works
            </a>
            <a href="#faq" className="hover:text-[var(--fg)]">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link to="/login" className="hidden text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] sm:inline">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary !py-2 !px-3.5 text-xs sm:text-sm">
              Start free <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — grid boxes only here */}
      <section id="top" className="grid-zone relative px-5 pb-8 pt-10 sm:pt-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-xs text-[var(--fg-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--ok)] shadow-[0_0_8px_var(--ok)]" />
            Free during beta · 5 audits/week
          </p>
          <h1 className="animate-fade-up-delay mt-6 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
            Audit any website.
            <br />
            Fix it with <span className="gradient-text">AI prompts.</span>
          </h1>
          <p className="animate-fade-up-delay-2 mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[var(--fg-muted)] sm:text-lg">
            Instant scores for SEO, GEO, AEO, AI visibility and technical health — plus a
            production-ready prompt for every issue, ready to paste into Claude Code, Cursor, Codex
            CLI, Gemini CLI or Windsurf.
          </p>

          <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={() => goAudit()} className="btn-primary">
              Audit your site <span aria-hidden>→</span>
            </button>
            <a href="#demo" className="btn-ghost">
              See how it works
            </a>
          </div>

          <form
            onSubmit={onAudit}
            className="animate-fade-up-delay-3 mx-auto mt-5 flex max-w-md flex-col gap-2 sm:flex-row sm:items-center"
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
              className="min-w-0 flex-1 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 font-mono text-sm text-[var(--fg)] outline-none placeholder:text-[var(--fg-subtle)] focus:border-[var(--accent)]"
            />
            <button type="submit" className="btn-primary !py-2.5 whitespace-nowrap">
              Go
            </button>
          </form>
        </div>

        <div className="animate-fade-up-delay-3 relative z-10 mx-auto mt-12 max-w-4xl">
          <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[var(--accent)]/8 blur-3xl" />
          <div className="product-frame relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>
                <p className="font-mono text-xs text-[var(--fg-subtle)]">audit://example.com</p>
              </div>
              <p className="text-xs text-[var(--fg-muted)]">Complete · 24s</p>
            </div>

            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                {SCORES.map((s) => (
                  <ScoreBar key={s.label} label={s.label} value={s.value} />
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
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--fg-muted)] hover:border-[var(--accent)] hover:text-[var(--fg)]"
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

      {/* Features */}
      <section id="features" className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Ship AI-native web quality
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--fg-muted)]">
            Everything you need to rank in Google, appear in AI answers, and pass the technical bar.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card p-6">
                <span className="icon-box">{f.icon}</span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            From URL to fixed website in minutes
          </h2>
          <p className="mt-3 text-[var(--fg-muted)]">
            No configuration. No integrations. Just paste a URL and start shipping fixes.
          </p>
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([n, t, d]) => (
              <li key={n} className="feature-card p-6">
                <span className="font-mono text-sm font-medium text-[var(--accent)]">{n}</span>
                <h3 className="mt-3 font-semibold tracking-tight">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Demo video */}
      <section id="demo" className="relative overflow-hidden px-5 py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,var(--hero-glow),transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
            2-minute demo
          </span>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            See SiteLens in action
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[var(--fg-muted)]">
            Watch how a single URL turns into a complete SEO, GEO, and AEO report with copy-paste AI
            fix prompts.
          </p>
        </div>
        <div className="relative mx-auto mt-10 max-w-2xl">
          <DemoVideo />
        </div>
        <div className="mx-auto mt-10 max-w-4xl">
          <div className="cta-band overflow-hidden p-8 text-center sm:p-12">
            <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              See a full audit report
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-sm text-[var(--fg-muted)] sm:text-base">
              Sign up free and run your first audit. Every issue includes a copy-paste prompt for
              your AI coding agent.
            </p>
            <button type="button" onClick={() => goAudit()} className="btn-primary mt-8">
              Run a free audit <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-5 pb-24">
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
                    <span className="text-lg text-[var(--fg-muted)]">{open ? '−' : '+'}</span>
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
        <div className="cta-band mx-auto max-w-5xl px-6 py-16 text-center sm:px-10">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Free during beta. No credit card.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[var(--fg-muted)]">
            Get 5 full audits every week — with AI prompts for every issue.
          </p>
          <Link to="/register" className="btn-primary mt-8 inline-flex">
            Start free <span aria-hidden>✓</span>
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-sm text-[var(--fg-muted)]">
          <Logo />
          <span>© 2026 SiteLens. Built for indie hackers, founders, and agencies.</span>
        </div>
      </footer>
    </div>
  )
}
