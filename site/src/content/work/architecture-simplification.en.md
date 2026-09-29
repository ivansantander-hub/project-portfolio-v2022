---
slug: architecture-simplification
lang: en
order: 1
title: Simplifying an architecture that grew by accumulation
project: Architecture simplification
headline: A system that had grown piece by piece over the years. I built an inventory and prepared costed options so that simplifying it became a decision that could be evaluated.
domain: Clinical trial management platform
role: Technical Lead → Technical Product Owner · inventory and architecture proposal
featured: false
summary:
  - k: The problem
    v: "The system had more pieces than the team could comfortably maintain."
  - k: The decision
    v: "Measure before proposing and present costed options, all with a step-by-step migration."
  - k: How it ended
    v: "The discussion moved from a general feeling to concrete options that could be compared."
stack:
  - TypeScript
  - Next.js
  - Python
tags:
  - architecture
  - leadership
  - migration
---

## The problem

The platform operates in a regulated environment, where a badly migrated record has real consequences.

The system had grown by accumulation: each new need brought a new piece. Decisions that made sense on their own had, together, left a system that was hard to maintain. A cross-cutting change had to be repeated in several places, bringing someone onto the team took longer than it should, and the problem grew along with the business. It all had the same cause, but nobody had laid it out concretely.

## Decisions

**Measure before proposing.** I went through the code part by part and built an inventory: what exists, what is in use and what depends on what. The conversation moved from "the system feels heavy" to a document that non-technical people could read too. Cost: review time before anything could be proposed.

**Options instead of a single proposal.** I prepared a conservative alternative and a structural one, each with scope, sequence and rollback criteria. That way the discussion was about which to choose, not about approving or rejecting. Cost: more preparation work.

**Migrate in parts.** Both options replace the system gradually while the existing one keeps running. Cost: living with two systems for a while, in exchange for not depending on a hard cutover in a regulated environment.

**Respect existing commitments.** Deliverables already promised come first, and one person stays dedicated to operations. Cost: the migration moves more slowly, but the plan is realistic.

## Outcome

- Knowledge of the system, which lived in a few people's heads, is now written down and available to the team.
- The architecture decision is discussed with options and costs in view.
- The same idea of configuration instead of code guided the frontend design (see the configurable screens case).

## What I'd do differently

I'd build the inventory earlier, when the system was smaller and the review simpler.
