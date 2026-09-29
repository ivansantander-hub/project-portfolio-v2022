---
slug: english
lang: en
order: 12
title: An app for practicing English every day
project: English A1
headline: "A personal app for practicing the Present Simple with real exercises, sentence-by-sentence AI feedback and an engine that picks what to practice based on mistakes."
domain: Personal project
role: Sole developer · design and development
period: August 2026
featured: true
links:
  - label: Code on GitHub
    href: https://github.com/ivansantander-hub/english
  - label: See the app
    href: https://web-production-81f3a7.up.railway.app
summary:
  - k: The problem
    v: "Practicing English daily with useful feedback, not just right or wrong, and knowing what to review."
  - k: The decision
    v: "AI grading validated against a schema, with a rule-based fallback so every answer gets a result."
  - k: How it ended
    v: "Deployed on Railway, version 1.5.0, with CI and 131 tests."
metrics:
  - value: "131"
    label: "automated tests"
  - value: "29"
    label: "tRPC procedures"
  - value: "19"
    label: "data models"
  - value: "~10.7k"
    label: "lines of TypeScript"
stack:
  - React
  - Vite
  - Tailwind
  - Node.js
  - tRPC
  - Prisma
  - PostgreSQL
  - Zod
  - OpenRouter
  - Railway
tags:
  - personal project
  - AI
  - education
---

English A1 is a daily-use app for a Spanish speaker studying the Present Simple. It has translation, fill-in-the-blank, correct-the-sentence and paragraph translation exercises; a practice map; a 15-exercise daily session; a conversation tutor; a mistakes history; an AI-generated profile analysis; and YouTube video recommendations tied to mistakes.

## The problem

An exercise app that only says "correct" or "incorrect" doesn't help much: a valid paraphrase counts as wrong and it's unclear what actually failed. I wanted per-sentence feedback, with the explanation in English and Spanish, and for the app to use those mistakes to decide what to practice next.

## Decisions

**The domain lives in pure packages.** The learning logic (per-concept accuracy, weakness detection, selection strategies, daily session composition) and the exercise logic don't depend on React, Prisma or OpenRouter: data in, data out. That lets me test it without a database or network. Cost: a monorepo with seven packages and the wiring between them, which is a lot of structure for an app this size.

**The AI grades, but there's always a result.** The model returns JSON validated with Zod; if it fails, there's one retry with a stricter instruction, and if that fails too, the answer is graded with exact-match rules. Every attempt stores `gradedBy: "ai" | "rules"`. Cost: the rules are much stricter than the AI and don't accept paraphrases, so the two kinds of result aren't comparable; that's why they're labeled.

**The model is changed from the admin panel.** Environment variables are only the initial value; after that an `AISettings` row, editable without a redeploy, is the source of truth. The picker is filled from OpenRouter's real catalog, sorted by price, and each call's cost is computed when it's logged so it doesn't drift if the provider reprices. Cost: conversation calls stream and never get a token count, so their cost stays `null`.

**Videos are cached by topic and language.** A real YouTube search happens at most once a month per topic and language, and the cache is shared across users. The language comes from the learner's level (A1/A2 get Spanish-taught lessons) or an explicit preference. Cost: recommendations can be up to 30 days old.

**Email and 6-digit PIN authentication.** Opaque sessions with a 90-day sliding expiry, sent as a bearer token because web and API live on different Railway subdomains. Cost: a 6-digit PIN is weak; a 15-minute lockout after 5 failed attempts partly makes up for it.

## Outcome

It's deployed on Railway (web, API and Postgres), auto-deploying on every push to `main`, running migrations and the seed on each deploy, with a CI pipeline that runs lint, typecheck and tests against a real Postgres. The history has 22 commits between August 11 and 12, 2026, and reaches version 1.5.0, with a changelog and bilingual in-app release notes.

## What I'd do differently

I'd think through the practice state earlier: switching tabs reset the exercise in progress, and it took two versions (1.1.2 and 1.1.3) to fix, the second because of React Query's `refetchOnWindowFocus`. I'd also close the gap in conversation cost tracking. And the data model already supports levels, but all the seeded content is still A1.
