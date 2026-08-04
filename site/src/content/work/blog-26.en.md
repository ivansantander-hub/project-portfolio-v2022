---
slug: blog-26
lang: en
order: 5
title: The version history I rebuilt three times
project: blog-26
headline: A self-built CMS with a visual editor, drafts and diffs. The interesting part wasn't building it — it was knowing when to stop patching it.
domain: Personal project
role: Design and development
period: 2026
confidential: false
featured: false
links:
  - label: See the blog
    href: https://blog.ivansantander.com
summary:
  - k: The problem
    v: "I couldn't write without deploying. Every note was a commit, a push and waiting for a build."
  - k: The decision
    v: "Stop patching the diff and simplify the model. One view, one job."
  - k: How it ended
    v: "A self-built CMS with a visual editor, drafts, history and analytics with no third parties."
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

## Context

It started as a static blog with Markdown entries. The practical problem showed up fast:
**I couldn't write without deploying.** Every note meant a commit, a push and waiting for a
build. That kills the writing habit.

So I turned it into a CMS: its own database, a visual editor, drafts, version history, image
uploads and view counts.

## Decisions

**A database instead of files.** Managed Postgres. The consequence is a vendor dependency
that makes me uncomfortable and is written down as pending: a periodic backup job to object
storage. I'd rather have the risk recorded than pretend it isn't there.

**A visual editor, not a Markdown textarea.** A block-style editor, with images uploading
straight to object storage and optimizing themselves. Writing has to be frictionless or the
project dies of disuse, not of bugs.

**My own analytics.** A hand-built view counter instead of a third-party script. No accounts,
no cookies, nothing to consent to. For a personal blog, an integer in a table is all the
analytics I need.

## The history that fought back

This is the part worth telling, because the mistake wasn't technical — it was methodological.

**First attempt.** I saved the state *before* each change. Result: a version's content and its
date didn't correspond. Every history entry lied about when it had existed.

**Second attempt.** I changed it to save the result *after* each save. That fixed the dates
and broke something else: comparing the most recent version against the current state showed
nothing, because they were literally the same thing.

**Third attempt.** I compared the last version against the previous one. And a third, subtler
problem appeared: added text rendered struck through in red, as if deleted, instead of green.
And any invisible reflow from the editor — a line break, a space — marked an identical
paragraph as changed.

At that point I had three fixes and each had produced a new problem. **That's the signal.**
When every patch yields a different bug, the problem isn't in the patch — it's in the model.

**The fix was to remove, not to add.** I stopped trying to make one view do two jobs. Each
version renders exactly as it was saved — comparing nothing — and differences moved to a
separate button. And the diff compares the **rendered text**, not the raw Markdown, so the
editor's formatting noise disappears by construction.

## Outcome

A working CMS with a visual editor, evolving drafts, history with restore, auditing, images
optimized on upload, RSS, sitemap, a real 404, continuous integration and self-hosted
analytics.

The logic that cost me the most — history, diffs, storage, reading time — is covered by unit
tests. End-to-end tests are still pending, and it's written down.

## What I'd do differently

**I'd have modeled the history on paper before writing it.** The three failed attempts were
the same mistake: implementing an idea of versioning without having defined what exactly a
version represents. Fifteen minutes drawing the timeline would have saved three rewrites.

**The backup should have been part of the deliverable, not the backlog.** I moved all the
content to a managed database and left the backup for later. It's the kind of "later" that
only becomes urgent on the day it's no longer any use.
