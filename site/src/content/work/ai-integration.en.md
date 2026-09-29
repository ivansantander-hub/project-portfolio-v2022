---
slug: ai-integration
lang: en
order: 4
title: A proposal for adding AI to a platform in a regulated environment
project: AI integration
headline: The platform had no AI features and handles sensitive data. I wrote a proposal to integrate AI with privacy as the starting point and validated it with a prototype.
domain: Clinical trial management platform
role: Technical Lead / Technical Product Owner · integration proposal and prototype
featured: false
summary:
  - k: The problem
    v: "Adding AI to a platform in a regulated environment without exposing sensitive data."
  - k: The decision
    v: "Privacy first, a single entry point for AI and human approval of its outputs."
  - k: How it ended
    v: "A written proposal and a prototype that helped validate the idea."
stack:
  - TypeScript
  - Node.js
  - React
  - LLM APIs
tags:
  - ai
  - architecture
  - privacy
---

## The problem

The platform had no AI features and operates in a regulated environment, with sensitive data that can't leave a controlled environment. Before adding anything, I had to work out how to use a model without exposing that data and how to keep a record of what the AI does.

## Decisions

**Privacy as the main criterion for choosing a provider.** I compared options and prioritized a cloud model provider that kept the data inside a controlled environment, over other advantages. Cost: we're more tied to that provider and its quirks.

**A single entry point for AI.** I proposed that every use of AI go through one service, so data protection and usage records live in one place and switching models doesn't affect everything else. Cost: one more component to deploy and maintain.

**A person approves AI outputs.** No output is treated as official without human review. Cost: AI-assisted flows still need a manual step.

**A quick prototype to validate the idea.** I built a simple test assistant to check that the approach worked before investing more. Cost: it was deliberately limited and doesn't replace the full design work.

## Outcome

- A written proposal the team can use as a basis for deciding how to integrate AI.
- A prototype that showed the idea was viable and surfaced the practical issues before investing more.

## What I'd do differently

I'd build the data protection layer before the prototype. The proposal put it at the center, but the prototype came first to validate the idea, and the order should have been the other way around.
