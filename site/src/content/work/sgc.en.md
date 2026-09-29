---
slug: sgc
lang: en
order: 11
title: "Talonaria: a multi-tenant ERP for Colombian small businesses"
project: Talonaria
headline: "In many Colombian small businesses, the books don't match the business. Talonaria is a multi-tenant ERP where every money operation creates its journal entry in the same transaction."
domain: Personal project
role: Sole developer · design, architecture and development
period: 2026 – present
confidential: false
featured: false
links:
  - label: See Talonaria
    href: https://talonaria.co
summary:
  - k: The problem
    v: "Accounting is usually a module added at the end; the books don't match the business."
  - k: The decision
    v: "Accounting as a core function: every money operation creates its entry in the same transaction, and if the entry doesn't balance, the operation doesn't happen."
  - k: How it ended
    v: "Product deployed at talonaria.co, pre-launch with no customers yet, with CI, automated releases and daily backups, maintained by one person."
metrics:
  - value: "91"
    label: "data models"
  - value: "~300"
    label: "HTTP endpoints"
  - value: "1,138"
    label: "test cases"
  - value: "~78k"
    label: "lines of TypeScript"
stack:
  - Next.js
  - TypeScript
  - PostgreSQL
  - Prisma
  - Jotai
  - Lucia
  - Stripe
  - Wompi
  - Cloudflare R2
  - OpenAI
  - Anthropic
  - Vitest
  - Playwright
  - GitHub Actions
  - Railway
tags:
  - personal project
  - architecture
  - fintech
---

Talonaria is a multi-tenant business management system for restaurants, gyms, retail stores and agencies in Colombia. It covers point of sale with cash sessions, inventory, purchasing with withholding taxes, receivables and payables, accounting on the national chart of accounts, payroll, electronic invoicing and electronic payroll filed with the tax authority (DIAN), quotes, orders and projects, gym memberships with access control, commissions, internal messaging, per-company roles and permissions, PDF generation, and an agent that answers questions in natural language. It's sold as a monthly subscription with a free trial.

## The problem

In admin software for Colombian small businesses, accounting is usually a module added at the end. The business numbers and the books don't match, and someone ends up reconciling them by hand.

On top of that come local rules that leave no room for interpretation: the national chart of accounts, VAT at several rates (19%, 5%, exempt and excluded), income, VAT and municipal withholding depending on each party's tax regime, and electronic documents filed with DIAN: invoices, credit and debit notes, support documents and payroll. And one constraint of its own: a single person maintains the system, so the architecture has to keep maintenance work down from the start.

## Decisions

**Accounting as a core function, not a module.** Every event that moves money (sale, purchase, supplier payment, receivables collection, expense, cash movement, payroll, commission, credit note) goes through the same function that creates the journal entry, inside the same transaction as the operation. There is no way to record a sale without its entry, so no after-the-fact reconciliation process is needed. An internal accounting and tax audit in July 2026 found that this function logged a warning and carried on when an account was missing or the entry didn't balance, so a sale could complete with half its bookkeeping. Since then it throws and aborts the whole transaction. *Trade-off:* a misconfigured account blocks the operation instead of letting it through; I'd rather have a visible error than incomplete books.

**Serializable, with retries, for money and stock.** Sales, purchase receiving, opening and closing cash sessions, credit and debit notes, commission advances, invoice voids and journal entries run in Serializable transactions with retries and exponential backoff. A point of sale has real concurrency: two cashiers selling the last unit. At first only sales and purchases retried; the rest opened an isolated transaction, but when PostgreSQL aborted one of two conflicting operations, the user saw a generic error in the middle of a payment. Now they all go through the same wrapper, and a test enforces it. *Trade-off:* some extra latency and the complexity of handling retries.

**Multi-tenancy through Postgres schemas, without RLS.** One database with two schemas: `public`, with 20 models for users, companies, sessions, plans and subscriptions, and `tenant`, with 71 models for each company's data, all carrying `companyId`. Isolation is by convention: every query filters by company, and a test suite tries to read, edit and delete another company's records across 13 resource types, also checking that the victim's data stays intact. *Trade-off:* without row-level security, isolation depends on the code respecting it; in return, the model is simple, there's one schema to sync, and cross-module queries cost nothing. With one maintainer and isolation tests it's a reasonable balance; with a team it wouldn't be.

