# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Iván Santander's personal portfolio. Vanilla stack (no React/Vue/TS runtime), built with
`mini-astro` — his own static-site generator (`github:ivansantander-hub/mini-astro`, pulled in
as a normal dependency, not vendored in this repo). Deployed to Railway, live at
ivansantander.com.

**The repo is mid-redesign** (branch `redesign-26`, see `docs/PLAN-V3.md` and
`docs/DESIGN-DIRECTION.md` for the full brief). The old 2022 design (3D models, GSAP/Lenis
hero, `model-viewer`) is frozen and still served at `/v1/`; the new "v3" design
("Complejidad → Claridad") is what `site/site.config.mjs` and `site/scripts/build-content.mjs`
actually build today. **The root `README.md` and `tests/e2e.spec.js` describe the old v1
architecture and are out of sync with the current build** — don't treat them as ground truth;
verify current behavior against `site/site.config.mjs`, `site/scripts/build-content.mjs`, and
`site/src/templates/Doc.html` instead.

## Commands

Run from the repo root (pnpm workspace, single package `site`):

```bash
pnpm dev      # kill port 3000 → build content → sync static assets → mini-astro dev (live reload)
pnpm build    # build-content.mjs → mini-astro build → prune-dist.mjs → sync-static.mjs
pnpm serve    # serve site/dist on http://127.0.0.1:3000 (static, no rebuild)
pnpm start    # production entrypoint used by Railway: node scripts/serve-static.mjs (requires site/dist to exist)
pnpm test     # Playwright suite (npx playwright test), auto-starts `pnpm serve` as webServer
```

Playwright first-time setup: `npx playwright install chromium`. Run a single test / debug UI:

```bash
npx playwright test -g "test name"
npx playwright test --ui
```

Inside `site/` there are additional scripts (`pnpm --filter portfolio-site run <script>` from
root, or `cd site && npm run <script>`):

```bash
npm run build:content   # just build-content.mjs (content collections + i18n → .build/pages)
npm run og               # regenerate public/img/og.png (scripts/gen-og.mjs)
npm run audit:seo        # audit-semantics.mjs + check-jsonld.mjs against dist/ (exit 1 on failure)
node scripts/graph-snapshot.mjs   # render the hero graph's SVG states with the same seeded PRNG as the browser, for reviewing choreography without a screenshot
```

Palette and v1-link are env-driven, not code changes:

```bash
PALETTE=vermilion pnpm build     # 'ultramarine' | 'chartreuse' | 'vermilion' | 'copper'
PALETTE_PICKER=1 pnpm dev        # inject a live palette picker (dev tool, not shipped)
LINK_V1=0 pnpm build             # drop the footer link to the frozen /v1/ site
```

## Architecture

### Build pipeline (`site/package.json` → `build`)

1. **`scripts/build-content.mjs`** reads `src/content/{pages,work}/*.{es,en}.md` (gray-matter
   frontmatter + markdown body) and generates `.build/pages/**.html` — one file per
   locale/route, with a `layout: Doc` frontmatter block, embedded JSON-LD, and per-page
   `<title>`/`<meta description>`. It also writes `public/sitemap.xml` and `public/robots.txt`.
   Then it copies `src/{templates,atoms,molecules,organisms,data}/` and hand-written
   `src/pages/*.html` (e.g. `v1.html`) into `.build/`.
2. **`mini-astro build`** reads `.build/` (never `src/` directly — see `mini-astro.config.js`,
   `srcDir: '.build'`) and resolves `<mini-include src="organisms/Foo" />` at build time,
   producing flat HTML in `dist/`. `.build/` is fully disposable and gitignored; it's rebuilt
   from scratch every time so there's never a stale-artifact-in-git problem.
3. **`scripts/prune-dist.mjs`** removes any `dist/` route folder that `.build/pages` no longer
   produces (mini-astro doesn't clean up after itself, so a renamed/deleted route would
   otherwise stay published and get indexed as a duplicate).
4. **`scripts/sync-static.mjs`** copies `public/{css,js,img,audio,proto}` → `dist/`, copies
   vendor JS (GSAP, ScrollTrigger, Lenis, model-viewer) from `node_modules` → `dist/vendor/`
   (never CDN-loaded), and copies only the actually-used font weight files from
   `@fontsource*` packages → `dist/fonts/`. `models-3d/` (~87 MB, only used by `/v1/`) is
   copied once and skipped on subsequent builds. File copies are done one-by-one so a
   Windows `EBUSY`/`EPERM` lock (e.g. a browser holding an image open) warns and skips
   instead of failing the whole build.

### Content collections & i18n

Two collections under `site/src/content/`:

- **`pages/{home,about}.{es,en}.md`** — free-form prose parsed section-by-section: `## name`
  headers become sections, `**key:** value` lines inside become fields (value can span
  multiple lines until the next `**key:**` or a `---` separator). Parsed by `parseSections()`
  in `build-content.mjs`; consumed by `renderHome()` / `renderAbout()`.
