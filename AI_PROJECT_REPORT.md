# AI Project Report

## 1. Title

Dungeon Game: AI-Assisted Product Improvement and Level Validation

## 2. Introduction

Dungeon Game is a browser-based puzzle game where the player starts at point A in the top-left corner and must reach point B in the bottom-right corner. The player moves through paths, avoids walls, loses HP on bombs, and gains HP from healing pots. The game includes timed runs, local player progress, rank caching, and JSON-backed levels.

This is an AI project because an AI assistant is used to run a structured product improvement workflow. The AI reviews the game, proposes a small improvement, implements it, reviews the change, runs QA, and validates the player experience.

## 3. Problem Statement

Manually edited game levels can become impossible, unfair, too simple, repetitive, or out of sync with runtime files. A good dungeon game needs both product judgment and strict validation. The project solves this by combining AI-assisted product work with deterministic level validation.

## 4. Objective

The objective is to improve Dungeon Game through repeatable AI-assisted cycles while ensuring every level remains valid, survivable, and enjoyable.

## 5. Dataset or Input

The main dataset is `levels.json`. It contains:

- `version`
- `startHp`
- `maxHp`
- `tiles`
- `levels`

Each level has an `id`, `name`, `size`, and `grid`. The runtime browser fallback is generated in `levels.js` by running:

```powershell
npm run sync:levels
```

## 6. AI Method

The project uses a multi-role AI workflow:

- **PM:** Reviews the product and proposes one focused improvement.
- **Developer:** Implements the selected improvement.
- **Reviewer:** Reviews the change like a pull request.
- **QA:** Runs validation and tests.
- **Player:** Plays from level 1 and checks whether all levels can reach the exit.

This method is AI-assisted software engineering and product QA. It does not depend on training a new model.

## 7. Game Rules

Tile symbols:

| Symbol | Meaning | Effect |
| --- | --- | --- |
| `S` | Start | Player begins here |
| `E` | Exit | Level ends here |
| `.` | Path | Player can walk through |
| `#` | Wall | Player cannot walk through |
| `B` | Bomb | HP -1 |
| `H` | Healing pot | HP +1, capped by `maxHp` |

Rules:

- Every level starts at the top-left tile.
- Every level exits at the bottom-right tile.
- Every level must have exactly one `S` and one `E`.
- Every level must have a survivable direct path.
- The timer starts only after the first successful player move.
- Completed or failed run state is cached in the local player profile.

## 8. Tools and Technologies

- HTML, CSS, and JavaScript for the browser game.
- JSON for level data.
- Node.js scripts for validation, sync, serving, and tests.
- Git and GitHub workflow for branches, commits, review, and pull requests.
- AI automation for product improvement cycles.

## 9. Evaluation

The project is evaluated using:

```powershell
npm run validate
npm test
npm run playthrough
```

Validation checks include:

- Level schema correctness.
- Unique contiguous level IDs.
- Supported tile symbols.
- Exactly one start and exit.
- Start at top-left and exit at bottom-right.
- Survivable path and survivable direct path.
- `levels.js` synchronization with `levels.json`.

Player review checks include:

- Easy controls and understandable flow.
- Fun and fair level difficulty.
- Strategy-driven routes.
- Avoidance of repeated winning patterns.
- Smooth game flow from lobby to result.

## 10. Ethics and Limitations

The AI assistant can make useful product and engineering suggestions, but it can also misunderstand the game or miss edge cases. Deterministic validation, tests, and human review should remain required. The project should avoid collecting unnecessary personal data and should make future ranking or lobby data storage clear to players.

## 11. Conclusion

Dungeon Game is a strong AI project because it shows how AI can support a complete product cycle, not just generate code. The project combines AI-assisted planning and review with rule-based validation, which keeps the game maintainable, playable, and fair.

