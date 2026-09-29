---
slug: dashboards
lang: en
order: 10
title: Per-project configurable dashboards
project: Configurable dashboards
headline: Dashboards were hand-coded one by one. We replaced them with an engine where a dashboard is configuration and the data is resolved on the server.
domain: Clinical trial management platform
role: Technical Lead · solution design, data flow and engine foundation
featured: false
summary:
  - k: The problem
    v: "Dashboards fixed in code and duplicated across modules, where changing a label required a deploy."
  - k: The decision
    v: "The dashboard as configuration, a widget catalog and data resolved on the server."
  - k: How it ended
    v: "A dashboard engine each project can adjust without code changes."
stack:
  - TypeScript
  - React
  - Node.js
  - PostgreSQL
tags:
  - product
  - data
  - architecture
---

## The problem

The platform's dashboards were coded one at a time. Several showed the same data in different modules, and data preparation depended on per-study details written into the code. When a client asked to hide a widget or rename a label in their project, that meant a code change and a deploy.

## Decisions

**Configuration instead of code.** Each dashboard and each widget is stored as configuration: chart type, data source, fields, filters and position. Predefined dashboards are built from the same components an admin can use. I wrote the solution design and the foundation of the frontend engine. Cost: the engine is a large piece and has special cases per widget family.

**Data is resolved on the server.** The frontend asks for the whole dashboard's data, and the server interprets each widget's configuration: it fetches, filters, aggregates and sorts. I wrote the first version of that flow. Cost: the frontend doesn't know which fields it will get until the server answers.

**Query data where it lives instead of copying it.** Data coming from external systems is queried on demand behind a cache layer, instead of being duplicated. Cost: data can arrive slightly out of date.

**Fewer, more complete sources.** I grouped the operational reports by entity so the frontend doesn't have to join them. Cost: a change to one source affects many widgets.

## Outcome

- The team built most of the engine on top of that foundation.
- Each project can adjust its dashboards without going through a deploy.
- We reviewed which widgets can be built with the data that exists and which need new data.

## What I'd do differently

I'd map widgets against data before building the catalog, to find out early what information was missing.
