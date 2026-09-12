# shrishrajgupta.vercel.app

Personal one-pager portfolio for **Shrish Raj Gupta** — Software Engineer at BrowserStack.

**Live:** <https://shrishrajgupta.vercel.app>

A single static page: sticky two-pane layout, dark/light theming, scroll-spy navigation, and content synced to the current SDE resume. Built by hand with plain HTML, one stylesheet, and a small vanilla-JS file. No frameworks, no build step, no trackers.

> This site is deliberately separate from the GitHub Pages site (the gruvbox terminal-style page at the repository root, served at `shrishrajgupta.github.io/ShrishRajGupta/`). Same facts, two designs, two hosts.

---

## Design philosophy

- **Minimal by construction, not by minification.** The page is small because it contains only what it needs: one HTML file, one stylesheet, one script. There is no framework to tree-shake and no bundle to analyze.
- **Human-made, classic, for human consumption.** Typography-led layout, hairline dividers, one accent color, restrained motion. No gradient heroes, no glassmorphism, no decorative noise.
- **Zero dependencies at runtime except fonts.** Google Fonts (Space Grotesk + Inter) is the only external request. Icons are inline SVG. Everything else ships in the repo.
- **Progressive enhancement.** With JavaScript disabled the full page renders and reads normally; JS only adds the theme toggle, scroll-spy highlighting, and reveal-on-scroll.

## File map

| File | Purpose |
|---|---|
| `index.html` | All content and markup; meta/OG tags; inline SVG icons; a tiny inline script that applies a stored theme before first paint |
| `styles.css` | The entire design system: theme tokens for both palettes, layout grid, components, motion, responsive rules |
| `script.js` | Theme toggle, IntersectionObserver scroll-spy, reveal-on-scroll (~55 lines, no dependencies) |
| `vercel.json` | Hosting config: clean URLs and basic security headers |
| `Shrish_Resume_SDE.pdf` | The resume linked from the header `Resume` button |
| `README.md` | This file |
| `CLAUDE.md` | Working conventions for AI assistants editing this site |
| `.gitignore` | Ignores `.vercel/`, `.env*`, and local tooling artifacts |

Local-only artifacts that never belong in commits: `.vercel/` (project link metadata written by the Vercel CLI) and `.env.local` (created by `vercel link`).

## Design system

### Color

All colors are CSS custom properties defined in `styles.css`. Dark is the base; light overrides the same tokens.

**Dark (default):**

| Token | Value | Used for |
|---|---|---|
| `--bg` | `#0f0e0c` | Page background (warm near-black) |
| `--fg` | `#e9e6df` | Primary text |
| `--muted` | `#a09a8e` | Secondary text, dates, nav idle state |
| `--accent` | `#e3b458` | Links, active states, stat numbers, tags (amber) |
| `--line` | `rgba(233, 230, 223, 0.14)` | Hairline borders and dividers |
| `--tag-bg` | `rgba(227, 180, 88, 0.09)` | Tag pill fill |

**Light:**

| Token | Value | Used for |
|---|---|---|
| `--bg` | `#faf9f6` | Page background (warm paper) |
| `--fg` | `#211f1a` | Primary text |
| `--muted` | `#6e6a60` | Secondary text |
| `--accent` | `#8a5c00` | Accent — deliberately darker amber for contrast on paper |
| `--line` | `rgba(33, 31, 26, 0.14)` | Hairline borders |
| `--tag-bg` | `rgba(138, 92, 0, 0.07)` | Tag pill fill |

Each palette also sets the CSS `color-scheme` property (`dark` / `light`) so native UI — scrollbars, form controls — matches the theme.

### Typography

| Font | Weights | Role |
|---|---|---|
| Space Grotesk | 500, 600 | Display: name, section headings, entry titles, stat numbers, email |
| Inter | 400, 500 | Body text and UI |

Both load from Google Fonts with `display=swap` and `preconnect` hints; the fallback stack is `system-ui`. Body line-height is 1.65; the name scales with `clamp(2rem, 3.5vw, 2.7rem)`.

