---
slug: sgc
lang: en
order: 2
title: A multi-tenant ERP for Colombia
project: SGC
headline: 85 models, 164 endpoints and 383 tests. Point of sale, inventory, payroll and Colombian accounting, in a project I'm building on my own.
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
    v: "In a lot of Colombian admin software, accounting is a module added at the end, and the books don't match the business."
  - k: The decision
    v: "Put accounting at the center: every sale is recorded together with its journal entry, in the same transaction."
  - k: How it ended
    v: "It's deployed and running, with 85 models, 164 endpoints and 383 tests."
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

SGC is a multi-tenant business management system I'm building for Colombian businesses: restaurants, bars, gyms and retail. It has point of sale, inventory, accounting, payroll, electronic invoicing, memberships, messaging, and an agent that answers questions in natural language. Part of the reason I started it was to see how much of a real ERP one person can maintain if the architecture is thought through from the start.

## The starting problem

In admin software for Colombian small businesses, accounting is often a module added at the end rather than the center of the system. So the business numbers and the books don't match, and someone ends up reconciling them by hand.

There are also local rules that have to be followed as they are: the national chart of accounts, 19% VAT with its exceptions, and electronic invoicing filed with the tax authority (DIAN).

## Five architecture decisions and what they cost

**Multi-tenancy by schema, not by database.** I use two Postgres schemas in a single database: a global one for users and companies, and another for everything that belongs to each company. The downside is there's no row-level security, so isolation depends on the code respecting it. In return, the model is simple, there's a single set of migrations, and cross-module queries cost nothing. With one maintainer and tests covering isolation, it feels like a good balance; with a team I'd do it differently.

**Serializable transactions for anything touching money or stock.** Sales, purchase receiving, opening and closing cash sessions, and journal entries all run this way, with retries, exponential backoff and atomic balance updates. This is the decision I'm most sure about: a point of sale has real concurrency (two cashiers selling the last unit), and with inventory and money "works most of the time" isn't enough. The cost is some extra latency and the complexity of handling retries, which I think is worth it.

**Accounting as a core function, not a module.** Every event that moves money goes through the same function that creates the journal entry, inside the same transaction as the operation. That means you can't record a sale without its entry: nothing checks it afterward, the code just doesn't offer another way to do it. That's why the books and the business stay in sync.

**Electronic invoicing through providers, not directly against DIAN.** I integrated four authorized providers behind a common interface. Connecting directly would have been cleaner on paper, but also ongoing regulatory maintenance that I don't think is realistic to handle on my own.

**A tightly scoped AI agent.** SGC includes an agent that turns natural-language questions into SQL. It's the most sensitive part of the system, because a badly scoped query could show one company's data to another. So it has its own test suite focused on trying to break that isolation.

## The system in numbers

| | |
|---|---|
| Data models | 85 |
| REST endpoints | 164 |
| Automated tests | 383 |
| Lines of TypeScript | ~59,700 across 389 files |

It covers point of sale, inventory, accounting on the national chart of accounts, payroll, electronic invoicing, gym memberships with access control, messaging, Stripe subscriptions, role-based access control and PDF generation. It's deployed and running.

## What I'd do differently

I'd start with the accounting model. I built it after the point of sale and had to go back over operations I'd already written to hook them in. If the journal entry had been the first piece, every operation would have been connected from the start.

Also, isolation by convention has its limits: it works while I'm the only one maintaining the project, but once someone else joins I'll move to row-level security.
