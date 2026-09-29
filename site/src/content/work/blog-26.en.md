---
slug: blog-26
lang: en
order: 5
title: The version history I rebuilt three times
project: blog-26
headline: I turned my static blog into a small CMS of my own. The hard part was the version history, which I had to rebuild three times.
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
    v: "Stop patching the diff and simplify: one view to see each version, another to compare."
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

The blog started out static, with posts in Markdown. The problem showed up quickly: publishing a note meant a commit, a push and waiting for a build, and that was enough to put me off writing.

So I turned it into a CMS: its own database, a visual editor, drafts, version history, image uploads and view counts.

## Main decisions

**A database instead of files.** I use managed Postgres. That ties me to a provider, which I'm not thrilled about. A periodic backup job to object storage is on my to-do list.

**A visual editor instead of a Markdown textarea.** A block-based editor, with images uploading straight to storage and getting optimized automatically. I wanted writing to be comfortable, because otherwise I'd stop using it.

**My own analytics.** A hand-built view counter instead of a third-party script: no accounts, no cookies, no consent banner. For a personal blog, an integer in a table is enough.

## The version history

This part took more work than I expected, mostly because of how I approached it.

**First attempt.** I saved the state before each change. The trouble was that each version's content didn't match its date, so the history showed the wrong dates.

**Second attempt.** I switched to saving the result after each save. The dates were right now, but comparing the latest version with the current state showed nothing, because they were exactly the same.

**Third attempt.** I compared the latest version with the previous one. That surfaced another issue: added text showed up struck through in red, as if it had been deleted, instead of in green. On top of that, any invisible change from the editor (a line break, a space) flagged an identical paragraph as modified.

After three fixes that each caused a different problem, I realized the issue was how I had designed the history, not the individual patches.

**What I did was simplify.** I had been asking one view to do two things. Now each version is shown exactly as it was saved, with no comparison, and the diff lives behind a separate button. It compares the rendered text rather than the raw Markdown, which gets rid of the formatting noise the editor introduces.

## Where it stands

A CMS with a visual editor, drafts, history with restore, auditing, images optimized on upload, RSS, a sitemap, a 404 page, continuous integration and self-hosted analytics.

The logic that took the most work (history, diffs, storage, reading time) has unit tests. End-to-end tests are still pending and on the list.

## What I'd do differently

I'd sketch the history on paper before coding it. All three attempts failed for the same reason: I started implementing before defining what exactly a version represents. About fifteen minutes thinking through the timeline would have saved me the three rewrites.
