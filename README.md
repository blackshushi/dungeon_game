# Dungeon Game

A small browser dungeon game with a lobby, local rank cache, timed level runs, HP tiles, and JSON-backed maps.

## Run

Open `index.html` directly in a browser, or run the local server:

```powershell
node scripts/serve.js 5173
```

Open `http://127.0.0.1:5173`.

## Validate Levels

```powershell
npm run validate
```

To simulate a full survivable route through every level from level 1 onward:

```powershell
npm run playthrough
```

If you edit `levels.json`, sync the browser fallback:

```powershell
npm run sync:levels
```

Level tiles:

- `S`: point A / start
- `E`: point B / exit
- `.`: normal path
- `#`: wall
- `B`: bomb, HP -1
- `H`: healing pot, HP +1

Every level starts at top-left, exits at bottom-right, and must have a survivable direct path.

## AI Project Documentation

This game is documented as an AI-assisted product improvement project:

- [PROJECT_BRIEF.md](PROJECT_BRIEF.md): problem, objective, scope, and success criteria.
- [AI_PROJECT_REPORT.md](AI_PROJECT_REPORT.md): report-style project write-up.
- [docs/AI_METHODOLOGY.md](docs/AI_METHODOLOGY.md): how the AI workflow is used.
- [docs/DATASET_AND_LEVEL_SCHEMA.md](docs/DATASET_AND_LEVEL_SCHEMA.md): level data schema and tile rules.
- [docs/EVALUATION_AND_TEST_PLAN.md](docs/EVALUATION_AND_TEST_PLAN.md): validation, QA, and player evaluation plan.
- [docs/PRODUCT_IMPROVEMENT_CYCLE.md](docs/PRODUCT_IMPROVEMENT_CYCLE.md): PM, Developer, Reviewer, QA, and Player cycle.
- [docs/ETHICS_AND_LIMITATIONS.md](docs/ETHICS_AND_LIMITATIONS.md): responsible use, risks, and guardrails.
- [ai/automation_prompt.md](ai/automation_prompt.md): reusable AI automation prompt.
- [ai/model_card.md](ai/model_card.md): AI assistant role card.
