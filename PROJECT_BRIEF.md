# Project Brief

## Project Title

Dungeon Game: AI-Assisted Product Improvement and Level Validation

## Problem Statement

Dungeon Game is a browser-based grid puzzle game where players move from point A to point B while managing HP, bombs, healing pots, walls, and timed runs. Because the game depends on many hand-authored levels, small level or gameplay changes can accidentally create impossible paths, unfair HP routes, repetitive level design, or broken progression.

The project needs a repeatable AI-assisted workflow that can review the product, propose a focused improvement, implement it, review it, run validation, and play through all levels from level 1.

## Objective

Use AI as a product and engineering assistant to improve Dungeon Game in small shippable cycles while keeping every level valid, survivable, and fun.

## Target Users

- Players who want clear, fair, and satisfying dungeon puzzles.
- Developers maintaining the browser game.
- Designers adding or adjusting levels.
- Reviewers checking product quality before changes are merged.

## Project Scope

This project uses AI to support the product improvement process. It is not a custom machine learning model trained from scratch. The strongest AI value is in structured product reasoning, code review, QA planning, and player-experience feedback.

The deterministic validation scripts remain the source of truth for level correctness.

## Existing Product Features

- Browser game launched from `index.html` or `npm run serve`.
- JSON-backed level data in `levels.json`.
- Browser fallback level data in `levels.js`.
- Local player profile and rank cache.
- Timed level runs.
- HP changes from bombs and healing pots.
- Gameplay state history stored after each ended run.
- Validation scripts for levels, sync, progression, result actions, summaries, and profile bootstrap behavior.

## AI Project Success Criteria

- One focused improvement is selected per cycle.
- Code or level changes stay scoped.
- `levels.json` and `levels.js` stay synchronized.
- `npm run validate` passes.
- `npm test` passes.
- `npm run playthrough` confirms every level is playable from level 1.
- Review decisions and QA results are recorded.
- Follow-up backlog items are captured without blocking the completed cycle.

## Deliverables

- Game source code and level data.
- AI automation prompt.
- AI project report.
- Dataset and schema documentation.
- Evaluation and test plan.
- Ethics and limitations notes.
- Product improvement cycle documentation.

