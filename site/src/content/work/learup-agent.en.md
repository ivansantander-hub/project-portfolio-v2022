---
slug: learup-agent
lang: en
order: 3
title: An AI coding assistant that knows the LearUp codebase
project: LearUp Agent
headline: A coding assistant with several agents, several model providers and two workflows of its own, one that takes tasks all the way to QA and one that turns a bug recording into an analysis and a test that reproduces it.
domain: Clinical trial management platform
role: Technical Lead · design and implementation
period: 2026
featured: false
summary:
  - k: The problem
    v: "Generic assistants don't know the platform's code, task flow or environments."
  - k: The decision
    v: "An in-house tool with role-based agents, a model gateway and workflows tied to the team's process."
  - k: How it ended
    v: "106 commits, 36 entries in the release log and 45 automated test files."
metrics:
  - value: "106"
    label: commits between March and September 2026
  - value: "8"
    label: agents with their own role
  - value: "10"
    label: supported model provider types
  - value: "45"
    label: Vitest test files
stack:
  - TypeScript
  - Node.js
  - Express
  - Socket.IO
  - React
  - Vite
  - SQLite
  - Model Context Protocol
  - Playwright
  - AWS Bedrock
tags:
  - ai
  - internal tools
  - automation
---

## The problem

The platform is spread across many repositories. A generic coding assistant doesn't know how they fit together, how the team writes a task, or how a change gets checked before it goes to QA. I wanted a tool that started from that context: implement and review code, but also follow the process the team already uses.

I focused on two parts of that process: taking a task from its definition to a verified change on QA, and reporting bugs with enough evidence to find the cause.

## Decisions

**A model gateway instead of a single provider.** The server picks the client from the model ID prefix: Anthropic, OpenAI-compatible APIs (OpenAI, Google, Groq, xAI, OpenRouter, Ollama), custom endpoints, and two local CLIs (Claude Code and Cursor). If there is no Anthropic API key but AWS credentials are present, it uses Claude through Bedrock. Cost: two agent loops to maintain (Anthropic and OpenAI-compatible), and provider differences that have to be handled by hand.

**Agents defined in Markdown plus a mode registry.** Each agent (dev, product, reviewer, QA, orchestrator, architect, chat) is a Markdown skill plus one registry entry that says which tools it loads. Product and reviewer are read-only. I borrowed patterns from an open-source coding agent without forking it. Cost: behavior lives in text, and a change to a skill can only be checked by running it.

**An autopilot that follows the team's flow.** It picks up tasks explicitly flagged in Notion, writes and validates the technical part (at most three rounds), implements in a per-task worktree, opens the merge requests and verifies the change locally before anything is merged. Every failure is classified as code, environment or human; only code failures go back to implementation. It runs on the Claude subscription through the CLI, with no API key. Cost: it depends on the local machine and the team's local dev CLI, and it verifies one task at a time.

**Bug capture with redaction before saving.** A tab records the bug in a real browser: video, network with bodies, console, clicks and screenshots. Auth headers, cookies, tokens and passwords are removed before anything is written to disk, and sensitive fields are blurred in the video. Captures are deleted after 30 days and each keeps a log of who viewed, exported or analyzed it. Claude then looks for the cause in the code and writes a Playwright test that reproduces the failure. Cost: redaction throws away data that would sometimes help debugging.

## Outcome

- 106 commits between March 23 and September 26, 2026, and 36 entries in the release log (v0.1.0 to v0.31.0).
- 8 agents, 10 provider types and support for MCP servers.
- A Chrome extension for recording from the tester's own browser, with an E2E test that checks 21 things.
- 45 Vitest test files, plus a manual smoke-test guide.

## What I'd do differently

I'd keep the release log from the first commit: the dates on the earliest entries don't match the git history. Also, 28 of those 36 entries fall between September 24 and 26; I'd have spread that work over more spaced-out releases.
