---
slug: workflow-engine
lang: en
order: 7
title: A configurable flow engine for data integrations
project: Flow engine
headline: Every data integration was solved with custom code. I designed a configurable flow engine so the people who know the data can build flows without going through engineering.
domain: Clinical trial management platform
role: Technical Lead · engine and preview design
featured: false
summary:
  - k: The problem
    v: "Each new integration required code nearly identical to the previous one."
  - k: The decision
    v: "A flow engine defined by configuration, with step-by-step preview."
  - k: How it ended
    v: "A new integration becomes configuration, not development."
stack:
  - Python
  - FastAPI
  - React
  - PostgreSQL
tags:
  - architecture
  - data
  - product
---

## The problem

The platform exchanges data with external clinical data capture systems, each with its own structure and naming. Every integration was solved with custom code, very similar from one to the next but different in exactly the part that mattered.

A fix had to be repeated across several copies, and every new integration went through engineering. The people who understand the data best couldn't change anything on their own.

I framed it as a product problem: the people who know the data should be able to build the flow without depending on engineering.

## Decisions

**Configuration instead of code.** A flow is a graph of steps stored as configuration. A catalog of step types (extract, transform, load, compare, among others) is composed at runtime. A new capability is a new step type; a new integration is a graph. Cost: the catalog has to be designed well before it grows.

**Building on the platform instead of adopting a generic tool.** We needed a domain interface (clinical forms, field mappings), not a generic graph editor. It's a call that could go either way; I wrote down the reasoning so it can be revisited.

**Per-step preview.** A single step can run on a sample and show its output right away, and an inspector shows what goes in and out at each step. Cost: validation happens on a sample, not on the full volume.

**Performance as a requirement.** I measured the preview early and tuned it (batched queries and a short-lived cache) until it responded without interrupting the work. Cost: tuning time before extending the interface.

## Outcome

- Onboarding a new integration becomes a configuration task.
- The people who know the data can build and review flows directly.
- A fix is made in one place.

## What I'd do differently

I'd measure the preview's performance before building the interface on top, not after.
