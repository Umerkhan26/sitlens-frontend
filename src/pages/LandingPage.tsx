import { Link, useNavigate } from 'react-router-dom'
import { useState, type CSSProperties, type FormEvent } from 'react'
import { useAuth } from '../features/auth/AuthContext'
import { setPendingAuditUrl, websitesStartPath, withAuditUrl } from '../lib/pendingAudit'

const SCORES = [
  { label: 'Overall', value: 72 },
  { label: 'SEO', value: 81 },
  { label: 'GEO', value: 58 },
  { label: 'AEO', value: 64 },
  { label: 'AI Visibility', value: 47 },
  { label: 'Technical', value: 88 },
]

export function LandingPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [url, setUrl] = useState('')

  function onAudit(e: FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    setPendingAuditUrl(trimmed)
    if (token) {
      navigate(websitesStartPath(trimmed))
      return
    }
    navigate(withAuditUrl('/register', trimmed))
  }

  return (
    <div className="min-h-screen bg-mist text-ink">
      <nav className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <a href="#top" className="font-display text-2xl text-white">
            SiteLens
          </a>
          <div className="flex items-center gap-6 text-sm text-white/80">
            <a href="#features" className="hidden hover:text-white sm:inline">
              Features
            </a>
            <a href="#how" className="hidden hover:text-white sm:inline">
              How it works
            </a>
            <a href="#faq" className="hidden hover:text-white sm:inline">
              FAQ
            </a>
            <Link to="/login" className="hover:text-white">
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-teal-bright px-3.5 py-2 font-medium text-ink hover:bg-teal"
            >
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — brand first, one composition, full-bleed atmosphere */}
      <section id="top" className="grid-atmosphere relative min-h-[100svh] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full border border-teal-bright/25" />
          <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full border border-teal-bright/10" />
          <div
            className="absolute left-1/2 top-[28%] h-px w-[70%] -translate-x-1/2 bg-teal-bright/30"
            style={{ animation: 'pulse-line 3s ease-in-out infinite' }}
          />
        </div>

        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-5 pb-16 pt-28">
          <p className="animate-fade-up font-display text-5xl tracking-tight text-teal-bright sm:text-6xl md:text-7xl">
            SiteLens
          </p>
          <h1 className="animate-fade-up-delay mt-6 max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Audit any website.
            <br />
            Fix it with AI prompts.
          </h1>
          <p className="animate-fade-up-delay-2 mt-4 max-w-xl text-base text-white/70 sm:text-lg">
            Instant scores for SEO, GEO, AEO, AI visibility and technical health —
            plus a production-ready prompt for every issue.
          </p>

          <form
            onSubmit={onAudit}
            className="animate-fade-up-delay-2 mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
          >
            <label className="sr-only" htmlFor="audit-url">
              Website URL
            </label>
            <input
              id="audit-url"
              type="url"
              required
              placeholder="https://your-site.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-white/15 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder:text-white/35 outline-none focus:border-teal-bright"
            />
            <button
              type="submit"
              className="rounded-md bg-teal-bright px-5 py-3 text-sm font-semibold text-ink hover:bg-teal"
            >
              Audit your site
            </button>
          </form>
          <p className="mt-3 text-xs text-white/45">Free during beta · 5 audits / week</p>
        </div>
      </section>

      {/* Score mock — below fold */}
      <section className="border-b border-ink/5 bg-white px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-muted">audit://example.com</p>
              <h2 className="mt-1 text-2xl font-semibold">Complete · 24s</h2>
            </div>
            <span className="rounded-md bg-ok/10 px-2.5 py-1 text-xs font-medium text-ok">
              Sample report
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {SCORES.map((s, i) => (
              <ScoreRing key={s.label} label={s.label} value={s.value} delay={i * 0.08} />
            ))}
          </div>
          <div className="mt-8 rounded-lg border border-ink/8 bg-mist p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="rounded bg-critical/10 px-2 py-0.5 text-xs font-medium text-critical">
                  Critical
                </span>
                <p className="mt-2 font-medium">Missing meta description</p>
              </div>
              <button
                type="button"
                className="rounded-md border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium hover:border-teal"
              >
                Copy prompt
              </button>
            </div>
            <pre className="mt-4 overflow-x-auto rounded-md bg-ink p-4 font-mono text-xs leading-relaxed text-teal-bright/90">
{`You are working on the marketing site at example.com. Add a unique meta
description of 140–160 characters to <head> of the home page that includes
the primary keyword. Preserve all existing meta tags and layout...`}
            </pre>
          </div>
        </div>
      </section>

      <section id="features" className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">Ship AI-native web quality</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Everything you need to rank in Google, appear in AI answers, and pass the technical bar.
          </p>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {[
              {
                title: 'SEO, GEO & AEO in one pass',
                body: 'Titles, meta, headings, canonicals, sitemap, schema, OG — plus generative and answer-engine coverage.',
              },
              {
                title: 'Production-ready AI prompts',
                body: 'Every issue ships with a prompt tuned for Cursor, Claude Code, Codex CLI or Gemini CLI. One click, one paste.',
              },
              {
                title: 'Scores that mean something',
                body: 'Weighted, category-specific scoring — not vibes. Understand exactly where to invest next.',
              },
            ].map((f) => (
              <div key={f.title}>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="border-y border-ink/5 bg-white px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">From URL to fixed website</h2>
          <p className="mt-3 text-muted">No configuration. Paste a URL and start shipping fixes.</p>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['01', 'Paste a URL', 'Point SiteLens at any public page.'],
              ['02', 'We crawl & analyze', 'SEO, GEO, AEO, technical, accessibility, AI visibility.'],
              ['03', 'We generate prompts', 'One production-ready prompt per issue for your AI agent.'],
              ['04', 'Paste. Fix. Ship.', 'Copy into Cursor, Claude Code, Codex or Gemini CLI.'],
            ].map(([n, t, d]) => (
              <li key={n}>
                <span className="font-mono text-sm text-teal">{n}</span>
                <h3 className="mt-2 font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="faq" className="px-5 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl text-ink">Answers first</h2>
          <dl className="mt-10 space-y-8">
            {[
              [
                'Which AI coding agents do the prompts work with?',
                'Cursor, Claude Code, Codex CLI, Gemini CLI, Windsurf, and any tool that accepts a natural-language coding prompt.',
              ],
              [
                'Is my data private?',
                'Audits are scoped to your account. Nothing is shared or resold.',
              ],
              [
                'How many audits can I run?',
                'During the free beta, every account gets 5 audits every 7 days. Credits reset each week.',
              ],
              [
                'Does it modify my site?',
                'No. SiteLens is read-only — you decide when and how to apply each prompt.',
              ],
            ].map(([q, a]) => (
              <div key={q}>
                <dt className="font-semibold">{q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-ink px-5 py-20 text-center text-white">
        <h2 className="font-display text-3xl sm:text-4xl">Free during beta. No credit card.</h2>
        <p className="mx-auto mt-3 max-w-lg text-white/65">
          Get 5 full audits every week — with AI prompts for every issue.
        </p>
        <Link
          to="/register"
          className="mt-8 inline-block rounded-md bg-teal-bright px-6 py-3 text-sm font-semibold text-ink hover:bg-teal"
        >
          Start free
        </Link>
      </section>

      <footer className="border-t border-ink/5 bg-mist px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <span className="font-display text-lg text-ink">SiteLens</span>
          <span>© 2026 SiteLens. Built for indie hackers, founders, and agencies.</span>
        </div>
      </footer>
    </div>
  )
}

function ScoreRing({
  label,
  value,
  delay,
}: {
  label: string
  value: number
  delay: number
}) {
  const r = 28
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-ink/8 bg-mist/60 px-3 py-4">
      <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#e8eef4" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="#14b8a6"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          className="score-ring"
          style={
            {
              strokeDashoffset: offset,
              '--score-offset': offset,
              animationDelay: `${delay}s`,
            } as CSSProperties
          }
        />
      </svg>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
      <p className="text-center text-xs text-muted">{label}</p>
    </div>
  )
}
