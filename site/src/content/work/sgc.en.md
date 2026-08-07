---
slug: sgc
lang: en
order: 2
title: A multi-tenant ERP for Colombia
project: SGC
headline: 85 models, 164 endpoints and 383 tests. A business management system with real Colombian accounting, built from scratch.
domain: Personal project
role: Design, architecture and development
period: 2025 – present
confidential: false
featured: true
links:
  - label: See the product
    href: https://business-system.up.railway.app/landing
summary:
  - k: The problem
    v: "In Colombian admin software, accounting is a module bolted on at the end. The books and the business don't match."
  - k: The decision
    v: "Accounting as a core function. No code path allows recording a sale without its journal entry."
  - k: How it ended
    v: "Deployed and running. 85 models, 164 endpoints, 383 tests. Verified against the code."
metrics:
  - value: "85"
    label: "data models"
  - value: "164"
    label: "REST endpoints"
  - value: "383"
    label: "automated tests"
  - value: "~60k"
    label: "lines of TypeScript"
stack:
  - Next.js
  - TypeScript
  - PostgreSQL
  - Prisma
  - Jotai
  - Stripe
  - Cloudflare R2
tags:
  - personal project
  - architecture
  - fintech
---

> How much of a real ERP can one person sustain, if the architectural decisions are right from the start?

That's the question I wanted to answer. SGC is the answer in progress: a multi-tenant business management system for Colombian businesses — restaurants, bars, gyms, retail. Point of sale, inventory, accounting, payroll, electronic invoicing, memberships, messaging, and a natural-language query agent.

## The problem I wanted to avoid

Administrative software for Colombian small businesses tends to fail at the same point: accounting is a module bolted on at the end, not the center of the system. The result is that the business numbers and the books don't match, and someone ends up reconciling by hand.

On top of that sit local constraints you can't simplify away: the national chart of accounts, 19% VAT with its exceptions, electronic invoicing filed with the tax authority.

## Five decisions, with their costs

**Multi-tenancy by schema, not by database.** Two Postgres schemas in a single database: one global for users and companies, another for everything that belongs to a company. The trade-off is explicit — there's no row-level security protecting me from myself. In exchange I get a simple model, single migrations and cross-module queries at no cost. For a single-maintainer system with tests covering isolation, that's the right ratio. With a team, the answer would be different.

**Anything touching money or stock runs in Serializable transactions.** Sales, purchase receiving, cash session open and close, journal entries — with retries, exponential backoff and atomic balance mutations. This is the decision I'm most confident about: a point of sale has real concurrency, two cashiers selling the last unit, and "almost always correct" isn't an option when the subject is inventory and money. The cost is latency and retry complexity. I pay it without argument.

**Accounting is a core function, not a module.** Every event that moves money goes through the same function that creates the journal entry, inside the same transaction as the operation. The consequence: it's impossible to record a sale without its journal entry — not because a process checks afterward, but because no code path allows it. The books don't drift from the business because they aren't two systems.

**Electronic invoicing through providers, not against the tax authority directly.** I integrated four authorized providers behind a common interface. Integrating directly would have been more "pure" and a permanent source of regulatory maintenance I have no interest in carrying alone.

**The AI agent is caged by design.** SGC includes an agent that translates natural-language questions into SQL — the most dangerous part of the system, where a badly scoped query is a data leak across companies. It has a test suite dedicated solely to trying to break that isolation.

## Verified against the code, not estimated

| | |
|---|---|
| Data models | 85 |
| REST endpoints | 164 |
| Automated tests | 383 |
| Lines of TypeScript | ~59,700 across 389 files |

Covers point of sale, inventory, accounting on the national chart of accounts, payroll, electronic invoicing, gym memberships with access control, messaging, Stripe subscriptions, role-based access control and PDF generation. Deployed and running.

## What I'd do differently

I'd have started with the accounting model. I built it after the point of sale and had to go back over already-written operations to hook them in — if the journal entry had been the first abstraction, every operation would have been born connected.

And isolation by convention has an expiry date. Today it's correct for one maintainer; the moment someone else joins, I migrate to row-level security. I'd rather say that now than discover it through a leak.
