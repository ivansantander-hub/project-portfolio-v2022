---
slug: digital-signatures
lang: en
order: 6
title: Electronic signatures with a verifiable evidence certificate
project: Electronic signatures and certificates
headline: Signature workflows in the document manager end in a certificate with each signer's details. I built the service that generates it and, later, PKCS#7 digital signing of the PDFs with a record that lets anyone verify them.
domain: Clinical trial management platform
role: Technical Lead · workflow orchestration, certificate service and digital signing
period: 2025 – 2026
featured: false
summary:
  - k: The problem
    v: "A document signed by several people, internal and external, needs evidence of who signed, when and from where, and a way to check the PDF hasn't changed."
  - k: The decision
    v: "A worker that generates the certificate outside the request, merges it with the document and signs the PDFs last, with a SHA-256 hash and a verification code."
  - k: How it ended
    v: "PKCS#7 signing and verification reached production in June 2026, using a self-signed certificate."
metrics:
  - value: "50"
    label: "my commits in the certificate service, out of 81"
  - value: "3"
    label: "digitally signed PDFs per workflow: certificate, signed document and completed document"
stack:
  - Node.js
  - TypeScript
  - RabbitMQ
  - PostgreSQL
  - Prisma
  - AWS S3
  - Handlebars
  - PKCS#7
  - Next.js
tags:
  - e-signature
  - security
  - audit
---

## The problem

In the document manager, whoever uploads a PDF can set up a signature workflow: place fields on the document (signature, initials, name, date, text), assign signers in order and send it. Signers can be internal or external users; external ones come in through a link and a one-time code sent by email. That token and code part was mostly the team's work: they are stored as HMAC-SHA256 and have an attempt limit.

Once everyone has signed, there has to be evidence: who signed, when, from which IP, and a final document that can't be altered without it showing. Doing that inside the last signer's request wasn't viable, since it means rendering, converting and merging PDFs, uploading them to S3 and sending notifications.

## Decisions

**The workflow in an orchestrator with a separate validator.** In August 2025 I pulled the signature mutation out of a long resolver and split it into an orchestrator, a workflow service and a validator, with unit tests. The orchestrator handles state transitions and signer sync; each signer is stored with the IP they signed from. Cost: more pieces to follow a signature end to end.

**A queue worker for the certificate.** When a workflow completes, a message goes to RabbitMQ. In October 2025 I built the worker that consumes it: it builds an HTML certificate from a template (document, sender, dates, status and one row per signer with their IP and fields), converts it to PDF through an external service, merges it with the document (the signed version if there is one) and registers each file as a typed path of the document (original, converted, signed, certificate, completed). Cost: an external dependency for conversion, and an intermediate "processing" state that can get stuck.

**Re-queue what gets stuck.** For that state I added a periodic job that republishes workflows that have been "processing" for too long, plus retries and a dead-letter queue. Cost: it is a database poll running separately from normal queue consumption.

**Sign last, after merging.** In June 2026 I added PKCS#7 digital signing with a self-signed certificate. The first version signed before merging the PDFs, and the merge left invalid signatures inside the completed document, so I moved signing to a later phase. Each signed PDF creates a record with its SHA-256, the certificate details (issuer, serial, thumbprint, validity) and a verification code the certificate shows as a QR code. Cost: if signing fails, the PDF stays unsigned and only the error is logged; the choice was not to block delivery of the document.

**A swappable signing strategy.** Signing sits behind an interface. Only the self-signed implementation exists today; commercial certificate providers were left as unimplemented options. Cost: a self-signed certificate lets you check integrity, but doesn't back the signer's identity to a third party.

**Public verification.** A page that needs no session takes the code from the QR or the file itself; with the file, the browser computes the SHA-256 and looks it up by hash. The server compares the stored hash with the object in S3, checks that the PDF has a signature structure and reports whether the certificate is self-signed or expired. Every verification goes to the audit log.

## Outcome

- The signature certificate has been in production since late 2025; PKCS#7 signing, the SHA-256 hash and the verification URL shipped in DMS version 1.5.0, in June 2026.
- In December 2025 I fixed a concurrency issue where signatures were overwritten on save; fields are now merged.
- In June 2026 I added typed signatures with a font, owner force-completion of a workflow (pending signers are marked as withdrawn) and document regeneration.

## What I'd do differently

I'd build digital signing and the verification record together with the certificate, instead of adding them months later as a second stage.
