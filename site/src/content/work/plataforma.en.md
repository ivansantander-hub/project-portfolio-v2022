---
slug: plataforma
lang: en
order: 2
title: Turning hand-written screens into a configurable platform
project: SaaS platform
headline: "As Technical Lead of a SaaS product in a regulated industry, I moved forms, dashboards, data flows and screens from custom code to configuration, and brought AI to the team without exposing sensitive data."
domain: "Employer · SaaS product in a regulated industry"
cardLine: "Employer · regulated industry"
role: "Technical Lead · solution design, architecture and team"
featured: true
confidential: true
media:
  image: /img/casos/plataforma/esquema.svg
  alt: "Diagram: hand-written forms, dashboards, integrations and screens go through an engine and come out as configuration"
points:
  - "**Configuration instead of code:** a change between projects no longer goes through engineering."
  - "**Traceability by design:** per-file permissions, every action logged and verifiable signatures."
  - "**AI with care:** a coding assistant for the team and an AI proposal that starts from privacy."
moreLabel: "See what I built"
stack:
  - TypeScript
  - Node.js
  - React
  - PostgreSQL
  - LLM APIs
tags:
  - technical leadership
  - architecture
  - platform
---

Client details, screenshots and internal figures are left out under a confidentiality agreement. What follows describes the kind of problem, the decisions and my role.

## Configuration engines

**A flow engine for data integrations.** Each integration with external systems was custom code, nearly identical but different in exactly the part that mattered. I moved it to a graph of steps stored as configuration, with a catalogue of step types and a preview that runs one step on a sample. People who know the data build the flow without going through engineering.

**Forms defined by schema.** In the modules that change most between projects, a form stopped being a hand-written screen: it is a schema the frontend draws and the backend validates.

**Configurable dashboards.** Dashboards were written one by one. Now a dashboard is configuration and the data is resolved on the server, with the permissions of whoever is looking.

**Generic tracking screens.** A generic grid and service serve the tracking screens from configuration, instead of one screen per case.

## Documents and evidence

**Document management.** Every file is clear about who can see it and every action is logged, because in a regulated industry traceability is not optional.

**Electronic signatures.** Signing flows end in a document with evidence of who signed and a way to verify it later.

## Team and AI

**A local environment in one command.** A command-line tool clones, configures, diagnoses and starts the environment, with an assistant that guides each step.

**An AI coding assistant.** An assistant that starts from the team's context: specialised roles, written conventions and human review before any change is merged.

**An AI proposal that starts from privacy.** The platform handles sensitive data and had no AI features. I wrote a proposal to add them with privacy as the starting point and validated it with a prototype.

**Simplifying the architecture.** A system that had grown piece by piece for years. I made an inventory and prepared options with their costs, so simplifying became a decision that could be evaluated.

## What I take from it

That a Technical Lead's job on a platform like this is turning what repeats into configuration, so the team spends its time on what is actually different.
