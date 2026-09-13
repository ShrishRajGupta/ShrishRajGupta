# CLAUDE.md — shrishrajgupta.vercel.app one-pager

Agent-facing instructions for working on this site. The human-facing companion
doc is [README.md](README.md) in this same folder — keep the two consistent
when anything here changes.

## What this folder is

A single-page portfolio site for Shrish Raj Gupta, deployed to
**https://shrishrajgupta.vercel.app** on Vercel's free Hobby tier.

It is **not** the GitHub Pages site. The owner runs two separate sites:

| Site | Lives | Deploys via | Look |
|---|---|---|---|
| Gruvbox terminal site | root of the `ShrishRajGupta/ShrishRajGupta` repo | GitHub Pages (`main`) | monospace, gruvbox palette |
| **This one-pager** | this folder (`vercel/` inside that repo) | Vercel CLI | modern two-pane, amber accent |

The two sites never share files. Both have their own `index.html` and
stylesheet, which is exactly why this one lives in a subfolder in the repo —
merging it to the repo root would collide with the Pages site. This folder is
fully self-contained: everything the deployed site needs is here.

Files:

```
index.html              the whole page (semantic HTML, inline SVG icons)
styles.css              the single stylesheet — both themes
script.js               theme toggle, scroll spy, reveal-on-scroll (vanilla)
vercel.json             cleanUrls + security headers
Shrish_Resume_SDE.pdf   linked from the header Resume button
CLAUDE.md / README.md   this doc and its human-facing companion
```

## Hard rules — the owner's explicit taste

The brief for this site was: **minimalist, classic, for human consumption —
no bloat, no AI slop**. Concretely:

- **No frameworks, no build step, no npm dependencies.** Plain HTML + one
  stylesheet + vanilla JS is the architecture, not a placeholder for one.
- **No jQuery.** It was deliberately removed from the owner's other site;
  do not reintroduce it here.
- **No trackers or analytics.** The footer says "no frameworks, no trackers"
  — keep it true.
- **One stylesheet** (`styles.css`). Don't split it, don't add a second.
- **No AI-slop frontend.** That means: no gradient hero banners, no
  glassmorphism, no emoji in headings, no badge/shield clutter, no decorative
  animation beyond the existing subtle section reveal. Google Fonts
  (Space Grotesk + Inter) is the only permitted external request.
- **Content stays resume-truthful.** Never invent or "round up" ratings,
  dates, metrics, company names, or repo URLs. Every number on the page
  (LeetCode 1985/Knight/Top 3%, Codeforces 1431/Specialist, the Groww
  percentages, CPI) comes from the owner's SDE resume. When adding a project
  link, verify the repo actually exists under the **ShrishRajGupta** GitHub
  account first (repo names are case-quirky: `Workplace`, `PortfolioGroww`,
  `dayNews`). If a fact isn't in the resume or verifiable, ask — don't guess.

## Design tokens

All color lives in CSS custom properties. **Never hard-code a color in a
rule** — add or change tokens instead.

| Token | Dark (base) | Light |
|---|---|---|
| `--bg` | `#0f0e0c` | `#faf9f6` |
| `--fg` | `#e9e6df` | `#211f1a` |
| `--muted` | `#a09a8e` | `#6e6a60` |
| `--accent` | `#e3b458` | `#8a5c00` |
| `--line` | `rgba(233, 230, 223, 0.14)` | `rgba(33, 31, 26, 0.14)` |
| `--tag-bg` | `rgba(227, 180, 88, 0.09)` | `rgba(138, 92, 0, 0.07)` |
| `color-scheme` | `dark` | `light` |

**Any token change must be applied in all three places** in `styles.css`, or
the theme toggle desyncs from the system preference:

1. the dark base — bare `:root`
2. the system-light block — `@media (prefers-color-scheme: light)` guarded as
   `:root:not([data-theme="dark"])`
3. the explicit override — `:root[data-theme="light"]`

(Blocks 2 and 3 carry identical values by design; the duplication is the
mechanism that lets an explicit toggle beat the media query in both
directions.)

## Theming contract

- **Dark is the base theme.** With no `data-theme` attribute on `<html>`, the
  page follows the system via `prefers-color-scheme`.
- An explicit `html[data-theme="dark"|"light"]` always wins over the system.
- The **inline script in the `<head>` of `index.html`** reads localStorage key
  `theme` and stamps `data-theme` before first paint. It must stay inline and
  before the stylesheet-dependent render — moving it into `script.js` (which
  is deferred) reintroduces a theme flash.
- `script.js` owns the toggle. Convention: the button shows the icon of the
  theme a click will switch **to** (sun shown while dark, moon while light).
  `syncIcon()` derives this from the *effective* theme (explicit attribute,
  else system), not from localStorage alone.

## Known gotchas (all learned the hard way in this codebase)

