---
slug: dynamic-forms
lang: en
order: 8
title: Forms defined by configuration
project: Configurable forms
headline: Every form was a hand-written screen. For the modules that change most between projects, the form became a schema the frontend renders and the backend validates.
domain: Clinical trial management platform
role: Technical Lead · shared form builder, conditional logic and integrations
featured: false
summary:
  - k: The problem
    v: "Hand-written forms per module, when each project wanted different fields."
  - k: The decision
    v: "The form as data: fields, sections and rules stored as configuration and validated on the backend too."
  - k: How it ended
    v: "Forms in those modules are adjusted per project without code changes."
stack:
  - TypeScript
  - React
  - Node.js
  - PostgreSQL
tags:
  - product
  - frontend
  - architecture
---

## The problem

The platform's tracking modules each had their own hand-written create and edit form. For some clinical modules that wasn't enough: each project needed different fields, different sections and rules like "this field only appears if that one has a given value". Doing it in code meant a change and a deploy per project.

## Decisions

**Configuration instead of code.** The team defined a form as a record with its fields, sections and settings, and responses are stored linked to the item they belong to, as drafts or submitted. Cost: the database doesn't check the shape of the responses; that job moves to the application.

**Rules are data too, and they're validated on the server.** A field can be shown or required depending on the value of others. I added the evaluation of those rules to the read-only view. The backend validates every response again, so the rules don't depend only on the browser. Cost: the same logic lives on the frontend and the backend, and they have to be kept aligned.

**A shared builder.** The team had built a drag-and-drop builder inside one module. I turned it into a shared component, added section management and connected it to an external clinical data integration. Cost: the builder's state grew quite a bit.

**Warn instead of overwrite.** Several people edit the same record. If someone else saved first, the user sees who changed it and doesn't lose what they typed. Cost: the conflict is resolved by hand.

## Outcome

- In those modules, adding a field or a rule doesn't need a deploy.
- The other modules still use their own forms; we didn't migrate them.

## What I'd do differently

I'd define the schema contract once and share it between builder, view and validation, instead of each layer having its own version.
