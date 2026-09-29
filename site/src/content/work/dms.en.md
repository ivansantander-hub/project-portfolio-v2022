---
slug: dms
lang: en
order: 5
title: Document control with inherited permissions and an audit trail
project: Document management (DMS)
headline: The document management system of a clinical trial platform, where every file has to know who can see it and every action leaves a trace. I worked on the permission model, uploads to S3, caching and, later, centralizing read authorization.
domain: Clinical trial management platform
role: Technical Lead · permission model, file uploads, caching and server-side authorization
period: 2024 – 2026
confidential: true
featured: false
summary:
  - k: The problem
    v: "Nested folders, documents shared with internal and external users, and a mandatory audit record for every action."
  - k: The decision
    v: "Effective permissions stored as rows with their source (explicit, inherited downward, upward), and audit logs published to a queue."
  - k: How it ended
    v: "34 production deployments between March 2025 and August 2026. Consolidating read authorization is in review."
metrics:
  - value: "34"
    label: "DMS production deployments (Mar 2025 – Aug 2026)"
  - value: "577"
    label: "changes listed in the production release notes"
  - value: "608"
    label: "my commits across the DMS GraphQL API, REST API and frontend"
stack:
  - GraphQL Federation
  - Node.js
  - TypeScript
  - Next.js
  - PostgreSQL
  - Prisma
  - Redis
  - RabbitMQ
  - AWS S3
tags:
  - architecture
  - security
  - audit
---

## The problem

The platform needs its own document manager: company and personal folders, versions, a recycle bin, documents shared with internal and external users, zip downloads and moving whole folders. In a regulated domain, every action on a document also has to be recorded with who, when and from where.

Several of us built it starting in December 2024: a federated GraphQL API, a REST API for uploads, a Next.js frontend and four workers consuming from RabbitMQ (downloads, audit logs, folder moves and signature certificates). The workers were mostly written by my teammates; I worked mainly on the GraphQL API, uploads and the frontend.

Access was the hard part. A document shared three folders deep has to be visible to the person who receives it without exposing the rest of those folders, and someone with access to a folder should also get access to whatever is added to it later.

## Decisions

**Effective permissions stored as rows, with their source.** Each permission is a row per user and item, marked as explicit, inherited downward or inherited upward. Downward copies access levels to everything under a folder; upward grants read-only access to parent folders, just enough to navigate to the shared item. On conflict, explicit wins. Cost: sharing, moving or versioning means recalculating rows, and several of my commits in September 2025 were fixes for those cases.

**Multipart upload to S3 with a route through the backend.** I moved the upload API to AWS SDK v3 and added a route that uploads each part from the server, because the bucket has Object Lock enabled and this way the SDK adds the integrity check that mode requires. Cost: on that route files go through our service instead of straight from the browser to S3.

**Audit logs published to a queue.** Each operation builds a record with action, entity, result, IP, browser, operating system and device, and publishes it to RabbitMQ; a worker stores it. The team moved log writes to the queue so auditing doesn't slow down the response. Cost: the audit trail now depends on the queue and the worker, and both need to be monitored.

**Redis cache for the DataLoaders.** I added a Redis cache with explicit invalidation when documents and folders are deleted, plus a mutation other services can call to invalidate. Cost: every new write path has to remember to invalidate, or stale data gets served.

**Read authorization centralized on the server.** In September 2026 I wrote a layer that computes each request's read scope in one place (owner or effective permission, active company, not deleted, external access token scope), so that logic isn't repeated in every query. It has three modes: off, shadow (logs what it would hide without hiding it) and enforce. Denials go to the audit log. Cost: more queries per request and an observation period before enforcing.

## Outcome

- The DMS reached production in March 2025 (0.3.0), 1.0.0 in December 2025 and 1.9.0 in August 2026: 34 deployments and 577 listed changes.
- Server-side authorization and atomic versioning (one transaction that locks the document, blocks new versions while a signature workflow is running and keeps the owner) are on branches in review, not in production.

## What I'd do differently

I'd design the authorization layer as a central piece from the start. Consolidating it later was a large change, shadow mode included, instead of growing alongside each query.
