---
slug: megabyte
lang: en
order: 17
title: A terminal agent on local models
project: megabyte
headline: "An agent that runs in my terminal on a local Ollama model. I first wrote it in Python; the next day I turned it into a thin layer over a fork of pi, an MIT project by earendil-works."
domain: Personal project
role: Sole author of the megabyte layer · the engine is pi (earendil-works, MIT)
period: 2026
confidential: false
featured: false
links:
  - label: Fork on GitHub (TypeScript)
    href: https://github.com/ivansantander-hub/megabyte
  - label: Python version (archived)
    href: https://github.com/ivansantander-hub/megabyte-python
summary:
  - k: The problem
    v: "I wanted a terminal agent that used a local model and knew when to use tools and when not to."
  - k: The decision
    v: "After a Python version of my own, use pi as the engine and keep megabyte as a layer on top."
  - k: How it ended
    v: "A launcher, an Ollama config and two ported tools; the Python version is archived."
metrics:
  - value: "1,395"
    label: "lines of Python in the first version"
  - value: "14"
    label: "tools in the Python version"
  - value: "11"
    label: "cases in the tool-use evaluation"
  - value: "208"
    label: "lines in the layer over pi"
stack:
  - Python
  - TypeScript
  - Node.js
  - Ollama
  - OpenRouter
  - Playwright
tags:
  - personal project
  - agents
  - open source
---

megabyte is an agent you invoke as `megabyte` from any terminal. It had two versions: one I wrote in Python, and one that is a fork of [pi](https://github.com/earendil-works/pi), the project by Mario Zechner and earendil-works (MIT license). The unified LLM API, agent loop, TUI and coding agent CLI listed in the repository description are pi's, not mine. My part of that repository is a single 251-line commit on top of more than 6,500 upstream commits.

## The problem

I wanted an agent that ran on a local model (Qwen on Ollama), could read files, browse and search the web, and wouldn't stop at describing a plan instead of carrying it out. Small models fail at this in specific ways: they repeat a call that already failed, write the tool call as plain text, or reach for tools on questions that don't need them.

## Decisions

**First, a Python version of my own.** Eight commits on September 24, 2026: a model–tools loop, 14 tools (files, a Playwright browser, DuckDuckGo search with no API key, image, voice and `ask_claude`), automatic context compaction, resumable sessions and YAML configuration. It showed me which parts were actually hard. Cost: a day of work on something I then set aside.

**Handle the model's failures in the harness.** If the model repeats exactly an action that already failed, the loop blocks it and asks it to change strategy. If it writes the call as text (`web_search{...}`), the harness parses and runs it. Cost: these are heuristics tied to the model and may break with another one.

**A small evaluation instead of tests.** `dev/eval_tool_decisions.py` runs 11 labeled prompts and checks whether the agent used a tool or answered directly. Neither of my versions has unit tests. Cost: the evaluation calls the real model, so it's slow and not deterministic.

**Switch to pi instead of continuing with my engine.** pi already handled providers, the TUI, extensions and sessions, and it is maintained by a team with hundreds of contributors. I tagged the Python version `python-final` and made the fork the next day. Cost: the engine isn't mine anymore, and I depend on another project's decisions.

**Don't touch pi's internals.** megabyte is a bash launcher that points pi at `~/.megabyte/agent`, a `models.json` with the Ollama provider, an identity prompt and two ported extensions: `ask-claude.ts` and `web-search.ts`. That way I can pull upstream changes without conflicts. Cost: anything I want to add has to fit pi's extension system.

## Outcome

The fork builds and `megabyte` runs with Ollama in print mode; both extensions load and search returns results through DuckDuckGo's lite endpoint when the HTML one blocks (per the commit message). Both repositories are public. It isn't published on npm or PyPI.

## What I'd do differently

Check earlier which open projects already existed: much of what I wrote in Python was already solved in pi. I'd also write tests for text-call recovery (`_text_to_call` is a pure function) and pull loop detection out of the main loop so it can be tested without a model.
