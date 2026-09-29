---
slug: dashboards
lang: en
order: 7
title: Per-project configurable dashboards
project: Dynamic dashboards
headline: Every dashboard was hand-coded and fed by a per-study ETL. We replaced them with an engine where a dashboard is configuration stored in the database and the data is resolved on the server.
domain: Clinical trial management platform
role: Technical Lead · solution design, data pipeline and engine foundation
period: 2026
confidential: true
featured: false
summary:
  - k: The problem
    v: "Dashboards fixed in code, duplicated across modules and fed by one ETL per study. Changing a label required a deploy."
  - k: The decision
    v: "The dashboard as configuration in the database, a widget catalog and a server-side data pipeline."
  - k: How it ended
    v: "An engine with 19 widget types and a map that says which widgets can be built today with the data that exists."
metrics:
  - value: "19"
    label: "widget types in the catalog"
  - value: "17 → 5"
    label: "reports consolidated into per-entity grains"
  - value: "89"
    label: "widgets mapped to their data source"
stack:
  - Next.js
  - TypeScript
  - GraphQL Federation
  - Recharts
  - Redis
  - Python
  - AWS S3
tags:
  - product
  - data
  - architecture
---

## The problem

The platform's dashboards were coded one at a time. Several showed the same data in different modules, and each study had its own Python ETL with form identifiers written into the code. When a client asked to hide a widget or rename a label in their project, that meant a code change and a deploy. Some clients ended up building their reports in external BI tools.

## Decisions

**A dashboard is configuration, not code.** Each dashboard and each widget is stored in the database: chart type, data source, fields, filters and grid position. The "factory" dashboards are presets built from the same components any admin can use. I wrote the technical solution the task list was drawn from and the first frontend commit of the engine. Cost: the engine is the largest part of the frontend and has special cases per widget family.

**Two GraphQL paths that don't mix.** Authoring (creating, moving, deleting widgets) lives in the projects service, where permissions already were. Data resolution lives in the analytics service. Cost: a new feature sometimes touches two services.

**Data is resolved on the server.** The frontend asks for the whole dashboard's data in one query, and the server interprets each widget's configuration: fetch, enrich, compute columns, filter, aggregate, sort, paginate and evaluate alerts. I wrote the first version of that pipeline and its Redis cache. Cost: the frontend doesn't know which fields it will get until the server answers.

**The EDC is queried on demand with a cache, not copied.** Data from the external clinical data capture system isn't duplicated into PostgreSQL. It goes through a proxy with a Redis cache, 5 minutes by default and configurable per project, and each widget can show whether its data came from cache. Cost: data can be up to that old.

**Fewer, wider reports.** I consolidated 17 operational reports into 5 per-entity grains (study, site, country, enrollment time series and subject analysis) so the frontend doesn't have to join reports. The report key doesn't depend on the project; isolation lives in the S3 path, so presets work for any project without rewriting them. Cost: a change to one grain affects many widgets.

## Outcome

- The team built most of the frontend engine on top of that foundation. It now has 19 widget types, each with its own documentation and, for the ones that can be created from the catalog, a manual QA script.
- The team changed widget version loading to one query per dashboard instead of one per widget; with 20 widgets that had been 20 round trips.
- I checked the 89 widgets of four operational dashboards against the schema and real data: 69 can be built with what exists, and 20 need three migrations, mostly a status-change history that isn't stored today.
- A verification run of the consolidated pipeline produced the 5 grains in about 30 seconds on a test project.

## What I'd do differently

I'd build the widget-to-data map before building the catalog. We did it afterwards, and that's when it showed that some widgets depended on dates the database doesn't store.
