---
slug: mini-astro
lang: en
order: 4
title: Why I wrote my own site generator
project: mini-astro
headline: A single-dependency SSG with Atomic Design and security-first defaults. This portfolio runs on it.
domain: Personal project · Open source (MIT)
role: Author
period: 2026 – present
confidential: false
featured: false
links:
  - label: Source on GitHub
    href: https://github.com/ivansantander-hub/mini-astro
summary:
  - k: The problem
    v: "I knew how to use a site generator. I didn't know what one does inside."
  - k: The decision
    v: "Write it because the cost was bounded. An SSG that composes HTML is a small, closed problem."
  - k: How it ended
    v: "Published under MIT. And with the best possible test: I use it for something I care about."
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

## What it is

A static site generator. HTML components composed with `<mini-include src="organisms/Hero" />`, file-based routing, templates with slots, an Atomic Design structure and a dev server with live reload. One production dependency, zero browser runtime.

This portfolio is built with it.

## The uncomfortable question first

Is it better than Astro?

No. Astro has islands, integrations, image optimization, an ecosystem and full-time people. mini-astro is in alpha and I maintain it alone. If the criterion were "pick the best available tool," the right answer would be to use Astro and close the subject.

So the decision deserves a real justification. Not an excuse.

## Why I wrote it anyway

**To understand the category, not to replace it.** There's a difference between knowing how to use a site generator and knowing what one does inside: component resolution, composition order, template substitution, watcher invalidation, static asset syncing. Those decisions are invisible until you're the one making them.

**Because the cost was bounded.** An SSG that composes HTML is a small, well-defined problem — I know what maintaining it costs, and it's little. Writing my own ORM or my own UI framework would be the opposite decision with the same apparent logic. I haven't, because there the cost isn't bounded.

**Because owning the compiler changes what I can build.** This portfolio needs Markdown content collections, bilingual routing and its own image pipeline. With someone else's framework, those are plugins and accommodating decisions I didn't make. With mine, they're functions.

## The rules I gave it

**Atomic Design as filesystem structure, not convention.** The `atoms/`, `molecules/`, `organisms/`, `templates/` and `pages/` folders are part of the tool's contract. It enforces the discipline instead of suggesting it.

**Security-first defaults.** Content policy headers, a cookie banner and policy pages get generated if you enable them at project creation — they're the things everyone postpones, and a default skips the argument.

**Zero client JavaScript except what you write.** No hydration, no runtime, no bundle. What ships is HTML, CSS and whatever scripts you added by hand. It's the constraint that makes everything else simple.

**One dependency.** Just the file watcher, and only in development. Every dependency that isn't there is a vulnerability I don't have to patch.

## Published, and in use

Under the MIT license. Installs from GitHub, with interactive setup and commands to scaffold routes and components.

And it has the best possible test for a tool: I use it for something I care about. I find mini-astro's limits by building my own portfolio, not by reading issues.

## What shouldn't grow

The tests should have come first. A compiler is exactly the kind of software where tests are cheap — text in, text out — and I still built it by hand, checking in the browser.

And there's something that shouldn't happen: that it grows. The temptation with your own tool is to bolt on whatever the current project needs. If mini-astro starts looking like Astro, the reason for having written it stops making sense.
