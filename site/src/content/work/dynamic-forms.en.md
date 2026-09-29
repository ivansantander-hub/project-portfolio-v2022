---
slug: dynamic-forms
lang: en
order: 8
title: Forms defined by configuration
project: Dynamic forms
headline: Every tracker form was a hand-written modal. For adverse events and regulatory submissions, the form became a schema stored in the database that the frontend renders and the backend validates.
domain: Clinical trial management platform
role: Technical Lead · shared form builder, conditional logic and EDC integration
period: 2025 – 2026
featured: false
summary:
  - k: The problem
    v: "A hand-written create and edit modal per tracker. Each project wanted different fields, and that meant code."
  - k: The decision
    v: "The form as data: schema, layout and rules in JSON, rendered on the frontend and validated again on the backend."
  - k: How it ended
    v: "Adverse event and submission forms are configured without a deploy. The other trackers still have their own modals."
metrics:
  - value: "8"
    label: "field types"
  - value: "8"
    label: "condition operators"
  - value: "3"
    label: "requirement levels (required, soft, optional)"
stack:
  - Next.js
  - TypeScript
  - React Hook Form
  - dnd-kit
  - GraphQL
  - PostgreSQL
  - Prisma
tags:
  - product
  - frontend
  - architecture
---

## The problem

The platform's trackers (sites, documents, visits, contacts) each have their own hand-written create and edit modal; I counted 11. For adverse events and regulatory submissions that wasn't enough: each project needed different fields, different sections and rules like "this field only appears if that one has a given value". Doing it in code meant a change and a deploy per project.

## Decisions

**A form is a database record.** The team defined a `Form` model with the field schema, the section layout and the settings (multiple submissions, drafts, access) in JSON columns with GIN indexes. Responses are stored as JSON too, as draft or submitted, linked to the adverse event or submission they belong to. Cost: the database doesn't check the shape of the data; that job moves to the application.

**Conditions are data too.** A field can have `showIf` and `requiredIf` with AND/OR groups and eight operators (equals, not equals, contains, greater than, empty, and so on). I added the evaluation of those conditions to the read-only view. The backend validates the response against the schema again, conditions included, so a modified client can't skip the rules. Cost: the same logic is implemented twice, on the frontend and on the backend, and the two can drift.

**Soft-required fields and drafts.** Besides required and optional, a field can be soft-required: a draft can be saved without it, but it's enforced on submit. Cost: one more state to explain and test.

**A way out for what isn't a simple field.** On top of the eight basic types, a `COMPONENT` field points to a component registered by name. Cost: those fields are code again.

**A shared builder, connected to the EDC.** The team had built a drag-and-drop builder inside the submissions tracker. I turned it into a shared component, added section management and connected it to the integration with the external clinical data capture system: the adverse event form is generated from the EDC field mapping, and a preview validates it before creation is confirmed. Cost: the builder's state ended up in a hook of about 1,400 lines.

**Warn instead of overwrite.** Several people edit sections of the same adverse event. I made each save send the version that was loaded; if someone else saved first, the backend rejects the change, the user sees who changed it, and what they typed isn't lost. Cost: the user has to resolve the conflict by hand.

## Outcome

- Adverse event and regulatory submission forms are defined by configuration: adding a field or a condition doesn't need a deploy.
- The renderer and the submissions tracker builder are on the main branch. The shared builder and EDC-based generation are in development and QA.
- The other trackers still use their hand-written modals; we didn't migrate them.

## What I'd do differently

I'd define the schema contract once and share it between builder, renderer and validator. Today the builder translates between two vocabularies (lowercase operators in the UI, PascalCase in the stored schema) with conversion tables, and each layer has its own type for the same thing.