- **SVG ignores the HTML `hidden` attribute.** The UA's `[hidden]` rule only
  covers HTML-namespace elements, and `SVGElement` has no `.hidden` IDL
  property. The stylesheet therefore carries a namespace-agnostic
  `[hidden] { display: none !important; }` rule, and JS must use
  `setAttribute`/`removeAttribute`/`toggleAttribute('hidden', …)` on SVGs —
  never the `.hidden` property. Symptom if regressed: all toggle icons render
  at once.
- **Headless Chromium defaults to `prefers-color-scheme: light`.** To
  screenshot the dark theme in Playwright, set
  `document.documentElement.setAttribute('data-theme', 'dark')` first — don't
  assume the default view is dark like it is on most real desktops.
- **Reveal-on-scroll blanks full-page screenshots.** Sections below the fold
  sit at `opacity: 0` until their IntersectionObserver fires, and Playwright's
  full-page capture doesn't reliably trigger it. Before a full-page
  screenshot, pre-add the class:
  `document.querySelectorAll('main section').forEach(s => s.classList.add('revealed'))`.
- **Scroll-spy tuning.** The nav highlight uses an IntersectionObserver with
  `rootMargin: '-40% 0px -55% 0px'` — a band around the viewport's middle. If
  section heights change materially (a much longer Experience list, a new
  section), re-check that every section can still win the highlight and
  retune the margins if needed.
- **Reduced motion is honored.** `@media (prefers-reduced-motion: reduce)`
  disables smooth scroll and the reveal transition. Any new animation must sit
  behind the same guard.

## Layout system

- Page grid: `max-width: 1120px`, two columns —
  `minmax(280px, 38%)` for the left pane, rest for content.
- Left pane is `position: sticky` at full viewport height (`100dvh`),
  flex column with `justify-content: space-between`: identity + nav on top,
  socials / Resume button / theme toggle pinned at the bottom.
- **Single breakpoint at 900px**: the grid collapses to one column, the side
  pane becomes static, and the section nav is hidden — that's by design, not
  an oversight. Mobile gets the compact header + socials row instead.
- Entries (experience/projects) are a `9.5rem | 1fr` grid (date | body) that
  stacks below the breakpoint.
- The page must never scroll horizontally at 400px width.

## Validation loop — mandatory before calling any change done

1. Serve the folder locally: `python3 -m http.server <port>`.
2. Playwright full-page screenshots at desktop (~1280px) **and** 400px width,
   in **both** themes (remember the dark-forcing and pre-reveal gotchas
   above). Eyeball them.
3. Confirm no horizontal scroll at 400px.
4. `curl` every external href. GitHub links must return 200.
   **Codeforces / LeetCode / LinkedIn returning 403/429 to curl is
   bot-blocking, not breakage** — verify those URLs against the resume
   instead of chasing the status code.
5. Confirm `/Shrish_Resume_SDE.pdf` returns 200 (locally, and on production
   after a deploy).

## Deployment runbook

- Hosting: **Vercel Hobby tier** (free). Project **`shrishrajgupta`** on the
  owner's personal Vercel scope; production alias
  **https://shrishrajgupta.vercel.app**.
- The Vercel CLI is installed globally via npm (`vercel` on PATH). Deploy from
  this folder:

  ```
  vercel deploy --prod --yes
  ```

  Then verify: `curl -s -o /dev/null -w "%{http_code}" https://shrishrajgupta.vercel.app/`
  (expect 200), and the same for the resume PDF.
- **Login** uses the device-code flow (`vercel login`): it prints a
  `vercel.com/oauth/device?user_code=…` URL, the owner confirms in the
  browser, the CLI polls until then. Two operational notes from experience:
  - Running it via `npx` under Claude Code's sandboxed package-manager
    wrapper **kills the polling process** — invoke the installed `vercel`
    binary directly instead.
  - It blocks for as long as the owner takes to confirm — run it as a
    background task, extract the URL from its output for the owner, and wait
    for the completion notification. Codes expire in minutes; mint a fresh
    one if stale.
- `vercel.json` sets `cleanUrls` and `X-Content-Type-Options: nosniff` +
  `X-Frame-Options: DENY`. Keep it that lean.
- `.vercel/` and `.env*` are gitignored (created by `vercel link`) — never
  commit them.

## Git / PR conventions

- This site ships **via Vercel, not GitHub Pages**. In the
  `ShrishRajGupta/ShrishRajGupta` repo it lives under the `vercel/` subfolder
  and is deliberately kept **off `main`** (main deploys the Pages site) — PRs
  for it target a non-main base branch by the owner's request.
- Pushes go through the owner's fork; PRs are raised against the
  `ShrishRajGupta` account.
- **Never `git add`/`commit`/`push` without the owner's explicit ask.** Build,
  validate, report — then wait for the word.
- If Vercel's git integration is ever connected for push-to-deploy, the
  project's Root Directory must be set to `vercel/`.
