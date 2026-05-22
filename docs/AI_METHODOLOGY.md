# AI Methodology

## AI Role

The AI assistant supports Dungeon Game as a product, engineering, review, QA, and player-experience assistant. It helps run a complete improvement cycle while keeping changes small and verifiable.

## Workflow

The AI cycle follows five ordered roles:

1. **PM:** Review the current game, levels, design, tests, and recent code. Select one focused improvement.
2. **Developer:** Implement the improvement with scoped changes.
3. **Reviewer:** Review the change for bugs, risk, missing tests, and product clarity.
4. **QA:** Run validation and tests, then fix any failure.
5. **Player:** Play from level 1 and confirm every level can reach the exit.

## Inputs

- `levels.json`
- `levels.js`
- `app.js`
- `progression.js`
- `result-actions.js`
- `level-summary.js`
- `scripts/*.js`
- Product rules and player-experience requirements
- Git status and recent changes

## Outputs

- One focused product improvement.
- Code, test, or level changes.
- Review decision.
- QA command results.
- Playthrough result.
- Follow-up backlog item.

## Human and Rule-Based Guardrails

The AI can propose and implement changes, but deterministic validation is required before accepting level changes. The project already includes scripts that check level structure, survivable paths, playthroughs, and level sync.

Required commands:

```powershell
npm run validate
npm test
npm run playthrough
```

## Why This Is an AI Project

This project uses AI for product reasoning, code change planning, development assistance, review, QA reporting, and player-style feedback. The AI does not replace the game engine or validator. Instead, it works with the existing validation system to improve the product safely.

## Future AI Expansion

Possible future AI features:

- AI-assisted level generation.
- Difficulty scoring for each level.
- Suggested level names and themes.
- Player run analysis and hints.
- Automated backlog prioritization.

Any AI-generated level must still pass the same validation scripts before it is committed.

