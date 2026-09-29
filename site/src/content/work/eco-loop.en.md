---
slug: eco-loop
lang: en
order: 13
title: Two AIs talking to each other
project: eco-loop
headline: "Two language models left to talk on their own get stuck offering each other help. eco-loop is a lab for measuring when that happens and what breaks it: 195 replicated trials for $1.02."
domain: "Personal project · Open source"
role: "Sole author · experimental design and development"
period: September 2026
featured: true
links:
  - label: Source on GitHub
    href: https://github.com/ivansantander-hub/eco-loop
summary:
  - k: The problem
    v: "What happens when two AIs talk to each other, with nobody else in the conversation?"
  - k: The decision
    v: "Treat it as an experiment: controlled frames, replicas and automatic measures, not one-off conversations."
  - k: How it ended
    v: "Two closed labs, 16 and 195 trials, with documented conclusions and limits."
metrics:
  - value: "195"
    label: "trials in Lab 02"
  - value: "54 → 68 %"
    label: "originality when given a human role"
  - value: "0 of 63"
    label: "trials with “how can I help you?” when the seed is a dream"
  - value: "$1.02"
    label: "spent on OpenRouter"
stack:
  - Python
  - JavaScript
  - Ollama
  - OpenRouter
tags:
  - ai
  - research
  - llm
---

eco-loop puts two language models in conversation, sometimes two copies of the same one, with no person in between. It works with local Ollama models and any OpenRouter model, in Python with no dependencies. Each lab asks one question, tests it with trials and keeps a log with method, results and limits.

## The question

A chat has a user and an assistant. Here there is no user: each AI sees the other's messages as if a person had written them. Lab 01 (Mirrors, 16 trials) asked what happens then. Given a plain "Hola", every model opens by offering help and the conversation stalls in loops of "how can I help you?" or endless requests for clarification. It only moves forward when one AI gives in and plays the user.

Lab 02 (Masks) started from there: if they stall because both believe they're the assistant, what changes when they're given another role, pretending to be human or knowing they're AIs?

## Experimental design

- **Frames.** A frame decides which instruction each AI gets: none (control), one or two "people" who must not say they're AIs, two AIs that know they are, or only one that knows. Seven frames in total, two of them mirrored to separate the effect of the role from the effect of speaking order.
- **Series.** `marcos-1`: 5 frames × 3 models (GPT-4o-mini, Gemini 2.5 Flash Lite, Llama 3.3 70B) × 3 replicas = 45 trials. `marcos-2`: 7 frames × 2 seeds ("Hola" and "Last night I dreamed the sea had gone.") × 3 models × 3 replicas = 126. `marcos-largo`: 18 trials of 30 turns. `marcos-local`: 6 with Qwen 14B running locally.
- **Fixed conditions:** 12 turns (30 in `marcos-largo`), temperature 0.8, the full history on every turn, and the exact text each model received stored with the trial.

## Decisions

**Cheap, automatic measures.** A message's originality is the share of its content words that weren't in the other AI's previous message. The role signals ("talks like an assistant", "says it's an AI", flattery, giving up the role) are regular expressions in Spanish and English. *Trade-off:* they measure phrases, not ideas or intentions. That's why role-yielding was calibrated against a manual reading of the control group, which it matches in 9 of 9.

**Replicas instead of one-off conversations.** In Lab 01, Llama went as far as saying "I am a human", and another trial degenerated into "A A A…". With three replicas per combination, neither happened again. *Trade-off:* it multiplies cost and time, and even so three replicas give trends, not statistics.

**Record what's invisible.** The first "pure" trial wasn't pure: the local model shipped with a built-in system prompt that Ollama applied without warning. Ollama was also silently dropping the start of long conversations. Since then the system stores built-in instructions, sizes the context window on every turn, and flags cut-off, empty or degenerate responses.

**One engine.** The way messages are assembled was at one point copied in the browser, in the trial battery and in the terminal script. Today it lives in a core used equally by the web app and the commands. There are 87 tests that run offline, against a fake provider and a local server that mimics the Ollama and OpenRouter streams. *Trade-off:* with no dependencies, the streaming client (NDJSON and SSE) and the web server are written on the standard library.

## Results

- **A role breaks the deadlock, and the human role works best.** With a person in the conversation, originality rises from 54% to 68% and loops drop from 5 of 18 to 1–2 of 18.
- **Knowing they're AIs helps less and holds up worse.** It's the frame where the role is yielded least (3 of 18), and over 30 turns originality falls from ~74% to ~35%: mutual praise hardens into a template, and that's what gets copied. "Two humans", by contrast, lasts 30 turns without degrading.
- **The first message matters as much as the frame.** With "Hola", 11 of 63 trials looped and 24% of messages were flattering; with the dream, 5 of 63 and 8%, and "how can I help you?" didn't appear in any of the 63.
- **The role decides the outcome; the order decides the behavior.** Whoever speaks first receives the seed as if it came from a user and opens as an assistant even when its instruction says it's a person. The "person" never admitted to being an AI in any of the 36 mirrored trials.
- **The model matters more than the frame.** Llama accounts for 9 of the 16 loops in `marcos-2`; Gemini is the most flattering (29% of its messages).
- **No frame removes the flattery.**

The project is paused, with the next questions written down: a script format without chat roles, a moderator that steps in, and the effect of temperature.

## What I'd do differently

Set a generous token limit from the first trial. In `marcos-1`, 42% of messages were cut off at 300 tokens, and the next AI often continued the other's sentence; the series had to be rerun at 1,000 tokens (10% cut off). I'd also measure the local model's speed before planning a series: `marcos-local` was stopped after 6 of the 10 planned trials because it generated about 3 tokens per second. And I'd vary more than one condition per axis: two seeds and a single temperature leave open how much of what was observed depends on them.