**Electronic invoicing through providers, not directly against DIAN.** Electronic documents go out through authorized technology providers behind a common interface: invoices, credit and debit notes, support documents and their adjustment notes, electronic payroll, status checks and downloads. Two are implemented: Factus, tested against its sandbox, and Matias. An earlier version of the screen offered three more providers that were never built; I removed them and kept a single list of real providers, which a test keeps in line with the code. *Trade-off:* a direct connection would be cleaner on paper, but it means certificates, signing and ongoing regulatory maintenance that one person can't sustain.

**A tightly scoped AI agent.** AURA turns natural-language questions into queries, with OpenAI or Anthropic behind the same interface, selectable per company. It has predefined tools plus a read-only SQL tool with a table allowlist, limits on tool rounds and per-user request rate, and a query quota per plan. It's the most sensitive part: a badly scoped query could expose one company's data to another. In September 2026, while checking its documentation against the code, I found that the company filter was applied only to the first table in the query, so a join could pull in other companies' data. Now every table with the column is scoped, and a table outside the allowlist rejects the query. It has its own test suite dedicated to trying to break that isolation, and another that fails if the schema described to the model drifts from the real one.

**Subscription billing behind a swappable gateway.** I started with Stripe, but Stripe doesn't accept Colombian companies as merchants. Billing moved to an abstraction with two providers: existing subscriptions stay on Stripe and new ones are charged through Wompi (Bancolombia), in pesos, by card, Nequi, Bancolombia account or Daviplata. The card is tokenized in the browser and the number never touches the server. *Trade-off:* with Wompi, the recurring billing engine is mine: a daily cron charges, retries the next day, after three days and after a week, and only suspends after the fourth failure. Payment events the gateway resends are recognized and ignored; before that, every resend extended the period by another month.

**Releases cut automatically from the CHANGELOG.** Railway deploys every commit that reaches `main`. Each PR with a visible change adds its line to the CHANGELOG, and when CI passes on `main` a workflow derives the version number from the categories (added, fixed, breaking change), updates the CHANGELOG and `package.json`, tags the commit and publishes the release on GitHub. The version shows in the sidebar and in a health endpoint, so it's clear what's running in production without opening the hosting dashboard. The project stays on 0.x on purpose: 1.0.0 will be the version the first real customer runs on. *Trade-off:* the discipline of writing the CHANGELOG in every PR; in return, nobody picks numbers or creates tags by hand.

## Result

It's deployed at talonaria.co and running, pre-launch: public sign-up, the free trial and billing are in place, but no real customer operates on it yet. The first commit is from March 7, 2026.

As of September 2026, the header figures are: 91 Prisma models; about 300 HTTP handlers across 204 route files; 1,138 test cases in 106 files, across Vitest and Playwright; and about 78,000 lines of TypeScript in 509 files. The history adds up to 344 commits and 40 tagged versions, up to v0.27.1; the ones before September were assigned retroactively from the git history.

Operations are automated with three GitHub Actions workflows:

- **CI** on every PR and push to `main`: type checks, production build and the full suite against a Postgres service. It's the only gate before production. For a while CI went green running 361 of 672 tests, because the HTTP suites skipped without a server and a skip counted as a pass; now it boots the production build, and the rule is that a test only skips for something the environment can't provide.
- **Release**, described above.
- **Daily backup**: `pg_dump` to Cloudflare R2 with 30-day retention, verified before and after upload, and a restore script tested end to end on a throwaway database.

A good share of the work has been dated internal audits with a remediation plan: an accounting and tax audit (28 findings, 6 critical, closed in four blocks: collecting credit invoices, paying suppliers, withholding on purchases and 2026 payroll values, among others), a security and testing audit on the same day as a deployment (CSRF protection only checked that the header existed), and two documentation audits that checked every claim against the code. Along the same lines, the help center described features that never existed; it was rewritten as Markdown guides verified against the code, and a test fails if a guide cites a route or menu item that doesn't exist.

## What I'd do differently

I'd start with the accounting model: I built it after the point of sale and had to go back over operations already written to hook them in. I'd have versioned migrations from the start: with direct schema sync, every destructive change (a status dropped from an enum, a column changing type) needed a hand-written SQL script, tested against a copy with data before deploying. I'd run CI against the production build from day one, instead of finding out months later that part of the tests never ran. And once someone else joins the project, I'll move isolation to row-level security.
