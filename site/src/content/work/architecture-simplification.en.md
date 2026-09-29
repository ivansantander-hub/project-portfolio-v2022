---
slug: architecture-simplification
lang: en
order: 1
title: Consolidating a microservice architecture
project: Architecture consolidation
headline: A microservice architecture with more components than people to maintain them. A system inventory and two costed proposals turned it into a decision that could be evaluated, starting with retiring what no longer deployed.
domain: Clinical trial management SaaS platform
role: Technical Lead → Technical Product Owner · inventory and architecture proposal
period: 2025 – 2026
confidential: true
featured: true
summary:
  - k: The problem
    v: "More components than people to maintain them. The issue wasn't performance or bugs, it was that ratio."
  - k: The decision
    v: "Two proposals with their costs. Both use incremental migration (Strangler Fig), no hard cutover."
  - k: How it ended
    v: "The proposal is the reference document for the architecture decision. First step: retiring what no longer deployed."
stack:
  - Microservice architecture
  - GraphQL Federation
  - Kubernetes
  - Next.js
  - TypeScript
  - Python
tags:
  - architecture
  - leadership
  - migration
---

## The problem

The platform covers project management, document control, data capture and analytics in a regulated, audited domain: a badly migrated record has real consequences.

The system had grown by accumulation over several years. Each new need brought a new service, and each new client a new scheduled job. Decisions that made sense on their own had, together, left more components than people to maintain them:

- A cross-cutting change had to be repeated across several repositories.
- Onboarding took weeks instead of days.
- Problems that weren't distributed were being debugged across distributed systems.
- The "one job per client" pattern meant the problem grew along with the business.

They all had the same cause, but nobody had put a number on it.

## Decisions

**Inventory before proposal.** I went through the code service by service and built an inventory: what exists, what's still in use, what hasn't had a commit in a year, and what depends on what. The conversation moved from "the system feels heavy" to a table that showed the imbalance, readable by non-technical people too. Cost: review time before anything could be proposed.

**Two options instead of one.** I proposed two plans with their costs, so the discussion was about which to pick rather than approving or rejecting one. For each one I defined scope, sequence, owners and rollback criteria.

- *Conservative:* consolidate services while keeping the current style. Less disruption, familiar ground, could start the following week; doesn't fix the underlying fragmentation.
- *Structural:* reduce to a handful of processes in a monorepo with end-to-end type safety, drop the federation layer and unify scheduled jobs into an event-driven worker. It addresses the cause, but costs more and touches more.

**Incremental migration in both plans.** Strangler Fig with a reverse proxy: the new system takes over routes one at a time while the old one serves the rest. It means running two systems at once, but in a regulated domain a hard cutover would have been hard to justify.

**One person dedicated to operations.** Someone reserved for bugs and support throughout the migration. It reduces capacity, but keeps day-to-day work from absorbing the team and stalling the migration.

**Existing commitments first.** Deliverables already promised come before refactoring. The migration moves more slowly, in exchange for a plan that is realistic for the business.

## Outcome

- The proposal is the reference document for the architecture decision.
- The inventory, which used to live in two or three people's heads, is now available to anyone.
- The team started with the simple parts: retiring what was no longer deployed and folding in catalog services that didn't justify existing separately. That built confidence for the more expensive parts.
- I designed the frontend replacement around the same idea: a registry engine instead of one file per view. A generic route resolves against a configuration map and a few reusable shells cover every screen pattern; adding a view means adding a config object.

## What I'd do differently

I'd build the inventory a year earlier. By the time the proposal existed, we had already paid the cost of that debt.
