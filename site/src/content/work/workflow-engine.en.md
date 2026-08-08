---
slug: workflow-engine
lang: en
order: 3
title: From per-client script to a pipeline you draw
project: Workflow engine
headline: Every new client needed an engineer to write code. I turned it into a graph the people who understand the data can draw themselves.
domain: Clinical trial management SaaS platform
role: Technical Lead
period: 2026
confidential: true
featured: true
summary:
  - k: The problem
    v: "One script per client, nearly identical. Engineering was the bottleneck for onboarding clients."
  - k: The decision
    v: "A graph engine with the definition in the database, not in code. Plus per-node preview."
  - k: How it ended
    v: "Onboarding a client moves from an engineering task to a configuration task."
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

> Every new client required an engineer to write code.

Not a configuration. A repository, a deployment pipeline, new code every time.

The platform has to sync with external clinical data capture systems, and every client uses a different one — its own form structure, its own way of naming things. The historical fix was a script per client: extract, transform, load, notify. It worked, until the list stopped being short.

The scripts were nearly identical — but only nearly. They shared almost all their logic and diverged in exactly the part that mattered, so fixing a bug meant finding it in every copy, and there was always one copy where nobody did. Engineering had become the bottleneck for onboarding clients, and the people who actually understood the data — the data managers — couldn't touch any of it.

## The real decision

Stop treating this as "write better scripts." Start treating it as a product problem: the people who know the data should be able to build the flow without going through engineering.

## How it got built

**A graph engine, not a script framework.** The flow is modeled as a DAG whose definition lives in the database, not in code. A catalog of task types — extract, transform, load, notify, compare, conditional, map — is composed at runtime. Adding a capability means registering a task type. Adding a client means drawing a graph.

**Build on what exists rather than adopt an orchestrator.** I evaluated bringing in an established tool from the ecosystem and ruled it out for two reasons: integrating it with the platform's authentication and permissions would have been a permanent graft, and the interface we needed was domain-specific — not a generic DAG, but one that understands clinical forms and semantic mappings. It's the kind of decision you can argue either way; what mattered was writing down the reasoning so it stays reviewable.

**Test a node, not the whole pipeline.** This is the decision that made the tool usable. A preview mode with limited sampling lets you run a single node and see its output instantly. Without it, every iteration means running the entire flow and waiting — and nobody uses a visual tool with a slow feedback loop.

**Data flows visibly between nodes.** A node's result is persisted onto the node itself and injected as context into the next one, each with a collapsible inspector. The user sees what goes in and what comes out at every step — exactly what a script never lets you see.

## The detail that decided the project

The first version of the preview was unusable. Loading the configuration data fired a cascade of individual queries — the classic N+1, hidden behind a data access layer that made it invisible in the code.

I rewrote it as batched queries with `IN` clauses, plus a short-lived cache. The difference was an order of magnitude: from a wait that broke the workflow to an immediate response.

It's the most transferable lesson from the project: the feature was complete and the product was still unusable. Performance wasn't an optimization at the end — it was the requirement that decided whether anyone would use it at all. If I did it again, I'd measure it before building the interface on top, not after.

## The shift wasn't technical

The engine went into use for real synchronization pipelines and became the foundation meant to absorb the duplicated logic of the per-client scripts.

Onboarding a client moves from an engineering task to a configuration task. Engineering stops being the bottleneck, and the people who understand the data get control back.
