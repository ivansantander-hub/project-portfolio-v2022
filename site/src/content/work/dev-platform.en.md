---
slug: dev-platform
lang: en
order: 18
title: A command-line tool for the local environment
project: Local development environment
headline: Running the platform locally meant many manual steps. I built a command-line tool that clones, configures, diagnoses and starts the environment through a wizard.
domain: Clinical trial management platform
role: Technical Lead · tool design and implementation
featured: false
summary:
  - k: The problem
    v: "Setting up the local environment depended on manual steps and scattered knowledge."
  - k: The decision
    v: "A thin command-line tool that orchestrates scripts and guides people with a wizard."
  - k: How it ended
    v: "The environment is set up and started with a few commands and stops cleanly."
stack:
  - TypeScript
  - Node.js
  - Bash
tags:
  - internal tooling
  - developer experience
  - automation
---

## The problem

The platform is spread across many independent repositories. Running it locally meant cloning each one, installing dependencies, preparing each service's configuration and starting them in the right order. That knowledge was scattered across documents and people, and every new person had to rediscover it.

## Decisions

**A thin layer over scripts.** The tool is written in TypeScript and hands the heavy work to bash scripts. A future graphical interface should call that same layer instead of duplicating the logic. Cost: two languages to maintain and a dependency on Unix tools, so the main targets are macOS and Linux.

**Wizard by default, options for automation.** With no arguments, the tool asks which parts to start. With options, it can be used from other scripts. Cost: two entry points to keep aligned.

**Configuration at runtime.** The tool passes configuration to each process when it starts, without rewriting files on disk. Cost: restarting a service has to go through the same mechanism so it isn't lost.

**Warn instead of acting on shared resources.** When an option affects something shared with other people, the tool warns about it and suggests the step, but doesn't run it. Cost: that step is left to the person using it.

## Outcome

- Setting up the environment comes down to a few documented steps.
- A diagnostic command checks prerequisites, dependencies and configuration, and points out what is blocking.
- Stopping the environment closes every process it started.
- Each delivery is documented with its manual verification.

## What I'd do differently

I'd have a single repository registry from the start, instead of lists that had to be unified later. I'd also write unit tests for the pure parts from the beginning.
