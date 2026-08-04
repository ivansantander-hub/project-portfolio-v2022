---
slug: architecture-simplification
lang: en
order: 1
title: When the system outgrows the team
project: Architecture consolidation
headline: A microservice architecture that had grown faster than the team meant to maintain it. I measured first, proposed two paths, and started with the boring part.
domain: Clinical trial management SaaS platform
role: Technical Lead → Technical Product Owner
period: 2025 – 2026
confidential: true
featured: true
summary:
  - k: The problem
    v: "More components than people to maintain them. Not performance, not bugs — a broken ratio."
  - k: The decision
    v: "Two proposals with their costs, not one. Incremental migration with Strangler Fig, never a hard cutover."
  - k: How it ended
    v: "The reference document for the architecture decision. We started by retiring what no longer deployed."
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

## The context

A platform for running clinical trials. Project management, document control, data capture and analytics.

Regulated domain. There are audits. A badly migrated record has real consequences.

The system had grown by accumulation for years. Every new need, a new service. Every new client, a new scheduled job.

None of those decisions was wrong.

The sum of them was.

## The problem

It wasn't performance. It wasn't bugs.

It was something else:

> there were more components to maintain than people to maintain them.

The symptoms were the usual ones when that ratio breaks.

- A cross-cutting change meant repeating the same work across many repositories
- Understanding an end-to-end flow meant hopping between several services
- Onboarding was measured in weeks, not days
- Distributed debugging for problems that weren't distributed

And the "one job per client" pattern guaranteed the problem would grow with the business.

What mattered wasn't any single symptom.

It was that all of them pointed at the same thing, and nobody had put a number on it.

## The first thing wasn't proposing. It was counting.

I went through the code service by service and built a real inventory. What exists, what's still alive, what hasn't seen a commit in a year, what depends on what.

That inventory changed the conversation.

We went from "the system feels heavy" to a table where anyone could see the disproportion.

An argument with data can be evaluated by someone who isn't technical. A feeling can't.

## Two paths, not one

I brought two proposals on purpose.

One option asks for a yes or a no. Two options with their costs ask for a decision.

**The conservative path.** Consolidate the services while keeping the current style. Less disruption, familiar ground, work can start next week. Doesn't solve the underlying fragmentation.

**The structural path.** Reduce to a handful of processes in a monorepo, end-to-end type safety, dropping the federation layer and unifying scheduled jobs into an event-driven worker. Solves the cause. Costs more and touches more.

For each one I defined scope, sequence, owners and rollback criteria.

## Three decisions I stand behind

**Incremental migration, never big bang.**

Strangler Fig with a reverse proxy. The new system absorbs routes one at a time while the old one keeps serving the rest.

In a regulated domain, a hard cutover isn't an option you can defend.

**Always someone on operations.**

In both plans I reserved one person for bugs and support throughout the migration.

Migrations don't die of technical problems. They die because day-to-day operations eat the team and the project is left with nobody.

**Commitments first, refactoring second.**

The plan said explicitly that already-promised deliverables came before refactoring.

An architecture proposal that ignores business commitments doesn't get executed. It gets filed.

## How it ended

The proposal became the reference document for the architecture decision.

The inventory stopped being knowledge held by two or three people and became something you can look up.

Before touching the big pieces we shipped the trivial ones: retiring what was no longer deployed and absorbing catalog services that didn't justify existing separately.

Starting with the boring part earns the trust you need later for the expensive part.

In parallel I designed the frontend replacement around a different idea. Instead of one file per view, a registry engine: a generic route resolving against a configuration map, and a few reusable shells covering every screen pattern.

Adding a view becomes adding a config object. Not creating files.

## What I'd do differently

The inventory should have happened a year earlier.

The proposal wasn't hard to write. What's hard is that by the time it existed, the cost of the debt had already been paid.
