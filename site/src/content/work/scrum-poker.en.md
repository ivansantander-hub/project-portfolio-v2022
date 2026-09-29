---
slug: scrum-poker
lang: en
order: 17
title: Real-time planning poker
project: Scrum Poker
headline: "A planning poker app for team estimation: rooms joined by code, votes hidden until the host reveals them, and rejoining after a dropped connection."
domain: Personal project
role: Sole developer
period: March 2026
featured: false
links:
  - label: Code on GitHub
    href: https://github.com/ivansantander-hub/scrum-poker
summary:
  - k: The problem
    v: "Estimating stories as a team, in real time, without sign-up."
  - k: The decision
    v: "The server holds room state and resends it in full to everyone on every change."
  - k: How it ended
    v: "A working prototype built in one evening; I found no deployment."
metrics:
  - value: "7"
    label: "commits"
  - value: "8"
    label: "client → server events"
  - value: "~2.8k"
    label: "lines of TypeScript"
stack:
  - NestJS
  - Socket.IO
  - SQLite
  - React
  - Zustand
  - Framer Motion
  - Vite
tags:
  - personal project
  - real-time
---

Scrum Poker is a monorepo with a NestJS backend and a React frontend. A host creates a room with a 6-character code and picks the deck (Fibonacci or hours), others join with a name and avatar, everyone votes in secret, and the host reveals the votes or resets the round. The interface is in English and Spanish.

## The problem

I wanted a simple tool for estimating stories as a team: join with a code, vote, and see the results at the same time, without accounts or sign-up.

## Decisions

**The server is the source of truth.** All logic goes through a Socket.IO gateway in NestJS. After every action (join, vote, reveal, reset) the server rebuilds the room from the database and sends the full state to everyone. Cost: the whole room is sent on every vote; with small rooms it doesn't matter.

**SQLite with hand-written SQL.** Two tables (rooms and players) created at startup, with repositories that wrap `sqlite3` callbacks in promises. Cost: there are no migrations; the avatar column was added with an `ALTER TABLE` whose error is ignored, and the database file ended up committed to git.

**Rejoining from the browser.** The Zustand store persists the room and player in `localStorage`; on reconnect, the client emits `rejoinRoom` with its id. Cost: if the player no longer exists, the server creates a new one with the default avatar instead of restoring the old one.

## Outcome

I built it in one evening: 7 commits on March 27, 2026, between 8:42 p.m. and 11:51 p.m. It runs locally. I found no deployed URL, and the backend's CORS only allows `localhost` ports.

## What I'd do differently

I'd check permissions on every event: reveal and start verify that the requester is the host, but resetting the round doesn't, and voting doesn't check that the player belongs to the room. Ids are generated with `Math.random`, and the only tests are the ones that come with the NestJS template. That's what I'd fix first before deploying it.
