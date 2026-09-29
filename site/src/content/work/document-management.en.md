---
slug: document-management
lang: en
order: 9
title: Document management with permissions and traceability
project: Document management
headline: I worked on the document manager of a clinical trial platform, where every file has to be clear about who can see it and every action is recorded.
domain: Clinical trial management platform
role: Technical Lead · permission model and file uploads
featured: false
summary:
  - k: The problem
    v: "Nested folders and documents shared with internal and external users, with every action traceable."
  - k: The decision
    v: "Folder- and document-level permissions resolved on the server, and an activity record kept apart from the main operation."
  - k: How it ended
    v: "A document manager the team keeps extending on that foundation."
stack:
  - TypeScript
  - Node.js
  - React
  - PostgreSQL
tags:
  - architecture
  - security
  - audit
---

## The problem

The platform needed its own document manager: organization and personal folders, versions, a recycle bin, downloads and documents shared with internal and external users. In a regulated environment, every action on a document has to be recorded.

We built it as a team. I worked mainly on the API, file uploads and the frontend.

Access was the hard part. A document shared inside a folder structure has to be visible to the person who receives it without exposing the rest, and someone with access to a folder should also see whatever is added to it later.

## Decisions

**Folder- and document-level permissions, computed ahead of time.** We store each user's effective access to each item instead of working it out on every read. That keeps queries simple and fast. Cost: sharing, moving or versioning means recalculating, and those cases need care.

**Traceability off the critical path.** The activity record is processed separately from the user's operation, so it doesn't slow down each response. Cost: more moving parts to watch so no record gets lost.

## Outcome

- The document manager became a central part of the platform, with folder- and document-level permissions and traceability for every action.

## What I'd do differently

I'd document the permission model from the start, with examples, so the team and users understand why someone can or can't see a document.