### Layout

- **Two-pane grid**, max width `1120px`: left pane `minmax(280px, 38%)`, right pane fluid, `4rem` gap.
- The **left pane is sticky** (`position: sticky; top: 0`) and full-viewport-height (`100vh` with `100dvh` override), flexed to push socials/resume/toggle to the bottom.
- The left pane holds the name, role, one-line intro, and a **vertical section nav** whose items carry an animated indicator bar (widens and turns amber on hover/active).
- The right pane holds the sections: About, Experience (including an education entry), Projects, Skills (including competitive-programming stat cards), Contact.
- Experience and project entries are a `9.5rem 1fr` grid: date column left, content right, separated by hairlines.
- **Below `900px`** everything collapses to a single column, the sticky behavior and section nav are dropped, and entry grids stack. Verified down to 400px with no horizontal scroll.

## Theming architecture

Three layers, so system preference and explicit choice compose correctly:

1. **Dark base** — tokens on `:root`. With no other signal, the page is dark.
2. **System light** — a `@media (prefers-color-scheme: light)` block redefines the tokens, guarded with `:root:not([data-theme="dark"])` so an explicit dark choice beats a light system preference.
3. **Explicit choice** — `:root[data-theme="light"]` redefines the tokens again so the toggle wins in both directions. `data-theme` absent means "follow the system".

Two supporting pieces:

- **Pre-paint script** — a tiny inline `<script>` in `<head>` reads `localStorage` and sets `data-theme` *before* the first paint, so returning visitors never see a theme flash. It is wrapped in `try/catch` because storage access can throw (private windows, blocked storage).
- **Persistence** — the toggle stores `dark` or `light` under the `localStorage` key `theme`. No stored value means system-following behavior.

The toggle button shows the icon of the theme a click will switch **to** (sun while dark, moon while light).

## JavaScript behaviors

Everything lives in `script.js` inside one IIFE:

- **`.js` gating** — the script's first act is adding a `js` class to `<html>`. All reveal-on-scroll styling is scoped under `.js`, so without JavaScript every section is fully visible.
- **Theme toggle** — `effectiveTheme()` resolves the explicit `data-theme` attribute or falls back to `matchMedia('(prefers-color-scheme: light)')`; a click flips it, persists it, and re-syncs the icon.
- **Scroll spy** — an `IntersectionObserver` with `rootMargin: '-40% 0px -55% 0px'` (a narrow horizontal band around the reading line) marks the matching nav link `.active` as each section crosses it.
- **Reveal on scroll** — a second observer (`threshold: 0.1`) adds `.revealed` to each section the first time it enters the viewport, then unobserves it. The animation is a 14px fade-up over 0.5s.
- **Reduced motion** — under `prefers-reduced-motion: reduce`, smooth scrolling is disabled and sections render fully visible with no transitions.

## Accessibility

- Icon-only controls (social links, theme toggle) carry `aria-label`s; decorative SVGs are `aria-hidden`.
- `:focus-visible` gets a 2px accent outline with offset — keyboard navigation is first-class.
- The light-mode accent is `#8a5c00` rather than the dark-mode `#e3b458`, chosen for contrast against the paper background.
- `color-scheme` keeps native controls and scrollbars consistent with the active theme.
- Content order is sensible without CSS, and the page works without JavaScript.

## Local development

No build step. Serve the folder with any static server and open it:

```sh
python3 -m http.server 8874
# then visit http://localhost:8874/
```

Editing is: change the file, reload the browser.

## Deployment

Hosted on **Vercel** (Hobby tier — free) as a plain static deployment. Project name `shrishrajgupta`, which owns the production alias `shrishrajgupta.vercel.app`.

One-time setup on a new machine:

```sh
npm install -g vercel
vercel login               # device-code flow, confirm in browser
vercel link --yes --project shrishrajgupta
```

Deploy:

```sh
vercel deploy --prod --yes
```

