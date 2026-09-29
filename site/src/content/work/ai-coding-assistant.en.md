---
slug: ai-coding-assistant
lang: en
order: 6
title: An AI coding assistant adapted to the team's way of working
project: AI coding assistant
headline: A coding assistant that starts from the team's context, with specialized roles, written conventions and human verification before changes land.
domain: Clinical trial management platform
role: Technical Lead · design and implementation
featured: false
summary:
  - k: The problem
    v: "A generic assistant doesn't know a codebase spread across many repositories or the team's process."
  - k: The decision
    v: "Specialized roles, conventions as editable documents and human verification before changes land."
  - k: How it ended
    v: "An internal tool that follows the workflow the team already had."
stack:
  - TypeScript
  - Node.js
  - React
  - LLM APIs
tags:
  - ai
  - internal tools
  - automation
---

## The problem

The platform is spread across many repositories. A generic coding assistant doesn't know how they relate, how the team writes a task, or how a change gets checked before it goes to testing. I wanted a tool that started from that context: one that helps implement and review code while following the process the team already uses.

## Decisions

**Not depending on a single model provider.** I kept the assistant's logic separate from the model that runs it, so the provider can change without rewriting the tool. Cost: differences between providers have to be handled by hand.

**Specialized roles instead of one assistant for everything.** I defined separate roles, for example one that implements and one that only reviews, each with access limited to what it needs. Cost: more pieces to configure and keep consistent with each other.

**Conventions written as editable documents.** The team's way of working lives in documents anyone can read and change, instead of being hidden in code. Cost: behavior lives in text, and a change can only be checked by running it.

**A person verifies before a change lands.** The assistant proposes and tests, but someone on the team makes the final call. Cost: the flow still has a manual step and moves more slowly.

## Outcome

- An internal tool that knows the structure of the code and the team's process.
- Less time spent explaining context to the assistant on each task.
- Changes that are reviewed by a person before they land.

## What I'd do differently

I'd keep a record of the tool's changes from the start and ship them in smaller, more spaced-out steps, instead of piling a lot of work up at the end.
