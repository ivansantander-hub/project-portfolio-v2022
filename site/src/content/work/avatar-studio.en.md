---
slug: avatar-studio
lang: en
order: 2
title: A studio that makes and publishes short videos with AI
project: Avatar Studio
headline: "My own platform to make short videos end to end, from the idea to automatic publishing on Instagram, YouTube and Facebook. The accounts it feeds add up to more than two million views in a month."
domain: "Personal project · Product and content"
role: "Sole author · product, architecture, code and content direction"
period: "September 2026 – present"
featured: true
links:
  - label: "@tony.mercury on Instagram"
    href: https://www.instagram.com/tony.mercury/
  - label: "Kinema Studio on Facebook"
    href: https://www.facebook.com/1262282486979772
  - label: "kalvin9604 on YouTube"
    href: https://www.youtube.com/@kalvin9604
summary:
  - k: The problem
    v: "A good short video takes many separate steps: idea, script, voice, images, edit, captions and posting to each network on its own."
  - k: The decision
    v: "One studio where every step belongs to a project, models are chosen per call and publishing goes out on its own at its time."
  - k: What is happening
    v: "Three live accounts fed by the studio, with more than two million views and more than 5,000 new followers in a month."
metrics:
  - value: "1.5 M"
    label: "views in a month on Kinema Studio (Facebook)"
  - value: "541k"
    label: "views in a month on @tony.mercury (Instagram)"
  - value: "+5,300"
    label: "new followers in a month across the three accounts"
stack:
  - TypeScript
  - tRPC · Postgres
  - Remotion
  - MCP
  - Python (local models)
tags:
  - own product
  - generative ai
  - content
---

Avatar Studio started in September 2026 as a folder of scripts to make an AI character talk. Today it is a platform: a workspace with accounts, series, a calendar and a pipeline that takes each video from the idea to publishing. I use it to produce the content of three real accounts, and their numbers are public.

## What is behind each video

Each video is a project that moves through stages: idea, script, shots, edit, review, scheduled and published. Ideas are captured and voted on; the script is written in versions; the voice comes from a text-to-speech model directed as a character; images and scenes come from whichever model suits each shot; the edit is built as data and rendered to MP4. At the end the studio uploads the video at its time to Instagram as a Reel, to YouTube and to a Facebook Page, and links each post with its metrics.

## Decisions

**The edit is data, not a file.** A cut is stored as a composition (clips, text, music, captions) and rendered with Remotion. A text or a timing can be fixed and exported again without redoing anything, and the same cut also comes out as captions or a CapCut pack.

**A model harness with a budget.** Each call chooses its model (video, image, voice or text, in the cloud or on the Mac) and is logged with its cost in a spend ledger with a monthly cap. *Trade-off:* more plumbing than marrying one vendor, in exchange for the best model at each step and knowing what each video costs.

**Local and cloud work on separate lanes.** What runs on the Mac (local models, rendering) goes through one lane; what runs on the server, through another. If no worker is running for a lane, the studio refuses the job with a reason instead of leaving it in a queue that never moves.

**Any agent can work in the studio.** An MCP server exposes the studio with the same permissions as the web app, so an agent like Claude can propose ideas, write scripts or assemble a cut inside the workspace, with roles and a spending cap.

**The studio learns from corrections.** The fixes I make to a video become lessons in a per-account style book, and the next videos follow them.

## Results

In the last month, measured on November 21, 2026: **Kinema Studio** on Facebook reached 1.5 million views and 1.2 million accounts, with almost 4,000 new followers; **@tony.mercury** on Instagram, 541k views and 385k accounts, with 1,226 new followers; and **kalvin9604** on YouTube, 75k views. The repository has about 400 commits since late September.

## What comes next

Letting the studio close the loop on its own: read which videos worked, turn that into ideas and propose the next week.
