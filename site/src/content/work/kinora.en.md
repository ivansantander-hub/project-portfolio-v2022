---
slug: kinora
lang: en
order: 5
title: A creative studio where AI proposes and the person approves
project: Kinora
headline: "A desktop app for a small team to plan a video series, make each episode and publish it. Every change is a typed, reversible operation: you do it by hand or an agent proposes it, and the person approves it."
domain: "Personal project · Desktop product"
role: "Product owner and developer · architecture, product and code"
period: "October 2026 – present"
featured: true
links:
  - label: Native toolchain on GitHub
    href: https://github.com/ivansantander-hub/kinora-toolchain
summary:
  - k: The problem
    v: "Video tools assume one person at a timeline; an AI agent has nowhere to work without breaking the project."
  - k: The decision
    v: "Every change is a typed operation you can undo; the agent proposes, the person approves, and originals never leave their disk."
  - k: Where it is
    v: "Full editor and planning studio done; publishing to YouTube, Instagram and Facebook is next."
metrics:
  - value: "277"
    label: "commits in 17 days"
  - value: "~100"
    label: "documented architecture decisions"
  - value: "16"
    label: "packages and apps in the monorepo"
media:
  image: /img/casos/kinora/editor.webp
  alt: "The Kinora editor with the timeline, viewer and inspector"
points:
  - "**Operations, not clicks:** every change is a validated operation you can undo."
  - "**AI proposes, the person approves:** the agent works in the same project without breaking it."
  - "**Offline and with no paid licences:** originals never leave the disk."
gallery:
  - src: /img/casos/kinora/proyectos.webp
    alt: "Kinora home screen with the projects"
    caption: Projects
  - src: /img/casos/kinora/medios.webp
    alt: "Kinora media library"
    caption: Media
  - src: /img/casos/kinora/transcripcion.webp
    alt: "Editing by transcript in Kinora"
    caption: Edit from the text
moreLabel: "Read the details: how the agent works"
stack:
  - TypeScript
  - Electron
  - React 19
  - Playwright
  - pnpm · Turborepo
tags:
  - product
  - ai
  - desktop
---

Kinora is a desktop creative studio for Mac and Windows. A small content team uses it to plan a series, make each episode and, soon, publish it. The repository is private; the native toolchain the app downloads (ffmpeg and whisper.cpp, pinned and checksummed) is public.

## Where an agent works

A normal video editor is built for one person with a mouse. If an AI agent edits the same project, any mistake gets mixed into the human work and there is no clean way to review it. The product question was how to give the agent a safe place inside the editor.

## How it was solved

**Operations, not clicks.** Cutting, moving, titling, changing colour or sound is a typed operation that is validated and can be undone. The same operation is run by the person from the interface or proposed by the agent from a panel, where each one is approved.

**Any agent, starting with your own.** The default agent is Claude Code with the person's own subscription, but tools, prompts and logic are kept apart so it can be any other. *Trade-off:* more layers than wiring up one model, in exchange for not depending on one vendor.

**Offline and with no paid licences.** The app works without a connection, originals stay on the person's disk, and no dependency costs money or links in GPL code.

**Decisions in writing.** Every architecture decision goes into a numbered record, and the roadmap marks each task done when its pull request closes. Strict TypeScript, no `any`, validation at the edges, and end-to-end tests that run against the packaged app, in the background.

## Status

Done: the editor (layers, sound, cutting, titles, transitions, speed, captions, effects, colour and quality exports) and the planning studio (scored ideas, series, calendar and a producer that proposes the week). Next is publishing to YouTube, Instagram and Facebook from the calendar.
