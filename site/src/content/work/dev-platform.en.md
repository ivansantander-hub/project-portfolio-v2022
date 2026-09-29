---
slug: dev-platform
lang: en
order: 10
title: A CLI to run a 32-repository polyrepo locally
project: Local development platform
headline: Running the platform locally meant cloning, configuring and starting dozens of independent repositories by hand. I built a CLI that clones, configures, diagnoses and starts the environment through a wizard, and documented every delivery with its real verification.
domain: Clinical trial management platform
role: Technical Lead · CLI design and implementation
period: 2026
featured: false
summary:
  - k: The problem
    v: "32 independent repositories, every service on the same default port, and a gateway that won't start if one subgraph is missing."
  - k: The decision
    v: "A TypeScript CLI that orchestrates bash scripts: clone, configure, diagnose and start whatever each person needs."
  - k: How it ended
    v: "The full stack starts with one command and stops with no orphan processes. Ten commands, validated with real runs."
metrics:
  - value: "32"
    label: repositories the CLI clones, configures and checks
  - value: "10"
    label: commands (clone, setup, dev, doctor, status, logs, restart, update, clean, remotes)
  - value: "~270 → ~55"
    label: estimated connections to the shared database with the whole backend running
  - value: "15"
    label: commits between July and August 2026 (~1,800 lines of TypeScript and ~2,200 of bash)
stack:
  - TypeScript
  - Node.js
  - Commander
  - Bash
  - Docker Compose
  - Kubernetes
  - Prisma
  - Redis
  - RabbitMQ
tags:
  - internal tooling
  - developer experience
  - polyrepo
---

## The problem

The platform lives in 32 independent repositories: GraphQL subgraphs, a federated gateway, a REST API, two frontends, queue workers, cronjobs and the Prisma schemas.

Running it locally had several snags. Every service uses port 4000 by default. Each subgraph needs the link to the shared schema and a generated Prisma client. Each one has its own `.env`. The gateway composes the supergraph at boot, so if one subgraph doesn't respond, it exits. And each service opens about 17 database connections by default: with the whole backend up that was around 270, competing with the development environment's pods.

## Decisions

**A thin CLI over bash scripts.** `./learup` is TypeScript with Commander and hands the heavy work to four scripts (clone, setup, dev, remotes). A future UI should call that same layer. Cost: two languages to maintain and a dependency on Unix tools (`lsof`, `pgrep`, BSD `sed`). macOS is the primary target, WSL2 is the path for Windows, Linux works with some friction, and native Windows is out of scope.

**Wizard by default, flags for scripts.** With no arguments, `dev` asks for mode, frontends, backend, workers and infrastructure. Cost: two entry points to keep aligned.

**Redis and RabbitMQ: Docker or port-forward, with a warning.** Docker Compose gives empty, isolated queues and cache. Port-forward connects to the cluster's, which are shared: the CLI warns about it and suggests the command to scale the cluster workers to zero, but doesn't run it. Cost: that step is left to the developer.

**Environment variables at runtime.** `dev` assigns each service a unique port and passes URLs and credentials as process variables, without rewriting the `.env` files. Cost: `restart` had to go through the `dev` controller to keep those variables. The first version started the service without them.

**Tiered connection limits.** 15 for the user service (it fires about 55 DataLoaders concurrently), 5 for the heavy services, 4 for the gateway and 2 for the rest, with a 30 s `pool_timeout` so queries queue instead of failing. Cost: under load queries wait, and the preflight still edits connection files inside the service repositories.

**Local patches with follow-ups.** A full stack wouldn't start because of four broken services: Prisma 4 clients against a Prisma 6 schema, Django importing a module removed in Python 3.13, and an undeclared dependency. The CLI works around them and the release notes leave the fix pending for each repository. Cost: the patch hides debt that each service's team still has to pay.

## Outcome

- The Quick Start is now: clone, download the env file, `setup` and `dev`.
- In a real `stack` run, all 15 subgraphs responded in 6 s, the gateway composed the supergraph with 538 root query fields, and Ctrl+C stopped everything with no orphan processes.
- `doctor` checks the 32 repositories, remote branches, dependencies, configuration and busy ports, and exits with an error when something blocks.

Every delivery is in the release notes with its verification matrix. There is no unit test suite.

## What I'd do differently

I'd have a single repository registry from the first commit. An audit found that `clean` and `update` duplicated the list, `status` and `logs` ignored the workers, and `doctor` only saw 18 of the 32 repositories. I'd also write unit tests for the pure parts, like the RabbitMQ URL rewrite and the wizard's plan resolution.
