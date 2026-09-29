---
slug: workflow-engine
lang: en
order: 2
title: A workflow engine to replace per-client scripts
project: Workflow engine
headline: Onboarding a client meant writing and deploying a new script. A configurable graph engine turns it into a configuration task for the people who know the data.
domain: Clinical trial management platform
role: Technical Lead · engine design, architecture decision and preview optimization
period: 2026
confidential: true
featured: true
summary:
  - k: The problem
    v: "A nearly identical script per client. Every onboarding went through engineering."
  - k: The decision
    v: "A graph engine with the definition in the database and per-node preview."
  - k: How it ended
    v: "Onboarding a client becomes configuration, not development."
stack:
  - Python
  - FastAPI
  - React
  - React Flow
  - PostgreSQL
  - Prisma
tags:
  - architecture
  - data
  - product
---

## The problem

The platform syncs with external clinical data capture systems. Each client uses a different one, with its own form structure and naming conventions. The existing solution was one script per client (extract, transform, load, notify), each with its own repository and deployment pipeline.

- The scripts shared almost all their logic and differed in exactly the part that mattered.
- A bug had to be fixed in every copy, and there was usually one that got missed.
- Every new client went through engineering. The data managers, who understand the data best, couldn't change anything themselves.

I framed it as a product problem rather than a matter of writing better scripts: the people who know the data should be able to build the flow without depending on engineering.

## Decisions

**A graph engine with the definition in the database.** The flow is a DAG stored in the database, not in code. A catalog of seven task types (extract, transform, load, notify, compare, conditional, map) is composed at runtime: a new capability is a newly registered task type; a new client is a graph. The alternative, a shared script framework, would have reduced duplication, but every client would still have gone through engineering.

**Building on the platform instead of adopting an orchestrator.** I evaluated an established tool from the ecosystem and ruled it out: integrating it with the platform's authentication and permissions would have been a permanent workaround, and we needed a domain-specific interface (clinical forms, semantic mappings), not a generic DAG editor. It's a call that could reasonably go either way; I documented the reasoning so it can be revisited.

**Per-node preview with sampling.** It runs a single node on a limited sample and shows its output right away. Without it, every change meant running the full flow, a loop too slow for a visual tool. The cost: validation happens on a sample, not on the full volume.

**An inspector between nodes.** Each node's result is saved on the node and passed as context to the next one. A collapsible inspector shows what goes in and what comes out at every step, which the scripts never allowed.

**Performance as a requirement, not a final optimization.** The first version of the preview was too slow to use: loading the configuration triggered a cascade of individual queries, an N+1 hidden by the data access layer. I rewrote it with batched queries (`IN` clauses) and a short-lived cache. It improved by an order of magnitude, from a wait that interrupted the work to an immediate response.

## Outcome

- The engine is in use for real synchronization pipelines.
- It is the foundation that the duplicated logic from the per-client scripts will gradually move into.
- Engineering is no longer the bottleneck, and the data managers work on the flows directly.

## What I'd do differently

I'd measure the preview's performance before building the interface on top. The feature was complete, but a slow preview would not have been used.
