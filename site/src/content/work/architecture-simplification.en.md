---
slug: architecture-simplification
lang: en
order: 1
title: Consolidating a microservice architecture
project: Architecture consolidation
headline: A microservice architecture that had grown faster than the team maintaining it. I built an inventory, proposed two plans, and we started with the simple parts.
domain: Clinical trial management SaaS platform
role: Technical Lead → Technical Product Owner
period: 2025 – 2026
confidential: true
featured: true
summary:
  - k: The problem
    v: "There were more components than people to maintain them. The issue wasn't performance or bugs, it was that ratio."
  - k: The decision
    v: "Two proposals with their costs. Both used incremental migration with Strangler Fig instead of a hard cutover."
  - k: How it ended
    v: "The proposal is the reference document for the architecture decision. We started by retiring what no longer deployed."
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

The platform is used to run clinical trials: project management, document control, data capture and analytics. It's a regulated, audited domain, so a badly migrated record has real consequences.

The system had grown by accumulation over several years. Each new need brought a new service, and each new client a new scheduled job. Every decision made sense on its own, but together they had left us with more components than people to maintain them. I confirmed that when I sat down and counted.

You could see it day to day: a cross-cutting change meant repeating the same work across several repositories, onboarding took weeks instead of days, and we were debugging problems across distributed systems that weren't distributed problems. On top of that, the "one job per client" pattern meant the problem grew along with the business.

All of these symptoms had the same cause, but nobody had put a number on it.

## Building an inventory before proposing anything

I went through the code service by service and built an inventory: what exists, what's still in use, what hasn't had a commit in a year, and what depends on what.

That changed the conversation. Instead of "the system feels heavy" we had a table that showed the imbalance, and that a non-technical person could also evaluate.

## Two proposals

I presented two options, each with its costs, so the discussion would be about which one to pick rather than just approving or rejecting a single plan.

**Conservative option.** Consolidate services while keeping the current style. Less disruption, familiar ground, and work could start the following week. It doesn't fix the underlying fragmentation.

**Structural option.** Reduce to a handful of processes in a monorepo with end-to-end type safety, dropping the federation layer and unifying scheduled jobs into an event-driven worker. It addresses the cause, but costs more and touches more.

For each one I defined scope, sequence, owners and rollback criteria.

## Conditions shared by both plans

**Incremental migration, no big bang.** Strangler Fig with a reverse proxy: the new system takes over routes one at a time while the old one keeps serving the rest. In a regulated domain, a hard cutover would have been hard to justify.

**One person dedicated to operations.** Both plans reserved someone for bugs and support throughout the migration. If day-to-day work pulls in the whole team, the migration ends up with nobody on it and stalls.

**Existing commitments first.** The plan stated clearly that deliverables already promised came before refactoring. Otherwise the proposal wouldn't have been realistic for the business.

## Where it landed

The proposal is now the reference document for the architecture decision. The inventory, which used to live in the heads of two or three people, is now something anyone can look up.

Before touching the big pieces, the team did the simple ones: retiring what was no longer deployed and folding in catalog services that didn't justify existing separately. That gave us some confidence for the more expensive parts.

In parallel I designed the frontend replacement around the same idea: instead of one file per view, a registry engine. A generic route resolves against a configuration map, with a few reusable shells covering every screen pattern. Adding a view means adding a config object, not creating files.

## What I'd do differently

I'd build the inventory a year earlier. Writing the proposal wasn't the hard part; the problem is that by the time it existed, we had already paid the cost of that debt.