Each deploy gets a unique immutable URL (`shrishrajgupta-<hash>-<scope>.vercel.app`); a production deploy is additionally **aliased** to `shrishrajgupta.vercel.app`, so the clean URL always points at the latest production deployment.

`vercel.json` sets:

- `cleanUrls: true` — serves `index.html` at `/` and strips `.html` extensions.
- `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY` on all routes — basic hardening for a static page.

If push-to-deploy is ever wanted, connect the Git repository in the Vercel dashboard; when the site lives in a subfolder (as in the `vercel/` copy inside the `ShrishRajGupta` repository), set the project's **Root Directory** accordingly.

## Updating content

All content lives in `index.html`. Map of resume facts to their home:

| Fact | Where |
|---|---|
| Name, role, one-line intro | Left pane (`header.side`) |
| Resume PDF | `Shrish_Resume_SDE.pdf` — replace the file, keep the filename (or update the header link) |
| Summary paragraphs | `#about` |
| Jobs: dates, titles, bullets, tags | `#experience` — one `article.entry` per role |
| Education + CPI | The `.entry.edu` article at the end of `#experience` |
| Projects: description, stack tags, repo links | `#projects` — one `article.entry` per project |
| Skill groups | The `<dl class="skills">` in `#skills` |
| LeetCode / Codeforces ratings | The `.stats` cards in `#skills` |
| Email | `#contact` and the socials list |

Two rules when editing:

1. **Never invent numbers or links.** Ratings, handles, and repo URLs come from the actual resume and the actual GitHub account. (Repo names are case-sensitive in spirit even where GitHub redirects — the canonical names here are `Workplace`, `PortfolioGroww`, `dayNews`, verified against the live account.)
2. **Keep both sites in sync.** The GitHub Pages site at the repository root carries the same facts; update both when the resume changes.

## Validation checklist

Before deploying:

- [ ] Serve locally and view **both themes** — toggle through them and also try with no stored theme (clear the `theme` key) to confirm system-following works.
- [ ] Check a **400px-wide viewport**: single column, no horizontal scroll.
- [ ] Click through every external link. GitHub links should return 200; Codeforces, LeetCode, and LinkedIn typically answer curl/bots with 403/429 — that is bot-blocking, not a broken link, but confirm the URLs in a real browser.
- [ ] Confirm `/Shrish_Resume_SDE.pdf` returns 200.
- [ ] Tab through the page once — focus outlines should be visible on every interactive element.
- [ ] After `vercel deploy --prod --yes`, re-check the live alias URL and the PDF.

## Gotchas (learned the hard way)

- **SVG ignores the `hidden` attribute by default.** The user-agent `[hidden] { display: none }` rule covers HTML-namespace elements only, and `SVGElement` has no `.hidden` IDL property. This project ships a namespace-agnostic `[hidden] { display: none !important; }` rule in `styles.css`, and `script.js` toggles the attribute with `toggleAttribute`/`setAttribute` — never the `.hidden` property. Without both, all theme-toggle icons render at once.
- **Headless browsers default to a light `prefers-color-scheme`.** When screenshotting the dark theme in Playwright or similar, set `data-theme="dark"` explicitly (or emulate the color scheme) — otherwise you are testing light mode twice.
- **Reveal-on-scroll vs full-page screenshots.** Sections start at `opacity: 0` until observed; a full-page screenshot can capture them un-revealed. In test scripts, add the `revealed` class to all sections first. The same caution applies to `loading="lazy"` images if any are added later — they may not have loaded when the screenshot fires.

## Related

- `CLAUDE.md` (same folder) — working conventions for AI assistants: what may be changed freely, what must never be invented, and how to validate.
- The GitHub Pages sibling site lives at the root of the [`ShrishRajGupta/ShrishRajGupta`](https://github.com/ShrishRajGupta/ShrishRajGupta) repository.

## License

MIT, via the parent repository's [LICENSE](https://github.com/ShrishRajGupta/ShrishRajGupta/blob/main/LICENSE).