- **`work/<slug>.{es,en}.md`** — case studies with structured frontmatter (`title`, `headline`,
  `domain`, `role`, `period`, `stack`, `metrics`, `links`, `summary`, `confidential`, `order`)
  plus a markdown body. Rendered by `renderCase()` into `/trabajo/<slug>/` (ES) and
  `/en/work/<slug>/` (EN).

Every content file **must** be named `<slug>.<es|en>.md` — the loader throws if the language
suffix is missing. CRLF line endings are normalized on read (a lone `\r` before `**key:**`
used to silently break field parsing).

Routing: ES lives at the root (`/`, `/trabajo/`, `/sobre-mi/`), EN under `/en/`
(`/en/`, `/en/work/`, `/en/about/`). Quirk: because mini-astro would turn
`pages/en/index.html` into `/en/index/`, the EN homepage is emitted as `pages/en.html` instead
so it resolves to `/en/`. A generated page throws a build error if its output path collides
with a hand-written file in `src/pages/`.

Disclosure rule baked into the content itself (see `docs/PLAN-V3.md` §9.1, NDA in effect):
hard numbers and metrics only ever come from Iván's own projects (SGC, blog-26, mini-astro,
scrum-poker). Employer work is described qualitatively — problem class, decisions, role — with
no counts, metrics, names, or screenshots of employer systems.

### Atomic design components (`site/src/`)

`atoms/`, `molecules/`, `organisms/`, `templates/` — resolved via `<mini-include src="..." />`.
`templates/Doc.html` is the current layout used by every generated content page (theme toggle,
lang toggle, canvas-based background shader, JSON-LD slot, footer). `templates/Base.html` plus
the `organisms/Project*.html`/`HeroSection.html`/etc. files are the old v1 template tree, still
built for the frozen `/v1/` route via the hand-written `src/pages/v1.html`.

### Design tokens & theming

`public/css/quarks/tokens.css` (`@layer tokens`) defines the whole system: fluid type scale via
`clamp()`, spacing scale, named z-index layers, motion durations/easings. **The UI is
intentionally monochrome** — color/accent comes from a live canvas shader
(`public/js/shader.js`) reading the active palette, not from a flat CSS palette; layering a
separate color system on top would visually compete with the shader. `data-palette` on
`<html>` selects one of the four palettes defined in `site.config.mjs`; `data-theme`
(light/dark) is set from `localStorage` synchronously in `<head>` to avoid a flash.

Typography is one variable font family stretched to different widths (`font-stretch`, not
`font-variation-settings`) rather than mixing families — see `docs/DESIGN-DIRECTION.md` §3 for
the full rationale and the exact `wdth`/`wght` axis ranges.

### SEO / structured data

JSON-LD is embedded inline in every page's `<script type="application/ld+json">` — a loose
`.jsonld` file in `public/` is not read by crawlers, so don't reintroduce that pattern.
`scripts/audit-semantics.mjs` and `scripts/check-jsonld.mjs` validate the **built output** in
`dist/` (heading hierarchy, landmarks, metadata completeness) and exit 1 on failure; run them
after a build, not against source.

**Every content/positioning change must be reflected in SEO, in the same pass — not as a
follow-up.** This bit us once already (2026-08-07, see `docs/BITACORA.md`): the hero statement
changed but `home.{es,en}.md`'s frontmatter `title`/`description` and `scripts/gen-og.mjs`'s
hardcoded OG-image tagline stayed on the old copy for a full session, so Google's indexed
snippet and the LinkedIn/X share card both quoted a line that no longer existed on the page.
When you change hero/thesis copy or the core positioning, check and update in the same pass:
`title`/`description` in `site/src/content/pages/home.es.md` and `home.en.md`, the tagline
string in `site/scripts/gen-og.mjs` (then run `npm run og` to regenerate `public/img/og.png`),
and the `favicon` — it's a real crawlable file (`public/img/favicon.svg`/`.png`), not a `data:`
URI, specifically so Google can index it instead of falling back to a generic icon.

### Root-level scripts (`/scripts`, not `site/scripts`)

- `scripts/serve-static.mjs` — production server entrypoint (`pnpm start`), spawns `serve` on
  `site/dist`, used by `railway.toml`'s deploy `startCommand`. Errors if `site/dist` doesn't
  exist yet — always `pnpm build` first.
- `scripts/github-metadata.mjs` — one-off tool to backfill description/topics on Iván's GitHub
  repos via a `GITHUB_TOKEN` env var (never written to a file). Not part of the site build.

### Deployment

Railway (`railway.toml`): build = `pnpm install --frozen-lockfile && pnpm run build`,
start = `pnpm run start`, healthcheck on `/`.
