---
slug: digital-signatures
lang: en
order: 6
title: Electronic signatures with verifiable evidence
project: Electronic signatures
headline: I worked on the signature workflows of the document manager, which end in a document with evidence of who signed and a way to verify it later.
domain: Clinical trial management platform
role: Technical Lead · workflow orchestration, evidence generation and document signing
featured: false
summary:
  - k: The problem
    v: "A document signed by several people, internal and external, needs evidence of the signing and a way to check it hasn't changed."
  - k: The decision
    v: "Generate the evidence outside the user's request and sign the final document so it can be verified."
  - k: How it ended
    v: "Signature workflows with an evidence document and later verification."
stack:
  - TypeScript
  - Node.js
  - React
  - PostgreSQL
tags:
  - e-signature
  - security
  - audit
---

## The problem

In the document manager, whoever uploads a document can set up a signature workflow: define where each person signs, assign the signers and send it. Signers can be internal or external users. Access for external signers was mostly the team's work.

Once everyone has signed, there has to be evidence of who signed and when, and a final document that can't be altered without it showing. Doing all of that inside the last signer's action wasn't viable: generating and assembling the documents is heavy work.

## Decisions

**Split the workflow into pieces with clear responsibilities.** I broke up the signing logic, which was concentrated in one place, into parts that handle workflow state, rules and validation, with tests. Cost: more pieces to follow to understand a signature end to end.

**Generate the evidence in the background.** When a workflow completes, a separate process builds the evidence document with each signer's details and joins it to the signed document. The user doesn't wait for that work. Cost: that process has to be watched so it finishes, and picked up again if it doesn't.

**Sign the final result and allow verifying it.** The final document is signed so any alteration can be detected, and anyone who receives it can verify it later. Cost: verification is one more surface to maintain and test.

## Outcome

- Signature workflows end in a document with evidence for each signer.
- Whoever receives a signed document can later check that it wasn't modified.

## What I'd do differently

I'd build document signing and verification together with the evidence, instead of adding them in a second stage.
