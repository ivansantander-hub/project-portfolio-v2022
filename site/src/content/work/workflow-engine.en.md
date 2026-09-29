---
slug: workflow-engine
lang: en
order: 3
title: A workflow engine to replace per-client scripts
project: Workflow engine
headline: Every new client needed an engineer to write code. I built a graph engine so the people who know the data can set it up themselves.
domain: Clinical trial management SaaS platform
role: Technical Lead
period: 2026
confidential: true
featured: true
summary:
  - k: The problem
    v: "There was one script per client, all nearly identical, and engineering was the bottleneck for onboarding clients."
  - k: The decision
    v: "A graph engine with the definition stored in the database, plus per-node preview."
  - k: How it ended
    v: "Onboarding a client becomes a configuration task instead of an engineering task."
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

Every new client required an engineer to write code: a repository, a deployment pipeline and new code each time, rather than just configuration.

The platform has to sync with external clinical data capture systems, and each client uses a different one, with its own form structure and naming conventions. The existing solution was one script per client: extract, transform, load, notify. That worked fine while there were only a few clients.

The scripts shared almost all their logic and differed in exactly the part that mattered. Fixing a bug meant tracking it down in every copy, and there was usually one that got missed. Engineering had become the bottleneck for onboarding clients, and the data managers, who understand the data best, couldn't change anything themselves.

## The approach

Instead of trying to write better scripts, I treated it as a product problem: the people who know the data should be able to build the flow without depending on engineering.

## How we built it

**A graph engine instead of a script framework.** The flow is modeled as a DAG, and its definition is stored in the database rather than in code. A catalog of task types (extract, transform, load, notify, compare, conditional, map) is composed at runtime. Adding a capability means registering a new task type; adding a client means drawing a graph.

**Building on the platform instead of adopting an orchestrator.** I looked at using an established tool from the ecosystem and decided against it for two reasons: integrating it with the platform's authentication and permissions would have been a permanent workaround, and we needed a domain-specific interface that understands clinical forms and semantic mappings, not a generic DAG editor. It's a call that could reasonably go either way, so I documented the reasoning so it can be revisited later.

**Testing a single node without running the whole pipeline.** This is what made the tool practical. A preview mode with limited sampling runs one node and shows its output right away. Without it, every change meant running the full flow and waiting, and with a loop that slow nobody would have used a visual tool.

**Seeing the data between nodes.** Each node's result is saved on the node and passed as context to the next one, with a collapsible inspector on each. You can see what goes in and what comes out at every step, which the scripts never allowed.

## The preview performance problem

The first version of the preview was too slow to use. Loading the configuration data triggered a cascade of individual queries, an N+1 that the data access layer hid in the code.

I rewrote it with batched queries using `IN` clauses and a short-lived cache. It improved by an order of magnitude: from a wait that interrupted the work to an immediate response.

What I took from it: the feature was complete, but if the preview was slow nobody was going to use it, so performance was a requirement rather than something to optimize at the end. If I did it again, I'd measure it before building the interface on top.

## Outcome

The engine is used for real synchronization pipelines and is the foundation that the duplicated logic from the per-client scripts will gradually move into.

Onboarding a client becomes a configuration task instead of an engineering task. Engineering is no longer the bottleneck, and the data managers can work on the flows directly.
