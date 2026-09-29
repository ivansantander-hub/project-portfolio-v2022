---
slug: mini-astro
lang: en
order: 4
title: A static site generator of my own
project: mini-astro
headline: "Understanding how a static site generator works inside by building one: a single dependency and no client-side JavaScript. It doesn't compete with Astro; this portfolio runs on it."
domain: Personal project · Open source (MIT)
role: Sole author · design, development and maintenance
period: 2026 – present
confidential: false
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
    v: "Published under MIT; this portfolio is built with it."
metrics:
  - value: "1"
    label: "production dependency"
  - value: "0"
    label: "client-side JavaScript by default"
stack:
  - Node.js
  - JavaScript
tags:
  - personal project
  - tooling
  - open source
---

mini-astro composes HTML components with `<mini-include src="organisms/Hero" />` and provides file-based routing, templates with slots, an Atomic Design structure and a dev server with live reload. It ships no runtime to the browser.

## Why not just use Astro

Astro is better, by a wide margin: islands, integrations, image optimization, an ecosystem and a full-time team. mini-astro is in alpha and I maintain it on my own. If the question were which tool is best, the answer would be Astro. Writing one anyway rests on other reasons:

- **Understanding the mechanics.** Component resolution, composition order, template substitution, watcher invalidation, static asset syncing: these are decisions you don't see until you have to make them. The goal isn't to replace anything.
- **Bounded cost.** An SSG that composes HTML is a small, well-defined problem, and maintaining it costs little. A homegrown ORM or UI framework doesn't meet that bar, which is why I haven't written one.
- **Concrete needs, directly.** This portfolio needs Markdown content collections, bilingual routing and its own image pipeline. With a third-party framework that means plugins and working around other people's decisions; here they're just functions.

## Design decisions

**Atomic Design as the folder structure.** The `atoms/`, `molecules/`, `organisms/`, `templates/` and `pages/` folders are part of how the tool works. The organization is built in rather than left to convention; in exchange, the project has to fit that structure.

**Secure defaults.** If enabled at project creation, it generates content policy headers, a cookie banner and policy pages. These tend to get put off; having them from the start keeps them from being forgotten.

**No client JavaScript except what you write.** No hydration, no runtime, no bundle: what ships is HTML, CSS and any hand-written scripts. It gives up the island-based interactivity Astro offers, and in exchange the rest of the system gets much simpler.

**A single dependency.** The file watcher, and only in development. Fewer dependencies also means fewer vulnerabilities to patch.

## Result

Published under MIT and installable from GitHub, with interactive setup and commands to scaffold routes and components. This portfolio is built with it, and most of its limits surface that way, through use, rather than through issues.

## What I'd do differently

Write the tests first: for a compiler they're easy to write (text in, text out), and I still tested it by hand in the browser. The risk to watch is that it grows too much; with your own tool it's tempting to add whatever each project asks for, and if mini-astro ends up looking like Astro, there's no point in having written it.
