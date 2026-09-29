---
slug: shell-system
lang: en
order: 16
title: Tracking screens from configuration
project: Configurable screens
headline: Every tracking screen was built by hand. I designed an approach where a generic grid and service serve these screens from configuration.
domain: Clinical trial management platform
role: Technical Lead · design and implementation
featured: false
summary:
  - k: The problem
    v: "Each new tracking screen repeated the same work in frontend and backend."
  - k: The decision
    v: "A generic grid and service driven by cascading configuration."
  - k: How it ended
    v: "Adding a screen becomes adding a configuration entry."
stack:
  - TypeScript
  - React
  - Next.js
  - PostgreSQL
tags:
  - architecture
  - frontend
  - configuration
---

## The problem

In the platform, each tracking screen (lists of records the team edits and reviews) was built by hand, with its own components, form and backend logic. The screens were very similar, yet each one repeated the work.

The question was whether a generic component and service, driven by configuration, could serve all of them.

## Decisions

**Configuration instead of code.** A single definition declares what data each screen shows, what can be edited and which panels go with each row. The create and edit form comes from the same definition. Cost: that configuration has to stay in step with the data model, so I added a test that validates it.

**Reuse the existing grid library.** My first attempt was to write the table by hand. I switched to the library the application already used, with paging, sorting and filtering handled on the server. Cost: the design is tied to that library's conventions.

**Cascading configuration that stores only differences.** First the base definition, then general settings, then per-project settings. Each level stores only what changes from the one before, so a project keeps receiving general improvements. Cost: configurations have to be compared carefully to avoid saving false differences.

**Measure before optimizing.** I ran load tests with synthetic data. The cost was in counting and paging large tables, not in the configuration. I replaced the exact count with an approximate one. Cost: the interface has to show when the total is approximate.

## Outcome

- Adding a tracking screen means adding a configuration entry, with no new components or logic.
- Configuration errors are shown in the interface with their reason, instead of a blank screen.

## What I'd do differently

I'd start directly on the existing grid library instead of writing the table by hand, and I'd validate the design with the people who use these screens before building the configuration.
