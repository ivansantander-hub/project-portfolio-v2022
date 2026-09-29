---
slug: bedrock-ai-strategy
lang: en
order: 4
title: A strategy for adding AI without taking clinical data out of a controlled environment
project: AI strategy with AWS Bedrock
headline: The platform had no AI in production and handles data that can't leave a controlled environment. I wrote an integration proposal built on AWS Bedrock and tested it with an assistant spike that queries platform data while respecting the user's permissions.
domain: Clinical trial management platform
role: Technical Lead / Technical Product Owner · integration strategy and spike
period: 2026
featured: false
summary:
  - k: The problem
    v: "Zero AI in production, in a domain with regulation, patient data and a traceability requirement."
  - k: The decision
    v: "Bedrock for privacy and the BAA, behind a single AI service that owns redaction, auditing and costs."
  - k: How it ended
    v: "A four-phase proposal and a read-only assistant spike merged into the development branch."
metrics:
  - value: "4"
    label: phases in the proposed roadmap
  - value: "8"
    label: read-only GraphQL queries for the assistant
  - value: "~8,000"
    label: characters of context per question, at most
stack:
  - AWS Bedrock
  - Claude
  - Next.js
  - GraphQL
  - TypeScript
  - AWS IAM
tags:
  - ai
  - architecture
  - privacy
---

## The problem

The platform had around 33 microservices and no AI features in production. Before adding anything there were four constraints: industry regulation (ICH-GCP, 21 CFR Part 11, GDPR), patient personal and health data must not leave the controlled environment, every AI decision must be traceable, and the provider has to be able to sign a BAA to process clinical data.

## Decisions

**Bedrock instead of calling the model APIs directly.** I documented the comparison: on Bedrock the data isn't used for training, the model providers don't see it, a BAA is available, you choose the region, and there's VPC isolation through PrivateLink. Cost: we're tied to AWS and to how Bedrock exposes each model, which in practice brought its own configuration problems.

**A single AI service as a subgraph of the existing gateway.** I proposed a central service with a versioned prompt registry, redaction of personal data before anything is sent to the model, a Bedrock client with fallback models, an audit log, cost tracking per client and project, and per-client rate limiting. That keeps redaction and auditing in one place, and switching models doesn't touch other services. Cost: one more service to deploy and maintain in an architecture that already had many.

**A person approves every AI output.** To meet electronic-records rules, the proposal treats each prompt version as the version of a method and requires human approval before an output becomes official. Cost: AI-assisted flows still need a manual step.

**Model by use case.** A fast, cheap model for classifying documents and answering queries; a mid-tier one for data extraction and drafting; the most capable one only for compliance review. Cost: more configuration and routing logic to maintain.

**A spike with platform data and the user's permissions.** I first wired a Bedrock Agent to a frontend page, but it had no access to the platform's data. The next day I replaced it with direct calls to the Converse API with streaming: a keyword-based intent classifier decides what to query, read-only GraphQL queries run with the user's session token (so it only sees what the user can already see), and the result is injected into the prompt. Cost: the classifier is crude, context is capped, files only contribute metadata, and conversation history lives in the browser.

## Outcome

- The proposal is written up with the architecture, use cases, a model per use case, estimated costs per scenario and a four-phase roadmap.
- The spike was merged into the development branch, with the configuration issues documented: inference profiles instead of model IDs, the provider's first-use form, and IAM permissions that must cover every region the profile routes to.
- Later I added an option to LearUp Agent, my coding assistant, to use Claude through Bedrock with AWS credentials.

## What I'd do differently

I'd build the redaction layer before the spike. The proposal put it at the center, but the spike came first to validate the idea, and the order should have been the other way around.
