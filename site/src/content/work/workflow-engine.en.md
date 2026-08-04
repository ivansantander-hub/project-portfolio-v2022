---
slug: workflow-engine
lang: en
order: 3
title: From per-client script to a pipeline you draw
project: Workflow engine
headline: I designed a low-code platform that replaces duplicated scripts with data pipelines a non-technical user can build by dragging nodes.
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

## Context

The platform has to sync with external clinical data capture systems. Every client uses a
different one, with its own form structure and its own way of naming things.

The historical solution was to write one script per client: extract the data, transform it,
load it, notify. It worked. The problem is what happens when that list stops being short.

## The problem

The scripts were nearly identical — but only nearly. They shared almost all their logic and
diverged in exactly the part that mattered, so fixing a bug meant finding it in every copy,
and there was always one copy where nobody did.

Worse: **every new client required an engineer to write code.** Not a configuration, not a
form — code, a repository, a deployment pipeline. The engineering team had become the
bottleneck for client onboarding, and the people who actually understood the data — the data
managers — couldn't touch any of it.

## My role

I defined the architecture and led development. The core decision was to stop treating this
as "write better scripts" and start treating it as **a product problem**: the people who know
the data should be able to build the flow without going through engineering.

## Decisions and trade-offs

**A graph engine, not a script framework.** The flow is modeled as a DAG whose definition
lives in the database, not in code. A catalog of task types (extract, transform, load,
notify, compare, conditional, map) is composed at runtime. Adding a new capability means
registering a task type; adding a new client means drawing a graph.

**Build on what exists rather than adopt an orchestrator.** I evaluated bringing in an
established tool from the ecosystem. I ruled it out for two reasons: integrating it with the
platform's authentication and permission model would have been a permanent graft, and the
interface we needed was domain-specific — not a generic DAG, but one that understands
clinical forms and semantic mappings. It's the kind of decision you can argue either way;
what mattered was documenting the reasoning so it stays reviewable.

**Test a node, not the whole pipeline.** This is the decision that made the tool usable. A
preview mode with limited sampling lets you run a single node and see its output data
immediately. Without it, every iteration means running the entire flow and waiting — and
nobody uses a visual tool with a slow feedback loop.

**Data flows visibly between nodes.** A node's result is persisted onto the node itself and
injected as context into the next one. Each carries a collapsible data inspector. The user
sees what goes in and what comes out at every step, which is exactly what a script won't let
you see.

**Three-panel layout.** Palette left, canvas center, configuration right. It isn't original,
and that's why it works: it's the pattern anyone who has used a diagramming tool already
knows.

## Performance: the detail that decided the project

The first version of the preview was unusable. Loading the configuration data fired a cascade
of individual queries against the database — the classic N+1, hidden behind a data access
layer that made it invisible in the code.

I rewrote it as a handful of batched queries with `IN` clauses, plus a short-lived cache for
repeated requests. The difference was an order of magnitude: from a wait that broke the
workflow to an immediate response.

I record it because it's the most transferable lesson from the project: **the feature was
complete and the product was still unusable.** Performance wasn't an optimization at the end,
it was the requirement that decided whether anyone would use it at all.

## Outcome

The engine went into use for real synchronization pipelines and became the foundation meant
to absorb the duplicated logic of the per-client scripts.

The important shift isn't technical: onboarding a client moves from an engineering task to a
configuration task. Engineering stops being the bottleneck, and the people who understand the
data get control over it back.

## What I'd do differently

I'd have measured preview performance **before** building the visual editor. I invested in
the interface assuming the data layer would hold up, and ended up fixing the foundations with
the house already standing.

I'd also start with fewer task types. I registered a broad catalog early when three or four
would have validated the idea just as well, with less surface to maintain while the design
was still moving.
