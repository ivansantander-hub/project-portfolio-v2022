---
slug: sgc
lang: en
order: 2
title: A multi-tenant ERP for Colombia
project: SGC
headline: "In many Colombian small businesses, the books don't match the business. SGC is a multi-tenant ERP where every sale creates its journal entry in the same transaction."
domain: Personal project
role: Sole developer · design, architecture and development
period: 2025 – present
confidential: false
featured: true
links:
  - label: See the product
    href: https://business-system.up.railway.app/landing
summary:
  - k: The problem
    v: "Accounting is usually a module added at the end; the books don't match the business."
  - k: The decision
    v: "Accounting as a core function: every money operation creates its entry in the same transaction."
  - k: How it ended
    v: "ERP deployed and running, maintained by one person."
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

SGC is a multi-tenant business management system for restaurants, bars, gyms and retail in Colombia. It covers point of sale, inventory, accounting on the national chart of accounts, payroll, electronic invoicing, gym memberships with access control, messaging, Stripe subscriptions, role-based access and PDF generation, plus an agent that answers questions in natural language.

## The problem

In admin software for Colombian small businesses, accounting is usually a module added at the end. The business numbers and the books don't match, and someone ends up reconciling them by hand.

On top of that come local rules that leave no room for interpretation: the national chart of accounts, 19% VAT with its exceptions, and electronic invoicing filed with the tax authority (DIAN). And one constraint of its own: a single person maintains the system, so the architecture has to keep maintenance work down from the start.

## Decisions

**Accounting as a core function, not a module.** Every event that moves money goes through the same function that creates the journal entry, inside the same transaction as the operation. There is no way to record a sale without its entry, so no after-the-fact reconciliation process is needed.

**Serializable, with retries, for money and stock.** Sales, purchase receiving, opening and closing cash sessions, and journal entries run in Serializable transactions with retries, exponential backoff and atomic balance updates. A point of sale has real concurrency (two cashiers selling the last unit). *Trade-off:* some extra latency and the complexity of handling retries.

**Multi-tenancy through Postgres schemas, without RLS.** A global schema for users and companies and another for each company's data, in a single database. *Trade-off:* without row-level security, isolation depends on the code respecting it; in return, the model is simple, there's one set of migrations, and cross-module queries cost nothing. With one maintainer and isolation tests it's a reasonable balance; with a team it wouldn't be.

**Electronic invoicing through providers, not directly against DIAN.** I integrated four authorized providers behind a common interface. *Trade-off:* a direct connection would be cleaner on paper, but it means ongoing regulatory maintenance that one person can't sustain.

**A tightly scoped AI agent.** The agent turns natural-language questions into SQL, and it's the most sensitive part: a badly scoped query could expose one company's data to another. It has its own test suite dedicated to trying to break that isolation.

## Result

It's deployed and running. The figures in the header come from roughly 59,700 lines of TypeScript across 389 files.

## What I'd do differently

I'd start with the accounting model: I built it after the point of sale and had to go back over operations already written to hook them in. And once someone else joins the project, I'll move isolation to row-level security.
