const VIMEO_ID = '1214753405'

/**
 * Real Vimeo embed — compact PromptAudit-style player with creator credit.
 * Exact 16:9 so the player has no white side bars.
 * @see https://vimeo.com/1214753405
 */
export function DemoVideo() {
  return (
    <div className="relative mx-auto w-full">
      <div className="pointer-events-none absolute -inset-4 rounded-2xl bg-[var(--accent)]/10 blur-2xl" />

      <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-black shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex items-start gap-1.5 sm:left-3 sm:top-3">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8b5a2b] text-xs font-semibold text-white shadow"
            aria-hidden
          >
            U
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="w-fit rounded bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-semibold text-[#041016]">
              sitelens_demo
            </span>
            <span className="w-fit rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              umar faiz
            </span>
          </div>
        </div>

        <div className="relative aspect-video w-full bg-black">
          <iframe
            title="SiteLens demo — umar faiz"
            src={`https://player.vimeo.com/video/${VIMEO_ID}?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0&dnt=1`}
            className="absolute inset-0 h-full w-full border-0 bg-black"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>

      <p className="mt-2.5 text-center text-[11px] text-[var(--fg-subtle)]">
        Demo by <span className="font-medium text-[var(--fg-muted)]">umar faiz</span>
        {' · '}
        <a
          href="https://vimeo.com/1214753405"
          target="_blank"
          rel="noreferrer"
          className="hover:text-[var(--accent)]"
        >
          Watch on Vimeo
        </a>
      </p>
    </div>
  )
}
