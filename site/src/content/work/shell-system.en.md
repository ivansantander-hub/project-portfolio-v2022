---
slug: shell-system
lang: en
order: 9
title: Serving trackers from a generic component and endpoint
project: Shell system
headline: Every tracker in the platform had its own component folder and resolver. I built an experiment to check whether a generic grid and endpoint, driven by a registry, can replace them.
domain: Clinical trial management platform
role: Technical Lead · design and implementation of the experiment
period: 2026
featured: false
summary:
  - k: The problem
    v: "A new tracker screen meant new components, hook, page, form and resolver."
  - k: The decision
    v: "A server-side registry, a generic route and a configurable grid, with configuration stored as a cascade."
  - k: How it ended
    v: "Working experiment with two trackers. It doesn't replace any real screen yet."
metrics:
  - value: "2"
    label: trackers wired up; adding another is two registry entries
  - value: "15"
    label: GraphQL operations (9 queries, 6 mutations) for every tracker
  - value: "262"
    label: unit tests (121 backend, 141 frontend)
  - value: "34"
    label: e2e tests against the local database
stack:
  - Next.js
  - React
  - TypeScript
  - MUI X DataGrid Pro
  - GraphQL
  - Prisma
  - PostgreSQL
  - Jest
  - Playwright
  - k6
tags:
  - architecture
  - frontend
  - experiment
---

## The problem

Each tracker in the platform (sites, trial master file documents, and so on) was built by hand: a component folder, a hook, a page, a form and a backend resolver. The screens were very similar, yet each repeated the work.

In the consolidation proposal I suggested replacing that with a registry engine. This case is the experiment to test it: a separate branch, with its own routes, that doesn't touch any existing screen. The question was whether a generic component and endpoint could serve the trackers.

## Decisions

**The client asks by registry key, not by model.** An endpoint that accepts a model name is open to all 176 models in the schema, users and sessions included. The server registry declares which model each key serves, which field paths it exposes, which can be written and which panels (comments, documents, history) hang off a row. Every path is validated against metadata generated from the schema: at most three hops, no list relations in the middle, and no credential-like fields. On writes, system-managed fields (id, authorship, soft delete) are excluded. Cost: a metadata generator that has to stay in sync with the schema.

**Use the grid the app already had.** The first attempt rewrote the table by hand, with its own toolbar. I moved to DataGrid Pro, which the current trackers already use, in server mode for paging, sorting and filtering. The shell adds a filter translation that only offers operators the server answers correctly, and a bar that asks, after columns are moved or resized, whether to save the layout for everyone or just this project. Cost: I didn't reuse the existing grid organism, because it is tied to the saved-views model the shell replaces.

**Cascading configuration that stores only differences.** Registry in code, then system configuration, then project configuration, on a table that already existed in the schema, so no migration. At project level only what differs from the inherited value is saved; otherwise editing one title copied every column and the project stopped receiving system changes. Cost: the comparison had to be canonical, because Postgres reorders keys in JSON fields.

**Visible errors instead of a blank screen.** Anything that can't be served comes back as a rejection with a reason, shown in the UI. A rejected filter widens the result, so the warning can't just go to the console. Cost: more states to handle in the UI.

**Measure before optimizing.** I ran a load test with 200,000 synthetic rows. Configuration shape barely matters; what costs is the exact count, text search and deep paging. I replaced the exact count with one capped at 1,000 rows: from 63 to 90 requests per second with 30 virtual users. Cost: the total is no longer exact on large tables and the UI has to know that.

## Outcome

- The experiment works with two trackers. Adding a third is two registry entries, one on the server and one in the frontend, with no new resolver, hook, page or form.
- The create/edit form is generated from the same configuration.
- A registry test checks every entry against the generated schema; it caught mistakes in the first entries I wrote by hand.
- It is still an experiment. Per-project and per-company permissions, per-user preferences, relation pickers in the form and the indexes the load test pointed to are still missing. For now only the grid shell exists.

## What I'd do differently

I'd start directly on DataGrid Pro instead of writing the table by hand. And I'd solve per-project permissions before the configuration screen, since they are the first thing blocking its use on a real tracker.
