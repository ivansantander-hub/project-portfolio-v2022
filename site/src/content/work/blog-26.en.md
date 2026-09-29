---
slug: blog-26
lang: en
order: 15
title: The version history I rebuilt three times
project: blog-26
headline: Publishing on a static blog meant commit, push and build. The fix was a self-built CMS; its hard part, the version history, took three attempts.
domain: Personal project
role: Sole author · design and development
period: 2026
confidential: false
featured: false
links:
  - label: See the blog
    href: https://blog.ivansantander.com
summary:
  - k: The problem
    v: "Every note meant a commit, a push and waiting for a build."
  - k: The decision
    v: "Separate viewing a version from comparing versions, instead of patching the diff again."
  - k: How it ended
    v: "A self-built CMS with a visual editor, drafts, history and no third-party analytics."
metrics:
  - value: "3"
    label: "attempts before the diff worked"
  - value: "0"
    label: "third-party analytics dependencies"
stack:
  - Astro
  - TypeScript
  - PostgreSQL
  - Cloudflare R2
  - Milkdown
tags:
  - personal project
  - debugging
  - product
---

## The problem

The blog was static, with posts in Markdown. Publishing a note required a commit, a push and waiting for a build, and that friction was enough to stop writing. The goal: a CMS with a database, a visual editor, drafts, version history, image uploads and view counts.

## Decisions

**A database instead of files.** Managed Postgres. Trade-off: dependence on a provider. Pending mitigation: a periodic backup job to object storage.

**A block editor instead of a Markdown textarea.** Images upload straight to storage and are optimized automatically. Trade-off: the editor introduces invisible formatting changes, which later affected the diff. It was chosen anyway because a tool that isn't comfortable to write in stops getting used.

**Self-built analytics.** A hand-built view counter instead of a third-party script: no accounts, no cookies, no consent banner. For a personal blog, an integer in a table is enough.

## The version history

Three attempts, each with a different bug:

- **Save the state before each change** → the history showed the wrong dates → each version's content didn't match its date.
- **Save the result after each save** → comparing the latest version with the current state showed nothing → they were exactly the same.
- **Compare the latest version with the previous one** → added text appeared struck through in red, as if deleted, and identical paragraphs showed as modified → in the second case, the diff ran on raw Markdown, carrying the editor's invisible noise (line breaks, spaces).

The common cause wasn't in any single patch but in the design: one view was doing two jobs.

**Solution.** Each version is shown exactly as it was saved, with no comparison. Differences live behind a separate button, and the diff compares the rendered text rather than the raw Markdown, which removes the editor's formatting noise.

## Outcome

- Visual editor, drafts, history with restore, and auditing.
- Images optimized on upload.
- RSS, sitemap, a 404 page and continuous integration.
- Self-built analytics with no third-party dependencies.

The trickiest logic (history, diffs, storage, reading time) has unit tests. End-to-end tests are still pending.

## What I'd do differently

Define on paper what exactly a version represents before implementing. All three attempts failed for that same omission; about fifteen minutes sketching the timeline would have avoided the three rewrites.
