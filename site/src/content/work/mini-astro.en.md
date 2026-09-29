---
slug: mini-astro
lang: en
order: 14
title: A static site generator of my own
project: mini-astro
headline: "Understanding how a static site generator works inside by building one: a single dependency, used only by the dev server, and no client-side runtime. It doesn't compete with Astro; this portfolio runs on it."
domain: Personal project · Open source (MIT)
role: Sole author · design, development and maintenance
period: 2026 – present
featured: false
links:
  - label: Source on GitHub
    href: https://github.com/ivansantander-hub/mini-astro
summary:
  - k: The problem
    v: "I knew how to use a site generator, not how one works inside."
  - k: The decision
    v: "Write one: composing HTML is a small problem, cheap to maintain."
  - k: How it ended
    v: "Open source under MIT on GitHub; this portfolio is built with it."
metrics:
  - value: "1"
    label: "dependency (for `dev` only)"
  - value: "0"
    label: "client-side runtime"
  - value: "55"
    label: "tests with `node --test`"
  - value: "~2,300"
    label: "lines of JavaScript"
stack:
  - Node.js
  - JavaScript
tags:
  - personal project
  - tooling
  - open source
---

mini-astro composes HTML components with `<mini-include src="organisms/Hero" />` and provides file-based routing, templates with slots, an Atomic Design structure, global data in JSON or JavaScript and a dev server with live reload. It ships no runtime to the browser: what goes out is HTML, CSS and any hand-written scripts. It is about 2,300 lines of JavaScript for Node 18 or later, roughly 840 of which are the scaffold for a new project.

## Why not just use Astro

Astro is better, by a wide margin: islands, integrations, image optimization, an ecosystem and a full-time team. mini-astro is in alpha (version 0.2.0) and I maintain it on my own. If the question were which tool is best, the answer would be Astro. Writing one anyway rests on other reasons:

- **Understanding the mechanics.** Component resolution, composition order, template substitution, watcher invalidation, static asset syncing: these are decisions you don't see until you have to make them. The goal isn't to replace anything.
- **Bounded cost.** An SSG that composes HTML is a small, well-defined problem, and maintaining it costs little. A homegrown ORM or UI framework doesn't meet that bar, which is why I haven't written one.
- **Concrete needs, directly.** This portfolio needs Markdown content collections, bilingual routing and its own image pipeline. With a third-party framework that means plugins and working around other people's decisions; here they're scripts that run before and after `mini-astro build`.

## How it works inside

**A single render pass.** One regular expression matches `{{{ var }}}` (raw HTML), `{{ var }}` (escaped) and `<mini-include … />`, and the output is never scanned again: if a data value contains `{{ something }}`, it is printed as is instead of being evaluated. Attributes may contain `>` inside quotes, and hyphens (`data-id`, `aria-label`).

**Include resolution.** `./X` and `../atoms/X` resolve relative to the including file; `atoms/X`, relative to `src/`; a bare name is looked up in `atoms/`, `molecules/` and `organisms/`, in that order. If nothing matches, the build fails and the error lists the paths it tried. A circular include stops with the full chain, and nesting is capped at 20 levels.

**Props and context.** The attributes of `<mini-include>` are the component's props and are layered over the includer's context; their values can reference it (`href="{{ base }}/x"`). A page's context follows a fixed precedence: template frontmatter < page frontmatter < `site`. `site` comes from `src/data/`: each `*.json` or `*.js` file (an object, or a possibly async function) becomes `site.<name>`.

**Templates and slots.** A page picks its template with `layout` in its frontmatter (`Base` by default), and its content goes into the template's `<slot />` or `<!-- @slot -->`. A template without a slot, or a `layout` that doesn't exist, is a build error, not an empty page.

**Clean routes.** `pages/about.html` becomes `about/index.html` and `pages/blog/index.html` becomes `blog/index.html`. If `x.html` and `x/index.html` would produce the same URL, the build stops.

**No leftover output.** Every build records the files it wrote in `.mini-astro/manifest.json`. The next one deletes those it no longer produces (renamed pages, removed static files) and never touches files mini-astro didn't write.

**Dev server.** It's `node:http`, no framework. The watcher covers `src/`, `public/`, the data folder and the config file; changes are debounced for 50 ms and rebuilds are serialized so two quick saves don't overlap. Reload goes over Server-Sent Events with a script served as its own file, compatible with a `script-src 'self'` CSP. If a build fails, the server stays up: pages return a 500 with the error, which reloads itself once fixed, and static assets keep being served. Paths are decoded and cannot escape `dist/`.

**Project setup.** `mini-astro init` asks for the name, cookie banner, policy pages, CSP, port (2323 by default) and package manager (pnpm, yarn or npm). All prompts share a single line reader, so it can also be scripted through a pipe: `printf 'mysite\nn\nn\nn\n4321\nnpm\n' | mini-astro init`. There are also commands to scaffold routes, components and templates, plus bash and zsh completion.

## Design decisions

**Atomic Design as the folder structure.** The `atoms/`, `molecules/`, `organisms/`, `templates/` and `pages/` folders are part of how the tool works: an include without a path is looked up in them. *Trade-off:* the organization is built in rather than left to convention, and in exchange the project has to fit that structure.

**Secure defaults.** The build injects a Content-Security-Policy meta tag into every page that doesn't declare its own; by default it's strict (`default-src 'self'`, `object-src 'none'`), and the config accepts `true`, a custom policy or `false`. `{{ var }}` escapes HTML, and skipping that takes an explicit `{{{ var }}}`. If enabled at project creation, a cookie banner and policy pages are generated. *Trade-off:* a strict CSP breaks external fonts or scripts until they're declared, which is why the starter project already widens it for Google Fonts in its config.

**No client JavaScript except what you write.** No hydration, no runtime, no bundle. *Trade-off:* it gives up the island-based interactivity Astro offers, and in exchange the rest of the system gets much simpler.

**Loud errors instead of silence.** A missing component, invalid JSON or a config with impossible values (an `outDir` equal to the project root or overlapping `src/`) stops the build with the reason. *Trade-off:* a half-finished site won't build until it's fixed, but broken pages don't get published unnoticed.

**A single runtime dependency.** It's chokidar, and only the dev server uses it: it is loaded with a dynamic `import()` inside `dev` and, if it isn't available, the server still works without automatic reload. The build and the generated site have no dependencies at all. *Trade-off:* it's still declared under `dependencies`, so it gets installed with the package even though the build doesn't use it.

## Result

Open source under MIT, installable from GitHub with `npx github:ivansantander-hub/mini-astro init` (it isn't on the npm registry). This portfolio is built with it: its `package.json` installs it from GitHub, and its build is `mini-astro build` wrapped in its own content and image scripts. Most of its limits surface that way, through use, rather than through issues.

## What I'd do differently

Write the tests first. For a compiler they're easy to write (text in, text out), and I still tested it by hand in the browser for months. The tests came late, with version 0.2.0: there are 55 today, they run with `node --test` with no added dependencies, and they cover the build, the CLI, config, the dev server and frontmatter. That same version fixed bugs an early suite would have caught: errors that were silently ignored, `pages/` subfolders that built to `x/index/index.html`, and an `init` that, with piped input, exited successfully without creating anything.

The other risk to watch is that it grows too much. With your own tool it's tempting to add whatever each project asks for, and if mini-astro ends up looking like Astro, there's no point in having written it.
