---
slug: mini-astro
lang: en
order: 4
title: A static site generator of my own
project: mini-astro
headline: A static site generator with one dependency, Atomic Design and secure defaults. It doesn't compete with Astro; I built it to learn, and this portfolio runs on it.
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
    v: "I knew how to use a site generator, but not really how one works inside."
  - k: The decision
    v: "Write one, since an SSG that composes HTML is a small problem and cheap to maintain."
  - k: How it ended
    v: "It's published under MIT and I use it to build this portfolio."
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

A static site generator. HTML components are composed with `<mini-include src="organisms/Hero" />`, and it has file-based routing, templates with slots, an Atomic Design structure and a dev server with live reload. It uses a single production dependency and ships no runtime to the browser.

This portfolio is built with it.

## Why not just use Astro?

Astro is better, by a wide margin: it has islands, integrations, image optimization, an ecosystem and people working on it full-time. mini-astro is in alpha and I maintain it on my own. If the only question were which tool is best, the sensible answer would be Astro.

So I needed to be clear about why it was worth building anyway.

## Why I wrote it

**To understand how one works inside.** I wasn't trying to replace anything. I wanted a close look at things like component resolution, composition order, template substitution, watcher invalidation and static asset syncing. You don't really see those decisions until you have to make them yourself.

**Because the cost was bounded.** An SSG that composes HTML is a small, well-defined problem, and maintaining it costs me little. My own ORM or UI framework would be a different story, since there the cost isn't bounded, which is why I haven't done that.

**Because it lets me build what I need directly.** This portfolio needs Markdown content collections, bilingual routing and its own image pipeline. With a third-party framework that means plugins and working around other people's decisions; with mine, they're just functions.

## How it's set up

**Atomic Design as the folder structure.** The `atoms/`, `molecules/`, `organisms/`, `templates/` and `pages/` folders are part of how the tool works, so the organization is built in rather than left to convention.

**Secure defaults.** If you enable them when creating the project, it generates content policy headers, a cookie banner and policy pages. These tend to get put off, and having them as defaults helps make sure they don't get forgotten.

**No client JavaScript except what you write.** No hydration, no runtime, no bundle: what ships is HTML, CSS and any scripts you added by hand. That constraint keeps the rest a lot simpler.

**A single dependency.** The file watcher, and only in development. Fewer dependencies also means fewer vulnerabilities to patch.

## Release and use

It's MIT-licensed and installs from GitHub, with interactive setup and commands to scaffold routes and components.

I use it for this portfolio, and I find most of its limits that way, while building, rather than through issues.

## What I'd do differently, and what I want to avoid

I should have written the tests first. For a compiler they're easy to write (text in, text out), and I still tested it by hand in the browser.

I also want to keep it from growing too much. With your own tool it's tempting to keep adding whatever each project asks for, but if mini-astro ends up looking like Astro, there's no point in having written it.
