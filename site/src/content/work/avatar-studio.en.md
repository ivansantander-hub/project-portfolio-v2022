---
slug: avatar-studio
lang: en
order: 16
title: A local pipeline for talking avatars
project: Avatar Studio
headline: "Testing whether short videos of fictional AI characters speaking Spanish can be produced mostly with open models on a Mac, renting a GPU or an API only for the video."
domain: Personal project
role: Sole developer · research, scripts and testing
period: "2026"
confidential: false
featured: false
summary:
  - k: The problem
    v: "Making videos of an AI character with natural Spanish speech without relying on a closed platform for every step."
  - k: The decision
    v: "Images and voice locally with open models; lip-sync on a rented GPU or through an API."
  - k: How it ended
    v: "Voice and image pipeline working and two pilot clips generated through an API; still in testing."
metrics:
  - value: "4"
    label: "fictional characters defined"
  - value: "40"
    label: "scripts written"
  - value: "1.2 min"
    label: "to generate a 30 s clip through the API"
  - value: "US$1.52"
    label: "cost of that clip"
stack:
  - Python
  - uv
  - Chatterbox
  - Whisper
  - mflux
  - ffmpeg
  - OpenRouter
  - ComfyUI
tags:
  - personal project
  - generative ai
  - audio
---

Avatar Studio is a set of Python scripts for producing short vertical videos of fictional characters talking to the camera. It covers the character profile, their images, the backgrounds, the voice, the lip-synced video and the final edit with subtitles. It started as a local folder called `ai-influencer`; it's the same code that now lives in a private repository.

## The problem

I wanted to know how much of this workflow can run on open models on my own Mac, and which parts really need a rented GPU or a paid service. The hard part turned out to be the voice: the first Spanish audio sounded flat or robotic, and a character that speaks badly is no use even if the image is good.

## Decisions

**Voices cloned from open datasets, not designed from scratch.** I first tried designing voices from a text description with Qwen3-TTS and dropped them because they sounded foreign or robotic. I ended up cloning with Chatterbox from anonymous speakers in Common Voice (CC0) and in a Google Colombian Spanish corpus (CC BY-SA), with an attribution file per voice. Cost: two of the four voices require attribution in the character's description, and quality depends on how expressive those clips are.

**The reference is built from the most expressive clips.** Chatterbox copies the speaking style of its reference, so a script measures how much the pitch moves in each of the speaker's clips and concatenates the liveliest ones up to about 20 seconds. Cost: it's a simple metric (pitch range) that doesn't capture everything that makes a voice sound natural.

**Sentence-by-sentence narration, with several takes and Whisper as a filter.** The script is split into chunks of at least 8 words (with 3 there were 11 cuts and it sounded robotic), several takes are generated per chunk, Whisper checks that the take says the text (minimum similarity 0.85), slow or dragging takes are dropped, and the one with the most pitch variation wins. Then it's joined with pauses and normalized to -14 LUFS with ffmpeg. Cost: three takes per sentence multiplies the time each audio takes.

**Images locally, video elsewhere.** Backgrounds, character views and the first frame are generated on the Mac with mflux (Z-Image Turbo and FLUX.2 klein, quantized to 8 bits). For lip-sync I prepared a RunPod session with InfiniteTalk in ComfyUI plus an install script, and in parallel a script that requests the video from HeyGen Avatar IV through OpenRouter. Cost: video isn't local, and the API charges per second.

## Outcome

The four characters have profiles, there are 40 scripts, and the voice and image pipeline works. The two pilot clips I recorded come from the same script and were made through the API: one of 30.4 s that took 1.2 min and cost US$1.52, and one of 25.2 s at 1080p that took 2.2 min, with an estimated cost of US$1.26 and audio from Gemini through OpenRouter. Neither is marked as usable yet, and the InfiniteTalk session on RunPod has no measurements: its time is an estimate. The repository has a single commit.

## What I'd do differently

I'd keep the test log from day one in a format that can be compared, instead of numbered folders with listening scripts. And I'd test the video with one character and one script before writing 40: the video step is the one most likely to change everything else.
